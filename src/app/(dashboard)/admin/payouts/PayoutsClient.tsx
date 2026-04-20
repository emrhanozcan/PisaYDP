'use client';

import { useState, useTransition, useMemo } from 'react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText, Search, Calendar, Download, Filter, ArrowUpRight, ArrowDownLeft, Wallet, MoreHorizontal,
    ArrowUpDown, BarChart3, PieChart, TrendingUp, DollarSign, Users, ChevronDown, ChevronUp, X, File,
    Edit, Plus, CheckCircle, Award, Image as ImageIcon, ChevronLeft, ChevronRight
} from "lucide-react";
import * as XLSX from 'xlsx';
import { updatePaymentStatus, updateServiceLogStatus } from "@/app/actions/admin";
import { updateServiceLogDetails } from "@/app/actions/service-logs"; // New simplified action
import { deleteServiceLogAttachment } from "@/app/actions/shared";
import Toast, { ToastType } from '@/components/common/Toast';

interface LogData {
    id: string;
    studentId: string;
    studentName: string;
    studentPhotoUrl?: string; // Add photo url
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
}

interface Props {
    logs: LogData[];
    serviceTypes: { id: string; name: string }[];
    mentors: { id: string; name: string }[];
}

type SortKey = 'date' | 'mentor' | 'student' | 'service' | 'price' | 'status' | 'paymentStatus';
type SortOrder = 'asc' | 'desc';

