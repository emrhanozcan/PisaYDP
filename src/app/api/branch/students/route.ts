import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BranchCode } from '@/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const branchCode = searchParams.get('branchCode') as BranchCode | null;

    if (universityId && branchCode) {
        const students = db.branchStudents.getByUniversity(universityId, branchCode);
        return NextResponse.json(students);
    }

    if (branchCode) {
        const students = db.branchStudents.getByBranch(branchCode);
        return NextResponse.json(students);
    }

    return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const newStudent = db.branchStudents.create({
            ...data,
            id: `bs-${Date.now()}`,
            createdAt: new Date().toISOString()
        });
        return NextResponse.json(newStudent);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();
        const updated = db.branchStudents.update(data);
        if (updated) {
            return NextResponse.json(updated);
        }
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        db.branchStudents.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }
}
