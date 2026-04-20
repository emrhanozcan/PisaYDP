'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import { MentorTransaction, TransactionStatus } from "@/types";

// ──────────────────────────────────────────────────────────
// Admin: İşlem durumunu güncelle (approve / reject / pending)
// ──────────────────────────────────────────────────────────
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
    revalidatePath('/mentor/finances');
    return { success: true };
}

// ──────────────────────────────────────────────────────────
// Admin & Mentor: Mentor işlemi ekle
//   - Admin: herhangi bir mentor adına her tip işlem
//   - Mentor: sadece kendi adına 'expense' veya 'advance'
// ──────────────────────────────────────────────────────────
export async function addMentorTransaction(formData: FormData) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'italy_staff' && session.role !== 'mentor')) {
        throw new Error("Unauthorized");
    }

    // Hangi mentor adına işlem yapılacak
    const targetMentorId = session.role === 'mentor'
        ? session.id
        : (formData.get('mentorId') as string);

    if (!targetMentorId) throw new Error("Mentor seçilmedi.");

    const type = formData.get('type') as MentorTransaction['type'];
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    if (!type || isNaN(amount) || amount <= 0) {
        throw new Error("Geçersiz tür veya miktar.");
    }

    // Mentor yalnızca expense / advance ekleyebilir; ödeme kaydı sadece admin yapar
    if (session.role === 'mentor' && type === 'payment') {
        throw new Error("Mentorlar 'ödeme' tipi işlem ekleyemez; bu işlem yönetici tarafından yapılır.");
    }

    const transaction: Partial<MentorTransaction> = {
        mentorId: targetMentorId,
        type,
        amount,
        description,
        status: session.role === 'mentor' ? 'pending' : 'approved', // admin eklediği zaman direkt onaylı
    };

    await db.mentorTransactions.create(transaction);

    revalidatePath('/admin/finances');
    revalidatePath('/mentor/finances');
    return { success: true };
}

// ──────────────────────────────────────────────────────────
// Admin & Mentor: Mentor işlemini sil
//   - Admin: herhangi bir işlemi silebilir
//   - Mentor: sadece kendi 'pending' işlemlerini silebilir
// ──────────────────────────────────────────────────────────
export async function deleteMentorTransaction(transactionId: string) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'italy_staff' && session.role !== 'mentor')) {
        throw new Error("Unauthorized");
    }

    if (!transactionId) throw new Error("İşlem ID gerekli.");

    // Mentor için ek kontroller
    if (session.role === 'mentor') {
        const transactions = await db.mentorTransactions.getByMentorId(session.id);
        const tx = transactions.find(t => t.id === transactionId);

        if (!tx) throw new Error("İşlem bulunamadı veya bu işlem size ait değil.");
        if (tx.status !== 'pending') throw new Error("Sadece onay bekleyen (pending) işlemler silinebilir.");
    }

    await db.mentorTransactions.delete(transactionId);

    revalidatePath('/admin/finances');
    revalidatePath('/mentor/finances');
    return { success: true };
}

// ──────────────────────────────────────────────────────────
// Admin & Mentor: İşlem fiyatını (unitPrice) güncelle
//   - Bu action service_logs tablosundaki unitPrice'ı günceller
//   - Mentor: sadece kendi loglarında ve onaylanmamış durumlarda
//   - Admin: her logda
// ──────────────────────────────────────────────────────────
export async function updateServiceLogPrice(logId: string, unitPrice: number) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'italy_staff' && session.role !== 'mentor')) {
        throw new Error("Unauthorized");
    }

    if (isNaN(unitPrice) || unitPrice < 0) throw new Error("Geçersiz fiyat değeri.");

    const logs = await db.logs.getAll();
    const log = logs.find(l => l.id === logId);
    if (!log) throw new Error("İşlem kaydı bulunamadı.");

    if (session.role === 'mentor') {
        if (log.mentorId !== session.id) throw new Error("Yetkisiz: Sadece kendi işlemlerinizin fiyatını güncelleyebilirsiniz.");
        if (log.status === 'approved') throw new Error("Onaylanmış işlemlerin fiyatı değiştirilemez.");
    }

    await db.logs.update({
        ...log,
        unitPrice,
        updatedAt: new Date().toISOString()
    });

    revalidatePath(`/admin/students/${log.studentId}`);
    revalidatePath(`/mentor/students/${log.studentId}`);
    revalidatePath('/admin/payouts');
    revalidatePath('/mentor/earnings');

    return { success: true };
}

// ──────────────────────────────────────────────────────────
// Admin: Mentor total bakiyesini sıfırla / Manuel ödeme ekle
//   Aslında "ödeme" tipi transaction ekleyerek bakiyeyi dengeler
// ──────────────────────────────────────────────────────────
export async function addMentorPayment(mentorId: string, amount: number, description?: string) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'italy_staff')) {
        throw new Error("Unauthorized: Sadece yöneticiler ödeme kaydı ekleyebilir.");
    }

    if (!mentorId) throw new Error("Mentor seçilmedi.");
    if (isNaN(amount) || amount <= 0) throw new Error("Geçersiz ödeme miktarı.");

    const transaction: Partial<MentorTransaction> = {
        mentorId,
        type: 'payment',
        amount,
        description: description || 'Manuel ödeme',
        status: 'approved', // Ödemeler direkt onaylı
    };

    await db.mentorTransactions.create(transaction);

    revalidatePath('/admin/finances');
    revalidatePath('/mentor/finances');
    return { success: true };
}
