'use server'

import { db } from "@/lib/db";
import { ServiceLog } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";

// Shared: Create Service Log (Optimized with Supabase Storage)
export async function createServiceLog(formData: FormData) {
    const session = await getSession();
    if (!session || (session.role !== 'mentor' && session.role !== 'admin' && session.role !== 'italy_staff')) {
        throw new Error("Unauthorized");
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

    const logId = `log-${Date.now()}`;
    const newLog: ServiceLog = {
        id: logId,
        studentId,
        mentorId: session.role === 'mentor' ? session.id : (formData.get('mentorId') as string || session.id), // Admin might assign another mentor? For now assume session.id if mentor, or form field if admin
        serviceTypeId,
        date: date || new Date().toISOString(),
        durationMinutes: duration,
        notes,
        attachments,
        status: session.role === 'admin' ? 'approved' : 'submitted', // Admin creates as approved?
        paymentStatus: session.role === 'admin' ? 'paid' : 'pending', // Optional default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Correction: Admin might be creating ON BEHALF of a mentor.
    // If Admin, they must specify mentorId. if not specified, maybe current user?
    // Let's stick to simple "Mentor creates for themselves" for now unless Admin UI allows selecting mentor.
    // The current UI (Mentor Dashboard) only allows Mentor to create. Admin creation UI is not specified yet, so this function primarily replaces `actions/mentor.ts`.

    await db.logs.create(newLog);

    await db.audit.create({
        id: `audit-${Date.now()}`,
        entity: 'ServiceLog',
        entityId: newLog.id,
        action: 'create',
        actorId: session.id,
        timestamp: new Date().toISOString()
    });

    revalidatePath(`/mentor/students/${studentId}`);
    if (session.role === 'admin') {
        revalidatePath(`/admin/payouts`);
    }
    // Optimization: Don't redirect if it's an AJAX/modal form? 
    // The original `createServiceLog` redirected.
    redirect(`/mentor/students/${studentId}`);
}

// Shared: Update Service Log (Mentor & Admin)
export async function updateServiceLogDetails(formData: FormData) {
    const session = await getSession();
    if (!session || (session.role !== 'mentor' && session.role !== 'admin' && session.role !== 'italy_staff')) {
        throw new Error("Unauthorized");
    }

    const logId = formData.get('logId') as string;
    const notes = formData.get('notes') as string;

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

    await db.logs.update({
        ...log,
        notes,
        attachments: updatedAttachments,
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
}
