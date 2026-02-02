
import fs from 'fs';
import path from 'path';
import { User, Student, MentorAssignment, ServiceLog, ServiceType, AuditLog, University, BranchStudent, UserFavorite, BranchCode } from '@/types';

// Mock Data Interfaces
interface DBData {
    users: User[];
    students: Student[];
    assignments: MentorAssignment[];
    serviceTypes: ServiceType[];
    serviceLogs: ServiceLog[];
    auditLogs: AuditLog[];
    universities: University[];
    branchStudents: BranchStudent[];
    userFavorites: UserFavorite[];
}

const DB_PATH = path.join(process.cwd(), 'ydp-data.json');

// Initial Seed Data
const INITIAL_DATA: DBData = {
    users: [
        {
            id: 'admin-1',
            username: 'admin',
            password: '123',
            role: 'admin',
            firstName: 'System',
            lastName: 'Admin',
            email: 'admin@ydp.com',
            createdAt: new Date().toISOString()
        },
        // Branch Users
        {
            id: 'branch-sariyer-1',
            username: 'sariyer',
            password: '123',
            role: 'branch_user',
            firstName: 'Sarıyer',
            lastName: 'Yönetici',
            email: 'sariyer@ydp.com',
            branchCode: 'sariyer',
            createdAt: new Date().toISOString()
        },
        {
            id: 'branch-kadikoy-1',
            username: 'kadikoy',
            password: '123',
            role: 'branch_user',
            firstName: 'Kadıköy',
            lastName: 'Yönetici',
            email: 'kadikoy@ydp.com',
            branchCode: 'kadikoy',
            createdAt: new Date().toISOString()
        },
        {
            id: 'branch-ankara-1',
            username: 'ankara',
            password: '123',
            role: 'branch_user',
            firstName: 'Ankara',
            lastName: 'Yönetici',
            email: 'ankara@ydp.com',
            branchCode: 'ankara',
            createdAt: new Date().toISOString()
        },
        {
            id: 'branch-izmir-1',
            username: 'izmir',
            password: '123',
            role: 'branch_user',
            firstName: 'İzmir',
            lastName: 'Yönetici',
            email: 'izmir@ydp.com',
            branchCode: 'izmir',
            createdAt: new Date().toISOString()
        },
        {
            id: 'branch-bursa-1',
            username: 'bursa',
            password: '123',
            role: 'branch_user',
            firstName: 'Bursa',
            lastName: 'Yönetici',
            email: 'bursa@ydp.com',
            branchCode: 'bursa',
            createdAt: new Date().toISOString()
        },
        {
            id: 'branch-fethiye-1',
            username: 'fethiye',
            password: '123',
            role: 'branch_user',
            firstName: 'Fethiye',
            lastName: 'Yönetici',
            email: 'fethiye@ydp.com',
            branchCode: 'fethiye',
            createdAt: new Date().toISOString()
        },
        // Italy Staff Users
        {
            id: 'italy-staff-1',
            username: 'italy1',
            password: '123',
            role: 'italy_staff',
            firstName: 'Marco',
            lastName: 'Rossi',
            email: 'marco@ydp.it',
            createdAt: new Date().toISOString()
        },
        {
            id: 'italy-staff-2',
            username: 'italy2',
            password: '123',
            role: 'italy_staff',
            firstName: 'Giulia',
            lastName: 'Bianchi',
            email: 'giulia@ydp.it',
            createdAt: new Date().toISOString()
        }
    ],
    students: [],
    assignments: [],
    serviceTypes: [
        { id: 'st-1', name: 'Havalimanı Karşılama', category: 'Arrival', pricingModel: 'fixed', unitPrice: 40, isActive: true },
        { id: 'st-2', name: 'Genel Danışma', category: 'Consulting', pricingModel: 'hourly', unitPrice: 15, isActive: true },
        { id: 'st-3', name: 'Ev Yerleştirme', category: 'Accommodation', pricingModel: 'fixed', unitPrice: 100, isActive: true },
    ],
    serviceLogs: [],
    auditLogs: [],
    universities: [
        { id: 'uni-1', name: 'Katanya Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-2', name: 'Pavia Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-3', name: 'Milano Devlet Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-4', name: 'Genova Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-5', name: 'IULM Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-6', name: 'NABA Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-7', name: 'Bari Aldo Moro Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-8', name: 'ERGO', country: 'İtalya', isActive: true },
        { id: 'uni-9', name: 'ADISUR Campania', country: 'İtalya', isActive: true },
        { id: 'uni-10', name: 'Cattholica Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-11', name: 'IED Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-12', name: 'San Raffaele Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-13', name: "Venedik Ca'Foscari Üniversitesi", country: 'İtalya', isActive: true },
        { id: 'uni-14', name: 'Padova Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-15', name: 'DSU Toscana', country: 'İtalya', isActive: true },
        { id: 'uni-16', name: 'Milano Biccoca Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-17', name: 'Messina Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-18', name: 'Lazio Disco', country: 'İtalya', isActive: true },
        { id: 'uni-19', name: 'Cassino Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-20', name: 'Humanitas Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-21', name: 'Bocconi Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-22', name: 'Cagliari Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-23', name: 'Politecnico di Marche', country: 'İtalya', isActive: true },
        { id: 'uni-24', name: 'Teramo Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-25', name: 'Politecnico di Milano Üniversitesi', country: 'İtalya', isActive: true },
        { id: 'uni-26', name: 'Trieste Üniversitesi', country: 'İtalya', isActive: true },
    ],
    branchStudents: [
        // Demo students for Sarıyer branch
        {
            id: 'bs-1',
            branchCode: 'sariyer',
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            idNumber: '12345678901',
            email: 'ahmet@email.com',
            phone: '+90 532 123 4567',
            city: 'İstanbul',
            universityId: 'uni-1',
            program: 'Tıp',
            enrollmentYear: '2024',
            packageType: 'Premium',
            accommodationService: 'Evet',
            supportPackage: 'Evet',
            status: 'active',
            finalStatus: 'Kabul',
            registrationDate: '2024-01-15',
            createdAt: new Date().toISOString()
        },
        {
            id: 'bs-2',
            branchCode: 'sariyer',
            firstName: 'Ayşe',
            lastName: 'Kaya',
            idNumber: '98765432109',
            email: 'ayse@email.com',
            phone: '+90 533 987 6543',
            city: 'İstanbul',
            universityId: 'uni-3',
            program: 'Mimarlık',
            enrollmentYear: '2024',
            packageType: 'Standart',
            status: 'active',
            finalStatus: 'Beklemede',
            registrationDate: '2024-02-20',
            createdAt: new Date().toISOString()
        },
        // Demo students for Kadıköy branch
        {
            id: 'bs-3',
            branchCode: 'kadikoy',
            firstName: 'Mehmet',
            lastName: 'Demir',
            idNumber: '11122233344',
            email: 'mehmet@email.com',
            phone: '+90 534 111 2233',
            city: 'İstanbul',
            universityId: 'uni-5',
            program: 'İşletme',
            enrollmentYear: '2024',
            packageType: 'Premium',
            accommodationService: 'Evet',
            status: 'active',
            finalStatus: 'Kabul',
            registrationDate: '2024-03-10',
            createdAt: new Date().toISOString()
        },
        // Demo students for Ankara branch
        {
            id: 'bs-4',
            branchCode: 'ankara',
            firstName: 'Zeynep',
            lastName: 'Öztürk',
            idNumber: '55566677788',
            email: 'zeynep@email.com',
            phone: '+90 535 555 6677',
            city: 'Ankara',
            universityId: 'uni-21',
            program: 'Ekonomi',
            enrollmentYear: '2024',
            packageType: 'Premium',
            accommodationService: 'Evet',
            supportPackage: 'Evet',
            status: 'active',
            finalStatus: 'Kabul',
            registrationDate: '2024-01-25',
            createdAt: new Date().toISOString()
        }
    ],
    userFavorites: []
};

