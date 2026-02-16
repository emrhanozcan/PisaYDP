
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMS } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const manualUniId = searchParams.get('universityId');
        const force = searchParams.get('force') === 'true';

        const universities = await db.universities.getAll();
        const now = new Date();
        const results = [];

        console.log(`Checking reminders for ${universities.length} universities...`);

        for (const uni of universities) {
            if (!uni.registrationDeadline) continue;

            if (manualUniId && manualUniId !== uni.id) continue;

            const [day, month, year] = uni.registrationDeadline.split('.').map(Number);
            const deadline = new Date(year, month - 1, day);

            // Normalize dates to midnight for comparison to avoid hour issues
            const cleanNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const cleanDeadline = new Date(year, month - 1, day);

            const diffTime = cleanDeadline.getTime() - cleanNow.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const isThreeDaysBefore = diffDays === 3;
            // Also allow if we are manually triggering and it is BEFORE deadline
            const isManualValid = force && diffDays >= 0;

            if (isThreeDaysBefore || (manualUniId && force)) {
                console.log(`Processing ${uni.name}: Deadline ${uni.registrationDeadline}, Days left: ${diffDays}`);

                const students = await db.branchStudents.getByUniversity(uni.id);
                // Filter active students with phones
                const activeStudents = students.filter(s => s.status === 'active' && s.phone);

                if (activeStudents.length > 0) {
                    const phones = activeStudents.map(s => s.phone!);
                    const message = `Sayin Veli/Ogrenci, ${uni.name} icin son kayit tarihi ${uni.registrationDeadline} gunudur. Lutfen kayit islemlerinizi tamamlayiniz.`;

                    const response = await sendSMS(phones, message);
                    results.push({
                        uni: uni.name,
                        deadline: uni.registrationDeadline,
                        count: phones.length,
                        success: response.success,
                        error: response.error,
                        daysLeft: diffDays
                    });
                } else {
                    results.push({
                        uni: uni.name,
                        deadline: uni.registrationDeadline,
                        count: 0,
                        message: 'No active students with phone',
                        daysLeft: diffDays
                    });
                }
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Reminder Check Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
