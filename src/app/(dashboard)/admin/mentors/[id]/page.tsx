import { db } from "@/lib/db";
import MentorDetailClient, { MentorData } from "./MentorDetailClient";

export default async function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const mentor = db.users.getById(id);

    if (!mentor || mentor.role !== 'mentor') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                color: '#9ca3af'
            }}>
                <h2 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>Mentor Bulunamadı</h2>
                <p style={{ marginBottom: '1.5rem' }}>Bu ID ile eşleşen mentor kaydı mevcut değil.</p>
                <a href="/admin/mentors" className="btn btn-primary">
                    Listeye Dön
                </a>
            </div>
        );
    }

    const assignments = db.assignments.getAll().filter(a => a.mentorId === id);
    const students = db.students.getAll();
    const serviceLogs = db.logs.getAll().filter(l => l.mentorId === id);
    const serviceTypes = db.serviceTypes.getAll();

    const approvedLogs = serviceLogs.filter(l => l.status === 'approved');
    const pendingLogs = serviceLogs.filter(l => l.status === 'submitted');

    // Assigned students
    const assignedStudents = assignments.map(a => {
        const student = students.find(s => s.id === a.studentId);
        const studentLogs = serviceLogs.filter(l => l.studentId === a.studentId);
        return {
            id: student?.id || '',
            firstName: student?.firstName || '',
            lastName: student?.lastName || '',
            country: student?.country,
            packageType: student?.packageType,
            assignment: {
                role: a.role
            },
            serviceCount: studentLogs.length,
            approvedCount: studentLogs.filter(l => l.status === 'approved').length
        };
    }).filter(s => s.id);

    // Total earnings
    const totalEarnings = approvedLogs.reduce((sum, log) => {
        const serviceType = serviceTypes.find(t => t.id === log.serviceTypeId);
        return sum + (serviceType?.unitPrice || 0);
    }, 0);

    // Success rate
    const successRate = serviceLogs.length > 0 ? Math.round((approvedLogs.length / serviceLogs.length) * 100) : 0;

    const stats = [
        { label: "Atanan Öğrenci", value: assignedStudents.length, icon: "Users", color: "#008C45", bg: "#eafaf3" },
        { label: "Toplam Hizmet", value: serviceLogs.length, icon: "FileText", color: "#6366f1", bg: "#eef2ff" },
        { label: "Onaylanan", value: approvedLogs.length, icon: "CheckCircle2", color: "#059669", bg: "#ecfdf5" },
        { label: "Bekleyen", value: pendingLogs.length, icon: "Clock", color: "#f59e0b", bg: "#fef3c7" },
    ];

    // Prepare mentor data for client
    const mentorData = {
        id: mentor.id,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        username: mentor.username,
        email: mentor.email,
        phone: mentor.phone,
        password: mentor.password || "",
        createdAt: mentor.createdAt
    } as any;

    // Service logs data
    const serviceLogsData = serviceLogs.map(log => ({
        id: log.id,
        serviceTypeId: log.serviceTypeId,
        studentId: log.studentId,
        status: log.status,
        date: log.date
    }));

    // Service types data
    const serviceTypesData = serviceTypes.map(st => ({
        id: st.id,
        name: st.name,
        unitPrice: st.unitPrice
    }));

    // Students data
    const studentsData = students.map(s => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName
    }));

    return (
        <MentorDetailClient
            mentor={mentorData}
            stats={stats}
            assignedStudents={assignedStudents}
            serviceLogs={serviceLogsData}
            serviceTypes={serviceTypesData}
            students={studentsData}
            totalEarnings={totalEarnings}
            successRate={successRate}
        />
    );
}
