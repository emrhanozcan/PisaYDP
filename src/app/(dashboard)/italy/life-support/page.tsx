import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import LifeSupportClient from "./LifeSupportClient";

export default async function LifeSupportPage() {
    const session = await getSession();

    if (!session || session.role !== 'italy_staff') {
        redirect('/login');
    }

    // Get all students from all branches
    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];
    const students = allBranches.flatMap(branchCode =>
        db.branchStudents.getByBranch(branchCode).map(s => ({
            ...s,
            branchName: BRANCH_NAMES[branchCode]
        }))
    );
    const universities = db.universities.getAll();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Yaşam Destek Hizmeti
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Öğrencilerin yaşam destek süreçlerini, karşılama ve kayıt işlemlerini yönetin.
                </p>
            </div>

            <LifeSupportClient
                initialStudents={students}
                universities={universities}
            />
        </div>
    );
}
