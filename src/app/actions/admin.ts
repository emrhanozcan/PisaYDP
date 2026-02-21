'use server'

import { db } from "@/lib/db";
import { User, Student, ServiceType } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMentor(formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string; // Temporary password

    const newMentor: User = {
        id: `mentor-${Date.now()}`,
        firstName,
        lastName,
        email,
        username,
        password,
        role: 'mentor',
        createdAt: new Date().toISOString()
    };

    db.users.create(newMentor);

    db.audit.create({
        id: `audit-${Date.now()}`,
        entity: 'User',
        entityId: newMentor.id,
        action: 'create',
        actorId: 'admin-1', // In real app get from session
        timestamp: new Date().toISOString()
    });

    revalidatePath('/admin/mentors');
    redirect('/admin/mentors');
}

export async function createStudent(formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const country = formData.get('country') as string;
    const school = formData.get('school') as string;
    const packageType = formData.get('packageType') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const program = formData.get('program') as string;
    const startDate = formData.get('startDate') as string;

    const newStudent: Student = {
        id: `student-${Date.now()}`,
        firstName,
        lastName,
        country,
        school,
        packageType,
        email,
        phone,
        program,
        status: 'active',
        startDate: startDate || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    db.students.create(newStudent);

    db.audit.create({
        id: `audit-${Date.now()}`,
        entity: 'Student',
        entityId: newStudent.id,
        action: 'create',
        actorId: 'admin-1',
        timestamp: new Date().toISOString()
    });

    revalidatePath('/admin/students');
    redirect('/admin/students');
}

export async function assignMentor(formData: FormData) {
    const studentId = formData.get('studentId') as string;
    const mentorId = formData.get('mentorId') as string;
    const role = formData.get('role') as 'primary' | 'support';
    const notes = formData.get('notes') as string || '';

    const newAssignment: any = { // using any for quick fix if type strictness complains about optional fields not present in form
        id: `assign-${Date.now()}`,
        studentId,
        mentorId,
        role,
        startDate: new Date().toISOString(),
        notes
    };
    // In real db.ts we defined interface MentorAssignment, ensure it matches.
    // Interface: { id, mentorId, studentId, role, startDate, endDate?, notes? }

    db.assignments.create(newAssignment);
    revalidatePath(`/admin/students/${studentId}`);
}

export async function toggleUserStatus(userId: string) {
    // Implement freeze/active toggle logic here
    revalidatePath('/admin/mentors');
}

export async function createServiceType(formData: FormData) {
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const pricingModel = formData.get('pricingModel') as 'fixed' | 'hourly';
    const unitPrice = parseFloat(formData.get('unitPrice') as string);
    const isActive = formData.get('isActive') === 'on';

    const newServiceType: ServiceType = {
        id: `st-${Date.now()}`,
        name,
        category,
        pricingModel,
        unitPrice,
        isActive: true // Always active on create for now, or use checkbox
    };

    db.serviceTypes.create(newServiceType);
    revalidatePath('/admin/settings');
}

export async function deleteServiceType(id: string) {
    db.serviceTypes.delete(id);
    revalidatePath('/admin/settings');
}
// Admin: Update payment status of a service log
export async function updatePaymentStatus(logId: string, paymentStatus: 'pending' | 'paid') {
    const log = db.logs.getAll().find(l => l.id === logId);
    if (!log) return;

    db.logs.update({
        ...log,
        paymentStatus,
        updatedAt: new Date().toISOString()
    });

    revalidatePath('/admin/payments');
    revalidatePath('/mentor/summary');
}

// Admin: Update service log status (approve/reject)
export async function updateServiceLogStatus(logId: string, status: 'approved' | 'rejected' | 'submitted', feedback?: string) {
    const log = db.logs.getAll().find(l => l.id === logId);
    if (!log) return;

    db.logs.update({
        ...log,
        status,
        adminFeedback: feedback,
        updatedAt: new Date().toISOString()
    });

    revalidatePath('/admin/logs');
    revalidatePath('/admin/payments');
    revalidatePath('/mentor');
    revalidatePath('/mentor/summary');
}

// Admin: Update mentor information
export async function updateMentor(mentorId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    username?: string;
    password?: string;
}) {
    const mentor = db.users.getById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
        throw new Error('Mentor not found');
    }

    const updatedMentor = {
        ...mentor,
        firstName: data.firstName || mentor.firstName,
        lastName: data.lastName || mentor.lastName,
        email: data.email || mentor.email,
        phone: data.phone || mentor.phone,
        username: data.username || mentor.username,
        password: data.password || mentor.password,
        updatedAt: new Date().toISOString()
    };

    db.users.update(updatedMentor);

    db.audit.create({
        id: `audit-${Date.now()}`,
        entity: 'User',
        entityId: mentorId,
        action: 'update',
        actorId: 'admin-1',
        changes: data as any,
        timestamp: new Date().toISOString()
    });

    revalidatePath('/admin/mentors');
    revalidatePath(`/admin/mentors/${mentorId}`);
}
