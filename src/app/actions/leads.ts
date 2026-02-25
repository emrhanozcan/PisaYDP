'use server';

import { db } from '@/lib/db';
import { Lead } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createLead(data: Partial<Lead>) {
    try {
        const newLead = await db.leads.create(data);
        revalidatePath('/italy/leads');
        return { success: true, data: newLead };
    } catch (error: any) {
        console.error('Create Lead Error:', error);
        return { success: false, error: error.message || 'Lead oluşturulamadı.' };
    }
}

export async function updateLead(id: string, data: Partial<Lead>) {
    try {
        const updatedLead = await db.leads.update({ id, ...data });
        revalidatePath('/italy/leads');
        return { success: true, data: updatedLead };
    } catch (error: any) {
        console.error('Update Lead Error:', error);
        return { success: false, error: error.message || 'Lead güncellenemedi.' };
    }
}
