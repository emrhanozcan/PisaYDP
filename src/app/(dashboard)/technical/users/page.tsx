import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import UsersClient from './UsersClient';
import { db } from '@/lib/db';

export default async function UsersPage() {
    const session = await getSession();

    if (!session || session.role !== 'technical_support') {
        redirect('/login');
    }

    const users = (await db.users.getAll()).map(({ password, ...user }) => user);

    return <UsersClient initialUsers={users} />;
}
