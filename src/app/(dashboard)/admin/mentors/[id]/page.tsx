
import { db } from "@/lib/db";
import Link from "next/link";
import {
    ArrowLeft, Users, Calendar, Mail, Phone,
    FileText, CheckCircle2, Clock, AlertCircle,
    User, TrendingUp, Star, Activity, Award,
    GraduationCap, MapPin, Package, Key, Lock, Shield, Eye, EyeOff
} from "lucide-react";

export default async function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const mentor = db.users.getById(id);

    if (!mentor || mentor.role !== 'mentor') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                color: '#9ca3af'
            }}>
                <Users size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <h2 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>Mentor Bulunamadı</h2>
                <p style={{ marginBottom: '1.5rem' }}>Bu ID ile eşleşen mentor kaydı mevcut değil.</p>
                <Link href="/admin/mentors" className="btn btn-primary">
                    <ArrowLeft size={16} /> Listeye Dön
                </Link>
            </div>
        );
    }

    const assignments = db.assignments.getAll().filter(a => a.mentorId === id);
    const students = db.students.getAll();
    const serviceLogs = db.logs.getAll().filter(l => l.mentorId === id);
    const serviceTypes = db.serviceTypes.getAll();

    const approvedLogs = serviceLogs.filter(l => l.status === 'approved');
    const pendingLogs = serviceLogs.filter(l => l.status === 'submitted');
    const rejectedLogs = serviceLogs.filter(l => l.status === 'rejected');

    // Atanmış öğrenciler
    const assignedStudents = assignments.map(a => {
        const student = students.find(s => s.id === a.studentId);
        const studentLogs = serviceLogs.filter(l => l.studentId === a.studentId);
        return {
            ...student,
            assignment: a,
            serviceCount: studentLogs.length,
            approvedCount: studentLogs.filter(l => l.status === 'approved').length
        };
    }).filter(s => s.id);

    // Toplam kazanç hesabı
    const totalEarnings = approvedLogs.reduce((sum, log) => {
        const serviceType = serviceTypes.find(t => t.id === log.serviceTypeId);
        return sum + (serviceType?.unitPrice || 0);
    }, 0);

    // Başarı oranı
    const successRate = serviceLogs.length > 0 ? Math.round((approvedLogs.length / serviceLogs.length) * 100) : 0;

    const stats = [
        { label: "Atanan Öğrenci", value: assignedStudents.length, icon: Users, color: "#008C45", bg: "#eafaf3" },
        { label: "Toplam Hizmet", value: serviceLogs.length, icon: FileText, color: "#6366f1", bg: "#eef2ff" },
        { label: "Onaylanan", value: approvedLogs.length, icon: CheckCircle2, color: "#059669", bg: "#ecfdf5" },
        { label: "Bekleyen", value: pendingLogs.length, icon: Clock, color: "#f59e0b", bg: "#fef3c7" },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Back Button */}
            <Link
                href="/admin/mentors"
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
                Mentor Listesine Dön
            </Link>

            {/* Header Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        flexShrink: 0,
                        position: 'relative'
                    }}>
                        {mentor.firstName[0]}{mentor.lastName[0]}
                        {serviceLogs.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-8px',
                                right: '-8px',
                                background: '#f59e0b',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid white'
                            }}>
                                <Star size={14} color="white" fill="white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#11142D', marginBottom: '0.25rem' }}>
                                    {mentor.firstName} {mentor.lastName}
                                </h1>
                                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>@{mentor.username}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    background: '#eef2ff',
                                    color: '#6366f1'
                                }}>
                                    <Award size={16} />
                                    Mentor
                                </span>
                                <span style={{
                                    padding: '0.5rem 1rem',
                                    background: successRate >= 80 ? '#ecfdf5' : successRate >= 50 ? '#fef3c7' : '#fef2f2',
                                    color: successRate >= 80 ? '#059669' : successRate >= 50 ? '#b45309' : '#dc2626',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                                    %{successRate} Başarı
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
                                    <Mail size={14} /> {mentor.email || 'Belirtilmemiş'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Telefon</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500 }}>
                                    <Phone size={14} /> {mentor.phone || 'Belirtilmemiş'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Kayıt Tarihi</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500 }}>
                                    <Calendar size={14} /> {new Date(mentor.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Toplam Kazanç</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 700, fontSize: '1.1rem' }}>
                                    €{totalEarnings.toLocaleString()}
                                </p>
                            </div>
                        </div>
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

            {/* Account Information Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={20} color="#dc2626" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hesap Bilgileri</h2>
                            <p style={{ fontSize: '0.8rem', color: '#808191' }}>Giriş bilgileri ve güvenlik</p>
                        </div>
                    </div>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: '#fef3c7',
                        color: '#b45309'
                    }}>
                        <Lock size={12} />
                        Sadece Admin Görüntüleyebilir
                    </span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                }}>
                    {/* Username */}
                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <User size={16} color="#6366f1" />
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Kullanıcı Adı</span>
                        </div>
                        <p style={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: '#11142D',
                            fontFamily: 'monospace',
                            background: 'white',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}>
                            {mentor.username}
                        </p>
                    </div>

                    {/* Password */}
                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Key size={16} color="#dc2626" />
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Şifre</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'white',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <p style={{
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                color: '#11142D',
                                fontFamily: 'monospace'
                            }}>
                                {mentor.password}
                            </p>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertCircle size={10} />
                            Bu bilgiyi güvenli tutun
                        </p>
                    </div>

                    {/* Account Status */}
                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Shield size={16} color="#059669" />
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Hesap Durumu</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                background: '#ecfdf5',
                                color: '#059669'
                            }}>
                                <CheckCircle2 size={16} />
                                Aktif
                            </span>
                        </div>
                    </div>

                    {/* Role */}
                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Award size={16} color="#6366f1" />
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Rol</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                background: '#eef2ff',
                                color: '#6366f1'
                            }}>
                                <Award size={16} />
                                Mentor
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Assigned Students */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eafaf3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GraduationCap size={20} color="#008C45" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Atanan Öğrenciler</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>{assignedStudents.length} öğrenci</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {assignedStudents.map((student) => (
                            <Link
                                key={student.id}
                                href={`/admin/students/${student.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #f1f5f9',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600
                                        }}>
                                            {student.firstName?.[0]}{student.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#11142D' }}>{student.firstName} {student.lastName}</p>
                                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={10} /> {student.country}
                                                </span>
                                                <span style={{
                                                    padding: '0.15rem 0.4rem',
                                                    background: '#eff6ff',
                                                    color: '#2563eb',
                                                    borderRadius: '4px'
                                                }}>
                                                    {student.packageType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            background: student.assignment.role === 'primary' ? '#fef3c7' : '#f3f4f6',
                                            color: student.assignment.role === 'primary' ? '#b45309' : '#6b7280',
                                            borderRadius: '8px'
                                        }}>
                                            {student.assignment.role === 'primary' ? '⭐ Ana' : 'Destek'}
                                        </p>
                                        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                            {student.approvedCount}/{student.serviceCount} hizmet
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {assignedStudents.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#9ca3af',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '12px'
                            }}>
                                <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>Henüz öğrenci atanmamış</p>
                            </div>
                        )}
                    </div>
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
                            const student = students.find(s => s.id === log.studentId);
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
                                            {student?.firstName} {student?.lastName} • {log.date.split('T')[0]}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
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
                                        {serviceType?.unitPrice && log.status === 'approved' && (
                                            <p style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.25rem', fontWeight: 600 }}>
                                                €{serviceType.unitPrice}
                                            </p>
                                        )}
                                    </div>
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

            {/* Performance Summary */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #11142D 0%, #1e293b 100%)',
                borderRadius: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1.5rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Toplam Öğrenci</p>
                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>{assignedStudents.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Başarı Oranı</p>
                    <p style={{ color: successRate >= 80 ? '#4ade80' : successRate >= 50 ? '#fbbf24' : '#f87171', fontSize: '1.5rem', fontWeight: 700 }}>
                        %{successRate}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Onaylı Hizmet</p>
                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>{approvedLogs.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Toplam Kazanç</p>
                    <p style={{ color: '#4ade80', fontSize: '1.5rem', fontWeight: 700 }}>€{totalEarnings.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
