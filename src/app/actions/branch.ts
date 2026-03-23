'use server';

import { db } from '@/lib/db';
import { BranchCode, BranchStudent, University, StudentEducation } from '@/types';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/app/actions/auth';

// Get all universities sorted alphabetically
export async function getUniversities() {
    return (await db.universities.getAll()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

// Get students by branch
export async function getBranchStudents(branchCode: BranchCode) {
    return await db.branchStudents.getByBranch(branchCode);
}

// Get students by university (filtered by branch)
export async function getStudentsByUniversity(universityId: string, branchCode: BranchCode) {
    return await db.branchStudents.getByUniversity(universityId, branchCode);
}

// Get user favorites
export async function getUserFavorites(userId: string) {
    return await db.userFavorites.getByUser(userId);
}

// Toggle favorite
export async function toggleFavorite(userId: string, universityId: string) {
    return await db.userFavorites.toggle(userId, universityId);
}

// Update university name
export async function updateUniversityName(id: string, name: string) {
    const uni = await db.universities.getById(id);
    if (uni) {
        uni.name = name;
        return await db.universities.update(uni);
    }
    return null;
}

// Delete university
export async function deleteUniversity(id: string) {
    await db.universities.delete(id);
    return true;
}

// Add new university
export async function addUniversity(name: string) {
    const newUni: University = {
        id: `uni-${Date.now()}`,
        name,
        country: 'İtalya',
        isActive: true
    };
    return await db.universities.create(newUni);
}

// Helper to sanitize payload (convert empty strings to null)
function sanitizePayload<T extends Record<string, any>>(data: T): T {
    const sanitized = { ...data };
    (Object.keys(sanitized) as Array<keyof T>).forEach(key => {
        if (sanitized[key] === '') {
            sanitized[key] = null as any;
        }
    });
    return sanitized;
}

// Create branch student
export async function createBranchStudent(student: Omit<BranchStudent, 'createdAt'>) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'branch_user' && session.role !== 'italy_staff')) {
        throw new Error("Unauthorized");
    }

    try {
        const sanitizedStudent = sanitizePayload(student);
        const newStudentData: any = {
            ...sanitizedStudent,
            id: student.id || `bs-${Date.now()}`,
            createdAt: new Date().toISOString()
        };

        if (!newStudentData.educations || newStudentData.educations.length === 0) {
            newStudentData.educations = [];
            if (newStudentData.universityId) {
                newStudentData.educations.push({
                    universityId: newStudentData.universityId,
                    department: newStudentData.department,
                    program: newStudentData.program,
                    grade: newStudentData.grade
                });
            }
        }

        if (newStudentData.educations && newStudentData.educations.length > 0) {
            const firstEdu = newStudentData.educations[0];
            newStudentData.universityId = firstEdu.universityId;
            newStudentData.department = firstEdu.department;
            newStudentData.program = firstEdu.program;
            newStudentData.grade = firstEdu.grade;
        }

        const result = await db.branchStudents.create(newStudentData as BranchStudent);
        revalidatePath('/admin');
        revalidatePath('/admin/students');
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error creating branch student:', error);
        return { success: false, error: error?.message || 'Bir hata oluştu' };
    }
}

// Update branch student
export async function updateBranchStudent(id: string, data: Partial<BranchStudent>) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'branch_user' && session.role !== 'italy_staff')) {
        throw new Error("Unauthorized");
    }

    try {
        const student = await db.branchStudents.getById(id);
        if (student) {
            const sanitizedData = sanitizePayload(data);
            const updated: any = { ...student, ...sanitizedData };

            if (data.educations) {
                if (data.educations.length > 0) {
                    const firstEdu = data.educations[0];
                    updated.universityId = firstEdu.universityId;
                    updated.department = firstEdu.department;
                    updated.program = firstEdu.program;
                    updated.grade = firstEdu.grade;
                } else {
                    updated.universityId = null;
                    updated.department = null;
                    updated.program = null;
                    updated.grade = null;
                }
            }

            delete (updated as any).searchText;
            delete (updated as any).search_text;
            delete (updated as any).full_text_search;
            delete (updated as any).fullName;
            delete (updated as any).full_name;

            const result = await db.branchStudents.update(updated);
            revalidatePath('/admin');
            revalidatePath('/admin/students');
            revalidatePath('/italy/residence-permit');
            revalidatePath('/branch/residence-permit');
            revalidatePath('/italy/accommodation');
            revalidatePath('/branch/accommodation');
            return { success: true, data: result };
        }
        return null;
    } catch (error: any) {
        console.error('Error updating branch student:', error);
        return { success: false, error: error?.message || 'Bir hata oluştu' };
    }
}

