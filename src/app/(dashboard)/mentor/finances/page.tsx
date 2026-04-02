import { Suspense } from 'react';
import MentorFinancesClient from './MentorFinancesClient';
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export const metadata = {
    title: 'Bakiye ve Masraflar | Mentor',
    description: 'Bakiye ve masraf ekranı'
};

export default async function MentorFinancesPage() {
    const session = await getSession();
    if (!session || session.role !== 'mentor') redirect('/login');

    const allLogs = await db.logs.getAll();
    const myLogs = allLogs.filter(l => l.mentorId === session.id && l.status === 'approved');
    const approvedEarnings = myLogs.reduce((sum, log) => sum + (log.unitPrice || 0), 0);

    const transactions = await db.mentorTransactions.getByMentorId(session.id);
    const approvedExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'approved').reduce((sum, t) => sum + Number(t.amount), 0);
    const receivedAdvances = transactions.filter(t => t.type === 'advance' && t.status === 'approved').reduce((sum, t) => sum + Number(t.amount), 0);
    const receivedPayments = transactions.filter(t => t.type === 'payment' && t.status === 'approved').reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = (approvedEarnings + approvedExpenses) - (receivedAdvances + receivedPayments);

    return (
        <div style={{ padding: '0 1rem' }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Finans verileri yükleniyor...</div>}>
                <MentorFinancesClient 
                    transactions={transactions}
                    balance={balance}
                    approvedEarnings={approvedEarnings}
                    approvedExpenses={approvedExpenses}
                    receivedAdvances={receivedAdvances}
                    receivedPayments={receivedPayments}
                />
            </Suspense>
        </div>
    );
}
