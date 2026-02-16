import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diag() {
    try {
        const { data, error } = await supabase.from('branch_students').select('*').limit(1);
        if (data && data.length > 0) {
            const keys = Object.keys(data[0]);
            console.log('--- ALL COLUMNS ---');
            console.log(JSON.stringify(keys));

            const problematic = keys.filter(k =>
                k.toLowerCase().includes('name') ||
                k.toLowerCase().includes('search') ||
                k.toLowerCase().includes('full')
            );
            console.log('--- POTENTIAL PROBLEMATIC COLUMNS ---');
            console.log(problematic);
        } else {
            console.log('No rows found.');
        }
    } catch (e) {
        console.error(e);
    }
}

diag();
