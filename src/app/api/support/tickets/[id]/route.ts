'use server';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TicketStatus } from '@/types';
import { getSession } from '@/app/actions/auth';

// GET - Get ticket by ID with responses
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

    // Non-technical users can only see their own tickets
    if (session.role !== 'technical_support' && session.role !== 'admin' && ticket.userId !== session.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get responses for this ticket
    let responses = await db.ticketResponses.getByTicket(id);

    // Filter internal responses for non-technical users
    if (session.role !== 'technical_support' && session.role !== 'admin') {
        responses = responses.filter(r => !r.isInternal);
    }

    return NextResponse.json({ ticket, responses });
}

// PUT - Update ticket
export async function PUT(
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

    try {
        const body = await request.json();
        const { status, assignedTo, priority } = body;

        // Users can only update their own tickets (limited fields)
        // Technical support can update any ticket
        if (session.role !== 'technical_support' && session.role !== 'admin') {
            // Regular users can only close/reopen their own tickets
            if (ticket.userId !== session.id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
        }

        const updateData: Partial<typeof ticket> & { id: string } = { id };

        if (status) {
            updateData.status = status as TicketStatus;
            if (status === 'resolved' || status === 'closed') {
                updateData.resolvedAt = new Date().toISOString();
            }

            // Create notification for status change
            if (ticket.userId !== session.id) {
                try {
                    await db.notifications.create({
                        id: `notif-${Date.now()}`,
                        userId: ticket.userId,
                        type: 'ticket_status',
                        title: 'Destek Talebi Güncellendi',
                        message: `${ticket.ticketNumber} numaralı talebinizin durumu güncellendi.`,
                        relatedTicketId: id,
                        isRead: false,
                        createdAt: new Date().toISOString()
                    });
                } catch (notifError) {
                    console.error('Failed to send notification for ticket update:', notifError);
                    // Continue execution - notification failure shouldn't block ticket update
                }
            }
        }

        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
        if (priority) updateData.priority = priority;

        const updated = await db.supportTickets.update(updateData);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating ticket:', error);
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}

// DELETE - Delete ticket
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.role !== 'technical_support' && session.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.supportTickets.delete(id);
    return NextResponse.json({ success: true });
}
