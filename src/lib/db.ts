
import { supabase } from '@/lib/supabase';
import { User, Student, MentorAssignment, ServiceLog, ServiceType, AuditLog, University, BranchStudent, StudentEducation, UserFavorite, BranchCode, SupportTicket, TicketResponse, Notification, ServiceNote, ServiceUpload, ScholarshipTracking, Lead } from '@/types';


// Helpers for Case Conversion
function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function mapToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => mapToCamelCase(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = toCamelCase(key);
            result[camelKey] = mapToCamelCase(obj[key]);
            return result;
        }, {} as any);
    }
    return obj;
}

const BRANCH_STUDENT_WRITABLE_FIELDS = new Set([
    'branch_code', 'first_name', 'last_name', 'id_number', 'serial_number', 'passport_no', 'passport_expiry',
    'notes', 'description', 'info_date', 'info_status', 'application_deadline', 'application_fee', 'dsu_fee',
    'visa_fee', 'offer_letter', 'email', 'phone', 'parent_name', 'parent_phone', 'parent_email', 'fee',
    'city', 'department', 'iban', 'university_id', 'program', 'grade', 'enrollment_year',
    'university2_id', 'department2', 'program2', 'grade2', 'exam_result', 'selection_result', 'contract_status',
    'visa_result', 'final_status', 'payment_status', 'package_type', 'accommodation_service', 'support_package',
    'scholarship_package', 'ydt_support', 'accommodation_city', 'accommodation_type', 'accommodation_address',
    'accommodation_monthly_rent', 'accommodation_diff_payment', 'accommodation_payment_status', 'accommodation_date',
    'accommodation_status', 'guardian_operator', 'guardian_arrival_date', 'guardian_city', 'guardian_location',
    'guardian_time', 'guardian_status', 'arrival_city', 'arrival_payment_status', 'arrival_operator',
    'arrival_date', 'arrival_airport', 'arrival_time', 'flight_code', 'arrival_accommodation', 'arrival_status',
    'ydt_welcome_date', 'ydt_welcome_status', 'ydt_school_reg_date', 'ydt_school_reg_status', 'ydt_res_permit_date',
    'ydt_res_permit_status', 'ydt_sim_date', 'ydt_sim_status', 'ydt_bank_date', 'ydt_bank_status',
    'residence_permit_handler', 'residence_permit_arrival_date', 'residence_permit_appointment_date',
    'residence_permit_place', 'residence_permit_time', 'residence_permit_status', 'codice_fiscale_handler',
    'codice_fiscale_arrival_date', 'codice_fiscale_appointment_date', 'codice_fiscale_place', 'codice_fiscale_time',
    'codice_fiscale_status', 'consultant_name', 'consultant_contact', 'status', 'registration_date', 'photo_url',
    'scholarship_types', 'guardian_service'
]);


const STUDENT_WRITABLE_FIELDS = new Set([
    'first_name', 'last_name', 'country', 'city', 'school', 'program', 'email', 'phone',
    'emergency_contact', 'address', 'notes', 'status', 'package_type', 'start_date', 'photo_url'
]);

// GLOBAL BLOCK-LIST for generated columns across ALL tables
const GLOBALLY_RESTRICTED_KEYS = new Set([
    'full_name', 'fullName', 'fullname', 'fullname_tr', 'Full_Name',
    'search_text', 'searchText', 'searchtext', 'Search_Text',
    'full_text_search', 'fulltextsearch', 'Full_Text_Search',
    'is_ydp', 'isYDP', 'is_branch', 'isBranch',
    'created_at', 'updated_at'
]);

function mapToSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => mapToSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object') {
        const result = {} as any;
        for (const key of Object.keys(obj)) {
            // STEP 1: Global Block-list check
            if (GLOBALLY_RESTRICTED_KEYS.has(key)) continue;

            const snakeKey = toSnakeCase(key);
            if (GLOBALLY_RESTRICTED_KEYS.has(snakeKey)) continue;

            // STEP 2: Handle special ID or read-only cases if needed, but for now continue
            result[snakeKey] = mapToSnakeCase(obj[key]);
        }
        return result;
    }
    return obj;
}

