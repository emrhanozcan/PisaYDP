import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import TicketDetailClient from './TicketDetailClient';
import { db } from '@/lib/db';

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession();

    if (!session || session.role !== 'technical_support') {
        redirect('/login');
    }

    const ticket = await db.supportTickets.getById(params.id);
    if (!ticket) {
        redirect('/technical/tickets');
    }

    const responses = await db.ticketResponses.getByTicket(params.id);
    const techUsers = (await db.users.getAll()).filter(u => u.role === 'technical_support');

    return (
        <TicketDetailClient
            ticket={ticket}
            responses={responses}
            techUsers={techUsers.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))}
            currentUser={{ id: session.id, name: `${session.firstName} ${session.lastName}`, role: session.role }}
        />
    );
}
