import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import GuardianServiceClient from "./GuardianServiceClient";

export default async function GuardianServicePage() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    const branchCode = session.branchCode as BranchCode;

    // Get only students from this branch
    const students = (await db.branchStudents.getByBranch(branchCode))
        .filter(s => s.guardianService === 'Evet')
        .map(s => ({
            ...s,
            branchName: BRANCH_NAMES[branchCode]
        }));

    const universities = await db.universities.getAll();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Vasi Hizmeti Takibi
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Şubenize kayıtlı öğrencilerin vasi (Guardian) hizmeti süreçlerini yönetin.
                </p>
            </div>

            <GuardianServiceClient
                initialStudents={students}
                universities={universities}
                branchCode={branchCode}
            />
        </div>
    );
}
