import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import {
    Clock, CheckCircle, Wallet, Users, Calendar,
    TrendingUp, FileText, ChevronRight, Star,
    AlertCircle, Award, Activity, MapPin, GraduationCap
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MentorDashboard() {
    const session = await getSession();
    if (!session) redirect('/login');

    // Get my assignments
    const myAssignments = db.assignments.getAll().filter(a => a.mentorId === session.id);
    const assignedStudentIds = myAssignments.map(a => a.studentId);

    // Get assigned students AND students with YDP support
    const myStudents = db.branchStudents.getAll().filter(s =>
        assignedStudentIds.includes(s.id) || s.ydtSupport === 'Evet'
    );

    // Get my logs
    const myLogs = db.logs.getAll().filter(l => l.mentorId === session.id);
    const serviceTypes = db.serviceTypes.getAll();
    const totalHours = myLogs.reduce((acc, log) => acc + log.durationMinutes, 0) / 60;

    // Status counts
    const approvedLogs = myLogs.filter(l => l.status === 'approved');
    const pendingLogs = myLogs.filter(l => l.status === 'submitted');
    const rejectedLogs = myLogs.filter(l => l.status === 'rejected');

    // Earnings calc
    const approvedEarnings = approvedLogs.reduce((acc, log) => {
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);
        return acc + (service?.unitPrice || 0);
    }, 0);

    const pendingEarnings = pendingLogs.reduce((acc, log) => {
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);
        return acc + (service?.unitPrice || 0);
    }, 0);

    // Get recent logs
    const recentLogs = myLogs.slice(-5).reverse();

    // Calculate success rate
    const successRate = myLogs.length > 0 ? Math.round((approvedLogs.length / myLogs.length) * 100) : 0;

    const stats = [
        { label: "Toplam Süre", value: `${totalHours.toFixed(1)}`, unit: "saat", icon: Clock, color: "#3b82f6", bg: "#eff6ff" },
        { label: "Tamamlanan", value: approvedLogs.length.toString(), unit: "hizmet", icon: CheckCircle, color: "#059669", bg: "#ecfdf5" },
        { label: "Bekleyen", value: pendingLogs.length.toString(), unit: "hizmet", icon: AlertCircle, color: "#f59e0b", bg: "#fef3c7" },
        { label: "Onaylanan Kazanç", value: `€${approvedEarnings}`, unit: "", icon: Wallet, color: "#8b5cf6", bg: "#f5f3ff" },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#11142D', marginBottom: '0.5rem' }}>
                        Merhaba, {session.firstName} 👋
                    </h1>
                    <p style={{ color: '#808191', fontSize: '1rem' }}>
                        Bugün öğrencileriniz için neler yaptınız? İşte güncel durumunuz.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{
                        padding: '0.75rem 1.25rem',
                        background: successRate >= 80 ? '#ecfdf5' : successRate >= 50 ? '#fef3c7' : '#fef2f2',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <TrendingUp size={18} color={successRate >= 80 ? '#059669' : successRate >= 50 ? '#f59e0b' : '#dc2626'} />
                        <span style={{
                            fontWeight: 600,
                            color: successRate >= 80 ? '#059669' : successRate >= 50 ? '#b45309' : '#dc2626'
                        }}>
                            %{successRate} Onay Oranı
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-enhanced" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 52,
                                height: 52,
                                borderRadius: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: stat.bg,
                                color: stat.color
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>
                                    {stat.value} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#808191' }}>{stat.unit}</span>
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#808191', marginTop: '0.25rem' }}>{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Earnings Banner */}
            {pendingEarnings > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '1rem',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Wallet size={22} color="#f59e0b" />
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, color: '#92400e', fontSize: '0.9rem' }}>Onay Bekleyen Hakediş</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#78350f' }}>€{pendingEarnings}</p>
                        </div>
                    </div>
                    <span style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        borderRadius: '8px',
                        color: '#b45309',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}>
                        {pendingLogs.length} hizmet bekliyor
                    </span>
                </div>
            )}

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                {/* Students Section */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eafaf3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={22} color="#008C45" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', color: '#11142D', fontWeight: 600 }}>Öğrencilerim</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>{myStudents.length} öğrenci atanmış</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {myStudents.map(student => {
                            const studentLogs = myLogs.filter(l => l.studentId === student.id);
                            const studentApproved = studentLogs.filter(l => l.status === 'approved').length;
                            const studentPending = studentLogs.filter(l => l.status === 'submitted').length;
                            const assignment = myAssignments.find(a => a.studentId === student.id);

                            return (
                                <div
                                    key={student.id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '1rem',
                                        border: '1px solid #f1f5f9',
                                        padding: '1.25rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                fontSize: '1rem'
                                            }}>
                                                {student.firstName[0]}{student.lastName[0]}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, color: '#11142D', fontSize: '1rem' }}>{student.firstName} {student.lastName}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    🇮🇹 İtalya
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            background: student.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                            color: student.status === 'active' ? '#059669' : '#dc2626'
                                        }}>
                                            {student.status === 'active' ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div style={{
                                        padding: '0.75rem',
                                        background: '#f8fafc',
                                        borderRadius: '10px',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem' }}>
                                            <GraduationCap size={14} />
                                            {db.universities.getById(student.universityId || '')?.name || 'Okul belirtilmemiş'}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                                            <span style={{ color: '#9ca3af' }}>
                                                Paket: <span style={{ color: '#2563eb', fontWeight: 500 }}>{student.packageType}</span>
                                            </span>
                                            <span style={{ color: '#9ca3af' }}>
                                                Rol: <span style={{ color: '#6366f1', fontWeight: 500 }}>{assignment?.role === 'primary' ? 'Ana Mentor' : 'Destek'}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f0fdf4', borderRadius: '8px' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{studentApproved}</p>
                                            <p style={{ fontSize: '0.65rem', color: '#6b7280' }}>Onaylı</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: studentPending > 0 ? '#fef3c7' : '#f8fafc', borderRadius: '8px' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: studentPending > 0 ? '#b45309' : '#9ca3af' }}>{studentPending}</p>
                                            <p style={{ fontSize: '0.65rem', color: '#6b7280' }}>Bekleyen</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: '#eff6ff', borderRadius: '8px' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>{studentLogs.length}</p>
                                            <p style={{ fontSize: '0.65rem', color: '#6b7280' }}>Toplam</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link
                                            href={`/mentor/students/${student.id}`}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.35rem',
                                                padding: '0.65rem',
                                                background: '#f8fafc',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '10px',
                                                color: '#6b7280',
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <FileText size={14} />
                                            Detay
                                        </Link>
                                        <Link
                                            href={`/mentor/students/${student.id}`}
                                            style={{
                                                flex: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.35rem',
                                                padding: '0.65rem',
                                                background: '#008C45',
                                                border: 'none',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Activity size={14} />
                                            Hizmet Gir
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}

                        {myStudents.length === 0 && (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '3rem',
                                color: '#9ca3af',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '1rem'
                            }}>
                                <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p style={{ fontWeight: 500 }}>Henüz atanmış öğrenciniz bulunmuyor</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Admin tarafından öğrenci ataması yapıldığında burada görünecektir.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Sidebar */}
                <div className="glass-panel" style={{ padding: '1.5rem', alignSelf: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={20} color="#f59e0b" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1rem', color: '#11142D', fontWeight: 600 }}>Son Aktiviteler</h3>
                            <p style={{ fontSize: '0.75rem', color: '#808191' }}>Son 5 hizmet</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentLogs.map(log => {
                            const type = serviceTypes.find(t => t.id === log.serviceTypeId);
                            const student = myStudents.find(s => s.id === log.studentId);
                            return (
                                <div key={log.id} style={{
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px',
                                    borderLeft: `3px solid ${log.status === 'approved' ? '#059669' :
                                        log.status === 'submitted' ? '#f59e0b' : '#dc2626'
                                        }`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                                        <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.85rem' }}>{type?.name}</p>
                                        <span style={{
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '8px',
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                            background: log.status === 'approved' ? '#ecfdf5' :
                                                log.status === 'submitted' ? '#fef3c7' : '#fef2f2',
                                            color: log.status === 'approved' ? '#059669' :
                                                log.status === 'submitted' ? '#b45309' : '#dc2626'
                                        }}>
                                            {log.status === 'approved' ? '✓' :
                                                log.status === 'submitted' ? '⏳' : '✗'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                        {student?.firstName} {student?.lastName} • {log.date.split('T')[0]}
                                    </p>
                                </div>
                            );
                        })}

                        {recentLogs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.85rem' }}>Henüz aktivite yok</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #11142D 0%, #1e293b 100%)',
                        borderRadius: '12px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Bu Ay</p>
                            <p style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>{myLogs.length}</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.65rem' }}>hizmet</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Toplam</p>
                            <p style={{ color: '#4ade80', fontSize: '1.25rem', fontWeight: 700 }}>€{approvedEarnings}</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.65rem' }}>kazanç</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
