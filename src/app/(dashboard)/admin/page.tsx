
import { db } from "@/lib/db";
import Link from "next/link";
import {
    Users, GraduationCap, FileText, AlertCircle,
    TrendingUp, TrendingDown, Clock, CheckCircle2,
    UserPlus, ClipboardList, Settings, Euro,
    Star, Activity, Calendar, ArrowRight,
    BarChart3, PieChart, Award
} from "lucide-react";

export default function AdminDashboard() {
    const students = db.students.getAll();
    const branchStudents = db.branchStudents.getAll();
    const allStudents = [...students, ...branchStudents];

    const mentors = db.users.getAll().filter(u => u.role === 'mentor');
    const serviceLogs = db.logs.getAll();
    const serviceTypes = db.serviceTypes.getAll();
    const pendingLogs = serviceLogs.filter(l => l.status === 'submitted');
    const approvedLogs = serviceLogs.filter(l => l.status === 'approved');

    // Sadece YDP öğrencileri aktif olarak say
    const ydpStudents = branchStudents.filter(s => s.ydtSupport === 'Evet');
    const activeStudents = ydpStudents.filter(s => s.status === 'active');
    const inactiveStudents = allStudents.filter(s => s.status !== 'active');

    // Son 7 gün içindeki logları hesapla
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = serviceLogs.filter(l => new Date(l.date) >= weekAgo);

    // Mentor performans hesaplaması
    const mentorPerformance = mentors.map(mentor => {
        const mentorLogs = serviceLogs.filter(l => l.mentorId === mentor.id);
        const approvedCount = mentorLogs.filter(l => l.status === 'approved').length;
        return {
            ...mentor,
            totalServices: mentorLogs.length,
            approvedServices: approvedCount,
            pendingServices: mentorLogs.filter(l => l.status === 'submitted').length,
        };
    }).sort((a, b) => b.totalServices - a.totalServices);

    // Hizmet kategorilerine göre dağılım
    const serviceCategoryData = serviceTypes.map(type => {
        const count = serviceLogs.filter(l => l.serviceTypeId === type.id).length;
        return { name: type.name, count, category: type.category };
    }).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

    // Toplam gelir hesabı (tahmini)
    const totalRevenue = serviceLogs.reduce((sum, log) => {
        const serviceType = serviceTypes.find(t => t.id === log.serviceTypeId);
        if (serviceType && log.status === 'approved') {
            return sum + (serviceType.unitPrice || 0);
        }
        return sum;
    }, 0);

    const stats = [
        {
            label: "Aktif Öğrenciler",
            value: activeStudents.length,
            icon: GraduationCap,
            color: "#008C45",
            bg: "linear-gradient(135deg, #eafaf3 0%, #d4f5e5 100%)",
            trend: "+12%",
            trendUp: true,
            subtitle: `${inactiveStudents.length} pasif`
        },
        {
            label: "Mentor Sayısı",
            value: mentors.length,
            icon: Users,
            color: "#6366f1",
            bg: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
            trend: "Stabil",
            trendUp: null,
            subtitle: "Aktif mentorlar"
        },
        {
            label: "Toplam Hizmet",
            value: serviceLogs.length,
            icon: FileText,
            color: "#CD212A",
            bg: "linear-gradient(135deg, #fbf1f1 0%, #fde8e8 100%)",
            trend: `+${recentLogs.length}`,
            trendUp: true,
            subtitle: "Bu hafta eklenen"
        },
        {
            label: "Onay Bekleyen",
            value: pendingLogs.length,
            icon: AlertCircle,
            color: "#f59e0b",
            bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            trend: pendingLogs.length > 3 ? "Acil" : "Normal",
            trendUp: pendingLogs.length <= 3,
            subtitle: "İşlem bekliyor"
        },
    ];

    const quickActions = [
        { label: "Yeni Öğrenci", icon: UserPlus, href: "/admin/students/new", color: "#008C45" },
        { label: "Yeni Mentor", icon: Users, href: "/admin/mentors/new", color: "#6366f1" },
        { label: "Hizmet Kayıtları", icon: ClipboardList, href: "/admin/services", color: "#CD212A" },
        { label: "Ayarlar", icon: Settings, href: "/admin/settings", color: "#64748b" },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: '#11142D', marginBottom: '0.5rem', fontWeight: 700 }}>
                        Yönetim Paneli
                    </h1>
                    <p style={{ color: '#808191', fontSize: '1rem' }}>
                        Sistem genel durumu ve önemli bildirimler • {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={18} />
                        Bu Ay
                    </button>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={18} />
                        Rapor İndir
                    </button>
                </div>
            </div>

            {/* Stats Grid - Enhanced */}
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card" style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.04)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100px',
                            height: '100px',
                            background: stat.bg,
                            borderRadius: '0 1rem 0 100%',
                            opacity: 0.5
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: stat.bg, color: stat.color }}>
                                <stat.icon size={26} strokeWidth={2} />
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: stat.trendUp === true ? '#ecfdf5' : stat.trendUp === false ? '#fef2f2' : '#f8fafc',
                                color: stat.trendUp === true ? '#059669' : stat.trendUp === false ? '#dc2626' : '#64748b'
                            }}>
                                {stat.trendUp === true && <TrendingUp size={14} />}
                                {stat.trendUp === false && <TrendingDown size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div style={{ marginTop: '1.25rem', position: 'relative', zIndex: 1 }}>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>{stat.value}</p>
                            <p style={{ fontSize: '0.9rem', color: '#808191', marginTop: '0.5rem', fontWeight: 500 }}>{stat.label}</p>
                            <p style={{ fontSize: '0.75rem', color: '#B2B3BD', marginTop: '0.25rem' }}>{stat.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hızlı Eylemler</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {quickActions.map((action, i) => (
                        <Link key={i} href={action.href} style={{ textDecoration: 'none' }}>
                            <div className="quick-action-card">
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `${action.color}15`,
                                    color: action.color
                                }}>
                                    <action.icon size={20} />
                                </div>
                                <span style={{ fontWeight: 500, color: '#374151', flex: 1 }}>{action.label}</span>
                                <ArrowRight size={16} color="#9ca3af" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Mentor Performance */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Award size={20} color="#6366f1" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Mentor Performansı</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>En aktif mentorlar</p>
                            </div>
                        </div>
                        <Link href="/admin/mentors" style={{ fontSize: '0.85rem', color: '#008C45', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Tümünü Gör <ArrowRight size={14} />
                        </Link>
                    </div>

                    {mentorPerformance.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#B2B3BD' }}>
                            Henüz mentor bulunmuyor.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {mentorPerformance.slice(0, 5).map((mentor, i) => (
                                <div key={mentor.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.75rem',
                                    background: i === 0 ? 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)' : '#f8fafc',
                                    borderRadius: '0.75rem',
                                    border: i === 0 ? '1px solid #fcd34d' : '1px solid transparent'
                                }}>
                                    <div style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: i === 0 ? '#f59e0b' : '#6366f1',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.85rem'
                                    }}>
                                        {i === 0 ? <Star size={16} /> : (i + 1)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, color: '#11142D', fontSize: '0.9rem' }}>
                                            {mentor.firstName} {mentor.lastName}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#808191' }}>
                                            {mentor.totalServices} hizmet • {mentor.approvedServices} onaylı
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {mentor.pendingServices > 0 && (
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                background: '#fef3c7',
                                                color: '#b45309',
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600
                                            }}>
                                                {mentor.pendingServices} bekliyor
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Service Distribution */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PieChart size={20} color="#CD212A" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hizmet Dağılımı</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>Kategorilere göre</p>
                            </div>
                        </div>
                        <Link href="/admin/services" style={{ fontSize: '0.85rem', color: '#008C45', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Detaylar <ArrowRight size={14} />
                        </Link>
                    </div>

                    {serviceCategoryData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#B2B3BD' }}>
                            Henüz hizmet kaydı bulunmuyor.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {serviceCategoryData.slice(0, 5).map((service, i) => {
                                const percentage = serviceLogs.length > 0 ? Math.round((service.count / serviceLogs.length) * 100) : 0;
                                const colors = ['#008C45', '#CD212A', '#6366f1', '#f59e0b', '#06b6d4'];
                                return (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>{service.name}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#808191' }}>{service.count} ({percentage}%)</span>
                                        </div>
                                        <div style={{
                                            height: 8,
                                            background: '#f1f5f9',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${percentage}%`,
                                                background: colors[i % colors.length],
                                                borderRadius: 4,
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Revenue Summary */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        borderRadius: '0.75rem',
                        border: '1px solid #bbf7d0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Euro size={24} color="#16a34a" />
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 500 }}>Tahmini Toplam Gelir</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>€{totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities - Enhanced */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={20} color="#f59e0b" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Son Hareketler</h2>
                            <p style={{ fontSize: '0.8rem', color: '#808191' }}>Onay bekleyen işlemler</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            padding: '0.35rem 0.75rem',
                            background: pendingLogs.length > 0 ? '#fef3c7' : '#ecfdf5',
                            color: pendingLogs.length > 0 ? '#b45309' : '#059669',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                        }}>
                            {pendingLogs.length} bekleyen
                        </span>
                    </div>
                </div>

                {pendingLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#B2B3BD' }}>
                        <CheckCircle2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ fontSize: '1rem', fontWeight: 500 }}>Tüm işlemler tamamlandı!</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Onay bekleyen kayıt bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Mentor</th>
                                    <th>Öğrenci</th>
                                    <th>Hizmet</th>
                                    <th>Tarih</th>
                                    <th>Durum</th>
                                    <th style={{ width: '100px' }}>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLogs.slice(0, 10).map((log, index) => {
                                    const mentor = db.users.getById(log.mentorId);
                                    const student = db.students.getById(log.studentId);
                                    const service = serviceTypes.find(t => t.id === log.serviceTypeId);
                                    return (
                                        <tr key={log.id} style={{ transition: 'background 0.2s' }}>
                                            <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{index + 1}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        background: '#6366f1',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>
                                                        {mentor?.firstName?.[0]}{mentor?.lastName?.[0]}
                                                    </div>
                                                    <span style={{ fontWeight: 500 }}>{mentor?.firstName} {mentor?.lastName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        background: '#008C45',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>
                                                        {student?.firstName?.[0]}{student?.lastName?.[0]}
                                                    </div>
                                                    <span style={{ fontWeight: 500 }}>{student?.firstName} {student?.lastName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: '#f1f5f9',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    color: '#475569'
                                                }}>
                                                    {service?.name}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#808191' }}>
                                                    <Clock size={14} />
                                                    <span style={{ fontSize: '0.85rem' }}>{log.date.split('T')[0]}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="status-badge status-pending" style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.35rem 0.75rem'
                                                }}>
                                                    <AlertCircle size={12} />
                                                    Onay Bekliyor
                                                </span>
                                            </td>
                                            <td>
                                                <Link href={`/admin/services`} style={{ textDecoration: 'none' }}>
                                                    <button style={{
                                                        padding: '0.4rem 0.75rem',
                                                        background: '#008C45',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}>
                                                        İncele <ArrowRight size={12} />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {pendingLogs.length > 10 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link href="/admin/services" style={{
                            color: '#008C45',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            Tüm kayıtları görüntüle ({pendingLogs.length - 10} daha fazla) <ArrowRight size={14} />
                        </Link>
                    </div>
                )}
            </div>

            {/* Footer Stats Summary */}
            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #11142D 0%, #1e293b 100%)',
                borderRadius: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Toplam Öğrenci</p>
                    <p style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700 }}>{allStudents.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Aktif Mentor</p>
                    <p style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700 }}>{mentors.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Onaylanan Hizmet</p>
                    <p style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700 }}>{approvedLogs.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Hizmet Türü</p>
                    <p style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700 }}>{serviceTypes.filter(s => s.isActive).length}</p>
                </div>
            </div>
        </div>
    );
}
