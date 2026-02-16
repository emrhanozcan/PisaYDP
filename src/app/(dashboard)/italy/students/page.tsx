import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import StudentsClient from "./StudentsClient";

export default async function StudentsPage() {
    const session = await getSession();

    if (!session || session.role !== 'italy_staff') {
        redirect('/login');
    }

    // Get main students for photo lookup
    const globalStudents = await db.students.getAll();
    const globalPhotoMap = new Map(globalStudents.filter(s => s.email).map(s => [s.email!.toLowerCase(), s.photoUrl]));

    // Get all students from all branches in single query
    const allStudents = await db.branchStudents.getAll();
    const students = allStudents.map(s => {
        const globalPhoto = s.email ? globalPhotoMap.get(s.email.toLowerCase()) : undefined;
        return {
            ...s,
            branchName: BRANCH_NAMES[s.branchCode],
            photoUrl: globalPhoto || s.photoUrl
        };
    });
    const universities = await db.universities.getAll();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Öğrenciler
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Tüm şubelere kayıtlı öğrencileri görüntüleyin.
                </p>
            </div>

            <StudentsClient
                initialStudents={students}
                universities={universities}
            />
        </div>
    );
}
