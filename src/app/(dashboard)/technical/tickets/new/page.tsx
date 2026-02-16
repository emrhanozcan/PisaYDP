
import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import NewTicketClient from './NewTicketClient';
import { db } from '@/lib/db';

export default async function NewTicketPage() {
    const session = await getSession();

    if (!session || session.role !== 'technical_support') {
        redirect('/login');
    }

    const users = (await db.users.getAll()).map(({ password, ...user }) => user);

    return <NewTicketClient users={users} currentUserId={session.id} />;
}
