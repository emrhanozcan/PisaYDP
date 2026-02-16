'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ScholarshipTracking, BranchCode } from "@/types";

export async function getScholarshipDashboardData() {
    try {
        const students = await db.branchStudents.getScholarshipStudents();
        const universities = await db.universities.getAll();

        // Fetch tracking data for all these students to populate the list/filters if needed, 
        // or just to have it ready.
        // For now, we will fetch it.
        // Optimization: We could use a tailored query in db.ts to join, but loop is acceptable here for < 1000 students.

        const studentsWithTracking = await Promise.all(students.map(async (student) => {
            const tracking = await db.scholarshipTracking.getByStudentId(student.id);
            return {
                ...student,
                scholarshipTracking: tracking || undefined
            };
        }));

        return {
            students: studentsWithTracking,
            universities
        };
    } catch (error) {
        console.error("Error fetching scholarship dashboard data:", error);
        throw new Error("Failed to fetch scholarship dashboard data");
    }
}

export async function updateScholarshipTracking(studentId: string, data: Partial<ScholarshipTracking>) {
    try {
        // Ensure studentId is in the data
        const payload = { ...data, studentId };

        const result = await db.scholarshipTracking.upsert(payload);
        revalidatePath('/italy/scholarship');
        revalidatePath('/branch/scholarship');
        return { success: true, data: result };
    } catch (error) {
        console.error("Error updating scholarship tracking:", error);
        return { success: false, error: "Failed to update scholarship tracking" };
    }
}

export async function getBranchScholarshipDashboardData(branchCode: BranchCode) {
    try {
        // Fetch all students for the branch
        const allBranchStudents = await db.branchStudents.getByBranch(branchCode);

        // Filter for those with Scholarship Package
        // Check both scholarshipPackage and potential legacy fields if needed, but 'Evet' is standard.
        const students = allBranchStudents.filter(s => s.scholarshipPackage === 'Evet');

        const universities = await db.universities.getAll();

        const studentsWithTracking = await Promise.all(students.map(async (student) => {
            const tracking = await db.scholarshipTracking.getByStudentId(student.id);
            return {
                ...student,
                scholarshipTracking: tracking || undefined
            };
        }));

        return {
            students: studentsWithTracking,
            universities
        };
    } catch (error) {
        console.error("Error fetching branch scholarship dashboard data:", error);
        throw new Error("Failed to fetch branch scholarship dashboard data");
    }
}
