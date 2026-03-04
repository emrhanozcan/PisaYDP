import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const userId = 'user-1771660341122';

    const { data: users, error: userErr } = await supabase.from('users').select('*').eq('id', userId);
    console.log("Users Data:", users, "Error:", userErr);
}

run();
