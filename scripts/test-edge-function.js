const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEdgeFunction() {
    console.log('Testing invocation of "send-welcome-sms"...');

    // Mimic the payload structure from the user's snippet
    // body: { lead_id, first_name, last_name, phone, branch_id, custom_message }
    // But we want to send a generic SMS?
    // The user's snippet sends a "welcome" SMS.
    // If we want to send a "payment" SMS, this function might not support it unless it handles 'custom_message'.

    const payload = {
        body: {
            // These might be required by the function's schema
            lead_id: 'test-lead-id',
            first_name: 'Test',
            last_name: 'Student',
            phone: '5423297878', // User's requested phone
            branch_id: null,
            custom_message: 'PisaYDP Edge Function Test Message'
        }
    };

    const { data, error } = await supabase.functions.invoke('send-welcome-sms', payload);

    if (error) {
        console.error('Edge Function Error:', error);
    } else {
        console.log('Edge Function Success:', data);
    }
}

testEdgeFunction();
