import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const userId = 'user-1771660341122';

    // Find a branch first
    const { data: branches, error: branchesErr } = await supabase.from('branches').select('*').limit(1);
    if (branchesErr || !branches || branches.length === 0) {
        console.log("No branches found or error:", branchesErr);

        // Create a dummy branch
        console.log("Creating a dummy branch...");
        const { data: newBranch, error: createErr } = await supabase.from('branches').insert({ name: 'Merkez Şube', code: 'MERKEZ' }).select().single();
        if (createErr) {
            console.error("Failed to create branch:", createErr);
            return;
        }
        await assignBranch(userId, newBranch.id);
    } else {
        // Assign to existing branch
        await assignBranch(userId, branches[0].id);
    }
}

async function assignBranch(userId, branchId) {
    console.log(`Assigning branch ${branchId} to user ${userId}...`);
    const { data, error } = await supabase.from('profiles').update({ branch_id: branchId }).eq('id', userId).select();

    if (error) {
        console.error("Failed to update profile:", error);
    } else {
        console.log("Profile updated successfully:", data);
    }

    // Also update all leads created by this user to have this branchId, if they were null
    console.log("Updating orphan leads...");
    const { data: leadData, error: leadErr } = await supabase.from('leads').update({ branch_id: branchId }).is('branch_id', null);
    if (!leadErr) {
        console.log("Updated orphan leads.");
    }
}

run();
