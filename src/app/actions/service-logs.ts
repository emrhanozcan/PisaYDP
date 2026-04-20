'use server'

import { db } from "@/lib/db";
import { ServiceLog } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";

// Shared: Create Service Log (Optimized with Supabase Storage)
export async function createServiceLog(formData: FormData) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'italy_staff' && session.role !== 'mentor')) {
        throw new Error("Yetkisiz işlem: Hizmet kaydı oluşturma yetkiniz bulunmamaktadır.");
    }

    const studentId = formData.get('studentId') as string;
    const serviceTypeId = formData.get('serviceTypeId') as string;
    const date = formData.get('date') as string;
    const duration = parseInt(formData.get('duration') as string || '0');
    const notes = formData.get('notes') as string;

    // Handle File Uploads via Supabase Storage
    const attachments: string[] = [];
    const files = formData.getAll('attachments') as File[];

    if (files.length > 0) {
        const { supabase } = await import('@/lib/supabase');

        // Parallel uploads
        const uploadPromises = files.map(async (file) => {
            if (file.size === 0) return null;

            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `logs/${studentId}/${Date.now()}-${safeName}`; // Group by studentId instead of logId since logId doesn't exist yet? Or gen ID first.

            // Generate ID first to organize folder better
            // actually we can just use timestamp-random for folder if we want, or just `logs/${fileName}`
            // Let's generate log ID first

            const { data, error } = await supabase.storage
                .from('service-uploads')
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (error) {
                console.error('Upload error:', error);
                throw new Error(`Upload failed for ${file.name}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('service-uploads')
                .getPublicUrl(fileName);

            return publicUrl;
        });

        const results = await Promise.all(uploadPromises);
        results.forEach(url => {
            if (url) attachments.push(url);
        });
    }

    // Mentor kendi adına işlem ekliyorsa mentorId session'dan gelir
    const mentorId = session.role === 'mentor'
        ? session.id
        : (formData.get('mentorId') as string);
    const unitPriceRaw = formData.get('unitPrice') as string;
    const customUnitPrice = unitPriceRaw ? parseFloat(unitPriceRaw) : undefined;

    if (!mentorId) {
        throw new Error("Lütfen hizmeti gerçekleştiren mentoru seçiniz.");
    }

    const newLog: any = {
        id: crypto.randomUUID(),
        studentId,
        mentorId: mentorId,
        serviceTypeId,
        date: date || new Date().toISOString(),
        durationMinutes: isNaN(duration) ? 0 : duration,
        notes,
        attachments,
        status: session.role === 'mentor' ? 'submitted' : 'assigned',
        paymentStatus: 'pending',
        unitPrice: (customUnitPrice !== undefined && !isNaN(customUnitPrice)) ? customUnitPrice : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await db.logs.create(newLog);

    await db.audit.create({
        id: `audit-${Date.now()}`,
        entity: 'ServiceLog',
        entityId: newLog.id,
        action: 'create',
        actorId: session.id,
        timestamp: new Date().toISOString()
    });

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath(`/mentor/students/${studentId}`);
    revalidatePath(`/admin/services`);
    revalidatePath(`/admin/payouts`);
    
    // Redirect depends on role
    if (session.role === 'mentor') {
        redirect(`/mentor/students/${studentId}`);
    } else {
        redirect(`/admin/students/${studentId}`);
    }
}

// Shared: Update Service Log (Mentor & Admin)
export async function updateServiceLogDetails(formData: FormData) {
    const session = await getSession();
    if (!session || (session.role !== 'mentor' && session.role !== 'admin' && session.role !== 'italy_staff')) {
        throw new Error("Unauthorized");
    }

    const logId = formData.get('logId') as string;
    const notes = formData.get('notes') as string;
    const duration = formData.get('duration') ? parseInt(formData.get('duration') as string) : undefined;
    const unitPriceRaw = formData.get('unitPrice') as string;
    const unitPrice = unitPriceRaw ? parseFloat(unitPriceRaw) : undefined;

    const logs = await db.logs.getAll();
    const log = logs.find(l => l.id === logId);

    if (!log) {
        throw new Error("Log not found");
    }

    // Authz Check
    if (session.role !== 'admin' && log.mentorId !== session.id) {
        throw new Error("Unauthorized: You can only edit your own logs");
    }

    // Handle New Uploads
    const newAttachments: string[] = [];
    const files = formData.getAll('attachments') as File[];

    if (files.length > 0) {
        const { supabase } = await import('@/lib/supabase');
        const uploadPromises = files.map(async (file) => {
            if (file.size === 0) return null;
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `logs/${logId}/${Date.now()}-${safeName}`;

            const { error } = await supabase.storage
                .from('service-uploads')
                .upload(fileName, file, { contentType: file.type, upsert: true });

            if (error) throw new Error(`Upload failed: ${error.message}`);

            const { data: { publicUrl } } = supabase.storage
                .from('service-uploads')
                .getPublicUrl(fileName);
            return publicUrl;
        });

        const results = await Promise.all(uploadPromises);
        results.forEach(url => { if (url) newAttachments.push(url); });
    }

    const updatedAttachments = [...(log.attachments || []), ...newAttachments];

    const destinationStatus = (formData.get('status') as import("@/types").ServiceStatus) || log.status;

    await db.logs.update({
        ...log,
        notes,
        durationMinutes: duration !== undefined ? duration : log.durationMinutes,
        attachments: updatedAttachments,
        unitPrice: unitPrice !== undefined ? unitPrice : log.unitPrice,
        status: destinationStatus,
        lastEditorRole: session.role === 'admin' ? 'admin' : 'mentor',
        updatedAt: new Date().toISOString()
    });

    await db.audit.create({
        id: `audit-${Date.now()}`,
        entity: 'ServiceLog',
        entityId: logId,
        action: 'update',
        actorId: session.id,
        changes: { notes, addedAttachments: newAttachments.length },
        timestamp: new Date().toISOString()
    });

    // Revalidate relevant paths
    revalidatePath('/mentor/earnings');
    revalidatePath('/admin/payouts');
    revalidatePath(`/mentor/students/${log.studentId}`);
    revalidatePath(`/admin/students/${log.studentId}`);
}

export async function updateServiceLogStatus(logId: string, status: 'approved' | 'rejected' | 'returned' | 'submitted') {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const logs = await db.logs.getAll();
    const log = logs.find(l => l.id === logId);
    if (!log) throw new Error("Log not found");

    // Only Admin can Approve/Reject/Return
    if (status === 'approved' || status === 'rejected' || status === 'returned') {
        if (session.role !== 'admin' && session.role !== 'italy_staff') {
            throw new Error("Sadece yöneticiler bu işlemi yapabilir.");
        }
    }

    // Mentor can move things to 'submitted' (de-facto handled by updateDetails, but for completeness)
    if (status === 'submitted' && log.mentorId !== session.id && session.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    await db.logs.update({
        ...log,
        status,
        updatedAt: new Date().toISOString()
    });

    await db.audit.create({
        id: `audit-${Date.now()}`,
        entity: 'ServiceLog',
        entityId: logId,
        action: 'status_change',
        actorId: session.id,
        changes: { status },
        timestamp: new Date().toISOString()
    });

    revalidatePath(`/admin/students/${log.studentId}`);
    revalidatePath(`/mentor/students/${log.studentId}`);
    revalidatePath('/admin/payouts');
    revalidatePath('/mentor/earnings');
    
    return { success: true };
}

// Shared: Delete Service Log (Mentor kendi bekleyen/atanmış logunu silebilir; Admin hepsini silebilir)
export async function deleteServiceLog(logId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const logs = await db.logs.getAll();
    const log = logs.find(l => l.id === logId);
    if (!log) throw new Error("Kayıt bulunamadı.");

    // Yetki kontrolü
    if (session.role === 'admin' || session.role === 'italy_staff') {
        // Admin her logu silebilir
    } else if (session.role === 'mentor') {
        // Mentor sadece kendi loglarını ve henüz onaylanmamış olanları silebilir
        if (log.mentorId !== session.id) {
            throw new Error("Yetkisiz: Sadece kendi işlemlerinizi silebilirsiniz.");
        }
        if (log.status === 'approved') {
            throw new Error("Onaylanmış işlemler silinemez.");
        }
    } else {
        throw new Error("Bu işlem için yetkiniz bulunmamaktadır.");
    }

    await db.logs.delete(logId);

    await db.audit.create({
        id: `audit-${Date.now()}`,
        entity: 'ServiceLog',
        entityId: logId,
        action: 'delete',
        actorId: session.id,
        timestamp: new Date().toISOString()
    });

    revalidatePath(`/admin/students/${log.studentId}`);
    revalidatePath(`/mentor/students/${log.studentId}`);
    revalidatePath('/admin/payouts');
    revalidatePath('/mentor/earnings');

    return { success: true };
}
