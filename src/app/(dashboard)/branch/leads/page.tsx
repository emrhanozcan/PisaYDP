import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Lead } from "@/types";
import LeadsClient from "../../italy/leads/LeadsClient";

export default async function BranchLeadsPage() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    // Get the user's branch_code from their session
    const branchCode = session.branchCode as string;

    let leads: Lead[] = [];
    if (branchCode) {
        leads = await db.leads.getByBranch(branchCode);
    } else {
        // Fallback or warning if branchCode is missing
        console.warn(`User ${session.id} has no branchCode assigned in their session.`);
        leads = [];
    }

    return (
        <div className="p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Şube Lead Yönetimi</h1>
                <p className="text-gray-600">Şubenize atanan veya şubeniz tarafından oluşturulan leadler.</p>
            </div>
            <LeadsClient initialLeads={leads} branchId={branchCode} />
        </div>
    );
}
