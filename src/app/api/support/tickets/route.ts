'use server';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SupportTicket, TicketCategory, TicketPriority } from '@/types';
import { getSession } from '@/app/actions/auth';

// GET - List tickets
export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let tickets = await db.supportTickets.getAll();

    // Non-technical users can only see their own tickets
    if (session.role !== 'technical_support' && session.role !== 'admin') {
        tickets = tickets.filter(t => t.userId === session.id);
    } else {
        if (status) {
            tickets = tickets.filter(t => t.status === status);
        }
        if (userId) {
            tickets = tickets.filter(t => t.userId === userId);
        }
    }

    // Sort by createdAt descending (newest first)
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(tickets);
}

// POST - Create new ticket
export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { category, priority, subject, description, screenshots, deviceInfo } = body;

        if (!category || !subject || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const ticketNumber = await db.supportTickets.generateTicketNumber();

        const newTicket: SupportTicket = {
            id: `ticket-${Date.now()}`,
            ticketNumber,
            userId: session.id,
            userName: `${session.firstName} ${session.lastName}`,
            userRole: session.role,
            category: category as TicketCategory,
            priority: (priority || 'medium') as TicketPriority,
            subject,
            description,
            screenshots: screenshots || [], // Kept for type safety, will be stripped in db.ts
            deviceInfo,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const created = await db.supportTickets.create(newTicket);
        return NextResponse.json(created, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}
