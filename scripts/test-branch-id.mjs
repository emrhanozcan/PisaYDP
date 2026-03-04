import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.from('leads').update({ branch_id: 'ankara' }).eq('id', 'eba86503-21af-4c3e-b5f7-640578ef2b81').select();
    console.log("Update result:", data);
    if (error) console.error("Error:", error);
}

run();
