import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import AccommodationClient from "./AccommodationClient";

export default async function AccommodationPage() {
    const session = await getSession();

    if (!session || session.role !== 'italy_staff') {
        redirect('/login');
    }

    // Get all students from all branches
    // Get all students from all branches who have Accommodation Service
    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];
    const students = (await Promise.all(allBranches.map(async branchCode => {
        const branchStudents = await db.branchStudents.getByBranch(branchCode);
        return branchStudents
            .filter(s => s.accommodationService === 'Evet')
            .map(s => ({
                ...s,
                branchName: BRANCH_NAMES[branchCode]
            }));
    }))).flat();
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
            />
        </div>
    );
}
