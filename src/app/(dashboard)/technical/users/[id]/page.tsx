
import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import { db } from '@/lib/db';
import UserDetailClient from './UserDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.role !== 'technical_support') {
        redirect('/login');
    }

    const user = await db.users.getById(id);

    if (!user) {
        notFound();
    }

    // Remove password before sending to client
    const { password: _, ...safeUser } = user;

    return <UserDetailClient user={safeUser} currentUserRole={session.role} />;
}
