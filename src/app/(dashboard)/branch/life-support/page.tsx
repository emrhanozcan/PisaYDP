import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import LifeSupportClient from "./LifeSupportClient";

export default async function LifeSupportPage() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    const branchCode = session.branchCode as BranchCode;

    // Get only students from this branch who have Life Support (YDP) Service
    const students = (await db.branchStudents.getByBranch(branchCode))
        .filter(s => s.ydtSupport === 'Evet')
        .map(s => ({
            ...s,
            branchName: BRANCH_NAMES[branchCode]
        }));
    const universities = await db.universities.getAll();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Yaşam Destek Hizmeti
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Şubenize kayıtlı öğrencilerin yaşam destek (YDP) süreçlerini yönetin.
                </p>
            </div>

            <LifeSupportClient
                initialStudents={students}
                universities={universities}
                branchCode={branchCode}
            />
        </div>
    );
}
