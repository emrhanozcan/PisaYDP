import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    console.log('Testing direct update on branch_students...');
    try {
        // Find a student first
        const { data: students } = await supabase.from('branch_students').select('id').limit(1);
        if (!students || students.length === 0) {
            console.log('No students found to test.');
            return;
        }
        const sid = students[0].id;
        console.log(`Trying to update photo_url for student ${sid}...`);

        // This is exactly what uploadStudentPhoto does
        const { data, error } = await supabase.from('branch_students')
            .update({ photo_url: 'https://example.com/test.jpg' })
            .eq('id', sid)
            .select();

        if (error) {
            console.error('Update FAILED with error:', error);
        } else {
            console.log('Update SUCCEEDED! Data:', data);
        }
    } catch (e) {
        console.error('Exception during test:', e);
    }
}

testUpdate();
