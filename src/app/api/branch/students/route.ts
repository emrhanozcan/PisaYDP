import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BranchCode } from '@/types';

// Date fields that PostgreSQL expects as null instead of empty string
const DATE_FIELDS = [
    'infoDate', 'applicationDeadline', 'registrationDate', 'createdAt',
    'passportExpiry', 'accommodationDate', 'guardianArrivalDate', 'arrivalDate',
    'residencePermitArrivalDate', 'residencePermitAppointmentDate',
    'codiceFiscaleArrivalDate', 'codiceFiscaleAppointmentDate',
    'ydtWelcomeDate', 'ydtSchoolRegDate', 'ydtResPermitDate', 'ydtSimDate', 'ydtBankDate'
];

// Convert empty strings to null for date fields
function sanitizeDateFields(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    for (const field of DATE_FIELDS) {
        if (sanitized[field] === '') {
            sanitized[field] = null;
        }
    }
    return sanitized;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const branchCode = searchParams.get('branchCode') as BranchCode | null;

    if (universityId && branchCode) {
        const students = await db.branchStudents.getByUniversity(universityId, branchCode);
        return NextResponse.json(students);
    }

    if (branchCode) {
        const students = await db.branchStudents.getByBranch(branchCode);
        return NextResponse.json(students);
    }

    return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        console.log('[POST /api/branch/students] Data received:', JSON.stringify(data, null, 2));
        const sanitizedData = sanitizeDateFields(data);
        const newStudent = await db.branchStudents.create({
            ...(sanitizedData as any),
            id: `bs-${Date.now()}`,
            createdAt: new Date().toISOString()
        });
        console.log('[POST /api/branch/students] Created:', newStudent?.id);
        return NextResponse.json(newStudent);
    } catch (error: any) {
        console.error('[POST /api/branch/students] Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to create student', details: error?.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();
        console.log('[PUT /api/branch/students] Data received:', JSON.stringify(data, null, 2));

        // Sync legacy fields to educations if they are being updated
        if (data.id && (data.universityId !== undefined || data.department !== undefined || data.program !== undefined || data.grade !== undefined)) {
            const existingStudent = await db.branchStudents.getById(data.id);
            if (existingStudent) {
                let newEducations = existingStudent.educations ? [...existingStudent.educations] : [];

                if (newEducations.length > 0) {
                    // Update first education
                    newEducations[0] = {
                        ...newEducations[0],
                        universityId: data.universityId !== undefined ? data.universityId : newEducations[0].universityId,
                        department: data.department !== undefined ? data.department : newEducations[0].department,
                        program: data.program !== undefined ? data.program : newEducations[0].program,
                        grade: data.grade !== undefined ? data.grade : newEducations[0].grade,
                    };
                } else {
                    // Create first education
                    newEducations.push({
                        id: `edu-${Date.now()}`,
                        universityId: data.universityId !== undefined ? data.universityId : existingStudent.universityId,
                        department: data.department !== undefined ? data.department : existingStudent.department,
                        program: data.program !== undefined ? data.program : existingStudent.program,
                        grade: data.grade !== undefined ? data.grade : existingStudent.grade,
                    });
                }
                data.educations = newEducations;
            }
        }

        // REVERSE SYNC: If educations are provided (from new UI), sync primary education back to legacy columns
        if (data.educations && data.educations.length > 0) {
            const primaryEdu = data.educations[0];
            data.universityId = primaryEdu.universityId;
            data.department = primaryEdu.department;
            data.program = primaryEdu.program;
            data.grade = primaryEdu.grade;
        }

        const sanitizedData = sanitizeDateFields(data);
        const updated = await db.branchStudents.update(sanitizedData);
        if (updated) {
            console.log('[PUT /api/branch/students] Updated:', updated?.id);

            // SMS Notification for Accommodation Difference Payment
            if (data.accommodationDiffPayment) {
                try {
                    const { sendSMS } = await import('@/lib/sms');
                    const message = `Öğrenci ${updated.firstName} ${updated.lastName} için konaklama fark ödemesi girildi: ${data.accommodationDiffPayment}`;
                    const smsResult = await sendSMS(['05423297878'], message);

                    if (smsResult.success) {
                        console.log('[PUT /api/branch/students] SMS sent successfully');
                    } else {
                        console.error('[PUT /api/branch/students] SMS failed:', smsResult.error);
                    }
                } catch (smsError) {
                    console.error('[PUT /api/branch/students] Failed to send SMS:', smsError);
                }
            }

            return NextResponse.json(updated);
        }
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    } catch (error: any) {
        console.error('[PUT /api/branch/students] Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to update student', details: error?.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        await db.branchStudents.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }
}
