import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPhotoUpdate() {
    const studentId = 'bs-1770912702767'; // The one from previous logs
    console.log(`Starting isolated photo_url update test for ${studentId}...`);

    const { data, error } = await supabase
        .from('branch_students')
        .update({ photo_url: 'https://cdn.example.com/test.png' })
        .eq('id', studentId)
        .select();

    if (error) {
        console.log('UPDATE FAILED!');
        console.log('Error Message:', error.message);
        console.log('Error Details:', error.details);
        console.log('Error Hint:', error.hint);
    } else {
        console.log('UPDATE SUCCEEDED!');
        console.log('New data:', JSON.stringify(data[0], null, 2));
    }
}

testPhotoUpdate();
