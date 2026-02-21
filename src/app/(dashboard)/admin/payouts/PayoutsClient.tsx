'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Calendar, Download, Filter, ArrowUpDown, BarChart3, PieChart, TrendingUp, DollarSign, Users } from "lucide-react";
import { updatePaymentStatus, updateServiceLogStatus } from "@/app/actions/admin";

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
        return sortOrder === 'desc' ? -comparison : comparison;
    });

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

    const handleExportExcel = () => {
        const headers = ["Tarih", "Öğrenci", "Mentor", "Hizmet", "Ücret (€)", "Hizmet Durumu", "Ödeme Durumu"];
        const rows = filteredLogs.map(log => [
            new Date(log.date).toLocaleDateString('tr-TR'),
            log.studentName,
            log.mentorName,
            log.serviceName,
            log.servicePrice.toFixed(2),
            log.status === 'approved' ? 'Onaylandı' : log.status === 'rejected' ? 'Reddedildi' : log.status === 'submitted' ? 'Bekliyor' : 'Taslak',
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

                        {/* Month Filter */}
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
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
                    <table className="table" style={{ minWidth: '1000px' }}>
                        <thead>
                            <tr>
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
                                <tr key={log.id}>
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
                                    <td style={{ textAlign: 'center' }}>
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
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#B2B3BD' }}>Kayıt bulunamadı.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
