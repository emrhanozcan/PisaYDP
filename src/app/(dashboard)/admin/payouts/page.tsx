
import { db } from "@/lib/db";
import PayoutsClient from "./PayoutsClient";

export default function PayoutsPage() {
<<<<<<< HEAD
    const mentors = db.users.getAll().filter(u => u.role === 'mentor');
    const logs = db.logs.getAll().filter(l => l.status === 'submitted' || l.status === 'approved');
    const serviceTypes = db.serviceTypes.getAll();

    // Calculate earnings per mentor
    const data = mentors.map(mentor => {
        const mentorLogs = logs.filter(l => l.mentorId === mentor.id);

        let totalAmount = 0;
        const breakdown: Record<string, number> = {};

        mentorLogs.forEach(log => {
            const service = serviceTypes.find(t => t.id === log.serviceTypeId);
            if (service) {
                let amount = 0;
                if (service.pricingModel === 'fixed') {
                    amount = service.unitPrice;
                } else if (service.pricingModel === 'hourly') {
                    amount = (log.durationMinutes / 60) * service.unitPrice;
                }
                totalAmount += amount;

                // Stats
                breakdown[service.name] = (breakdown[service.name] || 0) + 1;
            }
        });

        return {
            mentorId: mentor.id,
            mentorName: `${mentor.firstName} ${mentor.lastName}`,
            totalLogs: mentorLogs.length,
            totalAmount,
            breakdown
        };
    });

    return <PayoutsClient data={data} />;
=======
    const logs = db.logs.getAll().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const serviceTypes = db.serviceTypes.getAll();
    const students = db.students.getAll();
    const branchStudents = db.branchStudents.getAll();
    const mentorUsers = db.users.getAll().filter(u => u.role === 'mentor');

    // Helper to find student from either table
    const findStudent = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) return { firstName: student.firstName, lastName: student.lastName };
        const branchStudent = branchStudents.find(s => s.id === studentId);
        if (branchStudent) return { firstName: branchStudent.firstName, lastName: branchStudent.lastName };
        return { firstName: 'Bilinmeyen', lastName: 'Öğrenci' };
    };

    // Transform logs for client
    const logsData = logs.map(log => {
        const student = findStudent(log.studentId);
        const mentor = mentorUsers.find(m => m.id === log.mentorId);
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);

        return {
            id: log.id,
            studentId: log.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            mentorId: log.mentorId,
            mentorName: mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Bilinmiyor',
            serviceTypeId: log.serviceTypeId,
            serviceName: service?.name || 'Bilinmiyor',
            servicePrice: service?.unitPrice || 0,
            date: log.date,
            durationMinutes: log.durationMinutes,
            status: log.status,
            paymentStatus: log.paymentStatus
        };
    });

    // Service types for filter
    const serviceTypesData = serviceTypes.map(s => ({
        id: s.id,
        name: s.name
    }));

    // Mentors for filter
    const mentorsData = mentorUsers.map(m => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`
    }));

    return (
        <PayoutsClient
            logs={logsData}
            serviceTypes={serviceTypesData}
            mentors={mentorsData}
        />
    );
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
}
