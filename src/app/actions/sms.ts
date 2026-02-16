'use server';

import { sendSMS } from '@/lib/sms';
import { getSession } from './auth';

export async function sendManualSMS(phones: string[], message: string) {
    const session = await getSession();
    if (!session || (session.role !== 'italy_staff' && session.role !== 'admin')) {
        return { success: false, error: 'Unauthorized' };
    }

    if (!phones || phones.length === 0 || !message) {
        return { success: false, error: 'Phone numbers and message are required' };
    }

    try {
        const result = await sendSMS(phones, message);
        return result;
    } catch (error) {
        console.error('Manual SMS Error:', error);
        return { success: false, error: 'Failed to send SMS' };
    }
}
