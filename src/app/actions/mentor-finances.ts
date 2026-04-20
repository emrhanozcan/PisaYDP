'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import { MentorTransaction } from "@/types";

import { deleteMentorTransaction as adminDeleteTransaction, updateServiceLogPrice as adminUpdatePrice } from "@/app/actions/admin-finances";
import { deleteServiceLog as sharedDeleteLog } from "@/app/actions/service-logs";

// Wrap re-exports as required by Next.js Server Actions
export async function deleteMentorTransaction(id: string) {
    return adminDeleteTransaction(id);
}

export async function updateServiceLogPrice(logId: string, price: number) {
    return adminUpdatePrice(logId, price);
}

export async function deleteServiceLog(id: string) {
    return sharedDeleteLog(id);
}

export async function getMentorFinances() {
    const session = await getSession();
    if (!session || session.role !== 'mentor') {
        throw new Error("Unauthorized");
    }

    // 1. Get Service Logs (Earnings)
    const allLogs = await db.logs.getAll();
    const myLogs = allLogs.filter(l => l.mentorId === session.id);
    
    // Only approved logs count towards earnings
    const approvedLogs = myLogs.filter(l => l.status === 'approved');
    const approvedEarnings = approvedLogs.reduce((sum, log) => sum + (log.unitPrice || 0), 0);

    // 2. Get Mentor Transactions (Expenses, Advances, Payments)
    const transactions = await db.mentorTransactions.getByMentorId(session.id);

    // Calculate sums for approved transactions
    const approvedExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'approved')
                                         .reduce((sum, t) => sum + Number(t.amount), 0);
    const receivedAdvances = transactions.filter(t => t.type === 'advance' && t.status === 'approved')
                                         .reduce((sum, t) => sum + Number(t.amount), 0);
    const receivedPayments = transactions.filter(t => t.type === 'payment' && t.status === 'approved')
                                         .reduce((sum, t) => sum + Number(t.amount), 0);
    const parentPayments = transactions.filter(t => t.type === 'parent_payment' && t.status === 'approved')
                                         .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate balance
    // Balance = (What company owes mentor) - (What company already paid mentor)
    // Balance = (Earnings + Approved Expenses) - (Advances + CompanyPayments + ParentPayments)
    const balance = (approvedEarnings + approvedExpenses) - (receivedAdvances + receivedPayments + parentPayments);

    return {
        balance,
        approvedEarnings,
        approvedExpenses,
        receivedAdvances,
        receivedPayments,
        transactions
    };
}

export async function createMentorTransaction(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'mentor') {
        throw new Error("Unauthorized");
    }

    const type = formData.get('type') as 'expense' | 'advance' | 'parent_payment';
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    if (!type || !amount || parseFloat(amount.toString()) <= 0) {
        throw new Error("Geçersiz tür veya miktar.");
    }

    // Handle receipt upload if any (for expenses)
    let receiptUrl = '';
    const file = formData.get('receipt') as File;
    
    if (file && file.size > 0 && type === 'expense') {
        const { supabase } = await import('@/lib/supabase');
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `receipts/${session.id}/${Date.now()}-${safeName}`;

            const { error } = await supabase.storage
                .from('service-uploads') // Reusing existing bucket for simplicity, or we can use a new one if it existed
                .upload(fileName, buffer, {
                    contentType: file.type,
                    upsert: true
                });

            if (error) {
                console.error('Upload Error:', error);
                throw new Error("Fiş yüklenirken hata oluştu: " + error.message);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('service-uploads')
                .getPublicUrl(fileName);

            receiptUrl = publicUrl;
        } catch (err) {
            console.error('File processing error:', err);
            throw new Error("Fiş işlenemedi.");
        }
    }

    const transaction: Partial<MentorTransaction> = {
        mentorId: session.id,
        type,
        amount,
        description,
        receiptUrl: receiptUrl || undefined,
        status: 'pending'
    };

    await db.mentorTransactions.create(transaction);

    revalidatePath('/mentor/finances');
    return { success: true };
}
