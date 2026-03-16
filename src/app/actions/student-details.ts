'use server';

import { db } from "@/lib/db";
import {
    FileText, CheckCircle2, Clock, UserPlus
} from "lucide-react";

export async function getStudentFullDetails(studentId: string) {
    console.log('[getStudentFullDetails] Fetching details for:', studentId);
    if (!studentId || studentId === 'undefined') {
        console.error('[getStudentFullDetails] Invalid studentId');
        return null;
    }

    let student: any;
    try {
        console.log('[getStudentFullDetails] Fetching from branch_students...');
        student = await db.branchStudents.getById(studentId);
        if (!student) {
            console.log('[getStudentFullDetails] Fetching from students...');
            student = await db.students.getById(studentId);
        }
    } catch (e) {
        console.error('[getStudentFullDetails] Error fetching student:', e);
        throw e;
    }

    if (!student) {
        return null;
    } else if (student.email) {
        // If it's a branch student, try to find global counterpart for freshest photo
        try {
            const allGlobalStudents = await db.students.getAll();
            const globalMatch = allGlobalStudents.find(s => s.email?.toLowerCase() === student.email.toLowerCase());
            if (globalMatch?.photoUrl) {
                student.photoUrl = globalMatch.photoUrl;
            }
        } catch (e) {
            console.error('[getStudentFullDetails] Error fetching all global students for photo:', e);
            // Continue without photo if error
        }
    }

    // Map university name(s)
    let schoolNames: string[] = [];

    if (student.educations && student.educations.length > 0) {
        // Fetch all universities in parallel for efficiency
        const uniPromises = student.educations.map(async (edu: any) => {
            if (!edu.universityId) return null;
            try {
                return await db.universities.getById(edu.universityId);
            } catch (e) {
                console.error(`[getStudentFullDetails] Error fetching uni ${edu.universityId}:`, e);
                return null;
            }
        });
        const universities = await Promise.all(uniPromises);
        schoolNames = universities
            .filter((u: any) => u !== null && u.name)
            .map((u: any) => u.name);
    }

    if (schoolNames.length === 0 && student.universityId) {
        try {
            const uni = await db.universities.getById(student.universityId);
            if (uni?.name) schoolNames.push(uni.name);
        } catch (e) {
            console.error('[getStudentFullDetails] Error fetching legacy uni:', e);
        }
    }

    if (schoolNames.length > 0) {
        student.school = schoolNames.join(', ');
    }
    if (!student.country) student.country = 'İtalya';

    console.log('[getStudentFullDetails] Fetching assignments and logs...');
    const [assignments, allUsers, serviceLogs, serviceTypes] = await Promise.all([
        db.assignments.getByStudentId(studentId),
        db.users.getAll(),
        db.logs.getByStudentId(studentId),
        db.serviceTypes.getAll()
    ]);

    const mentors = allUsers.filter(u => u.role === 'mentor');
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
