import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BRANCH_NAMES } from "@/types";
import SMSClient from "../../italy/sms/SMSClient";

export default async function BranchSMSPage() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    const branchCode = session.branchCode;
    if (!branchCode) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Erişim Engellendi</h1>
                <p className="mt-2 text-gray-600">Şube bilginiz bulunamadı. Lütfen yönetici ile iletişime geçin.</p>
            </div>
        );
    }

    // Get students for this specific branch
    const allStudents = await db.branchStudents.getByBranch(branchCode);
    const universities = await db.universities.getAll();

    // Add branch names to students (though for branch users they are all the same, 
    // keeping it consistent with SMSClient's expectations)
    const students = allStudents.map(s => ({
        ...s,
        branchName: BRANCH_NAMES[s.branchCode]
    }));

    return (
        <SMSClient students={students} universities={universities} />
    );
}
