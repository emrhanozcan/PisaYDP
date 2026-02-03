import { db } from "@/lib/db";
import AdminStudentsClient from "./AdminStudentsClient";

export default function StudentsPage() {
    const students = db.students.getAll();
    const branchStudentsWithYDP = db.branchStudents.getAll().filter(s => s.ydtSupport === 'Evet');
    const universities = db.universities.getAll();

    // Map BranchStudent to Student-like structure for the list
    const mappedYDPStudents = branchStudentsWithYDP.map(s => {
        const uni = db.universities.getById(s.universityId || '');
        return {
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            phone: s.phone,
            country: 'İtalya',
            city: s.city,
            school: uni?.name || 'Belirtilmemiş',
            packageType: s.packageType || 'Standart',
            status: s.status,
            createdAt: s.createdAt,
            isYDP: true
        };
    });

    const allStudents = [...students, ...mappedYDPStudents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const activeStudents = allStudents.filter(s => s.status === 'active');
    const inactiveStudents = allStudents.filter(s => s.status !== 'active');

    return (
        <AdminStudentsClient
            allStudents={allStudents}
            universities={universities}
            totalCount={allStudents.length}
            activeCount={activeStudents.length}
            inactiveCount={inactiveStudents.length}
        />
    );
}
