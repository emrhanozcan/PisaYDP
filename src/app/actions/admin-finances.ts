'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import { TransactionStatus } from "@/types";

export async function updateMentorTransactionStatus(transactionId: string, newStatus: TransactionStatus) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'italy_staff')) {
        throw new Error("Unauthorized");
    }

    if (!transactionId || !newStatus) {
        throw new Error("Geçersiz işlem.");
    }

    await db.mentorTransactions.update({
        id: transactionId,
        status: newStatus
    });

    revalidatePath('/admin/finances');
    revalidatePath('/mentor/finances'); // Also revalidate mentor dashboard
    return { success: true };
}
