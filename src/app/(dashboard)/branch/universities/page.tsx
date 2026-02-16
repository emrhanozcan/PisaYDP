import { getSession } from "@/app/actions/auth";
import { getUniversities, getUserFavorites } from "@/app/actions/branch";
import { redirect } from "next/navigation";
import { BranchCode } from "@/types";
import UniversitiesClient from "./UniversitiesClient";

export default async function UniversitiesPage() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    const branchCode = session.branchCode as BranchCode;
    const universities = await getUniversities();
    const favorites = await getUserFavorites(session.id);
    const favoriteIds = favorites.map(f => f.universityId);

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Üniversiteler
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    İtalya üniversitelerini görüntüleyin ve yönetin.
                </p>
            </div>

            <UniversitiesClient
                universities={universities}
                initialFavorites={favoriteIds}
                branchCode={branchCode}
                userId={session.id}
            />
        </div>
    );
}
