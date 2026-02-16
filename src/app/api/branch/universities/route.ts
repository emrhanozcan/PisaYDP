import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const universities = (await db.universities.getAll()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    return NextResponse.json(universities);
}

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();
        const newUni = await db.universities.create({
            id: `uni-${Date.now()}`,
            name,
            country: 'İtalya',
            isActive: true
        });
        return NextResponse.json(newUni);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create university' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { id, name, registrationDeadline } = await request.json();
        console.log('[PUT /api/branch/universities] Data:', { id, name, registrationDeadline });
        const uni = await db.universities.getById(id);
        if (uni) {
            uni.name = name || uni.name;
            if (registrationDeadline) uni.registrationDeadline = registrationDeadline;
            console.log('[PUT /api/branch/universities] Updating uni:', JSON.stringify(uni));
            const updated = await db.universities.update(uni);
            console.log('[PUT /api/branch/universities] Updated result:', updated);
            return NextResponse.json(updated);
        }
        console.log('[PUT /api/branch/universities] University not found:', id);
        return NextResponse.json({ error: 'University not found' }, { status: 404 });
    } catch (error: any) {
        console.error('[PUT /api/branch/universities] Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to update university', details: error?.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        await db.universities.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete university' }, { status: 500 });
    }
}
