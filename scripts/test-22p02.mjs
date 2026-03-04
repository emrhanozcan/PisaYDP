import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.rpc('get_leads_schema'); // This won't work if they don't have the RPC.
    // We can just try to insert a dummy lead and see the exact error.
    const dummyLead = {
        first_name: 'Test',
        branch_id: 'ankara',
        created_by: 'invalid-uuid-format'
    };
    const { error: err1 } = await supabase.from('leads').insert(dummyLead);
    console.log("Error inserting with invalid created_by (UUID):", err1);

    const { error: err2 } = await supabase.from('leads').insert({ first_name: 'Test', branch_id: 'ankara' });
    console.log("Error inserting with branch_id = ankara (TEXT/UUID?):", err2);
}

run();
