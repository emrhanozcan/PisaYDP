'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Calendar, User, Filter, ArrowUpDown, DollarSign, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Image as ImageIcon, X, File, Edit3, Save, RotateCcw } from "lucide-react";
import { updatePaymentStatus, updateServiceLogStatus, updateServiceLogDetails } from "@/app/actions/admin";
import { deleteServiceLogAttachment } from "@/app/actions/shared";
import FileUploader from '@/components/common/FileUploader';

interface LogData {
    id: string;
    studentId: string;
    studentName: string;
    mentorId: string;
    mentorName: string;
    serviceTypeId: string;
    serviceName: string;
    servicePrice: number;
    date: string;
    durationMinutes: number;
    status: string;
    paymentStatus?: string;
    notes?: string;
    attachments?: string[];
    lastEditorRole?: 'mentor' | 'admin';
}

interface Props {
    logs: LogData[];
    serviceTypes: { id: string; name: string }[];
    mentors: { id: string; name: string }[];
}

type SortKey = 'date' | 'mentor' | 'student' | 'service' | 'price' | 'status' | 'paymentStatus';
type SortOrder = 'asc' | 'desc';

export default function ServicesClient({ logs, serviceTypes, mentors }: Props) {
    const [search, setSearch] = useState('');
    const [filterMentor, setFilterMentor] = useState('all');
    const [filterService, setFilterService] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Edit Mode State
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editNotes, setEditNotes] = useState('');

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleEditClick = (log: LogData) => {
        setEditingLogId(log.id);
        setEditNotes(log.notes || '');
    };

    const handleCancelEdit = () => {
        setEditingLogId(null);
        setEditNotes('');
    };

    // Filter logs
    let filteredLogs = logs.filter(log => {
        const matchesSearch = search === '' ||
            log.studentName.toLowerCase().includes(search.toLowerCase()) ||
            log.mentorName.toLowerCase().includes(search.toLowerCase()) ||
            log.serviceName.toLowerCase().includes(search.toLowerCase());

        const matchesMentor = filterMentor === 'all' || log.mentorId === filterMentor;
        const matchesService = filterService === 'all' || log.serviceTypeId === filterService;
        const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
        const matchesPayment = filterPayment === 'all' ||
            (filterPayment === 'paid' && log.paymentStatus === 'paid') ||
            (filterPayment === 'pending' && (log.paymentStatus === 'pending' || !log.paymentStatus));

        return matchesSearch && matchesMentor && matchesService && matchesStatus && matchesPayment;
    });

    // Sort logs
    filteredLogs = [...filteredLogs].sort((a, b) => {
        let comparison = 0;
        switch (sortKey) {
            case 'date':
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                break;
            case 'mentor':
                comparison = a.mentorName.localeCompare(b.mentorName);
                break;
            case 'student':
                comparison = a.studentName.localeCompare(b.studentName);
                break;
            case 'service':
                comparison = a.serviceName.localeCompare(b.serviceName);
                break;
            case 'price':
                comparison = a.servicePrice - b.servicePrice;
                break;
            case 'status':
                comparison = a.status.localeCompare(b.status);
                break;
            case 'paymentStatus':
                comparison = (a.paymentStatus || 'pending').localeCompare(b.paymentStatus || 'pending');
                break;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
    });

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    const handleStatusChange = (logId: string, newStatus: 'approved' | 'rejected' | 'submitted') => {
        startTransition(async () => {
            await updateServiceLogStatus(logId, newStatus);
            router.refresh();
        });
    };

    const handlePaymentChange = (logId: string, newStatus: 'pending' | 'paid') => {
        startTransition(async () => {
            await updatePaymentStatus(logId, newStatus);
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

    const SortButton = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
        <button
            onClick={() => handleSort(sortKeyName)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: sortKey === sortKeyName ? '#1a56db' : '#9ca3af',
                textTransform: 'uppercase'
            }}
        >
            {label}
            <ArrowUpDown size={12} />
        </button>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: '#11142D', marginBottom: '0.5rem' }}>Hizmet Kayıtları</h1>
                    <p style={{ color: '#808191' }}>Girilen tüm hizmetlerin listesi. ({filteredLogs.length} kayıt)</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {/* Search & Filters */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#B2B3BD' }} />
                        <input
                            type="text"
                            placeholder="Hizmet, öğrenci veya mentor ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '12px',
                                border: '1px solid #E4E5E7',
                                background: '#F9FAFC',
                                fontSize: '0.9rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Filters Row */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontWeight: 600 }}>
                            <Filter size={18} />
                            <span>Filtreler:</span>
                        </div>

                        {/* Mentor Filter */}
                        <select
                            value={filterMentor}
                            onChange={(e) => setFilterMentor(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">Tüm Mentorlar</option>
                            {mentors.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>

                        {/* Service Filter */}
                        <select
                            value={filterService}
                            onChange={(e) => setFilterService(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">Tüm Hizmetler</option>
                            {serviceTypes.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="draft">Taslak</option>
                            <option value="assigned">Atandı</option>
                            <option value="submitted">Bekliyor</option>
                            <option value="approved">Onaylandı</option>
                            <option value="rejected">Reddedildi</option>
                        </select>

                        {/* Payment Status Filter */}
                        <select
                            value={filterPayment}
                            onChange={(e) => setFilterPayment(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">Tüm Ödemeler</option>
                            <option value="pending">Ödeme Bekliyor</option>
                            <option value="paid">Ödendi</option>
                        </select>

                        {/* Clear Filters */}
                        {(filterMentor !== 'all' || filterService !== 'all' || filterStatus !== 'all' || filterPayment !== 'all' || search !== '') && (
                            <button
                                onClick={() => {
                                    setFilterMentor('all');
                                    setFilterService('all');
                                    setFilterStatus('all');
                                    setFilterPayment('all');
                                    setSearch('');
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                ✕ Temizle
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ minWidth: '1000px' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th style={{ width: '15%' }}><SortButton label="Hizmet" sortKeyName="service" /></th>
                                <th style={{ width: '15%' }}><SortButton label="Öğrenci" sortKeyName="student" /></th>
                                <th style={{ width: '12%' }}><SortButton label="Mentor" sortKeyName="mentor" /></th>
                                <th style={{ width: '10%' }}><SortButton label="Tarih" sortKeyName="date" /></th>
                                <th style={{ width: '8%' }}><SortButton label="Ücret" sortKeyName="price" /></th>
                                <th style={{ width: '15%', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                                        <SortButton label="Hizmet Durumu" sortKeyName="status" />
                                        <span style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 400 }}>(Mentor Güncellemesi)</span>
                                    </div>
                                </th>
                                <th style={{ width: '15%', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                                        <SortButton label="Ücret Onay" sortKeyName="paymentStatus" />
                                        <span style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 400 }}>(Admin Güncellemesi)</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <>
                                    <tr key={log.id} style={{ cursor: 'pointer', background: expandedLogId === log.id ? '#f8fafc' : 'transparent' }} onClick={() => toggleExpand(log.id)}>
                                        <td style={{ textAlign: 'center' }}>
                                            {expandedLogId === log.id ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#9ca3af" />}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fbf1f1', color: '#CD212A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FileText size={16} />
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#11142D', fontSize: '0.85rem' }}>{log.serviceName}</span>
                                            </div>
                                        </td>
                                        <td>
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
                                                    {log.studentName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <span style={{ color: '#11142D', fontWeight: 500, fontSize: '0.85rem' }}>{log.studentName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: '#1a56db', fontSize: '0.85rem', fontWeight: 500 }}>{log.mentorName}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#808191', fontSize: '0.8rem' }}>
                                                <Calendar size={14} />
                                                {new Date(log.date).toLocaleDateString("tr-TR")}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>€{log.servicePrice}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {/* Service Status - Admin can update */}
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
                                                            log.status === 'submitted' ? '#fef3c7' : 
                                                                log.status === 'assigned' ? '#eef2ff' : '#f3f4f6',
                                                    color: log.status === 'approved' ? '#059669' :
                                                        log.status === 'rejected' ? '#dc2626' :
                                                            log.status === 'submitted' ? '#b45309' : 
                                                                log.status === 'assigned' ? '#6366f1' : '#6b7280'
                                                }}
                                            >
                                                <option value="draft">📝 Taslak</option>
                                                <option value="assigned">👤 Atandı</option>
                                                <option value="submitted">⏳ Onay Bekliyor</option>
                                                <option value="approved">✅ Onaylandı</option>
                                                <option value="rejected">❌ Reddedildi</option>
                                            </select>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {/* Payment Status - Admin can update */}
                                            <select
                                                value={log.paymentStatus || 'pending'}
                                                onChange={(e) => handlePaymentChange(log.id, e.target.value as any)}
                                                disabled={isPending || log.status !== 'approved'}
                                                style={{
                                                    padding: '0.35rem 0.6rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    border: 'none',
                                                    cursor: log.status === 'approved' ? 'pointer' : 'not-allowed',
                                                    opacity: log.status === 'approved' ? 1 : 0.5,
                                                    background: log.paymentStatus === 'paid' ? '#dbeafe' : '#f3f4f6',
                                                    color: log.paymentStatus === 'paid' ? '#1d4ed8' : '#6b7280'
                                                }}
                                            >
                                                <option value="pending">⏳ Ödeme Bekliyor</option>
                                                <option value="paid">✅ Ödendi</option>
                                            </select>
                                        </td>
                                    </tr>
                                    {expandedLogId === log.id && (
                                        <tr key={`${log.id}-details`} style={{ background: '#f8fafc' }}>
                                            <td colSpan={8} style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: 'none' }}>
                                                <div style={{
                                                    background: 'white',
                                                    borderRadius: '12px',
                                                    padding: '1.5rem',
                                                    border: '1px solid #e5e7eb',
                                                    marginTop: '0.5rem',
                                                    marginLeft: '40px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                                }}>
                                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#11142D', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <FileText size={16} color="#4f46e5" />
                                                            Hizmet Detayları
                                                            {log.lastEditorRole === 'admin' && (
                                                                <span style={{
                                                                    fontSize: '0.7rem',
                                                                    background: '#e0e7ff',
                                                                    color: '#4338ca',
                                                                    padding: '0.1rem 0.4rem',
                                                                    borderRadius: '4px',
                                                                    fontWeight: 500
                                                                }}>
                                                                    (admin tarafından güncellendi)
                                                                </span>
                                                            )}
                                                        </div>
                                                        {editingLogId !== log.id && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleEditClick(log); }}
                                                                style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                                    color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                                    fontSize: '0.8rem', fontWeight: 500
                                                                }}
                                                            >
                                                                <Edit3 size={14} /> Düzenle
                                                            </button>
                                                        )}
                                                    </h4>

                                                    {editingLogId === log.id ? (
                                                        <form action={async (formData) => {
                                                            formData.append('logId', log.id);
                                                            await updateServiceLogDetails(formData);
                                                            setEditingLogId(null);
                                                            setEditNotes('');
                                                        }}>
                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                                                                    Notlar (Düzenle)
                                                                </label>
                                                                <textarea
                                                                    name="notes"
                                                                    value={editNotes}
                                                                    onChange={(e) => setEditNotes(e.target.value)}
                                                                    style={{
                                                                        width: '100%',
                                                                        minHeight: '100px',
                                                                        padding: '0.75rem',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid #e5e7eb',
                                                                        fontSize: '0.9rem',
                                                                        fontFamily: 'inherit',
                                                                        resize: 'vertical'
                                                                    }}
                                                                />
                                                            </div>

                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                                                                    Yeni Ekler Ekle
                                                                </label>
                                                                <FileUploader name="attachments" multiple={true} />
                                                            </div>

                                                            {/* Existing Attachments Display (Read-Only/Delete) in Edit Mode too */}
                                                            {log.attachments && log.attachments.length > 0 && (
                                                                <div style={{ marginBottom: '1.5rem' }}>
                                                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                                                        Mevcut Ekler ({log.attachments.length})
                                                                    </p>
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                                                        {log.attachments.map((url, idx) => {
                                                                            const isImage = url.startsWith('data:image') || url.match(/\.(jpeg|jpg|gif|png)$/) != null;
                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    style={{
                                                                                        width: '80px',
                                                                                        height: '80px',
                                                                                        borderRadius: '8px',
                                                                                        overflow: 'hidden',
                                                                                        border: '1px solid #e5e7eb',
                                                                                        position: 'relative',
                                                                                        background: '#f9fafb',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                    }}
                                                                                >
                                                                                    <button
                                                                                        type="button"
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
                                                                                            top: 2,
                                                                                            right: 2,
                                                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                                                            borderRadius: '50%',
                                                                                            width: 20,
                                                                                            height: 20,
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
                                                                                        <X size={12} />
                                                                                    </button>
                                                                                    {isImage ? (
                                                                                        <img src={url} alt={`Attachment ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                                    ) : (
                                                                                        <File size={20} color="#9ca3af" />
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCancelEdit}
                                                                    style={{
                                                                        padding: '0.6rem 1.25rem',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid #e5e7eb',
                                                                        background: 'white',
                                                                        color: '#374151',
                                                                        fontSize: '0.85rem',
                                                                        fontWeight: 600,
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    İptal
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    style={{
                                                                        padding: '0.6rem 1.25rem',
                                                                        borderRadius: '8px',
                                                                        border: 'none',
                                                                        background: '#4f46e5',
                                                                        color: 'white',
                                                                        fontSize: '0.85rem',
                                                                        fontWeight: 600,
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.5rem'
                                                                    }}
                                                                >
                                                                    <Save size={16} />
                                                                    Değişiklikleri Kaydet
                                                                </button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <>
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
                                                                            const isImage = url.startsWith('data:image') || url.match(/\.(jpeg|jpg|gif|png)$/) != null;
                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        if (isImage) openLightbox(url);
                                                                                    }}
                                                                                    style={{
                                                                                        width: '100px',
                                                                                        height: '100px',
                                                                                        borderRadius: '8px',
                                                                                        overflow: 'hidden',
                                                                                        border: '1px solid #e5e7eb',
                                                                                        position: 'relative',
                                                                                        cursor: isImage ? 'zoom-in' : 'default',
                                                                                        background: '#f9fafb',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                    }}
                                                                                    className="group"
                                                                                >
                                                                                    {/* Delete Button */}
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

                                                                                    {isImage ? (
                                                                                        <img src={url} alt={`Attachment ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                                    ) : (
                                                                                        <div style={{ textAlign: 'center' }}>
                                                                                            <File size={24} color="#9ca3af" style={{ margin: '0 auto 0.25rem auto' }} />
                                                                                            <span style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block' }}>Dosya</span>
                                                                                        </div>
                                                                                    )}
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
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#B2B3BD' }}>Kayıt bulunamadı.</td></tr>
                            )}
                        </tbody>
                    </table>
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
        </div>
    );
}
