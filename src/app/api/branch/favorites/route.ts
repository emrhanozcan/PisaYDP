import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { userId, universityId } = await request.json();
        const result = await db.userFavorites.toggle(userId, universityId);
        return NextResponse.json({ isFavorite: result });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
    }
}
