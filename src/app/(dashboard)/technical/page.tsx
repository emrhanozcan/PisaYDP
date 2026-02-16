import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import TechnicalDashboardClient from './TechnicalDashboardClient';
import { db } from '@/lib/db';

export default async function TechnicalPage() {
    const session = await getSession();

    if (!session || session.role !== 'technical_support') {
        redirect('/login');
    }

    const tickets = await db.supportTickets.getAll();
    const users = await db.users.getAll();

    // Calculate stats
    const stats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
        resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
        totalUsers: users.length,
        usersByRole: {
            admin: users.filter(u => u.role === 'admin').length,
            mentor: users.filter(u => u.role === 'mentor').length,
            branch_user: users.filter(u => u.role === 'branch_user').length,
            italy_staff: users.filter(u => u.role === 'italy_staff').length,
            technical_support: users.filter(u => u.role === 'technical_support').length,
        }
    };

    const techUsers = users
        .filter(u => u.role === 'technical_support')
        .map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }));

    return (
        <TechnicalDashboardClient
            stats={stats}
            recentTickets={tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)}
            allTickets={tickets}
            userName={`${session.firstName} ${session.lastName}`}
            techUsers={techUsers}
        />
    );
}
