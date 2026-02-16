import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableType() {
    console.log('--- TABLE VS VIEW CHECK ---');
    try {
        // We can check if it exists in information_schema.tables
        // But anon user usually can't. Let's try to update but with an invalid column to see the error.
        const { error } = await supabase.from('branch_students').update({ this_does_not_exist: 1 }).eq('id', 'x');
        console.log('Error message:', error?.message);

        // This usually reveals if it's a relation, view, etc.
        // Postgres error messages for views are different.
    } catch (e) {
        console.error(e);
    }
}

checkTableType();