// Helper to read DB
function readDB(): DBData {
    try {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2));
            return INITIAL_DATA;
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        // Ensure new collections exist
        return {
            ...INITIAL_DATA,
            ...parsed,
            universities: parsed.universities || INITIAL_DATA.universities,
            branchStudents: parsed.branchStudents || INITIAL_DATA.branchStudents,
            userFavorites: parsed.userFavorites || INITIAL_DATA.userFavorites,
        };
    } catch (error) {
        console.error("Database read error", error);
        return INITIAL_DATA;
    }
}

// Helper to write DB
function writeDB(data: DBData) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Database write error", error);
    }
}

// --- Data Access Logic ---

export const db = {
    users: {
        getAll: () => readDB().users,
        getById: (id: string) => readDB().users.find(u => u.id === id),
        getByUsername: (username: string) => readDB().users.find(u => u.username === username),
        create: (user: User) => {
            const data = readDB();
            data.users.push(user);
            writeDB(data);
            return user;
        },
        update: (user: User) => {
            const data = readDB();
            const index = data.users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                data.users[index] = user;
                writeDB(data);
                return user;
            }
            return null;
        }
    },
    students: {
        getAll: () => readDB().students,
        getById: (id: string) => readDB().students.find(s => s.id === id),
        create: (student: Student) => {
            const data = readDB();
            data.students.push(student);
            writeDB(data);
            return student;
        },
        update: (student: Student) => {
            const data = readDB();
            const index = data.students.findIndex(s => s.id === student.id);
            if (index !== -1) {
                data.students[index] = student;
                writeDB(data);
                return student;
            }
            return null;
        }
    },
    logs: {
        getAll: () => readDB().serviceLogs,
        create: (log: ServiceLog) => {
            const data = readDB();
            data.serviceLogs.push(log);
            writeDB(data);
            return log;
        },
        update: (log: ServiceLog) => {
            const data = readDB();
            const index = data.serviceLogs.findIndex(l => l.id === log.id);
            if (index !== -1) {
                data.serviceLogs[index] = log;
                writeDB(data);
                return log;
            }
            return null;
        }
    },
    assignments: {
        getAll: () => readDB().assignments,
        create: (assignment: MentorAssignment) => {
            const data = readDB();
            data.assignments.push(assignment);
            writeDB(data);
            return assignment;
        }
    },
    serviceTypes: {
        getAll: () => readDB().serviceTypes,
        create: (type: ServiceType) => {
            const data = readDB();
            data.serviceTypes.push(type);
            writeDB(data);
            return type;
        },
        update: (type: ServiceType) => {
            const data = readDB();
            const index = data.serviceTypes.findIndex(t => t.id === type.id);
            if (index !== -1) {
                data.serviceTypes[index] = type;
                writeDB(data);
                return type;
            }
            return null;
        },
        delete: (id: string) => {
            const data = readDB();
            data.serviceTypes = data.serviceTypes.filter(t => t.id !== id);
            writeDB(data);
        }
    },
    audit: {
        create: (log: AuditLog) => {
            const data = readDB();
            data.auditLogs.push(log);
            writeDB(data);
            return log;
        },
        getAll: () => readDB().auditLogs
    },
    // NEW: Universities
    universities: {
        getAll: () => readDB().universities,
        getById: (id: string) => readDB().universities.find(u => u.id === id),
        create: (uni: University) => {
            const data = readDB();
            data.universities.push(uni);
            writeDB(data);
            return uni;
        },
        update: (uni: University) => {
            const data = readDB();
            const index = data.universities.findIndex(u => u.id === uni.id);
            if (index !== -1) {
                data.universities[index] = uni;
                writeDB(data);
                return uni;
            }
            return null;
        },
        delete: (id: string) => {
            const data = readDB();
            data.universities = data.universities.filter(u => u.id !== id);
            writeDB(data);
        }
    },
    // NEW: BranchStudents
    branchStudents: {
        getAll: () => readDB().branchStudents,
        getByBranch: (branchCode: BranchCode) => readDB().branchStudents.filter(s => s.branchCode === branchCode),
        getById: (id: string) => readDB().branchStudents.find(s => s.id === id),
        getByUniversity: (universityId: string, branchCode?: BranchCode) => {
            const students = readDB().branchStudents.filter(s => s.universityId === universityId);
            if (branchCode) return students.filter(s => s.branchCode === branchCode);
            return students;
        },
        create: (student: BranchStudent) => {
            const data = readDB();
            data.branchStudents.push(student);
            writeDB(data);
            return student;
        },
        update: (student: any) => {
            const data = readDB();
            const index = data.branchStudents.findIndex(s => s.id === student.id);
            if (index !== -1) {
                data.branchStudents[index] = { ...data.branchStudents[index], ...student };
                writeDB(data);
                return data.branchStudents[index];
            }
            return null;
        },
        delete: (id: string) => {
            const data = readDB();
            data.branchStudents = data.branchStudents.filter(s => s.id !== id);
            writeDB(data);
        }
    },
    // NEW: UserFavorites
    userFavorites: {
        getByUser: (userId: string) => readDB().userFavorites.filter(f => f.userId === userId),
        toggle: (userId: string, universityId: string) => {
            const data = readDB();
            const existingIndex = data.userFavorites.findIndex(
                f => f.userId === userId && f.universityId === universityId
            );
            if (existingIndex !== -1) {
                data.userFavorites.splice(existingIndex, 1);
                writeDB(data);
                return false; // removed
            } else {
                data.userFavorites.push({ userId, universityId });
                writeDB(data);
                return true; // added
            }
        },
        isFavorite: (userId: string, universityId: string) => {
            return readDB().userFavorites.some(
                f => f.userId === userId && f.universityId === universityId
            );
        }
    }
};
