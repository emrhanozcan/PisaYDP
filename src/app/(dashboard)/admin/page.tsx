
import { db } from "@/lib/db";
import {
    User, Search, MapPin, Eye, GraduationCap, Package,
    UserPlus, TrendingUp, Users, Calendar, Mail, Phone,
    ChevronRight, Filter, Download, MoreHorizontal
} from "lucide-react";
import Link from "next/link";

export default function StudentsPage() {
    const students = db.students.getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const activeStudents = students.filter(s => s.status === 'active');
    const inactiveStudents = students.filter(s => s.status !== 'active');
    const assignments = db.assignments.getAll();
    const serviceLogs = db.logs.getAll();

    // Öğrenci istatistikleri
    const getStudentStats = (studentId: string) => {
        const studentAssignments = assignments.filter(a => a.studentId === studentId);
        const studentLogs = serviceLogs.filter(l => l.studentId === studentId);
        return {
            mentorCount: studentAssignments.length,
            serviceCount: studentLogs.length,
            completedServices: studentLogs.filter(l => l.status === 'approved').length
        };
    };

    const stats = [
        { label: "Toplam Öğrenci", value: students.length, icon: Users, color: "#008C45", bg: "#eafaf3" },
        { label: "Aktif Öğrenci", value: activeStudents.length, icon: TrendingUp, color: "#059669", bg: "#ecfdf5" },
        { label: "Pasif Öğrenci", value: inactiveStudents.length, icon: User, color: "#6b7280", bg: "#f3f4f6" },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: '#11142D', marginBottom: '0.5rem', fontWeight: 700 }}>Öğrenciler</h1>
                    <p style={{ color: '#808191', fontSize: '1rem' }}>
                        Sistemde kayıtlı tüm öğrencileri görüntüleyin ve yönetin
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} />
                        Dışa Aktar
                    </button>
                    <Link
                        href="/admin/students/new"
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <UserPlus size={18} />
                        Yeni Öğrenci
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-enhanced">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: stat.bg,
                                color: stat.color
                            }}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>{stat.value}</p>
                                <p style={{ fontSize: '0.85rem', color: '#808191', marginTop: '0.25rem' }}>{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {/* Search and Filters */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px', maxWidth: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#B2B3BD' }} />
                        <input
                            type="text"
                            placeholder="İsim, okul veya ülke ara..."
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem 0.875rem 3rem',
                                borderRadius: '12px',
                                border: '1px solid #E4E5E7',
                                background: '#F9FAFC',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            border: '1px solid #E4E5E7',
                            borderRadius: '10px',
                            background: 'white',
                            color: '#6b7280',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}>
                            <Filter size={16} />
                            Filtrele
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="table dashboard-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>#</th>
                                <th style={{ width: '22%' }}>Öğrenci</th>
                                <th style={{ width: '15%' }}>🇮🇹 Şehir</th>
                                <th style={{ width: '18%' }}>Okul</th>
                                <th style={{ width: '12%' }}>Paket</th>
                                <th style={{ width: '10%' }}>Hizmet</th>
                                <th style={{ width: '8%' }}>Durum</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => {
                                const stats = getStudentStats(student.id);
                                return (
                                    <tr key={student.id}>
                                        <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{index + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: '#11142D', marginBottom: '2px' }}>
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                        {student.email || 'E-posta yok'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                                <span>🇮🇹</span>
                                                {student.country}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                                <GraduationCap size={14} />
                                                <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {student.school}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.35rem 0.75rem',
                                                background: '#eff6ff',
                                                color: '#2563eb',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 500
                                            }}>
                                                {student.packageType}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    background: stats.serviceCount > 0 ? '#f0fdf4' : '#f9fafb',
                                                    color: stats.serviceCount > 0 ? '#15803d' : '#9ca3af',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {stats.completedServices}/{stats.serviceCount}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: student.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                                color: student.status === 'active' ? '#059669' : '#dc2626'
                                            }}>
                                                <span style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    background: student.status === 'active' ? '#059669' : '#dc2626'
                                                }} />
                                                {student.status === 'active' ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link
                                                href={`/admin/students/${student.id}`}
                                                className="quick-action-card"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '0.5rem 0.75rem',
                                                    background: '#008C45',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    gap: '0.35rem'
                                                }}
                                            >
                                                Detay <ChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '4rem', color: '#B2B3BD' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <Users size={48} style={{ opacity: 0.3 }} />
                                            <div>
                                                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Henüz kayıtlı öğrenci yok</p>
                                                <Link href="/admin/students/new" style={{ color: '#008C45', fontWeight: 500 }}>
                                                    İlk öğrenciyi ekleyin →
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {students.length > 0 && (
                    <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#9ca3af',
                        fontSize: '0.85rem'
                    }}>
                        <p>Toplam {students.length} öğrenci gösteriliyor</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px' }}>1</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