// Update residence permit fields specifically
export async function updateResidencePermit(id: string, data: Partial<BranchStudent>) {
    try {
        const sanitizedData = sanitizePayload(data);
        // Using Partial update via db.ts which handles mapToSnakeCase and filtering
        const result = await db.branchStudents.update({ id, ...sanitizedData });

        revalidatePath('/italy/residence-permit');
        revalidatePath('/branch/residence-permit');
        revalidatePath('/admin/students');

        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error updating residence permit:', error);
        return { success: false, error: error?.message || 'Failed to update residence permit' };
    }
}

// Delete branch student
export async function deleteBranchStudent(id: string) {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'branch_user' && session.role !== 'italy_staff')) {
        throw new Error("Unauthorized");
    }

    try {
        await db.assignments.deleteByStudentId(id);
        await db.logs.deleteByStudentId(id);
        await db.branchStudents.delete(id);
        revalidatePath('/admin/students');
        return true;
    } catch (error) {
        console.error('Error deleting branch student:', error);
        throw error;
    }
}

// Get branch statistics with detailed breakdown
export async function getBranchStats(branchCode: BranchCode) {
    const students = await db.branchStudents.getByBranch(branchCode);
    const universities = await db.universities.getAll();

    const active = students.filter(s => s.status === 'active').length;
    const graduated = students.filter(s => s.status === 'graduated').length;
    const frozen = students.filter(s => s.status === 'frozen').length;
    const cancelled = students.filter(s => s.status === 'cancelled').length;
    const accepted = students.filter(s => s.finalStatus === 'Kabul').length;
    const rejected = students.filter(s => s.finalStatus === 'Red').length;
    const pending = students.filter(s => s.finalStatus === 'Beklemede').length;

    const uniCounts: Record<string, number> = {};
    students.forEach(s => {
        if (s.educations && s.educations.length > 0) {
            s.educations.forEach(e => {
                if (e.universityId) {
                    uniCounts[e.universityId] = (uniCounts[e.universityId] || 0) + 1;
                }
            });
        } else {
            if (s.universityId) uniCounts[s.universityId] = (uniCounts[s.universityId] || 0) + 1;
            if (s.university2Id) uniCounts[s.university2Id] = (uniCounts[s.university2Id] || 0) + 1;
        }
    });

    const universityDistribution = Object.entries(uniCounts)
        .map(([id, count]) => ({
            id,
            name: universities.find(u => u.id === id)?.name || 'Bilinmeyen',
            count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const withConsulting = students.filter(s => s.supportPackage === 'Evet').length;
    const withAccommodation = students.filter(s => s.accommodationService === 'Evet').length;

    const recentStudents = [...students]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(s => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            name: `${s.firstName} ${s.lastName}`,
            photoUrl: s.photoUrl,
            university: (s.educations && s.educations.length > 0) ?
                s.educations.map(e => universities.find(u => u.id === e.universityId)?.name || '-').join(', ') :
                universities.find(u => u.id === s.universityId)?.name || '-',
            status: s.finalStatus,
            date: s.registrationDate
        }));

    return {
        total: students.length,
        active,
        graduated,
        frozen,
        cancelled,
        accepted,
        rejected,
        pending,
        universityDistribution,
        withConsulting,
        withAccommodation,
        recentStudents,
        totalUniversities: new Set(students.flatMap(s =>
            (s.educations && s.educations.length > 0) ? s.educations.map(e => e.universityId) : [s.universityId]
        ).filter(Boolean)).size
    };
}
