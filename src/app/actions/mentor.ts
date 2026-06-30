'use server'

import { db } from "@/lib/db";
import { ServiceLog } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "./auth";

export async function createServiceLog(formData: FormData) {
    const session = await getSession();
    if (!session || session.role === 'mentor') {
        throw new Error("Yetkisiz işlem: Hizmet girişleri artık sadece yönetim tarafından yapılmaktadır.");
    }

    const studentId = formData.get('studentId') as string;
    const serviceTypeId = formData.get('serviceTypeId') as string;
    const date = formData.get('date') as string; // defaults to 'datetime-local' string
    const duration = parseInt(formData.get('duration') as string || '0');
    const notes = formData.get('notes') as string;

    // Verify service type is allowed for this mentor-student assignment
    const assignments = await db.assignments.getByStudentId(studentId);
    const assignment = assignments.find(a => a.mentorId === session.id);
    
    if (!assignment) {
        throw new Error("Bu öğrenci için atamanız bulunamadı.");
    }

    // Only enforce if allowedServiceIds exists (new assignments)
    if (assignment.allowedServiceIds !== undefined) {
        if (!assignment.allowedServiceIds.includes(serviceTypeId)) {
            throw new Error("Bu hizmeti bu öğrenci için girme yetkiniz bulunmuyor. Lütfen yönetici ile iletişime geçin.");
        }
    }

    // Handle File Uploads
    const attachments: string[] = [];
    const files = formData.getAll('attachments') as File[];

    if (files.length > 0) {
        const { supabase } = await import('@/lib/supabase');

        for (const file of files) {
            if (file.size > 0) {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    // Sanitize filename
                    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `logs/new/${Date.now()}-${safeName}`;

                    const { error } = await supabase.storage
                        .from('service-uploads')
                        .upload(fileName, buffer, {
                            contentType: file.type,
                            upsert: true
                        });

                    if (error) {
                        console.error('Upload Error:', error);
                        continue;
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('service-uploads')
                        .getPublicUrl(fileName);

                    attachments.push(publicUrl);
                } catch (err) {
                    console.error('File processing error:', err);
                }
            }
        }
    }

    const newLog: ServiceLog = {
        id: `log-${Date.now()}`,
        studentId,
        mentorId: session.id,
        serviceTypeId,
        date: date || new Date().toISOString(),
        durationMinutes: duration,
        notes,
        attachments,
        status: 'submitted', // Auto-submit for now, or 'draft'
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

    revalidatePath(`/mentor/students/${studentId}`);
    redirect(`/mentor/students/${studentId}`);
}

// Mentor: Update service log status
export async function updateMentorServiceStatus(logId: string, status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'assigned' | 'returned') {
    const session = await getSession();
    if (!session || session.role !== 'mentor') {
        throw new Error("Unauthorized");
    }

    const logs = await db.logs.getAll();
    const log = logs.find(l => l.id === logId && l.mentorId === session.id);
    if (!log) {
        throw new Error("Log not found or unauthorized");
    }

    // Mentor can update to any logical status
    const validStatuses = ['draft', 'submitted', 'approved', 'rejected', 'assigned', 'returned'];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
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

    revalidatePath('/mentor/earnings');
    revalidatePath('/admin/payouts');
    revalidatePath('/admin/logs');
}

export async function updateMentorServiceLog(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'mentor') {
        throw new Error("Unauthorized");
    }

    const logId = formData.get('logId') as string;
    const notes = formData.get('notes') as string;

    const logs = await db.logs.getAll();
    const log = logs.find(l => l.id === logId && l.mentorId === session.id);

    if (!log) {
        throw new Error("Log not found or unauthorized");
    }

    // Handle NEW File Uploads via Supabase Storage
    const newAttachments: string[] = [];
    const files = formData.getAll('attachments') as File[];

    console.log(`[updateMentorServiceLog] Received ${files.length} files.`);

    // Check if bucket exists, if not try to create it (optional, but good for robustness)
    // Note: Creating buckets usually requires service role, which we have in db.ts context but maybe not exposed here directly
    // checking via simple list or upload assumption

    // We import supabase from lib/supabase which uses service role if available
    const { supabase } = await import('@/lib/supabase');

    for (const file of files) {
        if (file.size > 0) {
            console.log(`[updateMentorServiceLog] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

            try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Sanitize filename
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const fileName = `logs/${logId}/${Date.now()}-${safeName}`;

                const { data, error } = await supabase.storage
                    .from('service-uploads')
                    .upload(fileName, buffer, {
                        contentType: file.type,
                        upsert: true
                    });

                if (error) {
                    console.error('[updateMentorServiceLog] Storage Upload Error:', error);
                    // Fallback or throw? Let's throw to inform user
                    throw new Error(`Upload failed for ${file.name}: ${error.message}`);
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('service-uploads')
                    .getPublicUrl(fileName);

                newAttachments.push(publicUrl);
            } catch (err: any) {
                console.error('[updateMentorServiceLog] Error processing file:', err);
                throw new Error(`Failed to process file ${file.name}`);
            }
        }
    }

    // Combine existing and new attachments
    const updatedAttachments = [...(log.attachments || []), ...newAttachments];
    console.log(`[updateMentorServiceLog] Total attachments after update: ${updatedAttachments.length}`);

    await db.logs.update({
        ...log,
        notes,
        attachments: updatedAttachments,
        lastEditorRole: 'mentor',
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


    revalidatePath('/mentor/earnings');
    revalidatePath(`/mentor/students/${log.studentId}`);
}

export async function requestStudentRemoval(studentId: string, reason: string) {
    const session = await getSession();
    if (!session || session.role !== 'mentor') return { success: false, message: "Unauthorized" };

    // Check for existing open ticket
    const existingTickets = (await db.supportTickets.getByUser(session.id))
        .filter(t => t.status !== 'closed' && t.status !== 'resolved' && t.subject.includes(`[MENTOR_REMOVE]`) && t.description.includes(studentId));

    if (existingTickets.length > 0) {
        return { success: false, message: "Bu öğrenci için zaten açık bir kaldırma talebiniz var." };
    }

    const student = await db.students.getById(studentId) || await db.branchStudents.getById(studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : studentId;

    const ticketNumber = await db.supportTickets.generateTicketNumber();

    const newTicket: any = { // Type assertion using any to avoid strict type checks if some unnecessary fields are missing
        id: `ticket-${Date.now()}`,
        ticketNumber,
        userId: session.id,
        userName: `${session.firstName} ${session.lastName}`,
        userRole: session.role,
        category: 'other',
        priority: 'medium',
        subject: `[MENTOR_REMOVE] ${studentName}`,
        description: `Mentor ${session.firstName} ${session.lastName} şu öğrenciyi listesinden kaldırmak istiyor:\n\nÖğrenci: ${studentName} (ID: ${studentId})\nSebep: ${reason}`,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await db.supportTickets.create(newTicket);

    // Notify Admins
    const admins = (await db.users.getAll()).filter(u => u.role === 'admin');
    for (const admin of admins) {
        await db.notifications.create({
            id: `notif-${Date.now()}-${admin.id}`,
            userId: admin.id,
            type: 'system',
            title: 'Yeni Mentor Talebi',
            message: `${session.firstName} ${session.lastName} bir öğrenciyi kaldırmak istiyor.`,
            relatedTicketId: newTicket.id,
            isRead: false,
            createdAt: new Date().toISOString()
        });
    }

    revalidatePath('/mentor');
    return { success: true, message: "Talep oluşturuldu." };
}

export async function updateMentorIban(iban: string) {
    const session = await getSession();
    if (!session || session.role !== 'mentor') {
        throw new Error("Unauthorized");
    }

    const mentor = await db.users.getById(session.id);
    if (!mentor) {
        throw new Error("Mentor not found");
    }

    await db.users.update({
        ...mentor,
        iban: iban.trim()
    });

    revalidatePath('/mentor/settings');
    return { success: true, message: "IBAN başarıyla güncellendi." };
}
