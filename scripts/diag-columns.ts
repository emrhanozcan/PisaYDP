import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diag() {
    console.log('--- DIAGNOSTICS START ---');

    // 1. Check branch_students table for scholarship_types
    console.log('\n1. Checking table: branch_students');
    const { data: sData, error: sError } = await supabase.from('branch_students').select('scholarship_types').limit(1);
    if (sError) {
        console.error('Error fetching branch_students.scholarship_types:', sError.message);
    } else {
        console.log('branch_students.scholarship_types exists.');
    }

    // 2. Check scholarship_tracking for ALL fields
    console.log('\n2. Checking table: scholarship_tracking');
    const requiredCols = [
        'application_tuition_fee', 'application_tuition_fee_status',
        'application_isee_status', 'application_isee_status_status',
        'documents_survey_status', 'result_iban'
    ];

    const { data: tData, error: tError } = await supabase.from('scholarship_tracking').select(requiredCols.join(',')).limit(1);
    if (tError) {
        console.error('Error fetching scholarship_tracking columns:', tError.message);
        // If error is "column does not exist", it usually lists the first one that failed.
    } else {
        console.log('All checked columns in scholarship_tracking exist.');
    }
    console.log('--- DIAGNOSTICS END ---');
}

diag();
