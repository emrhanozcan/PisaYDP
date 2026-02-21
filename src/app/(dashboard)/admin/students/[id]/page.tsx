import { db } from "@/lib/db";
import { assignMentor } from "@/app/actions/admin";
import Link from "next/link";
import {
    ArrowLeft, UserPlus, Calendar, MapPin, School,
    Mail, Phone, Package, FileText, CheckCircle2,
    Clock, AlertCircle, User, Edit,
    ChevronRight, Star, Activity, TrendingUp
} from "lucide-react";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let student: any = db.branchStudents.getById(id);
    if (!student) {
        student = db.students.getById(id);
    }

    if (!student) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                color: '#9ca3af'
            }}>
                <User size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <h2 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>Öğrenci Bulunamadı</h2>
                <p style={{ marginBottom: '1.5rem' }}>Bu ID ile eşleşen öğrenci kaydı mevcut değil.</p>
                <Link href="/admin/students" className="btn btn-primary">
                    <ArrowLeft size={16} /> Listeye Dön
                </Link>
            </div>
        );
    }

    // Map university name if missing
    if (student.universityId && !student.school) {
        student.school = db.universities.getById(student.universityId)?.name;
    }
    if (!student.country) student.country = 'İtalya';

    const assignments = db.assignments.getAll().filter(a => a.studentId === id);
    const mentors = db.users.getAll().filter(u => u.role === 'mentor');
    const serviceLogs = db.logs.getAll().filter(l => l.studentId === id);
    const serviceTypes = db.serviceTypes.getAll();

    const approvedLogs = serviceLogs.filter(l => l.status === 'approved');
    const pendingLogs = serviceLogs.filter(l => l.status === 'submitted');
    const rejectedLogs = serviceLogs.filter(l => l.status === 'rejected');

    const availableMentors = mentors;

    // Toplam harcanan tutar hesabı
    const totalSpent = approvedLogs.reduce((sum, log) => {
        const serviceType = serviceTypes.find(t => t.id === log.serviceTypeId);
        return sum + (serviceType?.unitPrice || 0);
    }, 0);

    const stats = [
        { label: "Toplam Hizmet", value: serviceLogs.length, icon: FileText, color: "#6366f1", bg: "#eef2ff" },
        { label: "Onaylanan", value: approvedLogs.length, icon: CheckCircle2, color: "#059669", bg: "#ecfdf5" },
        { label: "Bekleyen", value: pendingLogs.length, icon: Clock, color: "#f59e0b", bg: "#fef3c7" },
        { label: "Atanan Mentor", value: assignments.length, icon: UserPlus, color: "#008C45", bg: "#eafaf3" },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Back Button */}
            <Link
                href="/admin/students"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem',
                    textDecoration: 'none'
                }}
            >
                <ArrowLeft size={18} />
                Öğrenci Listesine Dön
            </Link>

            {/* Header Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        flexShrink: 0
                    }}>
                        {student.firstName[0]}{student.lastName[0]}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#11142D', marginBottom: '0.5rem' }}>
                                    {student.firstName} {student.lastName}
                                </h1>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <MapPin size={16} /> {student.country}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <School size={16} /> {student.school}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Link
                                    href={`/admin/students/${student.id}/edit`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        background: '#f3f4f6',
                                        color: '#4b5563',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <Edit size={14} /> Düzenle
                                </Link>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    background: student.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                    color: student.status === 'active' ? '#059669' : '#dc2626'
                                }}>
                                    <span style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: student.status === 'active' ? '#059669' : '#dc2626'
                                    }} />
                                    {student.status === 'active' ? 'Aktif' : 'Pasif'}
                                </span>
                                <span style={{
                                    padding: '0.5rem 1rem',
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    <Package size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                                    {student.packageType}
                                </span>
                            </div>
                        </div>

                        {/* Contact & Details Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '12px'
                        }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>E-posta</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500 }}>
                                    <Mail size={14} /> {student.email || 'Belirtilmemiş'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Telefon</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500 }}>
                                    <Phone size={14} /> {student.phone || 'Belirtilmemiş'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Kayıt Tarihi</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500 }}>
                                    <Calendar size={14} /> {new Date(student.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Toplam Harcama</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 700, fontSize: '1.1rem' }}>
                                    €{totalSpent.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* YDP and Extra Info for Branch Students */}
                        {student.ydtSupport && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: '#f0fdf4',
                                borderRadius: '12px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1rem'
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '0.25rem', fontWeight: 600 }}>YDP Desteği</p>
                                    <p style={{ color: '#15803d' }}>{student.ydtSupport}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '0.25rem', fontWeight: 600 }}>Konaklama</p>
                                    <p style={{ color: '#15803d' }}>{student.accommodationService || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '0.25rem', fontWeight: 600 }}>Burs Paketi</p>
                                    <p style={{ color: '#15803d' }}>{student.scholarshipPackage || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '0.25rem', fontWeight: 600 }}>Sonuç</p>
                                    <p style={{ color: '#15803d' }}>{student.finalStatus || '-'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-enhanced">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: stat.bg,
                                color: stat.color
                            }}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>{stat.value}</p>
                                <p style={{ fontSize: '0.8rem', color: '#808191', marginTop: '0.2rem' }}>{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Mentor Assignments */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserPlus size={20} color="#6366f1" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Mentor Atamaları</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>{assignments.length} mentor atanmış</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {assignments.map(assign => {
                            const mentor = db.users.getById(assign.mentorId);
                            return (
                                <div key={assign.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600
                                        }}>
                                            {mentor?.firstName[0]}{mentor?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#11142D' }}>{mentor?.firstName} {mentor?.lastName}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>
                                                {assign.role === 'primary' ? '⭐ Ana Mentor' : 'Destek Mentor'}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                            <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                            {new Date(assign.startDate).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {assignments.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#9ca3af',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '12px'
                            }}>
                                <UserPlus size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>Henüz mentor atanmamış</p>
                            </div>
                        )}
                    </div>

                    {/* Add Assignment Form */}
                    <form action={assignMentor} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Yeni Mentor Ata</h3>
                        <input type="hidden" name="studentId" value={student.id} />
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <select name="mentorId" className="input-field" style={{ flex: 1, minWidth: '150px' }} required>
                                <option value="">Mentor Seç...</option>
                                {availableMentors.map(m => (
                                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                                ))}
                            </select>
                            <select name="role" className="input-field" style={{ width: '140px' }}>
                                <option value="primary">Ana Mentor</option>
                                <option value="support">Destek Mentor</option>
                            </select>
                            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                                <UserPlus size={16} /> Ekle
                            </button>
                        </div>
                    </form>
                </div>

                {/* Service History */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={20} color="#f59e0b" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hizmet Geçmişi</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>{serviceLogs.length} hizmet kaydı</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {serviceLogs.slice(0, 10).map(log => {
                            const serviceType = serviceTypes.find(t => t.id === log.serviceTypeId);
                            const mentor = db.users.getById(log.mentorId);
                            return (
                                <div key={log.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px',
                                    borderLeft: `3px solid ${log.status === 'approved' ? '#059669' :
                                        log.status === 'submitted' ? '#f59e0b' : '#dc2626'
                                        }`
                                }}>
                                    <div>
                                        <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.9rem' }}>{serviceType?.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                            {mentor?.firstName} {mentor?.lastName} • {log.date.split('T')[0]}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '12px',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        background: log.status === 'approved' ? '#ecfdf5' :
                                            log.status === 'submitted' ? '#fef3c7' : '#fef2f2',
                                        color: log.status === 'approved' ? '#059669' :
                                            log.status === 'submitted' ? '#b45309' : '#dc2626'
                                    }}>
                                        {log.status === 'approved' ? 'Onaylandı' :
                                            log.status === 'submitted' ? 'Bekliyor' : 'Reddedildi'}
                                    </span>
                                </div>
                            );
                        })}

                        {serviceLogs.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#9ca3af',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '12px'
                            }}>
                                <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>Henüz hizmet kaydı bulunmuyor</p>
                            </div>
                        )}
                    </div>

                    {serviceLogs.length > 10 && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link href="/admin/services" style={{ color: '#6366f1', fontSize: '0.85rem', fontWeight: 500 }}>
                                Tüm hizmetleri görüntüle ({serviceLogs.length - 10} daha fazla) →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
