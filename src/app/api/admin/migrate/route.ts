
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

function toSnakeCase(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function mapKeysToSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => mapKeysToSnakeCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const snakeKey = toSnakeCase(key);
            result[snakeKey] = mapKeysToSnakeCase(obj[key]);
            return result;
        }, {} as any);
    }
    return obj;
}

export async function GET() {
    try {
        const dataPath = path.join(process.cwd(), 'ydp-data.json');
        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
        }

        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        const results: any = {};

        const validUserIds = new Set<string>();
        const validStudentIds = new Set<string>();
        const validUniversityIds = new Set<string>();
        const validServiceTypeIds = new Set<string>();

        // 1. Users
        if (data.users && data.users.length > 0) {
            const users = mapKeysToSnakeCase(data.users).map((u: any) => {
                const { updated_at, ...rest } = u; // Remove updated_at as it's not in schema
                validUserIds.add(rest.id);
                return rest;
            });
            const { error } = await supabase.from('users').upsert(users);
            results.users = error ? error.message : `Migrated ${users.length} users`;
        }

        // 2. Universities
        if (data.universities && data.universities.length > 0) {
            const universities = mapKeysToSnakeCase(data.universities);
            universities.forEach((u: any) => validUniversityIds.add(u.id));
            const { error } = await supabase.from('universities').upsert(universities);
            results.universities = error ? error.message : `Migrated ${universities.length} universities`;
        }

        // 3. Service Types
        if (data.serviceTypes && data.serviceTypes.length > 0) {
            const serviceTypes = mapKeysToSnakeCase(data.serviceTypes);
            serviceTypes.forEach((s: any) => validServiceTypeIds.add(s.id));
            const { error } = await supabase.from('service_types').upsert(serviceTypes);
            results.serviceTypes = error ? error.message : `Migrated ${serviceTypes.length} service types`;
        }

        // 4. Students (Global)
        if (data.students && data.students.length > 0) {
            const students = mapKeysToSnakeCase(data.students);
            students.forEach((s: any) => validStudentIds.add(s.id));
            const { error } = await supabase.from('students').upsert(students);
            results.students = error ? error.message : `Migrated ${students.length} students`;
        }

        // 6. Branch Students
        if (data.branchStudents && data.branchStudents.length > 0) {
            // Branch students have university_id which references universities.
            const branchStudents = mapKeysToSnakeCase(data.branchStudents).map((s: any) => {
                const { branch_name, ...rest } = s;
                // Fix FKs: convert empty strings to null
                if (!validUniversityIds.has(rest.university_id)) rest.university_id = null;
                return rest;
            });

            // IMPORTANT: Insert into 'students' table first to satisfy FK constraints for assignments/logs
            // We map branch_students to students schema
            const globalStudents = branchStudents.map((s: any) => {
                validStudentIds.add(s.id);
                return {
                    id: s.id,
                    first_name: s.first_name,
                    last_name: s.last_name,
                    country: 'İtalya', // Default
                    city: s.city,
                    school: null, // Mapped from university_id later if needed
                    program: s.program,
                    email: s.email,
                    phone: s.phone,
                    status: s.status,
                    start_date: s.created_at, // Use created_at as start_date placeholder
                    created_at: s.created_at
                };
            });

            // Upsert into students (Global)
            const { error: globalError } = await supabase.from('students').upsert(globalStudents);
            if (globalError) console.error('Global Student Sync Error:', globalError);

            // Upsert into branch_students
            const { error } = await supabase.from('branch_students').upsert(branchStudents);
            results.branchStudents = error ? error.message : `Migrated ${branchStudents.length} branch students (and synced to global)`;
        }

        // 7. Support Tickets
        if (data.supportTickets && data.supportTickets.length > 0) {
            const tickets = mapKeysToSnakeCase(data.supportTickets).map((t: any) => {
                const { screenshots, ...rest } = t;
                // Fix FKs
                if (!validUserIds.has(rest.assigned_to)) rest.assigned_to = null;
                if (!validUserIds.has(rest.user_id)) rest.user_id = null;
                return rest;
            });
            const validTickets = tickets.filter((t: any) => t.user_id !== null); // Must have user_id usually? Schema allows null user_id?
            // Schema: user_id text references public.users(id). Not Null? Schema says just references.
            // But if user_id is missing, ticket is orphaned.
            const { error } = await supabase.from('support_tickets').upsert(validTickets);
            results.supportTickets = error ? error.message : `Migrated ${validTickets.length} tickets`;
        }

        // 8. Mentor Assignments
        if (data.assignments && data.assignments.length > 0) {
            const assignments = mapKeysToSnakeCase(data.assignments).map((a: any) => {
                // Fix FKs
                if (!validUserIds.has(a.mentor_id)) a.mentor_id = null;
                if (!validStudentIds.has(a.student_id)) a.student_id = null;
                return a;
            });
            const validAssignments = assignments.filter((a: any) => a.mentor_id && a.student_id);
            const { error } = await supabase.from('mentor_assignments').upsert(validAssignments);
            results.assignments = error ? error.message : `Migrated ${validAssignments.length} assignments`;
        }

        // 9. Service Logs
        if (data.serviceLogs && data.serviceLogs.length > 0) {
            const logs = mapKeysToSnakeCase(data.serviceLogs).map((l: any) => {
                if (!validStudentIds.has(l.student_id)) l.student_id = null;
                if (!validUserIds.has(l.mentor_id)) l.mentor_id = null;
                if (!validServiceTypeIds.has(l.service_type_id)) l.service_type_id = null;
                return l;
            });
            const validLogs = logs.filter((l: any) => l.student_id && l.mentor_id && l.service_type_id);
            const { error } = await supabase.from('service_logs').upsert(validLogs);
            results.serviceLogs = error ? error.message : `Migrated ${validLogs.length} logs`;
        }

        // 9. Audit Logs
        if (data.auditLogs && data.auditLogs.length > 0) {
            const audit = mapKeysToSnakeCase(data.auditLogs);
            const { error } = await supabase.from('audit_logs').upsert(audit);
            results.auditLogs = error ? error.message : `Migrated ${audit.length} audit logs`;
        }

        // 10. User Favorites
        if (data.userFavorites && data.userFavorites.length > 0) {
            const favorites = mapKeysToSnakeCase(data.userFavorites);
            const { error } = await supabase.from('user_favorites').upsert(favorites);
            results.userFavorites = error ? error.message : `Migrated ${favorites.length} favorites`;
        }

        // 11. Ticket Responses
        if (data.ticketResponses && data.ticketResponses.length > 0) {
            const responses = mapKeysToSnakeCase(data.ticketResponses);
            const { error } = await supabase.from('ticket_responses').upsert(responses);
            results.ticketResponses = error ? error.message : `Migrated ${responses.length} ticket responses`;
        }

        return NextResponse.json({
            success: true,
            results,
            debug: {
                usersCount: validUserIds.size,
                studentsCount: validStudentIds.size,
                firstTicket: data.supportTickets?.[0] ? mapKeysToSnakeCase([data.supportTickets[0]])[0] : null
            }
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
    }
}