export const db = {
    users: {
        getAll: async () => {
            const { data, error } = await supabase.from('users').select('*');
            if (error) throw error;
            return mapToCamelCase(data) as User[];
        },
        getById: async (id: string) => {
            const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
            if (error) return null; // Handle not found gracefully or throw? Original adapter threw? Let's return null.
            return mapToCamelCase(data) as User;
        },
        getByUsername: async (username: string) => {
            const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
            if (error) return null;
            return mapToCamelCase(data) as User;
        },
        create: async (user: User) => {
            const payload = mapToSnakeCase(user);
            const { data, error } = await supabase.from('users').insert(payload).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as User;
        },
        update: async (user: User) => {
            const { id, createdAt, created_at, ...rest } = user as any;
            const payload = mapToSnakeCase(rest);
            const { data, error } = await supabase.from('users').update(payload).eq('id', user.id).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as User;
        }
    },
    profiles: {
        getById: async (id: string) => {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
            if (error) return null;
            return mapToCamelCase(data);
        }
    },
    students: {
        getAll: async () => {
            const { data: students, error } = await supabase.from('students').select('*');
            if (error) throw error;

            const mappedStudents = mapToCamelCase(students) as Student[];

            if (mappedStudents.length > 0) {
                const studentIds = mappedStudents.map(s => s.id);
                const { data: educations } = await supabase
                    .from('student_educations')
                    .select('*')
                    .in('student_id', studentIds);

                const mappedEducations = mapToCamelCase(educations || []) as any[];

                mappedStudents.forEach(student => {
                    student.educations = mappedEducations.filter(e => e.studentId === student.id);
                });
            }

            return mappedStudents;
        },
        getById: async (id: string) => {
            const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
            if (error) return null;
            const student = mapToCamelCase(data) as Student;

            const { data: edus } = await supabase.from('student_educations').select('*').eq('student_id', id);
            if (edus) {
                student.educations = mapToCamelCase(edus);
            }
            return student;
        },
        create: async (student: Student) => {
            const payload = mapToSnakeCase(student);
            const filteredPayload = Object.keys(payload)
                .filter(key => STUDENT_WRITABLE_FIELDS.has(key) || key === 'id')
                .reduce((obj, key) => {
                    obj[key] = payload[key];
                    return obj;
                }, {} as any);

            const { data, error } = await supabase.from('students').insert(filteredPayload).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as Student;
        },

        getAllSummaries: async () => {
            const { data, error } = await supabase
                .from('students')
                .select('id, first_name, last_name, email, phone, photo_url, status, created_at, package_type, city')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return mapToCamelCase(data) as Partial<Student>[];
        },
        update: async (student: Partial<Student> & { id: string }) => {
            const payload = mapToSnakeCase(student);
            const filteredPayload = Object.keys(payload)
                .filter(key => STUDENT_WRITABLE_FIELDS.has(key))
                .reduce((obj, key) => {
                    obj[key] = payload[key];
                    return obj;
                }, {} as any);

            const { data, error } = await supabase.from('students').update(filteredPayload).eq('id', student.id).select().single();
            if (error) {
                console.error('[db.ts] students update ERROR:', error.message, 'Payload:', filteredPayload);
                throw error;
            }
            return mapToCamelCase(data) as Student;
        }
    },
    branchStudents: {
        getAll: async () => {
            const { data: students, error } = await supabase.from('branch_students').select('*');
            if (error) throw error;

            const mappedStudents = mapToCamelCase(students) as BranchStudent[];

            if (mappedStudents.length > 0) {
                const studentIds = mappedStudents.map(s => s.id);
                const { data: educations } = await supabase
                    .from('student_educations')
                    .select('*')
                    .in('student_id', studentIds);

                const mappedEducations = mapToCamelCase(educations || []) as any[];

                mappedStudents.forEach(student => {
                    student.educations = mappedEducations.filter(e => e.studentId === student.id);

                    if ((!student.educations || student.educations.length === 0) && student.universityId) {
                        student.educations = [{
                            universityId: student.universityId,
                            department: student.department,
                            program: student.program,
                            grade: student.grade
                        }];
                    }
                });
            }

            return mappedStudents;
        },
        getAllSummaries: async () => {
            const { data: students, error } = await supabase
                .from('branch_students')
                .select('id, first_name, last_name, email, phone, photo_url, status, created_at, package_type, city, university_id, branch_code');

            if (error) throw error;

            const mappedStudents = mapToCamelCase(students) as BranchStudent[];

            if (mappedStudents.length > 0) {
                const studentIds = mappedStudents.map(s => s.id);
                // Only primary education needed for University Name
                const { data: educations } = await supabase
                    .from('student_educations')
                    .select('student_id, university_id, program, grade')
                    .in('student_id', studentIds);

                const mappedEducations = mapToCamelCase(educations || []) as any[];

                mappedStudents.forEach(student => {
                    student.educations = mappedEducations.filter(e => e.studentId === student.id);
                    if ((!student.educations || student.educations.length === 0) && student.universityId) {
                        student.educations = [{
                            universityId: student.universityId
                        } as any];
                    }
                });
            }
            return mappedStudents;
        },
        getByBranch: async (branchCode: BranchCode) => {
            const { data: students, error } = await supabase
                .from('branch_students')
                .select('*')
                .eq('branch_code', branchCode);

            if (error) throw error;

            const mappedStudents = mapToCamelCase(students) as BranchStudent[];

            if (mappedStudents.length > 0) {
                const studentIds = mappedStudents.map(s => s.id);
                const { data: educations } = await supabase
                    .from('student_educations')
                    .select('*')
                    .in('student_id', studentIds);

                const mappedEducations = mapToCamelCase(educations || []) as any[];

                // Merge educations into students
                mappedStudents.forEach(student => {
                    student.educations = mappedEducations.filter(e => e.studentId === student.id);
                    // Fallback for legacy fields if no educations found (though standard behavior is to have at least one)
                    if ((!student.educations || student.educations.length === 0) && student.universityId) {
                        student.educations = [{
                            universityId: student.universityId,
                            department: student.department,
                            program: student.program,
                            grade: student.grade
                        }];
                    }
                });
            }

            return mappedStudents;
        },
        getById: async (id: string) => {
            const { data, error } = await supabase.from('branch_students').select('*').eq('id', id).single();
            if (error) return null;
            const student = mapToCamelCase(data) as BranchStudent;

            // Fetch additional educations
            const { data: edus } = await supabase.from('student_educations').select('*').eq('student_id', id);
            if (edus && edus.length > 0) {
                student.educations = mapToCamelCase(edus);
            } else if (student.universityId) {
                // Fallback to legacy fields if no educations found
                student.educations = [{
                    universityId: student.universityId,
                    department: student.department,
                    program: student.program,
                    grade: student.grade
                }];
            }
            return student;
        },
        getScholarshipStudents: async () => {
            const { data, error } = await supabase
                .from('branch_students')
                .select('*')
                .eq('scholarship_package', 'Evet');

            if (error) throw error;

            const mappedStudents = mapToCamelCase(data) as BranchStudent[];

            if (mappedStudents.length > 0) {
                const studentIds = mappedStudents.map(s => s.id);
                const { data: educations } = await supabase
                    .from('student_educations')
                    .select('*')
                    .in('student_id', studentIds);

                const mappedEducations = mapToCamelCase(educations || []) as any[];

                mappedStudents.forEach(student => {
                    student.educations = mappedEducations.filter(e => e.studentId === student.id);
                    if ((!student.educations || student.educations.length === 0) && student.universityId) {
                        student.educations = [{
                            universityId: student.universityId,
                            department: student.department,
                            program: student.program,
                            grade: student.grade
                        }];
                    }
                });
            }
            return mappedStudents;
        },
        getByUniversity: async (universityId: string, branchCode?: BranchCode) => {
            // 1. Fetch by primary/secondary columns
            // university2_id column might not exist, so we only check university_id
            let query1 = supabase.from('branch_students').select('*').eq('university_id', universityId);
            if (branchCode) query1 = query1.eq('branch_code', branchCode);

            const { data: data1, error: error1 } = await query1;
            if (error1) throw error1;

            // 2. Fetch by student_educations table
            const { data: eduMatches, error: error2 } = await supabase.from('student_educations').select('student_id').eq('university_id', universityId);
            if (error2) throw error2;

            const studentIdsFromEdus = eduMatches?.map(e => e.student_id) || [];

            let data2: any[] = [];
            if (studentIdsFromEdus.length > 0) {
                let query2 = supabase.from('branch_students').select('*').in('id', studentIdsFromEdus);
                if (branchCode) query2 = query2.eq('branch_code', branchCode);

                const { data, error: error3 } = await query2;
                if (error3) throw error3;
                data2 = data || [];
            }

            // 3. Merge and deduplicate
            const allStudents = [...(data1 || []), ...data2];
            const uniqueStudents = Array.from(new Map(allStudents.map(item => [item.id, item])).values());

            const mappedStudents = mapToCamelCase(uniqueStudents) as BranchStudent[];

            // 4. Populate educations for these students so the UI shows correct info
            if (mappedStudents.length > 0) {
                const studentIds = mappedStudents.map(s => s.id);
                const { data: educations } = await supabase
                    .from('student_educations')
                    .select('*')
                    .in('student_id', studentIds);

                const mappedEducations = mapToCamelCase(educations || []) as any[];

                mappedStudents.forEach(student => {
                    student.educations = mappedEducations.filter(e => e.studentId === student.id);
                    if ((!student.educations || student.educations.length === 0) && student.universityId) {
                        student.educations = [{
                            universityId: student.universityId,
                            department: student.department,
                            program: student.program,
                            grade: student.grade
                        }];
                    }
                });
            }

            return mappedStudents;
        },
        create: async (student: BranchStudent) => {
            const { educations, ...rest } = student;
            const payload = mapToSnakeCase(rest);
            const filteredPayload = Object.keys(payload)
                .filter(key => BRANCH_STUDENT_WRITABLE_FIELDS.has(key) || key === 'id' || key === 'created_at')
                .reduce((obj, key) => {
                    obj[key] = payload[key];
                    return obj;
                }, {} as any);

            const { data, error } = await supabase.from('branch_students').insert(filteredPayload).select().single();
            if (error) throw error;

            const createdStudent = mapToCamelCase(data) as BranchStudent;

            // Insert educations
            const eduPayloads = educations?.map((e: any) => ({
                student_id: createdStudent.id,
                university_id: e.universityId,
                department: e.department,
                program: e.program,
                grade: e.grade
            })) || [];

            if (eduPayloads.length > 0) {
                const { error: eduError } = await supabase.from('student_educations').insert(mapToSnakeCase(eduPayloads));
                if (eduError) {
                    console.error('Error inserting educations:', eduError);
                    throw eduError;
                }
            }

            // Return with educations attached
            return { ...createdStudent, educations: educations || [] };
        },
        update: async (student: any) => {
            const { id, educations, ...rest } = student;
            const payload = mapToSnakeCase(rest);
            const filteredPayload = Object.keys(payload)
                .filter(key => BRANCH_STUDENT_WRITABLE_FIELDS.has(key))
                .reduce((obj, key) => {
                    obj[key] = payload[key];
                    return obj;
                }, {} as any);

            const { data, error } = await supabase.from('branch_students').update(filteredPayload).eq('id', student.id).select().single();
            if (error) throw error;

            // Update educations: Delete all and re-insert
            if (educations) {
                // Delete existing
                const { error: delError } = await supabase.from('student_educations').delete().eq('student_id', student.id);
                if (delError) {
                    console.error('Error deleting educations:', delError);
                    throw delError;
                }

                // Insert new
                const eduPayloads = educations.map((e: any) => ({
                    student_id: student.id,
                    university_id: e.universityId,
                    department: e.department,
                    program: e.program,
                    grade: e.grade
                }));

                if (eduPayloads.length > 0) {
                    const { error: eduError } = await supabase.from('student_educations').insert(mapToSnakeCase(eduPayloads));
                    if (eduError) {
                        console.error('Error inserting educations:', eduError);
                        throw eduError;
                    }
                }
            }

            // Return updated data with educations attached
            const updatedStudent = mapToCamelCase(data) as BranchStudent;
            return { ...updatedStudent, educations: educations || [] };
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('branch_students').delete().eq('id', id);
            if (error) throw error;
        }
    },
    studentEducations: {
        getByStudent: async (studentId: string) => {
            const { data, error } = await supabase.from('student_educations').select('*').eq('student_id', studentId);
            if (error) throw error;
            return mapToCamelCase(data) as StudentEducation[];
        }
    },
    logs: {
        getAll: async () => {
            const { data, error } = await supabase.from('service_logs').select('*');
            if (error) throw error;
            return mapToCamelCase(data) as ServiceLog[];
        },
        getByStudentId: async (studentId: string) => {
            const { data, error } = await supabase.from('service_logs').select('*').eq('student_id', studentId);
            if (error) throw error;
            return mapToCamelCase(data) as ServiceLog[];
        },
        create: async (log: ServiceLog) => {
            const payload = mapToSnakeCase(log);
            const { data, error } = await supabase.from('service_logs').insert(payload).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as ServiceLog;
        },
        update: async (log: ServiceLog) => {
            const payload = mapToSnakeCase(log);
            const { data, error } = await supabase.from('service_logs').update(payload).eq('id', log.id).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as ServiceLog;
        },
        deleteByStudentId: async (studentId: string) => {
            const { error } = await supabase.from('service_logs').delete().eq('student_id', studentId);
            if (error) throw error;
        }
    },
    assignments: {
        getAll: async () => {
            const { data, error } = await supabase.from('mentor_assignments').select('*');
            if (error) throw error;
            return mapToCamelCase(data) as MentorAssignment[];
        },
        getByStudentId: async (studentId: string) => {
            const { data, error } = await supabase.from('mentor_assignments').select('*').eq('student_id', studentId);
            if (error) throw error;
            return mapToCamelCase(data) as MentorAssignment[];
        },
        create: async (assignment: MentorAssignment) => {
            const payload = mapToSnakeCase(assignment);
            const { data, error } = await supabase.from('mentor_assignments').insert(payload).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as MentorAssignment;
        },
        deleteByStudentId: async (studentId: string) => {
            const { error } = await supabase.from('mentor_assignments').delete().eq('student_id', studentId);
            if (error) throw error;
        }
    },
    serviceTypes: {
        getAll: async () => {
            const { data, error } = await supabase.from('service_types').select('*');
            if (error) throw error;
            return mapToCamelCase(data) as ServiceType[];
        },
        create: async (type: ServiceType) => {
            const payload = mapToSnakeCase(type);
            const { data, error } = await supabase.from('service_types').insert(payload).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as ServiceType;
        },
        update: async (type: ServiceType) => {
            const payload = mapToSnakeCase(type);
            const { data, error } = await supabase.from('service_types').update(payload).eq('id', type.id).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as ServiceType;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('service_types').delete().eq('id', id);
            if (error) throw error;
        }
    },
    audit: {
        create: async (log: AuditLog) => {
            const payload = mapToSnakeCase(log);
            const { data, error } = await supabase.from('audit_logs').insert(payload).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as AuditLog;
        },
        getAll: async () => {
            const { data, error } = await supabase.from('audit_logs').select('*');
            if (error) throw error;
            return mapToCamelCase(data) as AuditLog[];
        }
    },
    universities: {
        getAll: async () => {
            const { data, error } = await supabase.from('universities').select('*');
            if (error) throw error;
            return mapToCamelCase(data) as University[];
        },
        getById: async (id: string) => {
            const { data, error } = await supabase.from('universities').select('*').eq('id', id).single();
            if (error) throw error;
            return mapToCamelCase(data) as University;
        },
        create: async (uni: University) => {
            const payload = mapToSnakeCase(uni);
            const { data, error } = await supabase.from('universities').insert(payload).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as University;
        },
        update: async (uni: University) => {
            const payload = mapToSnakeCase(uni);
            const { data, error } = await supabase.from('universities').update(payload).eq('id', uni.id).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as University;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('universities').delete().eq('id', id);
            if (error) throw error;
        }
    },
    userFavorites: {
        getByUser: async (userId: string) => {
            const { data, error } = await supabase.from('user_favorites').select('*').eq('user_id', userId);
            if (error) throw error;
            return mapToCamelCase(data) as UserFavorite[];
        },
        toggle: async (userId: string, universityId: string) => {
            const { data } = await supabase.from('user_favorites').select('*').eq('user_id', userId).eq('university_id', universityId).single();

            if (data) {
                await supabase.from('user_favorites').delete().eq('user_id', userId).eq('university_id', universityId);
                return false;
            } else {
                await supabase.from('user_favorites').insert({ user_id: userId, university_id: universityId });
                return true;
            }
        },
        isFavorite: async (userId: string, universityId: string) => {
            const { data } = await supabase.from('user_favorites').select('*').eq('user_id', userId).eq('university_id', universityId);
            return !!(data && data.length > 0);
        }
    },
    supportTickets: {
        getAll: async () => {
            const { data, error } = await supabase.from('support_tickets').select('*');
            if (error) throw error;
            return mapToCamelCase(data) as SupportTicket[];
        },
        getById: async (id: string) => {
            const { data, error } = await supabase.from('support_tickets').select('*').eq('id', id).single();
            if (error) throw error;
            return mapToCamelCase(data) as SupportTicket;
        },
        getByUser: async (userId: string) => {
            const { data, error } = await supabase.from('support_tickets').select('*').eq('user_id', userId);
            if (error) throw error;
            return mapToCamelCase(data) as SupportTicket[];
        },
        getByStatus: async (status: string) => {
            const { data, error } = await supabase.from('support_tickets').select('*').eq('status', status);
            if (error) throw error;
            return mapToCamelCase(data) as SupportTicket[];
        },
        generateTicketNumber: async () => {
            const { count } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true });
            const year = new Date().getFullYear();
            const counter = (count || 0) + 1;
            return `TKT-${year}-${String(counter).padStart(5, '0')}`;
        },
        create: async (ticket: SupportTicket) => {
            const { screenshots, ...rest } = ticket; // Strip screenshots as column is missing/handled separately
            const payload = mapToSnakeCase(rest);
            // remove undefined fields to let DB defaults work if needed or avoid errors
            const { data, error } = await supabase.from('support_tickets').insert(payload).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as SupportTicket;
        },
        update: async (ticket: Partial<SupportTicket> & { id: string }) => {
            const { createdAt, created_at, updatedAt, updated_at, ...rest } = ticket as any;
            const payload = mapToSnakeCase(rest);
            const { data, error } = await supabase.from('support_tickets').update(payload).eq('id', ticket.id).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as SupportTicket;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('support_tickets').delete().eq('id', id);
            if (error) throw error;
        }
    },
    ticketResponses: {
        getByTicket: async (ticketId: string) => {
            const { data, error } = await supabase.from('ticket_responses').select('*').eq('ticket_id', ticketId);
            if (error) throw error;
            return mapToCamelCase(data) as TicketResponse[];
        },
        create: async (response: TicketResponse) => {
            const payload = mapToSnakeCase(response);
            const { error } = await supabase.from('ticket_responses').insert(payload);
            if (error) throw error;
            return response;
        }
    },
    notifications: {
        getByUser: async (userId: string) => {
            const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId);
            if (error) throw error;
            return mapToCamelCase(data) as Notification[];
        },
        getUnread: async (userId: string) => {
            const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).eq('is_read', false);
            if (error) throw error;
            return mapToCamelCase(data) as Notification[];
        },
        create: async (notification: Notification) => {
            const payload = mapToSnakeCase(notification);
            const { error } = await supabase.from('notifications').insert(payload);
            if (error) throw error;
            return notification;
        },
        markAsRead: async (id: string, userId?: string) => {
            let query = supabase.from('notifications').update({ is_read: true }).eq('id', id);
            // If userId is provided, ensure we only update matches for that user
            if (userId) {
                query = query.eq('user_id', userId);
            }
            const { error } = await query;
            if (error) throw error;
            return { id, isRead: true };
        },
        markAllAsRead: async (userId: string) => {
            const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
            if (error) throw error;
        }
    },
    serviceNotes: {
        get: async (studentId: string, serviceType: string) => {
            const { data, error } = await supabase
                .from('service_notes')
                .select('*')
                .eq('student_id', studentId)
                .eq('service_type', serviceType)
                .single();
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "found 0 rows"
            return data ? (mapToCamelCase(data) as ServiceNote) : null;
        },
        upsert: async (note: Partial<ServiceNote>) => {
            const payload = mapToSnakeCase(note);
            const { data, error } = await supabase
                .from('service_notes')
                .upsert(payload, { onConflict: 'student_id, service_type' })
                .select()
                .single();
            if (error) throw error;
            return mapToCamelCase(data) as ServiceNote;
        }
    },
    serviceUploads: {
        getByStudent: async (studentId: string, serviceType: string) => {
            const { data, error } = await supabase
                .from('service_uploads')
                .select('*')
                .eq('student_id', studentId)
                .eq('service_type', serviceType)
                .order('uploaded_at', { ascending: false });
            if (error) throw error;
            return mapToCamelCase(data) as ServiceUpload[];
        },
        create: async (upload: ServiceUpload) => {
            const payload = mapToSnakeCase(upload);
            // Remove id if it is empty so DB generates UUID
            if (payload.id === '') {
                delete payload.id;
            }
            const { data, error } = await supabase
                .from('service_uploads')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return mapToCamelCase(data) as ServiceUpload;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('service_uploads').delete().eq('id', id);
            if (error) throw error;
        }
    },
    scholarshipTracking: {
        getByStudentId: async (studentId: string) => {
            const { data, error } = await supabase
                .from('scholarship_tracking')
                .select('*')
                .eq('student_id', studentId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? (mapToCamelCase(data) as ScholarshipTracking) : null;
        },
        upsert: async (data: Partial<ScholarshipTracking>) => {
            const payload = mapToSnakeCase(data);

            // Remove id if empty/undefined to let DB generate it on insert, 
            // but for upsert with onConflict, we usually rely on a unique key.
            // unique key is student_id.

            const { data: result, error } = await supabase
                .from('scholarship_tracking')
                .upsert(payload, { onConflict: 'student_id' })
                .select()
                .single();

            if (error) throw error;
            return mapToCamelCase(result) as ScholarshipTracking;
            if (error) throw error;
            return mapToCamelCase(result) as ScholarshipTracking;
        }
    },
    leads: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return mapToCamelCase(data) as Lead[];
        },
        getByBranch: async (branchId: string) => {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('branch_id', branchId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return mapToCamelCase(data) as Lead[];
        },
        create: async (lead: Partial<Lead>) => {
            const payload = mapToSnakeCase(lead);

            // Remove id if empty
            if (!payload.id) delete payload.id;
            // Remove created_at/updated_at to let DB handle defaults if not provided
            if (!payload.created_at) delete payload.created_at;
            if (!payload.updated_at) delete payload.updated_at;

            // FIX: Sanitize UUID fields (empty string -> null)
            const uuidFields = ['meeting_consultant', 'created_by', 'branch_id'];
            uuidFields.forEach(field => {
                if (payload[field] === '') {
                    payload[field] = null;
                }
            });

            // FIX: Sanitize Date/Time fields (empty string -> null)
            const dateFields = ['meeting_date', 'meeting_time'];
            dateFields.forEach(field => {
                if (payload[field] === '') {
                    payload[field] = null;
                }
            });

            // FIX: Sanitize UUID Arrays
            if (payload.assigned_consultants && Array.isArray(payload.assigned_consultants)) {
                payload.assigned_consultants = payload.assigned_consultants.filter((id: string) => id && id.trim() !== '');
            }

            const { data, error } = await supabase.from('leads').insert(payload).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as Lead;
        },
        update: async (lead: Partial<Lead> & { id: string }) => {
            const payload = mapToSnakeCase(lead);
            const { id, ...rest } = payload;

            // FIX: Sanitize UUID fields
            const uuidFields = ['meeting_consultant', 'created_by', 'branch_id'];
            uuidFields.forEach(field => {
                if (rest[field] === '') {
                    rest[field] = null;
                }
            });

            // FIX: Sanitize Date/Time fields
            const dateFields = ['meeting_date', 'meeting_time'];
            dateFields.forEach(field => {
                if (rest[field] === '') {
                    rest[field] = null;
                }
            });

            // FIX: Sanitize UUID Arrays
            if (rest.assigned_consultants && Array.isArray(rest.assigned_consultants)) {
                rest.assigned_consultants = rest.assigned_consultants.filter((uid: string) => uid && uid.trim() !== '');
            }

            const { data, error } = await supabase.from('leads').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id).select().single();
            if (error) throw error;
            return mapToCamelCase(data) as Lead;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('leads').delete().eq('id', id);
            if (error) throw error;
        }
    }
};
