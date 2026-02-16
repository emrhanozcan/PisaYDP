import { getSession } from "@/app/actions/auth";
import { getBranchStudents, getUniversities } from "@/app/actions/branch";
import { redirect } from "next/navigation";
import { BranchCode } from "@/types";
import StudentsClient from "./StudentsClient";

export default async function StudentsPage() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    const branchCode = session.branchCode as BranchCode;
    const branchStudents = await getBranchStudents(branchCode);

    // Get all global students for photo mapping
    const { db } = await import("@/lib/db");
    const globalStudents = await db.students.getAll();
    const globalPhotoMap = new Map(globalStudents.filter(s => s.email).map(s => [s.email!.toLowerCase(), s.photoUrl]));

    const students = branchStudents.map(s => {
        const globalPhoto = s.email ? globalPhotoMap.get(s.email.toLowerCase()) : undefined;
        return {
            ...s,
            photoUrl: globalPhoto || s.photoUrl
        };
    });

    const universities = await getUniversities();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Öğrenciler
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Şubenize kayıtlı öğrencileri görüntüleyin ve yönetin.
                </p>
            </div>

            <StudentsClient
                initialStudents={students}
                universities={universities}
                branchCode={branchCode}
            />
        </div>
    );
}
