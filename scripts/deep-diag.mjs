import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepDiag() {
    console.log('--- DEEP DATABASE DIAGNOSTIC ---');

    // 1. Get a student to test with
    const { data: students } = await supabase.from('branch_students').select('*').limit(1);
    if (!students || students.length === 0) {
        console.log('No students found to test.');
        return;
    }
    const student = students[0];
    console.log('Testing with student ID:', student.id);
    console.log('Current full_name:', student.full_name);

    // 2. Try a "nothing" update - update a column that shouldn't affect full_name
    console.log('\n--- Test 1: Update photo_url (should be safe) ---');
    const { data: d1, error: e1 } = await supabase
        .from('branch_students')
        .update({ photo_url: 'https://test-' + Date.now() + '.jpg' })
        .eq('id', student.id)
        .select();

    if (e1) {
        console.error('Test 1 FAILED:', e1.message);
        console.error('Code:', e1.code);
        console.error('Details:', e1.details);
        console.error('Hint:', e1.hint);
    } else {
        console.log('Test 1 SUCCEEDED');
    }

    // 3. Try to update first_name (this affects full_name if it's generated)
    console.log('\n--- Test 2: Update first_name (affects full_name) ---');
    const { data: d2, error: e2 } = await supabase
        .from('branch_students')
        .update({ first_name: student.first_name }) // same name, but still an update
        .eq('id', student.id)
        .select();

    if (e2) {
        console.error('Test 2 FAILED:', e2.message);
        console.error('Details:', e2.details);
    } else {
        console.log('Test 2 SUCCEEDED');
    }
}

deepDiag();
