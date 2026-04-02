import { db } from "@/lib/db";
import FinancesClient from "./FinancesClient";

export default async function AdminFinancesPage() {
    const transactions = await db.mentorTransactions.getAll();
    const mentorUsers = (await db.users.getAll()).filter(u => u.role === 'mentor');

    // Transform data for client
    const transactionsData = transactions.map(t => {
        const mentor = mentorUsers.find(m => m.id === t.mentorId);
        return {
            id: t.id,
            mentorId: t.mentorId,
            mentorName: mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Bilinmiyor',
            type: t.type,
            amount: t.amount,
            description: t.description || '',
            receiptUrl: t.receiptUrl || '',
            status: t.status,
            createdAt: t.createdAt
        };
    });

    return (
        <FinancesClient transactions={transactionsData} />
    );
}
