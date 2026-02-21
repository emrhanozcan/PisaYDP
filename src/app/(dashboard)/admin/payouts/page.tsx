import { db } from "@/lib/db";
import PayoutsClient from "./PayoutsClient";

export default function PayoutsPage() {
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
}
