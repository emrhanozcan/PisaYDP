import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import MentorEarningsClient from "./MentorEarningsClient";

export default async function MentorEarningsPage() {
    const session = await getSession();
    if (!session) return null;

    // Get my data
    const myLogs = db.logs.getAll().filter(l => l.mentorId === session.id);
    const serviceTypes = db.serviceTypes.getAll();
    const students = db.students.getAll();
    const branchStudents = db.branchStudents.getAll();
    const myAssignments = db.assignments.getAll().filter(a => a.mentorId === session.id);
    const myStudentIds = myAssignments.map(a => a.studentId);
    const myStudents = students.filter(s => myStudentIds.includes(s.id));

    // Helper to find student from either table
    const findStudent = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) return { firstName: student.firstName, lastName: student.lastName };
        const branchStudent = branchStudents.find(s => s.id === studentId);
        if (branchStudent) return { firstName: branchStudent.firstName, lastName: branchStudent.lastName };
        return { firstName: 'Bilinmeyen', lastName: 'Öğrenci' };
    };

    // Status counts
    const approvedLogs = myLogs.filter(l => l.status === 'approved');
    const pendingLogs = myLogs.filter(l => l.status === 'submitted');

    // Earnings calculations
    const approvedEarnings = approvedLogs.reduce((acc, log) => {
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);
        return acc + (service?.unitPrice || 0);
    }, 0);

    const pendingEarnings = pendingLogs.reduce((acc, log) => {
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);
        return acc + (service?.unitPrice || 0);
    }, 0);

    const totalHours = myLogs.reduce((acc, log) => acc + log.durationMinutes, 0) / 60;

    // Transform logs for client
    const logsData = myLogs.slice().reverse().map(log => {
        const student = findStudent(log.studentId);
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);
        return {
            id: log.id,
            studentId: log.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            serviceTypeId: log.serviceTypeId,
            serviceName: service?.name || 'Bilinmiyor',
            servicePrice: service?.unitPrice || 0,
            date: log.date,
            durationMinutes: log.durationMinutes,
            status: log.status,
            paymentStatus: log.paymentStatus
        };
    });

    // Service type breakdown
    const serviceBreakdown = serviceTypes.map(type => {
        const typeLogs = approvedLogs.filter(l => l.serviceTypeId === type.id);
        return {
            id: type.id,
            name: type.name,
            unitPrice: type.unitPrice,
            count: typeLogs.length,
            total: typeLogs.length * type.unitPrice
        };
    }).filter(t => t.count > 0).sort((a, b) => b.total - a.total);

    // Student breakdown
    const studentBreakdown = myStudents.map(student => {
        const studentLogs = approvedLogs.filter(l => l.studentId === student.id);
        const studentEarnings = studentLogs.reduce((acc, log) => {
            const service = serviceTypes.find(s => s.id === log.serviceTypeId);
            return acc + (service?.unitPrice || 0);
        }, 0);
        return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            serviceCount: studentLogs.length,
            earnings: studentEarnings
        };
    }).sort((a, b) => b.earnings - a.earnings);

    return (
        <MentorEarningsClient
            logs={logsData}
            approvedEarnings={approvedEarnings}
            pendingEarnings={pendingEarnings}
            totalHours={totalHours}
            approvedCount={approvedLogs.length}
            serviceBreakdown={serviceBreakdown}
            studentBreakdown={studentBreakdown}
        />
    );
}
