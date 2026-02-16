import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import NewUserClient from './NewUserClient';

export default async function NewUserPage() {
    const session = await getSession();

    if (!session || session.role !== 'technical_support') {
        redirect('/login');
    }

    return <NewUserClient />;
}
