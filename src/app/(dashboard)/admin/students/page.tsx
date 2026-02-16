import { db } from "@/lib/db";
import AdminStudentsClient from "./AdminStudentsClient";

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
    const students = await db.students.getAllSummaries();
    const branchStudentsWithYDP = await db.branchStudents.getAllSummaries();
    const universities = await db.universities.getAll();

    console.log('DEBUG: Fetched Branch Students:', branchStudentsWithYDP.length);
    console.log('DEBUG: Fetched Universities:', universities.length);
    if (branchStudentsWithYDP.length > 0) {
        console.log('DEBUG: First Branch Student UniversityID:', branchStudentsWithYDP[0].universityId);
        const matchedUni = universities.find(u => u.id === branchStudentsWithYDP[0].universityId);
        console.log('DEBUG: Matched University:', matchedUni?.name);
    }

    // Get all global students for photo mapping
    const globalStudentMap = new Map(students.filter(s => s.email).map(s => [s.email!.toLowerCase(), s.photoUrl]));

    // Map BranchStudent to Student-like structure for the list
    const mappedBranchStudents = branchStudentsWithYDP.map(s => {
        let uniId = s.universityId;
        if (s.educations && s.educations.length > 0) {
            uniId = s.educations[0].universityId;
        }
        const uni = universities.find(u => u.id === (uniId || ''));

        // Find global photo by email
        const globalPhoto = s.email ? globalStudentMap.get(s.email.toLowerCase()) : undefined;

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
            isYDP: true,
            universityId: s.universityId,
            educations: s.educations,
            photoUrl: globalPhoto || s.photoUrl
        };
    });

    // Deduplicate: If email exists in both, prefer global student
    const allStudentsMap = new Map();

    // Add global students first (source of truth)
    students.forEach(s => {
        if (s.email) {
            allStudentsMap.set(s.email.toLowerCase(), { ...s, isYDP: false });
        } else {
            // If no email, add by ID to avoid missing records
            allStudentsMap.set(`id-${s.id}`, { ...s, isYDP: false });
        }
    });

    // Add branch students only if they don't exist by email
    mappedBranchStudents.forEach(bs => {
        const emailKey = bs.email?.toLowerCase();
        if (emailKey && !allStudentsMap.has(emailKey)) {
            allStudentsMap.set(emailKey, bs);
        } else if (!emailKey) {
            allStudentsMap.set(`id-${bs.id}`, bs);
        }
    });

    const allStudents = Array.from(allStudentsMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
