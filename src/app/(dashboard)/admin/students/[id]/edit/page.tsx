
import { db } from "@/lib/db";
import StudentForm from "../../StudentForm";
import { redirect } from "next/navigation";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const student = db.branchStudents.getById(id);
    const universities = db.universities.getAll().sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    if (!student) {
        // Maybe it's a regular student?
        // If so, we might not be able to edit all fields, or we should upgrade them.
        // For now, redirect or show error.
        return (
            <div className="text-center py-20 text-gray-500">
                Öğrenci bulunamadı veya düzenlenebilir bir şube öğrencisi değil.
            </div>
        );
    }

    return (
        <StudentForm
            universities={universities}
            initialData={student}
            isEditing={true}
        />
    );
}
