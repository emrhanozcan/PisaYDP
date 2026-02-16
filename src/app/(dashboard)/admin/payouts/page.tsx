
import { db } from "@/lib/db";
import PayoutsClient from "./PayoutsClient";

export default async function PayoutsPage() {
    const logs = (await db.logs.getAll()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const serviceTypes = await db.serviceTypes.getAll();
    const students = await db.students.getAll();
    const branchStudents = await db.branchStudents.getAll();
    const mentorUsers = (await db.users.getAll()).filter(u => u.role === 'mentor');

    // Get all students for photo lookup
    const allGlobalStudents = await db.students.getAll();
    const globalStudentMap = new Map(allGlobalStudents.filter(s => s.email).map(s => [s.email!.toLowerCase(), s]));

    // Helper to find student from either table
    const findStudent = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            // Try to find global match for photo
            const globalMatch = student.email ? globalStudentMap.get(student.email.toLowerCase()) : undefined;
            return {
                firstName: student.firstName,
                lastName: student.lastName,
                photoUrl: globalMatch?.photoUrl || student.photoUrl
            };
        }
        const branchStudent = branchStudents.find(s => s.id === studentId);
        if (branchStudent) {
            // Try to find global match for photo
            const globalMatch = branchStudent.email ? globalStudentMap.get(branchStudent.email.toLowerCase()) : undefined;
            return {
                firstName: branchStudent.firstName,
                lastName: branchStudent.lastName,
                photoUrl: globalMatch?.photoUrl || branchStudent.photoUrl
            };
        }
        return { firstName: 'Bilinmeyen', lastName: 'Öğrenci', photoUrl: undefined };
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
            studentPhotoUrl: student.photoUrl,
            mentorId: log.mentorId,
            mentorName: mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Bilinmiyor',
            serviceTypeId: log.serviceTypeId,
            serviceName: service?.name || 'Bilinmiyor',
            servicePrice: service?.unitPrice || 0,
            date: log.date,
            durationMinutes: log.durationMinutes,
            status: log.status,
            paymentStatus: log.paymentStatus,
            notes: log.notes,
            attachments: log.attachments
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