export default function PayoutsClient({ logs, serviceTypes, mentors }: Props) {
    const [search, setSearch] = useState('');
    const [filterMentor, setFilterMentor] = useState('all');
    const [filterService, setFilterService] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<LogData | null>(null);
    const [editNotes, setEditNotes] = useState('');
    const [editPrice, setEditPrice] = useState<number>(0);
    const [editDuration, setEditDuration] = useState<number>(0);
    const [editAttachments, setEditAttachments] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedLogId(expandedLogId === id ? null : id);
    };

    const openLightbox = (url: string) => {
        setLightboxImage(url);
    };

    const closeLightbox = () => {
        setLightboxImage(null);
    };

    const openEditModal = (log: LogData, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingLog(log);
        setEditNotes(log.notes || '');
        setEditPrice(log.servicePrice || 0);
        setEditDuration(log.durationMinutes || 0);
        setEditAttachments([]);
        setIsEditModalOpen(true);
    };

    const closeEditModalWithCleanup = () => {
        setIsEditModalOpen(false);
        setEditingLog(null);
        setEditNotes('');
        setEditPrice(0);
        setEditDuration(0);
        setEditAttachments([]);
        setIsSubmitting(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setEditAttachments(Array.from(e.target.files));
        }
    };

    const handleUpdateLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLog) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('logId', editingLog.id);
            formData.append('notes', editNotes);
            formData.append('unitPrice', editPrice.toString());
            formData.append('duration', editDuration.toString());

            editAttachments.forEach(file => {
                formData.append('attachments', file);
            });

            await updateServiceLogDetails(formData);
            setToast({ message: '✅ Hizmet kaydı güncellendi!', type: 'success' });
            closeEditModalWithCleanup();
            router.refresh(); // Refresh to show new data
        } catch (error: unknown) {
            console.error('Update error:', error);
            setToast({ message: `❌ Hata: ${(error as Error).message}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAttachment = async (logId: string, url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) return;

        try {
            await deleteServiceLogAttachment(logId, url);
            setToast({ message: '✅ Dosya silindi', type: 'success' });
            router.refresh();
        } catch (error: unknown) {
            setToast({ message: '❌ Silinemedi', type: 'error' });
        }
    };

    // Get unique months from logs
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        logs.forEach(log => {
            const date = new Date(log.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(monthKey);
        });
        return Array.from(months).sort().reverse();
    }, [logs]);

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

        // Month filter
        let matchesMonth = true;
        if (filterMonth !== 'all') {
            const date = new Date(log.date);
            const logMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            matchesMonth = logMonth === filterMonth;
        }

        return matchesSearch && matchesMentor && matchesService && matchesStatus && matchesPayment && matchesMonth;
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
        
        if (comparison !== 0) {
            return sortOrder === 'desc' ? -comparison : comparison;
        }

        // Secondary stable sort by createdAt (Newest first)
        const timeA = new Date((a as any).createdAt || 0).getTime();
        const timeB = new Date((b as any).createdAt || 0).getTime();
        return timeB - timeA;
    });

    // Paginate logs
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination on filter change
    const onFilterChange = (setter: (val: any) => void) => (e: any) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const approvedLogs = filteredLogs.filter(l => l.status === 'approved');
        const paidLogs = approvedLogs.filter(l => l.paymentStatus === 'paid');
        const pendingPaymentLogs = approvedLogs.filter(l => l.paymentStatus !== 'paid');

        const totalApproved = approvedLogs.reduce((sum, l) => sum + l.servicePrice, 0);
        const totalPaid = paidLogs.reduce((sum, l) => sum + l.servicePrice, 0);
        const totalPendingPayment = pendingPaymentLogs.reduce((sum, l) => sum + l.servicePrice, 0);

        // By mentor
        const byMentor: Record<string, { name: string; total: number; count: number }> = {};
        approvedLogs.forEach(log => {
            if (!byMentor[log.mentorId]) {
                byMentor[log.mentorId] = { name: log.mentorName, total: 0, count: 0 };
            }
            byMentor[log.mentorId].total += log.servicePrice;
            byMentor[log.mentorId].count++;
        });

        // By service
        const byService: Record<string, { name: string; total: number; count: number }> = {};
        approvedLogs.forEach(log => {
            if (!byService[log.serviceTypeId]) {
                byService[log.serviceTypeId] = { name: log.serviceName, total: 0, count: 0 };
            }
            byService[log.serviceTypeId].total += log.servicePrice;
            byService[log.serviceTypeId].count++;
        });

        return {
            totalApproved,
            totalPaid,
            totalPendingPayment,
            approvedCount: approvedLogs.length,
            paidCount: paidLogs.length,
            pendingCount: pendingPaymentLogs.length,
            byMentor: Object.values(byMentor).sort((a, b) => b.total - a.total),
            byService: Object.values(byService).sort((a, b) => b.total - a.total)
        };
    }, [filteredLogs]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    const handleStatusChange = (logId: string, newStatus: 'approved' | 'rejected' | 'submitted' | 'returned' | 'assigned') => {
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

    const handleExportExcel = () => {
        const headers = ["Tarih", "Öğrenci", "Mentor", "Hizmet", "Ücret (€)", "Hizmet Durumu", "Ödeme Durumu"];
        const rows = filteredLogs.map(log => [
            new Date(log.date).toLocaleDateString('tr-TR'),
            log.studentName,
            log.mentorName,
            log.serviceName,
            log.servicePrice.toFixed(2),
            log.status === 'approved' ? 'Onaylandı' : log.status === 'rejected' ? 'Reddedildi' : log.status === 'submitted' ? 'Bekliyor' : log.status === 'assigned' ? 'Atandı' : 'Taslak',
            log.paymentStatus === 'paid' ? 'Ödendi' : 'Bekliyor'
        ]);

        // Add summary
        rows.push([]);
        rows.push(['ÖZET']);
        rows.push(['Toplam Onaylı', '', '', '', stats.totalApproved.toFixed(2)]);
        rows.push(['Toplam Ödenen', '', '', '', stats.totalPaid.toFixed(2)]);
        rows.push(['Ödeme Bekleyen', '', '', '', stats.totalPendingPayment.toFixed(2)]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(c => `"${c}"`).join(','))
        ].join('\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `odeme_raporu_${filterMonth || 'tum'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getMonthName = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
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

    const maxMentorTotal = stats.byMentor[0]?.total || 1;
    const maxServiceTotal = stats.byService[0]?.total || 1;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: '#11142D', marginBottom: '0.5rem' }}>Ödemeler & Rapor</h1>
                    <p style={{ color: '#808191' }}>Mentor hakedişlerini görüntüleyin ve yönetin. ({filteredLogs.length} kayıt)</p>
                </div>
                <button
                    onClick={handleExportExcel}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    <Download size={18} />
                    Excel İndir
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={22} color="#059669" />
                        </div>
                        <div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>€{stats.totalApproved.toFixed(0)}</p>
                            <p style={{ fontSize: '0.8rem', color: '#808191' }}>Toplam Onaylı</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={22} color="#1d4ed8" />
                        </div>
                        <div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d4ed8' }}>€{stats.totalPaid.toFixed(0)}</p>
                            <p style={{ fontSize: '0.8rem', color: '#808191' }}>Ödenen</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={22} color="#b45309" />
                        </div>
                        <div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b45309' }}>€{stats.totalPendingPayment.toFixed(0)}</p>
                            <p style={{ fontSize: '0.8rem', color: '#808191' }}>Ödeme Bekliyor</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={22} color="#6b7280" />
                        </div>
                        <div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#11142D' }}>{stats.approvedCount}</p>
                            <p style={{ fontSize: '0.8rem', color: '#808191' }}>Onaylı Hizmet</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Mentor Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <BarChart3 size={18} color="#1a56db" />
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#11142D' }}>Mentör Bazlı Hakediş</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {stats.byMentor.slice(0, 5).map((mentor, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#374151' }}>{mentor.name}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>€{mentor.total.toFixed(0)}</span>
                                </div>
                                <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(mentor.total / maxMentorTotal) * 100}%`,
                                        background: 'linear-gradient(90deg, #059669, #10b981)',
                                        borderRadius: 4
                                    }} />
                                </div>
                            </div>
                        ))}
                        {stats.byMentor.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>Veri yok</p>
                        )}
                    </div>
                </div>

                {/* Service Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <PieChart size={18} color="#8b5cf6" />
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#11142D' }}>Hizmet Bazlı Dağılım</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {stats.byService.slice(0, 5).map((service, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#374151' }}>{service.name} ({service.count})</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8b5cf6' }}>€{service.total.toFixed(0)}</span>
                                </div>
                                <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(service.total / maxServiceTotal) * 100}%`,
                                        background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                                        borderRadius: 4
                                    }} />
                                </div>
                            </div>
                        ))}
                        {stats.byService.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>Veri yok</p>
                        )}
                    </div>
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
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
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

                        {/* Month Filter */}
                        <select
                            value={filterMonth}
                            onChange={onFilterChange(setFilterMonth)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #1a56db',
                                background: '#eff6ff',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                color: '#1a56db'
                            }}
                        >
                            <option value="all">📅 Tüm Aylar</option>
                            {availableMonths.map(month => (
                                <option key={month} value={month}>{getMonthName(month)}</option>
                            ))}
                        </select>

                        {/* Mentor Filter */}
                        <select
                            value={filterMentor}
                            onChange={onFilterChange(setFilterMentor)}
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
                            onChange={onFilterChange(setFilterService)}
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
                            onChange={onFilterChange(setFilterStatus)}
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
                            onChange={onFilterChange(setFilterPayment)}
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
                        {(filterMentor !== 'all' || filterService !== 'all' || filterStatus !== 'all' || filterPayment !== 'all' || filterMonth !== 'all' || search !== '') && (
                            <button
                                onClick={() => {
                                    setFilterMentor('all');
                                    setFilterService('all');
                                    setFilterStatus('all');
                                    setFilterPayment('all');
                                    setFilterMonth('all');
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
                    <table className="table" style={{ minWidth: '1000px', borderCollapse: 'collapse' }}>
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
                            {paginatedLogs.map(log => (
                                <Fragment key={log.id}>
                                    <tr
                                        key={log.id}
                                        style={{
                                            cursor: 'pointer',
                                            background: expandedLogId === log.id ? '#f8fafc' : 'transparent',
                                            borderBottom: '1px solid #f1f5f9'
                                        }}
                                        onClick={() => toggleExpand(log.id)}
                                    >
                                        <td style={{ textAlign: 'center' }}>
                                            {expandedLogId === log.id ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#9ca3af" />}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fbf1f1', color: '#CD212A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FileText size={16} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600, color: '#11142D', fontSize: '0.85rem' }}>{log.serviceName}</span>
                                                    <span
                                                        onClick={(e) => openEditModal(log, e)}
                                                        style={{ fontSize: '0.7rem', color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}
                                                    >
                                                        <Edit size={10} /> Düzenle
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {log.studentPhotoUrl ? (
                                                    <img
                                                        src={log.studentPhotoUrl}
                                                        alt={log.studentName}
                                                        style={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: '50%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
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
                                                )}
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
                                            <select
                                                value={log.status}
                                                onChange={(e) => handleStatusChange(log.id, e.target.value as 'approved' | 'rejected' | 'submitted')}
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
                                            <select
                                                value={log.paymentStatus || 'pending'}
                                                onChange={(e) => handlePaymentChange(log.id, e.target.value as 'pending' | 'paid')}
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
                                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#11142D', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <FileText size={16} color="#4f46e5" />
                                                        Hizmet Detayları
                                                    </h4>

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
                                                                {log.attachments.map((url, idx) => (
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
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={url}
                                                                            alt={`Attachment ${idx + 1}`}
                                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                            onError={(e) => {
                                                                                e.currentTarget.style.display = 'none';
                                                                                if (e.currentTarget.parentElement) {
                                                                                    e.currentTarget.parentElement.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg><span style="font-size:0.6rem;color:#6b7280;margin-top:0.25rem">Dosya</span></div>';
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
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
                            {filteredLogs.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#B2B3BD' }}>Kayıt bulunamadı.</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.25rem 1.5rem',
                            borderTop: '1px solid #f1f5f9',
                            background: '#f8fafc',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Toplam <b>{filteredLogs.length}</b> kayıttan <b>{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)}</b> arası gösteriliyor
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        background: 'white',
                                        color: currentPage === 1 ? '#9ca3af' : '#374151',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <ChevronLeft size={16} /> Önceki
                                </button>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        // Show first, last, and pages around current
                                        if (
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        border: '1px solid',
                                                        borderColor: currentPage === pageNum ? '#4f46e5' : '#e5e7eb',
                                                        background: currentPage === pageNum ? '#4f46e5' : 'white',
                                                        color: currentPage === pageNum ? 'white' : '#374151',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        }
                                        if (
                                            (pageNum === 2 && currentPage > 3) ||
                                            (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                        ) {
                                            return <span key={pageNum} style={{ padding: '0 0.25rem', color: '#9ca3af' }}>...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        background: 'white',
                                        color: currentPage === totalPages ? '#9ca3af' : '#374151',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Sonraki <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
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
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        zIndex: 10
                    }}
                        onClick={closeLightbox}
                    >
                        <X size={32} color="white" style={{ cursor: 'pointer' }} />
                    </div>
                    <img
                        src={lightboxImage}
                        alt="Full view"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingLog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }} onClick={closeEditModalWithCleanup}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#11142D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Edit size={20} color="#4f46e5" />
                                Hizmet Kaydını Düzenle
                            </h2>
                            <button onClick={closeEditModalWithCleanup} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="#6b7280" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateLog}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                                    Hizmet Notları
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm min-h-[120px]"
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Hizmet detaylarını buraya girin..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '0.9rem',
                                        minHeight: '120px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                                        Birim Ücret (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                                        Süre (Dakika)
                                    </label>
                                    <input
                                        type="number"
                                        value={editDuration}
                                        onChange={(e) => setEditDuration(parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                                    Mevcut Ekler
                                </label>
                                {editingLog.attachments && editingLog.attachments.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        {editingLog.attachments.map((url, idx) => (
                                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                <img
                                                    src={url}
                                                    alt="Attachment"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteAttachment(editingLog.id, url, e)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: -5,
                                                        right: -5,
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: '20px',
                                                        height: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>Ekli dosya yok.</p>
                                )}
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                                    Yeni Dosya Ekle
                                </label>
                                <div style={{
                                    border: '2px dashed #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    background: '#f9fafb',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Plus size={20} color="#1d4ed8" />
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>
                                            {editAttachments.length > 0
                                                ? `${editAttachments.length} dosya seçildi`
                                                : "Dosya seçmek için tıklayın veya sürükleyin"}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                            PNG, JPG, PDF (Max 5MB)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={closeEditModalWithCleanup}
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb',
                                        background: 'white',
                                        color: '#374151',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: isSubmitting ? '#93c5fd' : '#1a56db',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin">⌛</span> Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} /> Değişiklikleri Kaydet
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
