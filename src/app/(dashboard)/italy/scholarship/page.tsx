import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import ScholarshipClient from "./ScholarshipClient";
import { getScholarshipDashboardData } from "@/app/actions/scholarship";

export default async function ScholarshipPage() {
    const session = await getSession();

    if (!session || session.role !== 'italy_staff') {
        redirect('/login');
    }

    // Get ONLY students with Scholarship Package enabled
    const { students } = await getScholarshipDashboardData();

    // Map branch names
    const studentsWithBranch = students.map(s => ({
        ...s,
        branchName: BRANCH_NAMES[s.branchCode]
    }));
    const universities = await db.universities.getAll();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Burs Hizmeti Takibi
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Öğrencilerin burs başvuru ve sonuç süreçlerini yönetin.
                </p>
            </div>

            <ScholarshipClient
                initialStudents={studentsWithBranch}
                universities={universities}
            />
        </div>
    );
}
