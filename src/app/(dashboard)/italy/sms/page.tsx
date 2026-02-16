import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BRANCH_NAMES } from "@/types";
import SMSClient from "./SMSClient";

export default async function SMSPage() {
    const session = await getSession();

    if (!session || (session.role !== 'italy_staff' && session.role !== 'admin')) {
        redirect('/login');
    }

    // Get all students using the same logic as the Students page
    const allStudents = await db.branchStudents.getAll();

    // Add branch names to students
    const students = allStudents.map(s => ({
        ...s,
        branchName: BRANCH_NAMES[s.branchCode]
    }));

    return (
        <SMSClient students={students} />
    );
}
