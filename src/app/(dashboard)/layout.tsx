
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const showHeader = session.role !== 'branch_user' && session.role !== 'italy_staff';

    return (
        <div className="dashboard-container">
            <Sidebar
                userRole={session.role}
                firstName={session.firstName}
                lastName={session.lastName}
                branchCode={session.branchCode}
            />

            {/* Main Content */}
            <main className="main-content">
                {/* Header removed for full screen refinement */}

                <div className="page-content" style={{ paddingTop: '1.5rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
