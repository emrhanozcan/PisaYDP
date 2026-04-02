'use client';

import { useState, useTransition, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Wallet, TrendingUp, TrendingDown, Receipt, PlusCircle, CreditCard, Clock, FileText, Download
} from "lucide-react";
import Toast, { ToastType } from '@/components/common/Toast';
import { createMentorTransaction } from '@/app/actions/mentor-finances';

interface PropData {
    transactions: any[];
    balance: number;
    approvedEarnings: number;
    approvedExpenses: number;
    receivedAdvances: number;
    receivedPayments: number;
}

export default function MentorFinancesClient({ 
    transactions, balance, approvedEarnings, approvedExpenses, receivedAdvances, receivedPayments
}: PropData) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [modalOpen, setModalOpen] = useState<'expense' | 'advance' | null>(null);

    const stats = [
        { label: "Güncel Bakiye", value: `€${balance.toFixed(2)}`, icon: Wallet, color: "#059669", bg: "#ecfdf5", highlight: true },
        { label: "Onaylı Hakediş", value: `€${approvedEarnings.toFixed(2)}`, icon: TrendingUp, color: "#6366f1", bg: "#eef2ff" },
        { label: "Onaylı Masraflar", value: `€${approvedExpenses.toFixed(2)}`, icon: Receipt, color: "#f59e0b", bg: "#fef3c7" },
        { label: "Alınan Avans/Ödeme", value: `€${(receivedAdvances + receivedPayments).toFixed(2)}`, icon: TrendingDown, color: "#ef4444", bg: "#fef2f2" }
    ];

    const handleSubmit = async (formData: FormData) => {
        try {
            await createMentorTransaction(formData);
            setToast({ message: "Talebiniz başarıyla oluşturuldu.", type: 'success' });
            setModalOpen(null);
            router.refresh();
        } catch (err: any) {
            setToast({ message: err.message || "Bir hata oluştu.", type: 'error' });
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#11142D', marginBottom: '0.5rem' }}>
                        Bakiye ve Masraflar
                    </h1>
                    <p style={{ color: '#808191', fontSize: '1rem' }}>
                        Güncel bakiyenizi görüntüleyin, masraf veya avans talebinde bulunun.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setModalOpen('expense')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
                            borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.4)'
                        }}
                    >
                        <Receipt size={18} /> Masraf Gir
                    </button>
                    <button
                        onClick={() => setModalOpen('advance')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
                            borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        <CreditCard size={18} /> Avans Talep Et
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            background: stat.highlight ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'white',
                            border: stat.highlight ? '2px solid #059669' : '1px solid #e5e7eb',
                            boxShadow: stat.highlight ? '0 10px 15px -3px rgba(5, 150, 105, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                         <div style={{
                            width: 56, height: 56, borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: stat.highlight ? 'white' : stat.bg, color: stat.color
                        }}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p style={{ fontSize: stat.highlight ? '2.25rem' : '1.75rem', fontWeight: 700, color: stat.highlight ? '#059669' : '#11142D', lineHeight: 1 }}>
                                {stat.value}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#808191', marginTop: '0.35rem', fontWeight: 500 }}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Transactions Table */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={22} color="#64748b" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', color: '#11142D', fontWeight: 600 }}>Talepler ve Geçmiş İşlemler</h2>
                        <p style={{ fontSize: '0.85rem', color: '#808191' }}>Oluşturduğunuz masraf ve avans taleplerinin durumu.</p>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderRadius: '8px' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tarih</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tür</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Açıklama</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tutar</th>
                                <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Statü</th>
                                <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Fiş / Belge</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                                        Henüz bir işleminiz bulunmuyor.
                                    </td>
                                </tr>
                            ) : transactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#334155' }}>
                                        {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {t.type === 'expense' ? <span style={{ color: '#d97706' }}>Masraf</span> : 
                                         t.type === 'advance' ? <span style={{ color: '#2563eb' }}>Avans</span> : 
                                         <span style={{ color: '#059669' }}>Ödeme</span>}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                                        {t.description || '-'}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                                        €{Number(t.amount).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                                            background: t.status === 'approved' ? '#dcfce7' : t.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            color: t.status === 'approved' ? '#166534' : t.status === 'rejected' ? '#991b1b' : '#92400e'
                                        }}>
                                            {t.status === 'approved' ? 'Onaylandı' : t.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {t.receiptUrl ? (
                                            <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none' }}>
                                                <Download size={14} /> Resmi Gör
                                            </a>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#11142D', marginBottom: '1.5rem' }}>
                            {modalOpen === 'expense' ? 'Masraf Ekle' : 'Avans Talep Et'}
                        </h3>
                        <form action={(formData) => startTransition(() => handleSubmit(formData))}>
                            <input type="hidden" name="type" value={modalOpen} />
                            
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                    Tutar (€) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }} />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                    Açıklama <span style={{ color: 'red' }}>*</span>
                                </label>
                                <textarea name="description" rows={3} required placeholder="Hangi masraf / Neyin avansı?"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }} />
                            </div>

                            {modalOpen === 'expense' && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                        Fiş / Fatura Fotoğrafı (İsteğe Bağlı)
                                    </label>
                                    <input name="receipt" type="file" accept="image/*,.pdf"
                                        style={{ width: '100%', padding: '0.5rem', border: '1px dashed #d1d5db', borderRadius: '8px' }} />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: modalOpen === 'advance' ? '2rem' : 0 }}>
                                <button type="button" onClick={() => setModalOpen(null)} disabled={isPending}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}>
                                    İptal
                                </button>
                                <button type="submit" disabled={isPending}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#059669', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                    {isPending ? 'Gönderiliyor...' : 'Gönder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
