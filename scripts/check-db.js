
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qolehozrpftiegpjkcdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGVob3pycGZ0aWVncGprY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU0NzksImV4cCI6MjA4NTk2MTQ3OX0.wnJvXPFRueaL0uLHSB5uSxWv-1NcVZjHYLCmM-Jk3YQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('Checking columns for branch_students...');

    // Try to select the specific column that failed
    const { data, error } = await supabase
        .from('branch_students')
        .select('residence_permit_handler')
        .limit(1);

    if (error) {
        console.error('Error fetching residence_permit_handler:', error.message);
        console.log('---');
        console.log('Attempting to fetch all available columns...');
        const { data: allData, error: allError } = await supabase
            .from('branch_students')
            .select('*')
            .limit(1);

        if (allError) {
            console.error('Error fetching all columns:', allError.message);
        } else if (allData && allData.length > 0) {
            console.log('Available columns:', Object.keys(allData[0]));
        } else {
            console.log('No data found in branch_students.');
        }
    } else {
        console.log('Column residence_permit_handler exists and is visible.');
    }
}

checkColumns();
