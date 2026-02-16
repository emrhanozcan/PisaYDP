
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying implementation...');

    // 1. Check Service Notes Table
    const { count, error: notesError } = await supabase
        .from('service_notes')
        .select('*', { count: 'exact', head: true });

    if (notesError) {
        if (notesError.code === '42P01') {
            console.error('❌ Table `service_notes` DOES NOT EXIST.');
        } else {
            console.error('❌ Error checking `service_notes`:', notesError.message);
        }
    } else {
        console.log('✅ Table `service_notes` exists.');
    }

    // 2. Check Service Uploads Table
    const { count: uploadsCount, error: uploadsError } = await supabase
        .from('service_uploads')
        .select('*', { count: 'exact', head: true });

    if (uploadsError) {
        if (uploadsError.code === '42P01') {
            console.error('❌ Table `service_uploads` DOES NOT EXIST.');
        } else {
            console.error('❌ Error checking `service_uploads`:', uploadsError.message);
        }
    } else {
        console.log('✅ Table `service_uploads` exists.');
    }

    // 3. Check Storage Bucket
    const { data: bucket, error: bucketError } = await supabase
        .storage
        .getBucket('service-uploads');

    if (bucketError) {
        console.error('❌ Storage bucket `service-uploads` DOES NOT EXIST or is not accessible:', bucketError.message);
    } else {
        console.log('✅ Storage bucket `service-uploads` exists.');
    }
}

verify();
