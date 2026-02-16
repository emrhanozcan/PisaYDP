import { db } from "@/lib/db";
import StudentForm from "../StudentForm";

export default async function NewStudentPage() {
    const universities = (await db.universities.getAll()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    return (
        <StudentForm universities={universities} />
    );
}
