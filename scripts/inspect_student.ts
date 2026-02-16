
import { db } from './src/lib/db';

async function inspectStudent() {
    const students = await db.branchStudents.getAll();
    const targetStudent = students.find(s => s.firstName.toLowerCase().includes('test') && s.lastName.toLowerCase().includes('tset'));

    if (targetStudent) {
        console.log('--- Branch Student Data ---');
        console.log('ID:', targetStudent.id);
        console.log('Name:', targetStudent.firstName, targetStudent.lastName);
        console.log('School (Legacy Text):', targetStudent.school); // This property might not exist on BranchStudent type, but let's check if it comes from DB
        console.log('University ID:', targetStudent.universityId);
        console.log('Educations:', JSON.stringify(targetStudent.educations, null, 2));

        if (targetStudent.universityId) {
            const uni = await db.universities.getById(targetStudent.universityId);
            console.log('Resolved University (from ID):', uni?.name);
        }
    } else {
        console.log('Student "test tset" not found in branch_students.');

        // Check main students table just in case
        const allStudents = await db.students.getAll();
        const targetStudentMain = allStudents.find(s => s.firstName.toLowerCase().includes('test') && s.lastName.toLowerCase().includes('tset'));

        if (targetStudentMain) {
            console.log('--- Main Student Data ---');
            console.log('ID:', targetStudentMain.id);
            console.log('Name:', targetStudentMain.firstName, targetStudentMain.lastName);
            console.log('School:', targetStudentMain.school);
            console.log('Educations:', JSON.stringify(targetStudentMain.educations, null, 2));
        } else {
            console.log('Student not found in main students table either.');
        }
    }
}

inspectStudent();
