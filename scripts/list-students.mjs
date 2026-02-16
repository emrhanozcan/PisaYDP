import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listStudents() {
    const { data: bStudents } = await supabase.from('branch_students').select('id, first_name, last_name, full_name');
    console.log('--- BRANCH STUDENTS ---');
    console.log(bStudents);

    const { data: students } = await supabase.from('students').select('id, first_name, last_name');
    console.log('\n--- STUDENTS ---');
    console.log(students);
}

listStudents();
