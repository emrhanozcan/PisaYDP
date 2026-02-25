import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
    console.error('Could not find Supabase URL or Key in .env');
    process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUniversities() {
    const { data: universities, error } = await supabase
        .from('universities')
        .select('name')
        .order('name');

    if (error) {
        console.error('Error fetching universities:', error.message);
        return;
    }

    console.log('Current Universities:');
    universities.forEach(u => console.log(`- ${u.name}`));
    console.log(`\nTotal: ${universities.length}`);
}

listUniversities();
