'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, UserPlus, Calendar, MapPin, School,
    Mail, Phone, Package, FileText, CheckCircle2,
    Clock, AlertCircle, User, TrendingUp, Edit,
    ChevronRight, Star, Activity, Trash2, X, AlertTriangle, UserMinus, Plus, Check, RotateCcw
} from "lucide-react";
import {
    assignMentor,
    removeMentorFromStudent,
} from "@/app/actions/admin";
import { deleteBranchStudent } from "@/app/actions/branch";
import { createServiceLog, updateServiceLogStatus } from "@/app/actions/service-logs";
import StudentAvatar from "@/components/common/StudentAvatar";
import UserAvatar from "@/components/common/UserAvatar";
import { getSession } from "@/app/actions/auth";
import AssignMentorForm from "./AssignMentorForm";
import AdminServiceLogForm from "./AdminServiceLogForm";

interface StudentDetailViewProps {
    student: any;
    assignments: any[];
    serviceLogs: any[];
    mentors: any[];
    serviceTypes: any[];
    totalSpent: number;
    stats: any[];
    showBackLink?: boolean;
}

export default function StudentDetailView({
    student,
    assignments,
    serviceLogs,
    mentors,
    serviceTypes,
    totalSpent,
    stats,
    showBackLink = true
}: StudentDetailViewProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const router = useRouter();

    const [userRole, setUserRole] = useState<string>('');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            const session = await getSession();
            if (session) setUserRole(session.role);
        };
        fetchSession();
    }, []);

    const canEditPhoto = userRole !== '' && userRole !== 'mentor';

    const handleDelete = () => {
        startDeleteTransition(async () => {
            try {
                await deleteBranchStudent(student.id);
                router.push('/admin/students');
                router.refresh();
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Silme işlemi sırasında bir hata oluştu.');
            }
        });
    };

    const handleRemoveMentor = (mentorId: string) => {
        if (window.confirm("Bu mentoru öğrenci listesinden çıkarmak istediğinize emin misiniz?")) {
            startDeleteTransition(async () => {
                try {
                    await removeMentorFromStudent(student.id, mentorId);
                    router.refresh();
                } catch (error) {
                    console.error('Remove mentor failed:', error);
                    alert('İşlem sırasında bir hata oluştu.');
                }
            });
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Back Button */}
            {showBackLink && (
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
            )}

            {/* Header Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <StudentAvatar
                        studentId={student.id}
                        firstName={student.firstName}
                        lastName={student.lastName}
                        photoUrl={student.photoUrl}
                        size={100}
                        canEdit={canEditPhoto}
                        isAuthorized={userRole !== 'mentor'}
                        table={student.branchCode ? 'branch_students' : 'students'}
                    />

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
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        background: '#fef2f2',
                                        color: '#dc2626',
                                        border: '1px solid #fee2e2',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={14} /> Sil
                                </button>
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
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Toplam Harcama</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 700, fontSize: '1.1rem' }}>
                                €{totalSpent.toLocaleString()}
                            </p>
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
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        {student.scholarshipTypes && student.scholarshipTypes.length > 0 ? (
                                            student.scholarshipTypes.map((type: string, idx: number) => {
                                                let bg = '#f3f4f6';
                                                let color = '#374151';

                                                if (type === 'Lazio Disco') { bg = '#dbeafe'; color = '#1e40af'; } // blue-100 blue-800
                                                else if (type === 'DSU') { bg = '#f3e8ff'; color = '#6b21a8'; } // purple-100 purple-800
                                                else if (type === 'EDISU') { bg = '#ffedd5'; color = '#9a3412'; } // orange-100 orange-800
                                                else { bg = '#f3f4f6'; color = '#374151'; } // gray-100 gray-800

                                                return (
                                                    <span key={idx} style={{
                                                        padding: '0.1rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: bg,
                                                        color: color,
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {type}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span style={{ color: student.scholarshipPackage === 'Evet' ? '#9ca3af' : '#15803d' }}>
                                                {student.scholarshipPackage === 'Evet' ? 'Seçilmedi' : (student.scholarshipPackage || '-')}
                                            </span>
                                        )}
                                    </div>
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
                {stats.map((stat, i) => {
                    let IconComponent = stat.icon;

                    // Fallback mapping if icon is not provided (e.g. from server action)
                    if (!IconComponent) {
                        switch (stat.label) {
                            case "Toplam Hizmet": IconComponent = FileText; break;
                            case "Onaylanan": IconComponent = CheckCircle2; break;
                            case "Bekleyen": IconComponent = Clock; break;
                            case "Atanan Mentor": IconComponent = UserPlus; break;
                            default: IconComponent = Activity;
                        }
                    }

                    return (
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
                                    <IconComponent size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>{stat.value}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#808191', marginTop: '0.2rem' }}>{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
                {/* Column 1: Assignments & Logging */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                                const mentor = mentors.find(u => u.id === assign.mentorId);
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
                                            <UserAvatar
                                                userId={mentor?.id || ''}
                                                firstName={mentor?.firstName || ''}
                                                lastName={mentor?.lastName || ''}
                                                photoUrl={mentor?.photoUrl}
                                                size={44}
                                                canEdit={false}
                                            />
                                            <div>
                                                <p style={{ fontWeight: 600, color: '#11142D' }}>
                                                    {mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Bilinmeyen Mentor'}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>
                                                    {assign.role === 'primary' ? '⭐ Ana Mentor' : 'Destek Mentor'}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                                {new Date(assign.startDate).toLocaleDateString('tr-TR')}
                                            </p>
                                            <button
                                                onClick={() => handleRemoveMentor(assign.mentorId)}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: '#dc2626',
                                                    background: '#fef2f2',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid #fee2e2',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                <UserMinus size={12} /> Bağlantıyı Kes
                                            </button>
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

                        <AssignMentorForm studentId={student.id} mentors={mentors} serviceTypes={serviceTypes} />
                    </div>

                    {/* Admin Service Logging */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eafaf3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={22} color="#008C45" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hizmet Girişi (Yönetici)</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>Öğrenciye mentor adına hizmet ekleyin</p>
                            </div>
                        </div>

                        <AdminServiceLogForm
                            studentId={student.id}
                            assignedMentors={assignments.map(a => {
                                const m = mentors.find(u => u.id === a.mentorId);
                                return m ? { id: m.id, firstName: m.firstName, lastName: m.lastName } : null;
                            }).filter(m => m !== null) as any[]}
                            serviceTypes={serviceTypes.filter(t => t.isActive)}
                        />
                    </div>
                </div>

                {/* Column 2: Service History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
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
                            const mentor = mentors.find(u => u.id === log.mentorId);
                            const isExpanded = expandedLogId === log.id;

                            return (
                                <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                    <div
                                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem 1rem',
                                            background: '#f8fafc',
                                            borderRadius: isExpanded ? '10px 10px 0 0' : '10px',
                                            borderLeft: `3px solid ${log.status === 'approved' ? '#059669' :
                                                log.status === 'submitted' ? '#f59e0b' : '#dc2626'
                                                }`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            borderBottom: isExpanded ? 'none' : 'visible'
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.9rem' }}>{serviceType?.name}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <UserAvatar
                                                    userId={mentor?.id || ''}
                                                    firstName={mentor?.firstName || ''}
                                                    lastName={mentor?.lastName || ''}
                                                    photoUrl={mentor?.photoUrl}
                                                    size={18}
                                                    canEdit={false}
                                                />
                                                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                    {mentor?.firstName} {mentor?.lastName} • {new Date(log.date).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {(log.unitPrice !== undefined || serviceType?.unitPrice) && (
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                                                    €{log.unitPrice !== undefined ? log.unitPrice : serviceType?.unitPrice}
                                                </span>
                                            )}
                                            <span style={{
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: log.status === 'approved' ? '#ecfdf5' :
                                                    log.status === 'assigned' ? '#eef2ff' :
                                                        log.status === 'submitted' ? '#fef3c7' : '#fef2f2',
                                                color: log.status === 'approved' ? '#059669' :
                                                    log.status === 'assigned' ? '#6366f1' :
                                                        log.status === 'submitted' ? '#b45309' : '#dc2626'
                                            }}>
                                                {log.status === 'approved' ? 'Onaylandı' :
                                                    log.status === 'assigned' ? 'Mentor Atandı' :
                                                        log.status === 'submitted' ? 'İnceleme Bekliyor' : 'Reddedildi'}
                                            </span>
                                            {isExpanded ? <Clock size={16} color="#6b7280" /> : <Activity size={16} color="#9ca3af" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{
                                            padding: '1rem',
                                            background: '#ffffff',
                                            border: '1px solid #f1f5f9',
                                            borderLeft: `3px solid ${log.status === 'approved' ? '#059669' :
                                                log.status === 'submitted' ? '#f59e0b' : '#dc2626'
                                                }`,
                                            borderRadius: '0 0 10px 10px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {log.notes && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Notlar</p>
                                                    <p style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{log.notes}</p>
                                                </div>
                                            )}

                                            {log.attachments && log.attachments.length > 0 && (
                                                <div>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Ekler</p>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        {log.attachments.map((url: string, idx: number) => (
                                                            <a
                                                                key={idx}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '6px',
                                                                    overflow: 'hidden',
                                                                    border: '1px solid #e5e7eb',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    background: '#f9fafb'
                                                                }}
                                                            >
                                                                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {
                                                                    (e.target as any).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTQuNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWNy41TDE0LjUgMnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxNCAyIDE0IDggMjAgOCI+PC9wb2x5bGluZT48L3N2Zz4=';
                                                                }} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {!log.notes && (!log.attachments || log.attachments.length === 0) && (
                                                <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Detay bulunmuyor.</p>
                                            )}

                                            {log.status === 'submitted' && (
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    marginTop: '1.5rem',
                                                    paddingTop: '1rem',
                                                    borderTop: '1px solid #f1f5f9'
                                                }}>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Bu hizmet kaydını onaylamak istediğinize emin misiniz?')) {
                                                                updateServiceLogStatus(log.id, 'approved');
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#059669',
                                                            color: 'white',
                                                            border: 'none',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem'
                                                        }}
                                                    >
                                                        <Check size={14} /> Onayla
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Bu hizmet kaydını reddetmek istediğinize emin misiniz?')) {
                                                                updateServiceLogStatus(log.id, 'rejected');
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#dc2626',
                                                            color: 'white',
                                                            border: 'none',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem'
                                                        }}
                                                    >
                                                        <X size={14} /> Reddet
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Bu kaydı düzeltmesi için mentora geri göndermek istiyor musunuz?')) {
                                                                updateServiceLogStatus(log.id, 'returned');
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#f59e0b',
                                                            color: 'white',
                                                            border: 'none',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem'
                                                        }}
                                                    >
                                                        <RotateCcw size={14} /> Geri Gönder
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

        {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto'
                        }}>
                            <AlertTriangle size={24} color="#dc2626" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>Öğrenciyi Sil?</h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                            Bu öğrenciyi ({student.firstName} {student.lastName}) silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    border: '1px solid #d1d5db',
                                    color: '#374151',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '8px',
                                    backgroundColor: '#dc2626',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 500,
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    opacity: isDeleting ? 0.7 : 1
                                }}
                            >
                                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
