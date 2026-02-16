'use server';

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function uploadUserPhoto(userId: string, formData: FormData) {
    try {
        const file = formData.get('photo') as File;
        if (!file) throw new Error('Fotoğraf dosyası bulunamadı');

        const fileExt = file.name.split('.').pop();
        const fileName = `user-${userId}-${Date.now()}.${fileExt}`;
        const filePath = `user-photos/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();

        // 1. Upload to Supabase Storage
        let { data: uploadData, error: uploadError } = await supabase.storage
            .from('student-photos')
            .upload(filePath, arrayBuffer, {
                contentType: file.type,
                upsert: true
            });

        // Try to create bucket if it doesn't exist (fallback, though student-photos should exist)
        if (uploadError && (uploadError.message === 'Bucket not found' || (uploadError as any).error === 'Bucket not found')) {
            await supabase.storage.createBucket('student-photos', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
            });

            // Retry upload
            const retry = await supabase.storage
                .from('student-photos')
                .upload(filePath, arrayBuffer, {
                    contentType: file.type,
                    upsert: true
                });
            uploadData = retry.data;
            uploadError = retry.error;
        }

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('student-photos')
            .getPublicUrl(filePath);

        // 3. Update Database
        await db.users.update({ id: userId, photoUrl: publicUrl } as any);

        // Revalidate relevant paths
        revalidatePath('/admin/mentors');
        revalidatePath(`/admin/mentors/${userId}`);
        revalidatePath('/mentor/settings');
        revalidatePath('/admin/payouts');
        revalidatePath('/mentor/earnings');

        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error('Error uploading user photo:', error);
        return { success: false, error: error.message };
    }
}

export async function removeUserPhoto(userId: string) {
    try {
        // 1. Get user to find old photo URL
        const user = await db.users.getById(userId);
        const currentPhotoUrl = user?.photoUrl || '';

        // 2. Clear from database
        if (user) {
            await db.users.update({ id: userId, photoUrl: '' } as any);
        }

        // 3. Delete from storage if exists
        if (currentPhotoUrl) {
            const pathMatches = currentPhotoUrl.match(/user-photos\/[^?]+/);
            if (pathMatches) {
                const filePath = pathMatches[0];
                await supabase.storage.from('student-photos').remove([filePath]);
            }
        }

        revalidatePath('/admin/mentors');
        revalidatePath(`/admin/mentors/${userId}`);
        revalidatePath('/mentor/settings');
        revalidatePath('/admin/payouts');
        revalidatePath('/mentor/earnings');

        return { success: true };
    } catch (error: any) {
        console.error('Error removing user photo:', error);
        return { success: false, error: error.message };
    }
}
