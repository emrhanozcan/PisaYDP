'use client';

import { useState, useTransition, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import {
    Wallet, TrendingUp, CheckCircle, Clock,
    FileText, Award, ChevronDown, ChevronUp, Image as ImageIcon, File, X, Edit, Plus
} from "lucide-react";
import { updateMentorServiceStatus } from '@/app/actions/mentor';
import { updateServiceLogDetails } from '@/app/actions/service-logs';
import { deleteServiceLogAttachment } from '@/app/actions/shared';
import Toast, { ToastType } from '@/components/common/Toast';

interface LogData {
    id: string;
    studentId: string;
    studentName: string;
    serviceTypeId: string;
    serviceName: string;
    servicePrice: number;
    date: string;
    durationMinutes: number;
    notes?: string;
    attachments?: string[];
    status: string;
    paymentStatus?: string;
}

interface StudentBreakdown {
    id: string;
    firstName: string;
    lastName: string;
    serviceCount: number;
    earnings: number;
}

interface ServiceBreakdown {
    id: string;
    name: string;
    unitPrice: number;
    count: number;
    total: number;
}

interface Props {
    logs: LogData[];
    approvedEarnings: number;
    pendingEarnings: number;
    totalHours: number;
    approvedCount: number;
    serviceBreakdown: ServiceBreakdown[];
    studentBreakdown: StudentBreakdown[];
}

export default function MentorEarningsClient({
    logs,
    approvedEarnings,
    pendingEarnings,
    totalHours,
    approvedCount,
    serviceBreakdown,
    studentBreakdown
}: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [editingLog, setEditingLog] = useState<LogData | null>(null);
    const [editNotes, setEditNotes] = useState('');
    const [newAttachments, setNewAttachments] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setNewAttachments(prev => [...prev, ...newFiles]);

            const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
            setNewPreviews(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const removeNewAttachment = (index: number) => {
        setNewAttachments(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => {
            const updated = prev.filter((_, i) => i !== index);
            if (prev[index]) URL.revokeObjectURL(prev[index]);
            return updated;
        });
    };

    const closeEditModalWithCleanup = () => {
        newPreviews.forEach(url => URL.revokeObjectURL(url));
        setNewPreviews([]);
        setNewAttachments([]);
        closeEditModal();
    };

    const handleStatusChange = (logId: string, newStatus: 'draft' | 'submitted' | 'approved' | 'rejected') => {
        startTransition(async () => {
            await updateMentorServiceStatus(logId, newStatus);
            setToast({ message: 'Durum güncellendi', type: 'success' });
            router.refresh();
        });
    };

    const toggleExpand = (id: string) => {
        setExpandedLogId(expandedLogId === id ? null : id);
    };

    const openLightbox = (url: string) => {
        setLightboxImage(url);
    };

    const closeLightbox = () => {
        setLightboxImage(null);
    };

    const handleEditClick = (log: LogData) => {
        setEditingLog(log);
        setEditNotes(log.notes || '');
    };

    const closeEditModal = () => {
        setEditingLog(null);
        setEditNotes('');
    };

    const stats = [
        { label: "Toplam Kazanç", value: `€${approvedEarnings}`, icon: Wallet, color: "#059669", bg: "#ecfdf5", highlight: true },
        { label: "Bekleyen", value: `€${pendingEarnings}`, icon: Clock, color: "#f59e0b", bg: "#fef3c7" },
        { label: "Onaylı Hizmet", value: approvedCount.toString(), icon: CheckCircle, color: "#6366f1", bg: "#eef2ff" },
        { label: "Toplam Süre", value: `${totalHours.toFixed(1)} saat`, icon: TrendingUp, color: "#8b5cf6", bg: "#f5f3ff" },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#11142D', marginBottom: '0.5rem' }}>
                    Hakediş & Özet
                </h1>
                <p style={{ color: '#808191', fontSize: '1rem' }}>
                    Kazançlarınızı ve hizmet istatistiklerinizi görüntüleyin
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="stat-card-enhanced"
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            background: stat.highlight ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : undefined,
                            border: stat.highlight ? '2px solid #059669' : undefined
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 52,
                                height: 52,
                                borderRadius: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: stat.highlight ? 'white' : stat.bg,
                                color: stat.color
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: stat.highlight ? '2rem' : '1.75rem', fontWeight: 700, color: stat.highlight ? '#059669' : '#11142D', lineHeight: 1 }}>
                                    {stat.value}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#808191', marginTop: '0.25rem' }}>{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
                {/* Recent Transactions */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={22} color="#6366f1" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hizmet Kayıtları</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>{logs.length} toplam kayıt</p>
                            </div>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ width: '40px' }}></th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Tarih</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Öğrenci</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Hizmet</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Durum</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Ödeme</th>
                                    <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <Fragment key={log.id}>
                                        <tr key={log.id} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: expandedLogId === log.id ? '#f8fafc' : 'transparent' }} onClick={() => toggleExpand(log.id)}>
                                            <td style={{ textAlign: 'center' }}>
                                                {expandedLogId === log.id ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#9ca3af" />}
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                                {new Date(log.date).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        background: '#008C45',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600
                                                    }}>
                                                        {log.studentName.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', color: '#374151' }}>{log.studentName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                                                {log.serviceName}
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={log.status}
                                                    onChange={(e) => handleStatusChange(log.id, e.target.value as any)}
                                                    disabled={isPending}
                                                    style={{
                                                        padding: '0.35rem 0.6rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: log.status === 'approved' ? '#ecfdf5' :
                                                            log.status === 'rejected' ? '#fef2f2' :
                                                                log.status === 'submitted' ? '#fef3c7' : '#f3f4f6',
                                                        color: log.status === 'approved' ? '#059669' :
                                                            log.status === 'rejected' ? '#dc2626' :
                                                                log.status === 'submitted' ? '#b45309' : '#6b7280'
                                                    }}
                                                >
                                                    <option value="draft">📝 Taslak</option>
                                                    <option value="submitted">⏳ Onay Bekliyor</option>
                                                    <option value="approved">✅ Onaylandı</option>
                                                    <option value="rejected">❌ Reddedildi</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem', textAlign: 'center' }}>
                                                {log.status === 'approved' ? (
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.25rem 0.6rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        background: log.paymentStatus === 'paid' ? '#dbeafe' : '#f3f4f6',
                                                        color: log.paymentStatus === 'paid' ? '#1d4ed8' : '#6b7280'
                                                    }}>
                                                        {log.paymentStatus === 'paid' ? '✅ Ödendi' : '⏳ Bekliyor'}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.7rem', color: '#d1d5db' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right', fontWeight: 600, color: log.status === 'approved' ? '#059669' : '#9ca3af' }}>
                                                €{log.servicePrice}
                                            </td>
                                        </tr>
                                        {expandedLogId === log.id && (
                                            <tr key={`${log.id}-details`} style={{ background: '#f8fafc' }}>
                                                <td colSpan={7} style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: 'none' }}>
                                                    <div style={{
                                                        background: 'white',
                                                        borderRadius: '12px',
                                                        padding: '1.5rem',
                                                        border: '1px solid #e5e7eb',
                                                        marginTop: '0.5rem',
                                                        marginLeft: '40px',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#11142D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <FileText size={16} color="#4f46e5" />
                                                                Hizmet Detayları
                                                            </h4>
                                                            <button
                                                                onClick={() => handleEditClick(log)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    padding: '0.5rem 1rem',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #e5e7eb',
                                                                    background: 'white',
                                                                    color: '#374151',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 500,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <Edit size={14} />
                                                                Düzenle
                                                            </button>
                                                        </div>

                                                        {log.notes && (
                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                                                                    Notlar
                                                                </p>
                                                                <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                                    {log.notes}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {log.attachments && log.attachments.length > 0 && (
                                                            <div>
                                                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                                                    Ekler ({log.attachments.length})
                                                                </p>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                                                    {log.attachments.map((url, idx) => {
                                                                        // Simple check for image extension or data URI
                                                                        const isImage = url.startsWith('data:image') ||
                                                                            url.match(/\.(jpeg|jpg|gif|png|webp)/i) != null ||
                                                                            // Supabase storage URLs often don't have extensions but have mimetype in response, 
                                                                            // but for display we can check if it behaves like an image or just assume
                                                                            // For now, let's treat anything not obviously a document as potential image or generic file
                                                                            true;

                                                                        return (
                                                                            <div
                                                                                key={idx}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    openLightbox(url);
                                                                                }}
                                                                                style={{
                                                                                    width: '100px',
                                                                                    height: '100px',
                                                                                    borderRadius: '8px',
                                                                                    overflow: 'hidden',
                                                                                    border: '1px solid #e5e7eb',
                                                                                    position: 'relative',
                                                                                    cursor: 'zoom-in',
                                                                                    background: '#f9fafb',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    transition: 'transform 0.2s'
                                                                                }}
                                                                            >
                                                                                <button
                                                                                    onClick={async (e) => {
                                                                                        e.stopPropagation();
                                                                                        if (confirm('Bu eki silmek istediğinize emin misiniz?')) {
                                                                                            startTransition(async () => {
                                                                                                await deleteServiceLogAttachment(log.id, url);
                                                                                                router.refresh();
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        top: 4,
                                                                                        right: 4,
                                                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                                                        borderRadius: '50%',
                                                                                        width: 24,
                                                                                        height: 24,
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        border: '1px solid #fee2e2',
                                                                                        cursor: 'pointer',
                                                                                        zIndex: 10,
                                                                                        color: '#ef4444'
                                                                                    }}
                                                                                    title="Eki Sil"
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>

                                                                                <img
                                                                                    src={url}
                                                                                    alt={`Attachment ${idx + 1}`}
                                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                                    onError={(e) => {
                                                                                        // Fallback if image fails to load
                                                                                        e.currentTarget.style.display = 'none';
                                                                                        e.currentTarget.parentElement!.classList.add('fallback-icon');
                                                                                    }}
                                                                                />
                                                                                {/* Fallback Icon (hidden by default unless image fails) */}
                                                                                <div className="fallback-content" style={{ display: 'none', flexDirection: 'column', alignItems: 'center' }}>
                                                                                    <File size={24} color="#9ca3af" />
                                                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Dosya</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!log.notes && (!log.attachments || log.attachments.length === 0) && (
                                                            <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                                                Ek bilgi veya dosya bulunmuyor.
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {logs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Henüz hizmet kaydınız bulunmuyor</p>
                        </div>
                    )}

                    {logs.length > 15 && (
                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                            Son 15 kayıt gösteriliyor ({logs.length - 15} daha var)
                        </p>
                    )}
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Service Type Breakdown */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Award size={20} color="#8b5cf6" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#11142D', fontWeight: 600 }}>Hizmet Dağılımı</h3>
                                <p style={{ fontSize: '0.75rem', color: '#808191' }}>Onaylı kazançlar</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {serviceBreakdown.map((service) => (
                                <div key={service.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px'
                                }}>
                                    <div>
                                        <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.85rem' }}>{service.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{service.count} adet × €{service.unitPrice}</p>
                                    </div>
                                    <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>€{service.total}</span>
                                </div>
                            ))}

                            {serviceBreakdown.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '1rem' }}>
                                    Henüz onaylı hizmet yok
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Student Breakdown */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eafaf3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={20} color="#008C45" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#11142D', fontWeight: 600 }}>Öğrenci Bazlı</h3>
                                <p style={{ fontSize: '0.75rem', color: '#808191' }}>Onaylı kazançlar</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {studentBreakdown.slice(0, 5).map((student) => (
                                <div key={student.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: 600
                                        }}>
                                            {student.firstName[0]}{student.lastName[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.85rem' }}>{student.firstName} {student.lastName}</p>
                                            <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{student.serviceCount} hizmet</p>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>€{student.earnings}</span>
                                </div>
                            ))}

                            {studentBreakdown.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '1rem' }}>
                                    Henüz veri yok
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #11142D 0%, #1e293b 100%)',
                        borderRadius: '1rem'
                    }}>
                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>Özet</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Onaylı</p>
                                <p style={{ color: '#4ade80', fontSize: '1.5rem', fontWeight: 700 }}>€{approvedEarnings}</p>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Bekleyen</p>
                                <p style={{ color: '#fbbf24', fontSize: '1.5rem', fontWeight: 700 }}>€{pendingEarnings}</p>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Toplam Potansiyel</span>
                                <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>€{approvedEarnings + pendingEarnings}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.85)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '2rem',
                            background: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10000
                        }}
                    >
                        <X size={24} color="#11142D" />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Full Preview"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Edit Modal */}
            {editingLog && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999,
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={closeEditModalWithCleanup}
                >
                    <div
                        style={{
                            background: 'white',
                            width: '100%',
                            maxWidth: '600px',
                            borderRadius: '16px',
                            padding: '2rem',
                            position: 'relative',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#11142D', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Edit size={24} color="#4f46e5" />
                            Kaydı Düzenle
                        </h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                startTransition(async () => {
                                    try {
                                        // Append files from state manually as they might not be in the form input
                                        newAttachments.forEach(file => {
                                            formData.append('attachments', file);
                                        });

                                        await updateServiceLogDetails(formData);
                                        setToast({ message: '✅ Başarıyla kaydedildi!', type: 'success' });
                                        closeEditModalWithCleanup();
                                    } catch (error: any) {
                                        console.error("Update failed:", error);
                                        setToast({ message: "Hata oluştu: " + error.message, type: 'error' });
                                    }
                                });
                            }}
                        >
                            <input type="hidden" name="logId" value={editingLog.id} />

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                    Notlar / Açıklama
                                </label>
                                <textarea
                                    name="notes"
                                    defaultValue={editNotes}
                                    rows={4}
                                    className="input-field"
                                    placeholder="Hizmet detaylarını buraya yazın..."
                                    style={{ resize: 'vertical', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                    Yeni Dosya Ekle
                                </label>
                                <div style={{
                                    border: '2px dashed #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    background: '#f9fafb',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    marginBottom: newPreviews.length > 0 ? '1rem' : 0
                                }}>
                                    <input
                                        type="file"
                                        name="attachments_input"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer',
                                            zIndex: 2
                                        }}
                                    />
                                    <div style={{ pointerEvents: 'none' }}>
                                        <Plus size={24} color="#9ca3af" style={{ margin: '0 auto 0.5rem' }} />
                                        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Dosyaları buraya sürükleyin veya tıklayın</p>
                                    </div>
                                </div>

                                {/* Previews */}
                                {newPreviews.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        {newPreviews.map((url, idx) => (
                                            <div key={idx} style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '1px solid #e5e7eb',
                                                position: 'relative',
                                                background: 'white'
                                            }}>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewAttachment(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 2,
                                                        right: 2,
                                                        background: 'rgba(255,255,255,0.9)',
                                                        borderRadius: '50%',
                                                        width: 20,
                                                        height: 20,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #fee2e2',
                                                        cursor: 'pointer',
                                                        color: '#ef4444',
                                                        zIndex: 10
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>

                                                {newAttachments[idx]?.type.startsWith('image/') ? (
                                                    <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                                        <File size={24} color="#9ca3af" />
                                                        <span style={{ fontSize: '0.5rem', color: '#6b7280', marginTop: '0.2rem', padding: '0 0.2rem', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {newAttachments[idx]?.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={closeEditModalWithCleanup}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        background: 'white',
                                        color: '#374151',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                    disabled={isPending}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#4f46e5',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: isPending ? 'not-allowed' : 'pointer',
                                        opacity: isPending ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Kaydet
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Contextual Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
