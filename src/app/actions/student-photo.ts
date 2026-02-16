'use server';

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function uploadStudentPhoto(studentId: string, formData: FormData, table: 'students' | 'branch_students') {
    try {
        const file = formData.get('photo') as File;
        if (!file) throw new Error('Fotoğraf dosyası bulunamadı');

        const fileExt = file.name.split('.').pop();
        const fileName = `${studentId}-${Date.now()}.${fileExt}`;
        const filePath = `profile-photos/${fileName}`;

        // Convert File to Buffer/ArrayBuffer for Supabase Upload
        const arrayBuffer = await file.arrayBuffer();

        // 1. Upload to Supabase Storage
        let { data: uploadData, error: uploadError } = await supabase.storage
            .from('student-photos')
            .upload(filePath, arrayBuffer, {
                contentType: file.type,
                upsert: true
            });

        // If bucket doesn't exist, try to create it (if we have service role key)
        if (uploadError && (uploadError.message === 'Bucket not found' || (uploadError as any).error === 'Bucket not found')) {
            console.log('Bucket "student-photos" not found, attempting to create...');
            const { error: createError } = await supabase.storage.createBucket('student-photos', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
            });

            if (!createError) {
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
        }

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('student-photos')
            .getPublicUrl(filePath);

        // 3. Update Database
        if (table === 'branch_students') {
            await db.branchStudents.update({ id: studentId, photoUrl: publicUrl });
        } else {
            await db.students.update({ id: studentId, photoUrl: publicUrl });
        }

        revalidatePath('/admin/students');
        revalidatePath(`/admin/students/${studentId}`);
        revalidatePath('/branch/students');

        // Italy Panel
        revalidatePath('/italy/students');
        revalidatePath('/italy/residence-permit');
        revalidatePath('/italy/life-support');
        revalidatePath('/italy/guardian-service');
        revalidatePath('/italy/accommodation');

        // Mentor Panel
        revalidatePath('/mentor');

        // Dashboards
        revalidatePath('/admin');
        revalidatePath('/branch');
        revalidatePath('/italy');

        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error('Error uploading student photo:', error);
        return { success: false, error: error.message };
    }
}

export async function removeStudentPhoto(studentId: string, table: 'students' | 'branch_students') {
    try {
        // 1. Get student to find old photo URL
        let currentPhotoUrl = '';
        if (table === 'branch_students') {
            const student = await db.branchStudents.getById(studentId);
            currentPhotoUrl = student?.photoUrl || '';
            if (student) await db.branchStudents.update({ id: studentId, photoUrl: '' });
        } else {
            const student = await db.students.getById(studentId);
            currentPhotoUrl = student?.photoUrl || '';
            if (student) await db.students.update({ id: studentId, photoUrl: '' });
        }

        // 2. Delete from storage if exists
        if (currentPhotoUrl) {
            const pathMatches = currentPhotoUrl.match(/profile-photos\/[^?]+/);
            if (pathMatches) {
                const filePath = pathMatches[0];
                await supabase.storage.from('student-photos').remove([filePath]);
            }
        }

        revalidatePath('/admin/students');
        revalidatePath(`/admin/students/${studentId}`);
        revalidatePath('/branch/students');

        // Italy Panel
        revalidatePath('/italy/students');
        revalidatePath('/italy/residence-permit');
        revalidatePath('/italy/life-support');
        revalidatePath('/italy/guardian-service');
        revalidatePath('/italy/accommodation');

        // Mentor Panel
        revalidatePath('/mentor');

        // Dashboards
        revalidatePath('/admin');
        revalidatePath('/branch');
        revalidatePath('/italy');

        return { success: true };
    } catch (error: any) {
        console.error('Error removing student photo:', error);
        return { success: false, error: error.message };
    }
}
