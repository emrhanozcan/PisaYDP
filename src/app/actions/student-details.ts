'use server';

import { db } from "@/lib/db";
import {
    FileText, CheckCircle2, Clock, UserPlus
} from "lucide-react";

export async function getStudentFullDetails(studentId: string) {
    let student: any = await db.branchStudents.getById(studentId);
    if (!student) {
        student = await db.students.getById(studentId);
    } else if (student.email) {
        // If it's a branch student, try to find global counterpart for freshest photo
        const allGlobalStudents = await db.students.getAll();
        const globalMatch = allGlobalStudents.find(s => s.email?.toLowerCase() === student.email.toLowerCase());
        if (globalMatch?.photoUrl) {
            student.photoUrl = globalMatch.photoUrl;
        }
    }

    if (!student) {
        return null;
    }

    // Map university name if missing
    // Map university name(s)
    let schoolNames: string[] = [];

    if (student.educations && student.educations.length > 0) {
        // Fetch all universities in parallel for efficiency
        const uniPromises = student.educations.map((edu: any) =>
            edu.universityId ? db.universities.getById(edu.universityId) : Promise.resolve(null)
        );
        const universities = await Promise.all(uniPromises);
        schoolNames = universities
            .filter((u: any) => u !== null && u.name)
            .map((u: any) => u.name);
    }

    if (schoolNames.length === 0 && student.universityId) {
        const uni = await db.universities.getById(student.universityId);
        if (uni?.name) schoolNames.push(uni.name);
    }

    if (schoolNames.length > 0) {
        student.school = schoolNames.join(', ');
    }
    if (!student.country) student.country = 'İtalya';

    if (schoolNames.length > 0) {
        student.school = schoolNames.join(', ');
    }
    if (!student.country) student.country = 'İtalya';

    const assignments = await db.assignments.getByStudentId(studentId);
    const allUsers = await db.users.getAll();
    const mentors = allUsers.filter(u => u.role === 'mentor');
    const serviceLogs = await db.logs.getByStudentId(studentId);
    const serviceTypes = await db.serviceTypes.getAll();

    const approvedLogs = serviceLogs.filter(l => l.status === 'approved');
    const pendingLogs = serviceLogs.filter(l => l.status === 'submitted');

    // Toplam harcanan tutar hesabı
    const totalSpent = approvedLogs.reduce((sum, log) => {
        const serviceType = serviceTypes.find(t => t.id === log.serviceTypeId);
        return sum + (serviceType?.unitPrice || 0);
    }, 0);

    const stats = [
        { label: "Toplam Hizmet", value: serviceLogs.length, color: "#6366f1", bg: "#eef2ff" },
        { label: "Onaylanan", value: approvedLogs.length, color: "#059669", bg: "#ecfdf5" },
        { label: "Bekleyen", value: pendingLogs.length, color: "#f59e0b", bg: "#fef3c7" },
        { label: "Atanan Mentor", value: assignments.length, color: "#008C45", bg: "#eafaf3" },
    ];

    // Serializable data for client
    return {
        student: JSON.parse(JSON.stringify(student)),
        assignments: JSON.parse(JSON.stringify(assignments)),
        serviceLogs: JSON.parse(JSON.stringify(serviceLogs)),
        mentors: JSON.parse(JSON.stringify(mentors.map(m => ({
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            photoUrl: m.photoUrl
        })))),
        serviceTypes: JSON.parse(JSON.stringify(serviceTypes)),
        totalSpent,
        stats
    };
}
