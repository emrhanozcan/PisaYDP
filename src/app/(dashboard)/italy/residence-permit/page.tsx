import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import ResidencePermitClient from "./ResidencePermitClient";

export default async function ResidencePermitPage() {
    const session = await getSession();

    if (!session || session.role !== 'italy_staff') {
        redirect('/login');
    }

    // Get all students from all branches
    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];
    const students = (await Promise.all(allBranches.map(async branchCode => {
        const branchStudents = await db.branchStudents.getByBranch(branchCode);
        return branchStudents.map(s => ({
            ...s,
            branchName: BRANCH_NAMES[branchCode]
        }));
    }))).flat();
    const universities = await db.universities.getAll();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Oturum İzni Takibi
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Öğrencilerin oturum izni (Permesso di Soggiorno) başvuru süreçlerini yönetin.
                </p>
            </div>

            <ResidencePermitClient
                initialStudents={students}
                universities={universities}
            />
        </div>
    );
}
