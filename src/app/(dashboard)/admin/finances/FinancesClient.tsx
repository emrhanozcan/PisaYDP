'use client';

import { useState, useTransition } from 'react';
import { 
    Receipt, CheckCircle, XCircle, Search, Filter, Download, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import Toast, { ToastType } from '@/components/common/Toast';
import { updateMentorTransactionStatus } from '@/app/actions/admin-finances';

interface Transaction {
    id: string;
    mentorId: string;
    mentorName: string;
    type: 'expense' | 'advance' | 'payment';
    amount: number;
    description: string;
    receiptUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

interface FinancesClientProps {
    transactions: Transaction[];
}

export default function FinancesClient({ transactions }: FinancesClientProps) {
    const [isPending, startTransition] = useTransition();
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            await updateMentorTransactionStatus(id, newStatus);
            setToast({ message: "İşlem durumu başarıyla güncellendi.", type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || "Bir hata oluştu.", type: 'error' });
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        const matchesSearch = t.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#11142D', marginBottom: '0.5rem' }}>
                        Masraf & Avans Yönetimi
                    </h1>
                    <p style={{ color: '#808191', fontSize: '1rem' }}>
                        Mentorların oluşturduğu masraf ve avans taleplerini görüntüleyin ve yönetin.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                    <input
                        type="text"
                        placeholder="Mentor adı veya açıklama ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.95rem' }}
                    />
                </div>
                
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    style={{ padding: '0.85rem 1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '0.95rem', minWidth: '150px' }}
                >
                    <option value="all">Tüm Durumlar</option>
                    <option value="pending">Bekleyenler</option>
                    <option value="approved">Onaylananlar</option>
                    <option value="rejected">Reddedilenler</option>
                </select>
            </div>

            {/* Transactions Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tarih</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Mentor</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tür</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Açıklama</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tutar</th>
                                <th style={{ textAlign: 'center', padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Statü</th>
                                <th style={{ textAlign: 'center', padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Fiş</th>
                                <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                                        Eşleşen işlem bulunamadı.
                                    </td>
                                </tr>
                            ) : filteredTransactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: '#334155' }}>
                                        {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                                        {t.mentorName}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {t.type === 'expense' ? (
                                            <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ArrowUpRight size={14} /> Masraf</span>
                                        ) : t.type === 'advance' ? (
                                            <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ArrowDownRight size={14} /> Avans</span>
                                        ) : (
                                            <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Ödeme</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: '#64748b', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.description}>
                                        {t.description || '-'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                                        €{Number(t.amount).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                                            background: t.status === 'approved' ? '#dcfce7' : t.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            color: t.status === 'approved' ? '#166534' : t.status === 'rejected' ? '#991b1b' : '#92400e'
                                        }}>
                                            {t.status === 'approved' ? 'Onaylandı' : t.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                        {t.receiptUrl ? (
                                            <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', transition: 'background 0.2s', textDecoration: 'none' }} title="Fişi Görüntüle">
                                                <Download size={16} />
                                            </a>
                                        ) : <span style={{ color: '#9ca3af' }}>-</span>}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        {t.status === 'pending' ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => startTransition(() => handleUpdateStatus(t.id, 'approved'))}
                                                    disabled={isPending}
                                                    style={{ 
                                                        display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', borderRadius: '8px', 
                                                        border: 'none', background: '#ecfdf5', color: '#059669', fontSize: '0.8rem', fontWeight: 600, 
                                                        cursor: isPending ? 'not-allowed' : 'pointer', transition: 'background 0.2s' 
                                                    }}
                                                    title="Onayla"
                                                >
                                                    <CheckCircle size={16} /> Onayla
                                                </button>
                                                <button 
                                                    onClick={() => startTransition(() => handleUpdateStatus(t.id, 'rejected'))}
                                                    disabled={isPending}
                                                    style={{ 
                                                        display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', borderRadius: '8px', 
                                                        border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, 
                                                        cursor: isPending ? 'not-allowed' : 'pointer', transition: 'background 0.2s' 
                                                    }}
                                                    title="Reddet"
                                                >
                                                    <XCircle size={16} /> Reddet
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>
                                                İşlem Yapıldı
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
