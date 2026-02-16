import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNoSelect() {
    const studentId = 'bs-1770923878393';
    console.log(`Starting update test WITHOUT .select() for ${studentId}...`);

    // Exact same call as in student-photo.ts
    const { error } = await supabase
        .from('branch_students')
        .update({ photo_url: 'https://cdn.example.com/no-select.png' })
        .eq('id', studentId);

    if (error) {
        console.log('UPDATE FAILED!');
        console.log(error);
    } else {
        console.log('UPDATE SUCCEEDED (no error returned)!');
    }
}

testNoSelect();
