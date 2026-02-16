'use server';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TicketResponse } from '@/types';
import { getSession } from '@/app/actions/auth';

// GET - Get responses for a ticket
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticket = await db.supportTickets.getById(id);
    if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check access
    if (session.role !== 'technical_support' && session.role !== 'admin' && ticket.userId !== session.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let responses = await db.ticketResponses.getByTicket(id);

    // Filter internal responses for non-technical users
    if (session.role !== 'technical_support' && session.role !== 'admin') {
        responses = responses.filter(r => !r.isInternal);
    }

    // Sort by createdAt ascending (oldest first for conversation flow)
    responses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return NextResponse.json(responses);
}

// POST - Add response to ticket
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticket = await db.supportTickets.getById(id);
    if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check access
    if (session.role !== 'technical_support' && session.role !== 'admin' && ticket.userId !== session.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { message, isInternal = false } = body;

        if (!message || !message.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Non-technical users cannot send internal messages
        const canBeInternal = session.role === 'technical_support' || session.role === 'admin';

        const newResponse: TicketResponse = {
            id: `resp-${Date.now()}`,
            ticketId: id,
            userId: session.id,
            userName: `${session.firstName} ${session.lastName}`,
            userRole: session.role,
            message: message.trim(),
            isInternal: canBeInternal ? isInternal : false,
            createdAt: new Date().toISOString()
        };

        const created = await db.ticketResponses.create(newResponse);

        // Update ticket status to in_progress if it was open and tech support responded
        if (ticket.status === 'open' && (session.role === 'technical_support' || session.role === 'admin')) {
            await db.supportTickets.update({ id, status: 'in_progress' });
        }

        // Create notification for the other party
        if (!isInternal) {
            const notifyUserId = session.id === ticket.userId
                ? (ticket.assignedTo || undefined)  // Notify assigned tech if user responds
                : ticket.userId;  // Notify user if tech responds

            if (notifyUserId && notifyUserId !== session.id) {
                await db.notifications.create({
                    id: `notif-${Date.now()}`,
                    userId: notifyUserId,
                    type: 'ticket_response',
                    title: 'Yeni Yanıt',
                    message: `${ticket.ticketNumber} numaralı talebinize yanıt geldi.`,
                    relatedTicketId: id,
                    isRead: false,
                    createdAt: new Date().toISOString()
                });
            }
        }

        return NextResponse.json(created, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to add response' }, { status: 500 });
    }
}
