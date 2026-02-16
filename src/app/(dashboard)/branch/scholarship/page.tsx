import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import ScholarshipClient from "./ScholarshipClient";
import { getBranchScholarshipDashboardData } from "@/app/actions/scholarship";

export default async function ScholarshipPage() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    const branchCode = session.branchCode as BranchCode;

    // Get ONLY students with Scholarship Package enabled
    const { students } = await getBranchScholarshipDashboardData(branchCode);

    // Add branch name manually since server action might not include it (though Client doesn't strictly define it in props, it's safer)
    const studentsWithBranch = students.map(s => ({
        ...s,
        branchName: BRANCH_NAMES[branchCode]
    }));
    const universities = await db.universities.getAll();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Burs Hizmeti Takibi
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Şubenize kayıtlı öğrencilerin burs başvuru ve sonuç süreçlerini yönetin.
                </p>
            </div>

            <ScholarshipClient
                initialStudents={studentsWithBranch}
                universities={universities}
            />
        </div>
    );
}
