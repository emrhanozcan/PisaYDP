import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import AccommodationClient from "./AccommodationClient";

export default async function AccommodationPage() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    const branchCode = session.branchCode as BranchCode;

    // Get only students from this branch who have Accommodation Service
    const students = (await db.branchStudents.getByBranch(branchCode))
        .filter(s => s.accommodationService === 'Evet')
        .map(s => ({
            ...s,
            branchName: BRANCH_NAMES[branchCode]
        }));
    const universities = await db.universities.getAll();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Konaklama Hizmeti
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Öğrencilerin konaklama durumlarını ve başvurularını yönetin.
                </p>
            </div>

            <AccommodationClient
                initialStudents={students}
                universities={universities}
                branchCode={branchCode}
            />
        </div>
    );
}
