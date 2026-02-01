import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import UniversitiesClient from "./UniversitiesClient";

export default async function UniversitiesPage() {
    const session = await getSession();

    if (!session || session.role !== 'italy_staff') {
        redirect('/login');
    }

    // Get all universities
    const universities = db.universities.getAll();

    // Get user favorites
    const favorites = db.userFavorites.getByUser(session.id);
    const favoriteIds = favorites.map(f => f.universityId);

    // Get all students from all branches
    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];
    const allStudents = allBranches.flatMap(branchCode =>
        db.branchStudents.getByBranch(branchCode).map(s => ({
            ...s,
            branchName: BRANCH_NAMES[branchCode]
        }))
    );

    return (
        <div>
            <div style={{ marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Üniversiteler
                </h1>
                <p style={{ color: '#808191', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    İtalya üniversitelerini görüntüleyin.
                </p>
            </div>

            <UniversitiesClient
                universities={universities}
                allStudents={allStudents}
                initialFavorites={favoriteIds}
                userId={session.id}
            />
        </div>
    );
}
