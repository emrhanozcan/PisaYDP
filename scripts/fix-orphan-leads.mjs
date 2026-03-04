import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.from('leads').update({ branch_id: 'ankara' }).is('branch_id', null).select();
    console.log("Orphan leads updated:", data?.length);
    if (error) console.error("Error updating orphan leads:", error);
}

run();
