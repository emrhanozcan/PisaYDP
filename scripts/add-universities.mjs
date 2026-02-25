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

const newUniversities = [
    "Brescia Üniversitesi",
    "Milano Devlet Üniversitesi",
    "Genova Üniversitesi",
    "Torino Üniversitesi",
    "Siena Üniversitesi",
    "Trento Üniversitesi",
    "Humanitas Üniversitesi",
    "Venedik Ca’Foscari Üniversitesi",
    "Verona Üniversitesi",
    "Trieste Üniversitesi",
    "Salerno Üniversitesi",
    "IULM Üniversitesi",
    "LUISS Üniversitesi",
    "Bari Aldo Moro Üniversitesi",
    "NABA Üniversitesi",
    "Salento Üniversitesi",
    "Cattholica Üniversitesi",
    "Napoli Federico II Üniversitesi",
    "IED Üniversitesi",
    "Bio Medico Üniversitesi",
    "San Raffaele Üniversitesi",
    "Katanya Üniversitesi",
    "Unicamillus Üniversitesi",
    "Roma Tre Üniversitesi",
    "Padova Üniversitesi",
    "Accademia Italiana",
    "Roma Tor Vergata Üniversitesi",
    "Bocconi Üniversitesi",
    "Politecnico di Torino Üniversitesi",
    "Pavia Üniversitesi",
    "Roma La Sapienza Üniversitesi",
    "Modena ve Reggio Emilia Üniversitesi",
    "Milano Biccoca Üniversitesi",
    "Messina Üniversitesi",
    "Floransa Üniversitesi",
    "Bologna Üniversitesi",
    "Insubria Üniversitesi",
    "RUFA Üniversitesi",
    "Politecnico di Milano Üniversitesi",
    "Politecnico di Marche",
    "Pisa Üniversitesi",
    "LINK CAMPUS Üniversitesi",
    "Quasar Design Üniversitesi",
    "UNINT",
    "Roma Foro Italico",
    "Tuscia Viterbo Üniversitesi",
    "Universita Europea",
    "Telematica Üniversiteleri",
    "Parma Üniversitesi",
    "Napoli Luigi Vanvitelli Üniversitesi",
    "Marangoni Üniversitesi",
    "LUMSA Üniversitesi",
    "Perugia Üniversitesi",
    "Bergamo Üniversitesi",
    "Cagliari Üniversitesi",
    "Cassino Üniversitesi",
    "Gastronomi Üniversitesi",
    "Saint Louis College of Music",
    "FIDI",
    "IUAV",
    "Domus Academy",
    "SPD",
    "Teramo Üniversitesi"
];

async function run() {
    // 1. Get existing universities
    const { data: existing, error: fetchError } = await supabase
        .from('universities')
        .select('name');

    if (fetchError) {
        console.error('Error fetching existing universities:', fetchError.message);
        return;
    }

    const existingNames = new Set(existing.map(u => u.name.trim().toLowerCase()));

    // 2. Identify missing ones
    const missing = newUniversities.filter(name => !existingNames.has(name.trim().toLowerCase()));

    if (missing.length === 0) {
        console.log('All universities are already in the database.');
        return;
    }

    console.log(`Found ${missing.length} missing universities. Inserting...`);

    // 3. Insert missing ones
    const toInsert = missing.map(name => ({
        id: `uni-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: name.trim(),
        country: 'İtalya',
        is_active: true
    }));

    // Insert in batches of 10 to be safe
    for (let i = 0; i < toInsert.length; i += 10) {
        const batch = toInsert.slice(i, i + 10);
        const { error: insertError } = await supabase
            .from('universities')
            .insert(batch);

        if (insertError) {
            console.error('Error inserting batch:', insertError.message);
        } else {
            console.log(`Inserted batch ${i / 10 + 1}`);
        }
    }

    console.log('Done!');
}

run();
