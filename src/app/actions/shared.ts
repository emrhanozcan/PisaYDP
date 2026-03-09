'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";

export async function deleteServiceLogAttachment(logId: string, attachmentUrl: string) {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const logs = await db.logs.getAll();
    const log = logs.find(l => l.id === logId);

    if (!log) {
        throw new Error("Log not found");
    }

    // Authorization check
    // Admin and Italy Staff can delete any. Mentor can only delete their own.
    if (session.role !== 'admin' && session.role !== 'italy_staff' && (session.role !== 'mentor' || log.mentorId !== session.id)) {
        throw new Error("Unauthorized access to this log");
    }

    const updatedAttachments = (log.attachments || []).filter(url => url !== attachmentUrl);

    await db.logs.update({
        ...log,
        attachments: updatedAttachments,
        updatedAt: new Date().toISOString()
    });

    await db.audit.create({
        id: `audit-${Date.now()}`,
        entity: 'ServiceLog',
        entityId: logId,
        action: 'update',
        actorId: session.id,
        changes: { deletedAttachment: attachmentUrl },
        timestamp: new Date().toISOString()
    });

    revalidatePath('/admin/services');
    revalidatePath('/mentor/earnings');
    revalidatePath(`/mentor/students/${log.studentId}`);
}
