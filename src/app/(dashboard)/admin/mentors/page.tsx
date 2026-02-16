
import { db } from "@/lib/db";
import Link from "next/link";
import {
    Plus, Search, Mail, Phone, Eye, Users,
    Award, TrendingUp, Calendar, ChevronRight,
    Star, FileText, CheckCircle2, Clock,
    Filter, Download
} from "lucide-react";
import MentorReportButton from "@/components/admin/MentorReportButton";
import UserAvatar from "@/components/common/UserAvatar";

export default async function MentorsPage() {
    const mentors = (await db.users.getAll()).filter(u => u.role === 'mentor');
    const assignments = await db.assignments.getAll();
    const serviceLogs = await db.logs.getAll();

    // Mentor istatistikleri hesapla
    const getMentorStats = (mentorId: string) => {
        const mentorAssignments = assignments.filter(a => a.mentorId === mentorId);
        const mentorLogs = serviceLogs.filter(l => l.mentorId === mentorId);
        const approvedLogs = mentorLogs.filter(l => l.status === 'approved');
        const pendingLogs = mentorLogs.filter(l => l.status === 'submitted');

        return {
            studentCount: mentorAssignments.length,
            totalServices: mentorLogs.length,
            approvedServices: approvedLogs.length,
            pendingServices: pendingLogs.length,
            successRate: mentorLogs.length > 0 ? Math.round((approvedLogs.length / mentorLogs.length) * 100) : 0
        };
    };

    // En yüksek performanslı mentorları bul
    const mentorPerformance = mentors.map(m => ({
        ...m,
        ...getMentorStats(m.id)
    })).sort((a, b) => b.totalServices - a.totalServices);

    const totalStudentsAssigned = assignments.length;
    const totalServicesCompleted = serviceLogs.filter(l => l.status === 'approved').length;

    const stats = [
        { label: "Toplam Mentor", value: mentors.length, icon: Users, color: "#6366f1", bg: "#eef2ff" },
        { label: "Atanan Öğrenci", value: totalStudentsAssigned, icon: Award, color: "#008C45", bg: "#eafaf3" },
        { label: "Tamamlanan Hizmet", value: totalServicesCompleted, icon: CheckCircle2, color: "#059669", bg: "#ecfdf5" },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: '#11142D', marginBottom: '0.5rem', fontWeight: 700 }}>Mentor Yönetimi</h1>
                    <p style={{ color: '#808191', fontSize: '1rem' }}>
                        Mentorları görüntüleyin, ekleyin ve performanslarını takip edin
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <MentorReportButton mentors={mentors} />
                    <Link href="/admin/mentors/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} />
                        Yeni Mentor Ekle
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
                            placeholder="Mentor ara..."
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
                            Sırala
                        </button>
                    </div>
                </div>

                {/* Mentor Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
                    {mentorPerformance.map((mentor, index) => {
                        const isTopPerformer = index === 0 && mentor.totalServices > 0;
                        return (
                            <div
                                key={mentor.id}
                                className="mentor-card"
                                style={{
                                    background: 'white',
                                    borderRadius: '1rem',
                                    border: isTopPerformer ? '2px solid #f59e0b' : '1px solid #f1f5f9',
                                    padding: '1.5rem',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Top Performer Badge */}
                                {isTopPerformer && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.25rem 0.5rem',
                                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                        borderRadius: '12px',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        color: '#b45309'
                                    }}>
                                        <Star size={12} fill="#f59e0b" />
                                        En Aktif
                                    </div>
                                )}

                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                    <UserAvatar
                                        userId={mentor.id}
                                        firstName={mentor.firstName}
                                        lastName={mentor.lastName}
                                        photoUrl={mentor.photoUrl}
                                        size={56}
                                        canEdit={false}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 700, color: '#11142D', fontSize: '1.1rem', marginBottom: '2px' }}>
                                            {mentor.firstName} {mentor.lastName}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>@{mentor.username}</p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    marginBottom: '1rem',
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px'
                                }}>
                                    {mentor.email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                                            <Mail size={14} color="#9ca3af" />
                                            {mentor.email}
                                        </div>
                                    )}
                                    {mentor.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                                            <Phone size={14} color="#9ca3af" />
                                            {mentor.phone}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                                        <Calendar size={14} />
                                        Kayıt: {new Date(mentor.createdAt).toLocaleDateString("tr-TR", { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '0.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ textAlign: 'center', padding: '0.75rem', background: '#eafaf3', borderRadius: '10px' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#008C45' }}>{mentor.studentCount}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Öğrenci</p>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '0.75rem', background: '#eff6ff', borderRadius: '10px' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>{mentor.approvedServices}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Onaylı</p>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '0.75rem', background: mentor.pendingServices > 0 ? '#fef3c7' : '#f8fafc', borderRadius: '10px' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: mentor.pendingServices > 0 ? '#b45309' : '#9ca3af' }}>{mentor.pendingServices}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Bekleyen</p>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Link
                                    href={`/admin/mentors/${mentor.id}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className="quick-action-card" style={{
                                        justifyContent: 'center',
                                        background: '#6366f1',
                                        color: 'white',
                                        border: 'none'
                                    }}>
                                        <Eye size={16} />
                                        <span style={{ fontWeight: 500, flex: 'none' }}>Detayları Görüntüle</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {mentors.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#B2B3BD' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <Users size={48} style={{ opacity: 0.3 }} />
                            <div>
                                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Henüz kayıtlı mentor bulunmuyor</p>
                                <Link href="/admin/mentors/new" style={{ color: '#6366f1', fontWeight: 500 }}>
                                    İlk mentoru ekleyin →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {mentors.length > 0 && (
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
                        <p>Toplam {mentors.length} mentor gösteriliyor</p>
                    </div>
                )}
            </div>
        </div>
    );
}
