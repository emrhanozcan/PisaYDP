import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diag() {
    console.log('--- DATABASE TRIGGER DIAGNOSTIC ---');
    try {
        // Query pg_trigger to find triggers on our tables
        const { data, error } = await supabase.rpc('get_table_triggers', { table_name: 'branch_students' });
        if (error) {
            console.log('RPC get_table_triggers failed, trying raw query via select...');
            // Fallback: try to see if we can get anything from information_schema via a trick or just raw SQL if enabled
            // Usually RLS prevents this, but let's try a simple select from a known system-like table if any
        } else {
            console.log('Triggers found:', data);
        }

        // Let's try to get column info including "is_generated"
        const { data: cols, error: colErr } = await supabase.from('branch_students').select('*').limit(1);
        if (cols && cols[0]) {
            console.log('Checking keys in data...');
            console.log(Object.keys(cols[0]));
        }

    } catch (e) {
        console.error(e);
    }
}

diag();
