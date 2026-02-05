'use server';

import { db } from '@/lib/db';
import { BranchCode, BranchStudent, University } from '@/types';

// Get all universities sorted alphabetically
export async function getUniversities() {
    return db.universities.getAll().sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

// Get students by branch
export async function getBranchStudents(branchCode: BranchCode) {
    return db.branchStudents.getByBranch(branchCode);
}

// Get students by university (filtered by branch)
export async function getStudentsByUniversity(universityId: string, branchCode: BranchCode) {
    return db.branchStudents.getByUniversity(universityId, branchCode);
}

// Get user favorites
export async function getUserFavorites(userId: string) {
    return db.userFavorites.getByUser(userId);
}

// Toggle favorite
export async function toggleFavorite(userId: string, universityId: string) {
    return db.userFavorites.toggle(userId, universityId);
}

// Update university name
export async function updateUniversityName(id: string, name: string) {
    const uni = db.universities.getById(id);
    if (uni) {
        uni.name = name;
        return db.universities.update(uni);
    }
    return null;
}

// Delete university
export async function deleteUniversity(id: string) {
    db.universities.delete(id);
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
    return db.universities.create(newUni);
}

// Create branch student
export async function createBranchStudent(student: Omit<BranchStudent, 'id' | 'createdAt'>) {
    const newStudent: BranchStudent = {
        ...student,
        id: `bs-${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    return db.branchStudents.create(newStudent);
}

// Update branch student
export async function updateBranchStudent(id: string, data: Partial<BranchStudent>) {
    const student = db.branchStudents.getById(id);
    if (student) {
        const updated = { ...student, ...data };
        return db.branchStudents.update(updated);
    }
    return null;
}

// Delete branch student
export async function deleteBranchStudent(id: string) {
    db.branchStudents.delete(id);
    return true;
}

// Get branch statistics with detailed breakdown
export async function getBranchStats(branchCode: BranchCode) {
    const students = db.branchStudents.getByBranch(branchCode);
    const universities = db.universities.getAll();

    const active = students.filter(s => s.status === 'active').length;
    const graduated = students.filter(s => s.status === 'graduated').length;
    const frozen = students.filter(s => s.status === 'frozen').length;
    const cancelled = students.filter(s => s.status === 'cancelled').length;
    const accepted = students.filter(s => s.finalStatus === 'Kabul').length;
    const rejected = students.filter(s => s.finalStatus === 'Red').length;
    const pending = students.filter(s => s.finalStatus === 'Beklemede').length;

    // University distribution (top 5)
    const uniCounts: Record<string, number> = {};
    students.forEach(s => {
        if (s.universityId) {
            uniCounts[s.universityId] = (uniCounts[s.universityId] || 0) + 1;
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

    // Danışmanlık stats
    const withConsulting = students.filter(s => s.supportPackage === 'Evet').length;
    const withAccommodation = students.filter(s => s.accommodationService === 'Evet').length;

    // Recent students (last 5)
    const recentStudents = [...students]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(s => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            university: universities.find(u => u.id === s.universityId)?.name || '-',
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
        totalUniversities: new Set(students.map(s => s.universityId).filter(Boolean)).size
    };
}
