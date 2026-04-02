
import { db } from "@/lib/db";
import AdminMentorsClient from "./AdminMentorsClient";

export default async function MentorsPage() {
    const mentors = (await db.users.getAll()).filter(u => u.role === 'mentor');
    const assignments = await db.assignments.getAll();
    const serviceLogs = await db.logs.getAll();

    return (
        <AdminMentorsClient 
            mentors={mentors}
            assignments={assignments}
            serviceLogs={serviceLogs}
        />
    );
}
