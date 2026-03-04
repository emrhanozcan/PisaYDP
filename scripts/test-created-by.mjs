import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const dummyLead = {
        first_name: 'Test 2',
        created_by: 'user-1771660341122'
    };
    const { error: err1 } = await supabase.from('leads').insert(dummyLead);
    console.log("Error inserting with created_by='user-1771660341122':", err1);
}

run();
