'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getServiceNote(studentId: string, serviceType: string) {
    try {
        const note = await db.serviceNotes.get(studentId, serviceType);
        return { success: true, data: note };
    } catch (error: any) {
        console.error('Error fetching service note:', error);
        return { success: false, error: error.message };
    }
}

export async function saveServiceNote(studentId: string, serviceType: string, note: string) {
    try {
        await db.serviceNotes.upsert({
            studentId,
            serviceType,
            note,
            updatedAt: new Date().toISOString()
        });

        revalidatePath('/branch/accommodation');
        revalidatePath('/branch/life-support');
        revalidatePath('/italy/accommodation');
        revalidatePath('/italy/life-support');

        return { success: true };
    } catch (error: any) {
        console.error('Error saving service note:', error);
        return { success: false, error: error.message };
    }
}
