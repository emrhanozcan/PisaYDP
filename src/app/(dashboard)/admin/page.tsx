import { db } from "@/lib/db";
import { BRANCH_NAMES } from "@/types";
import AdminDashboardClient from "./AdminDashboardClient";
import { getSession } from "@/app/actions/auth";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    // 1. Fetch all required data in parallel
    const [students, branchStudents, universities, users, tickets] = await Promise.all([
        db.students.getAll(),
        db.branchStudents.getAll(),
        db.universities.getAll(),
        db.users.getAll(),
        db.supportTickets.getByStatus('open')
    ]);

    const removalRequests = tickets.filter(t => t.subject.includes('[MENTOR_REMOVE]'));

    // 2. Process Student Data
    // Combine regular students and branch students for total counts
    const totalStudents = students.length + branchStudents.length;

    // Calculate active students (approximation based on status)
    const activeStudents = [
        ...students.filter(s => s.status === 'active'),
        ...branchStudents.filter(s => (s.status as string) === 'Kabul' || (s.status as string) === 'Beklemede') // 'Kabul' or 'Beklemede' as active proxy
    ].length;

    // 3. Process Branch Data
    const branchCounts: Record<string, number> = {};
    branchStudents.forEach(s => {
        const branchName = BRANCH_NAMES[s.branchCode] || s.branchCode;
        branchCounts[branchName] = (branchCounts[branchName] || 0) + 1;
    });

    const branchDistribution = Object.entries(branchCounts)
        .map(([name, count], index) => ({
            name,
            count,
            color: ['#6C5CE7', '#00B894', '#0984e3', '#fdcb6e', '#e17055', '#a29bfe'][index % 6]
        }))
        .sort((a, b) => b.count - a.count);

    // 4. Process University Data
    const uniCounts: Record<string, number> = {};
    branchStudents.forEach(s => {
        if (s.educations && s.educations.length > 0) {
            s.educations.forEach(e => {
                if (e.universityId) {
                    const uni = universities.find(u => u.id === e.universityId);
                    const uniName = uni ? uni.name : 'Bilinmiyor';
                    uniCounts[uniName] = (uniCounts[uniName] || 0) + 1;
                }
            });
        } else if (s.universityId) {
            const uni = universities.find(u => u.id === s.universityId);
            const uniName = uni ? uni.name : 'Bilinmiyor';
            uniCounts[uniName] = (uniCounts[uniName] || 0) + 1;
        }
    });

    const topUniversities = Object.entries(uniCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    // 5. Recent Activity (Mix of latest students)
    const combinedRecent = [
        ...students.map(s => ({ ...s, type: 'regular', branchName: 'Merkez', school: s.school })),
        ...branchStudents.map(s => {
            let schoolName = 'Belirtilmemiş';

            // Try to get from educations first
            if (s.educations && s.educations.length > 0) {
                const uniNames = s.educations.map(e => {
                    const u = universities.find(uni => uni.id === e.universityId);
                    return u ? u.name : null;
                }).filter(name => name !== null);

                if (uniNames.length > 0) {
                    schoolName = uniNames.join(', ');
                }
            }
            // Fallback to legacy field
            else if (s.universityId) {
                const uni = universities.find(u => u.id === s.universityId);
                if (uni) schoolName = uni.name;
            }

            return {
                ...s,
                type: 'branch',
                branchName: BRANCH_NAMES[s.branchCode],
                school: schoolName
            };
        })
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);


    const stats = {
        totalStudents,
        activeStudents,
        totalMentors: users.filter(u => u.role === 'mentor').length,
        totalBranches: Object.keys(branchCounts).length,
        totalUniversities: universities.length,
        totalRevenue: branchStudents.reduce((acc, curr) => acc + (parseFloat(curr.fee || '0') || 0), 0) // Naive sum of fees
    };

    const session = await getSession();

    return (
        <AdminDashboardClient
            stats={stats}
            branchDistribution={branchDistribution}
            topUniversities={topUniversities}
            recentStudents={combinedRecent}
            userRole={session?.role || ''}
            removalRequests={removalRequests}
        />
    );
}
