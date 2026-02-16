import { db } from './src/lib/db';

async function test() {
    console.log('--- DB.TS WRAPPER TEST ---');
    try {
        // Try to find a student
        const students = await db.branchStudents.getAll();
        if (students.length === 0) {
            console.log('No students found.');
            return;
        }
        const s = students[0];
        console.log(`Testing update for student: ${s.id} (${s.firstName} ${s.lastName})`);

        // This is exactly what the avatar upload does
        const result = await db.branchStudents.update({
            id: s.id,
            photoUrl: 'https://test-from-script.jpg'
        });

        console.log('SUCCESS! Result id:', result.id);
        console.log('Result photoUrl:', result.photoUrl);
    } catch (err: any) {
        console.error('FAILED with error:');
        console.error(err);
        if (err.details) console.error('Details:', err.details);
    }
}

test();
