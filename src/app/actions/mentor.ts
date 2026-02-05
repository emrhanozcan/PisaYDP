'use server'

import { db } from "@/lib/db";
import { ServiceLog } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "./auth";

export async function createServiceLog(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'mentor') {
        throw new Error("Unauthorized");
    }

    const studentId = formData.get('studentId') as string;
    const serviceTypeId = formData.get('serviceTypeId') as string;
    const date = formData.get('date') as string; // defaults to 'datetime-local' string
    const duration = parseInt(formData.get('duration') as string || '0');
    const notes = formData.get('notes') as string;

    const newLog: ServiceLog = {
        id: `log-${Date.now()}`,
        studentId,
        mentorId: session.id,
        serviceTypeId,
        date: date || new Date().toISOString(),
        durationMinutes: duration,
        notes,
        status: 'submitted', // Auto-submit for now, or 'draft'
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.logs.create(newLog);

    db.audit.create({
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
