
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const students = await db.branchStudents.getAll();
        const targetStudent = students.find(s => s.firstName.toLowerCase().includes('test') && s.lastName.toLowerCase().includes('tset'));

        if (!targetStudent) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        let universityName = null;
        if (targetStudent.universityId) {
            const uni = await db.universities.getById(targetStudent.universityId);
            universityName = uni?.name;
        }

        return NextResponse.json({
            student: targetStudent,
            resolvedUniversityName: universityName
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
