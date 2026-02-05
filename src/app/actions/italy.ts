'use server'

import { db } from '@/lib/db';
import { BranchCode, BRANCH_NAMES } from '@/types';

const ALL_BRANCHES: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];

export async function getAllBranchesStats() {
    const universities = db.universities.getAll();

    const branchesData = ALL_BRANCHES.map(branchCode => {
        const students = db.branchStudents.getByBranch(branchCode);
        const active = students.filter(s => s.status === 'active').length;
        const accepted = students.filter(s => s.finalStatus === 'Kabul').length;
        const rejected = students.filter(s => s.finalStatus === 'Red').length;
        const pending = students.filter(s => s.finalStatus === 'Beklemede').length;
        const withConsulting = students.filter(s => s.supportPackage === 'Evet').length;
        const withAccommodation = students.filter(s => s.accommodationService === 'Evet').length;

        return {
            code: branchCode,
            name: BRANCH_NAMES[branchCode],
            total: students.length,
            active,
            accepted,
            rejected,
            pending,
            withConsulting,
            withAccommodation,
            income: (withConsulting * 500) + (withAccommodation * 300)
        };
    });

    // Totals
    const totals = {
        total: branchesData.reduce((sum, b) => sum + b.total, 0),
        active: branchesData.reduce((sum, b) => sum + b.active, 0),
        accepted: branchesData.reduce((sum, b) => sum + b.accepted, 0),
        rejected: branchesData.reduce((sum, b) => sum + b.rejected, 0),
        pending: branchesData.reduce((sum, b) => sum + b.pending, 0),
        income: branchesData.reduce((sum, b) => sum + b.income, 0),
        totalUniversities: universities.length
    };

    return { branches: branchesData, totals };
}

export async function getAllStudents() {
    const allStudents: any[] = [];
    const universities = db.universities.getAll();

    ALL_BRANCHES.forEach(branchCode => {
        const students = db.branchStudents.getByBranch(branchCode);
        students.forEach(s => {
            allStudents.push({
                ...s,
                branchName: BRANCH_NAMES[branchCode],
                universityName: universities.find(u => u.id === s.universityId)?.name || '-'
            });
        });
    });

    return allStudents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getBranchDetailStats(branchCode: BranchCode) {
    const students = db.branchStudents.getByBranch(branchCode);
    const universities = db.universities.getAll();

    const active = students.filter(s => s.status === 'active').length;
    const graduated = students.filter(s => s.status === 'graduated').length;
    const frozen = students.filter(s => s.status === 'frozen').length;
    const cancelled = students.filter(s => s.status === 'cancelled').length;
    const accepted = students.filter(s => s.finalStatus === 'Kabul').length;
    const rejected = students.filter(s => s.finalStatus === 'Red').length;
    const pending = students.filter(s => s.finalStatus === 'Beklemede').length;

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

    const withConsulting = students.filter(s => s.supportPackage === 'Evet').length;
    const withAccommodation = students.filter(s => s.accommodationService === 'Evet').length;

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
        branchName: BRANCH_NAMES[branchCode],
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
        totalUniversities: new Set(students.map(s => s.universityId).filter(Boolean)).size,
        students
    };
}

export async function getAllUniversitiesWithStats() {
    const universities = db.universities.getAll();

    const uniStats = universities.map(uni => {
        let totalStudents = 0;
        const branchCounts: Record<string, number> = {};

        ALL_BRANCHES.forEach(branchCode => {
            const students = db.branchStudents.getByBranch(branchCode);
            const count = students.filter(s => s.universityId === uni.id).length;
            if (count > 0) {
                branchCounts[BRANCH_NAMES[branchCode]] = count;
                totalStudents += count;
            }
        });

        return {
            ...uni,
            totalStudents,
            branchCounts
        };
    });

    return uniStats.sort((a, b) => b.totalStudents - a.totalStudents);
}
