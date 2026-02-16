import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import TicketsClient from './TicketsClient';
import { db } from '@/lib/db';

export default async function TicketsPage() {
    const session = await getSession();

    if (!session || (session.role !== 'technical_support' && session.role !== 'admin')) {
        redirect('/login');
    }

    const tickets = await db.supportTickets.getAll();
    const users = await db.users.getAll();

    return (
        <TicketsClient
            initialTickets={tickets}
            users={users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, role: u.role, branchCode: u.branchCode }))}
            currentUserId={session.id}
        />
    );
}
