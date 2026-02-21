
import { db } from "@/lib/db";
<<<<<<< HEAD
import { FileText, Search, Calendar, User } from "lucide-react";
=======
import ServicesClient from "./ServicesClient";
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a

export default function ServicesPage() {
    const logs = db.logs.getAll().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const serviceTypes = db.serviceTypes.getAll();
<<<<<<< HEAD

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: '#11142D', marginBottom: '0.5rem' }}>Hizmet Kayıtları</h1>
                    <p style={{ color: '#808191' }}>Girilen tüm hizmetlerin listesi.</p>
                </div>
                {/* Optional: Add Filter or Export button here */}
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {/* Search / Filters */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#B2B3BD' }} />
                        <input
                            type="text"
                            placeholder="Hizmet, öğrenci veya mentor ara..."
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '12px',
                                border: '1px solid #E4E5E7',
                                background: '#F9FAFC',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Hizmet Türü</th>
                                <th style={{ width: '20%' }}>Öğrenci</th>
                                <th style={{ width: '20%' }}>Mentor</th>
                                <th style={{ width: '15%' }}>Tarih</th>
                                <th style={{ width: '10%' }}>Süre</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => {
                                const type = serviceTypes.find(t => t.id === log.serviceTypeId);
                                const student = db.students.getById(log.studentId);
                                const mentor = db.users.getById(log.mentorId);

                                return (
                                    <tr key={log.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fbf1f1', color: '#CD212A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FileText size={16} />
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#11142D' }}>{type?.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#11142D', fontWeight: 500 }}>
                                                <User size={14} className="text-gray-400" />
                                                {student?.firstName} {student?.lastName}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: '#808191', fontSize: '0.9rem' }}>{mentor?.firstName} {mentor?.lastName}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#808191', fontSize: '0.85rem' }}>
                                                <Calendar size={14} />
                                                {new Date(log.date).toLocaleDateString("tr-TR")}
                                            </div>
                                        </td>
                                        <td style={{ color: '#808191', fontSize: '0.9rem' }}>
                                            {log.durationMinutes > 0 ? `${log.durationMinutes} dk` : '-'}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className={`status-badge ${log.status === 'submitted' ? 'status-pending' : ''}`} style={{
                                                background: log.status === 'approved' ? '#d1fae5' : undefined,
                                                color: log.status === 'approved' ? '#065f46' : undefined
                                            }}>
                                                {log.status === 'submitted' ? 'Onay Bekliyor' : log.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {logs.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#B2B3BD' }}>Kayıt bulunamadı.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
=======
    const students = db.students.getAll();
    const branchStudents = db.branchStudents.getAll();
    const mentorUsers = db.users.getAll().filter(u => u.role === 'mentor');

    // Helper to find student from either table
    const findStudent = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) return { firstName: student.firstName, lastName: student.lastName };
        const branchStudent = branchStudents.find(s => s.id === studentId);
        if (branchStudent) return { firstName: branchStudent.firstName, lastName: branchStudent.lastName };
        return { firstName: 'Bilinmeyen', lastName: 'Öğrenci' };
    };

    // Transform logs for client
    const logsData = logs.map(log => {
        const student = findStudent(log.studentId);
        const mentor = mentorUsers.find(m => m.id === log.mentorId);
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);

        return {
            id: log.id,
            studentId: log.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            mentorId: log.mentorId,
            mentorName: mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Bilinmiyor',
            serviceTypeId: log.serviceTypeId,
            serviceName: service?.name || 'Bilinmiyor',
            servicePrice: service?.unitPrice || 0,
            date: log.date,
            durationMinutes: log.durationMinutes,
            status: log.status,
            paymentStatus: log.paymentStatus
        };
    });

    // Service types for filter
    const serviceTypesData = serviceTypes.map(s => ({
        id: s.id,
        name: s.name
    }));

    // Mentors for filter
    const mentorsData = mentorUsers.map(m => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`
    }));

    return (
        <ServicesClient
            logs={logsData}
            serviceTypes={serviceTypesData}
            mentors={mentorsData}
        />
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
    );
}
