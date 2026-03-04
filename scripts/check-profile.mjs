import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const userId = 'user-1771660341122';

    // Try updating the user's branch_id to a mock value, or seeing what branch_id they have
    const { data: userProfile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', userId).single();
    console.log("Profile Data:", userProfile, "Error:", profileErr);

    // If branch_id is an enum/string, we can set it to 'sariyer'
    // Or maybe it's actually `branch_code`? Let's check keys in userProfile
    if (userProfile) {
        console.log("Profile keys:", Object.keys(userProfile));
    }
}

run();
