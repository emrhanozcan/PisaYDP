import { db } from "@/lib/db";
import StudentForm from "../StudentForm";

export default function NewStudentPage() {
    const universities = db.universities.getAll().sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    return (
        <StudentForm universities={universities} />
    );
}
