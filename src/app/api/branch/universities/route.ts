import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const universities = db.universities.getAll().sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    return NextResponse.json(universities);
}

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();
        const newUni = db.universities.create({
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
        const { id, name } = await request.json();
        const uni = db.universities.getById(id);
        if (uni) {
            uni.name = name;
            const updated = db.universities.update(uni);
            return NextResponse.json(updated);
        }
        return NextResponse.json({ error: 'University not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update university' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        db.universities.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete university' }, { status: 500 });
    }
}
