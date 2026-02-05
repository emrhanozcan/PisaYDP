'use client';

import { Download, Filter } from "lucide-react";
import { useState } from "react";

interface PayoutData {
    mentorId: string;
    mentorName: string;
    totalLogs: number;
    totalAmount: number;
    breakdown: Record<string, number>;
}

export default function PayoutsClient({ data }: { data: PayoutData[] }) {
    const [month, setMonth] = useState('2026-01');

    const handleExport = () => {
        // ... (Export logic remains same)
        const headers = ["Mentor", "Toplam Hizmet", "Toplam Tutar", "Detaylar"];
        const rows = data.map(d => [
            d.mentorName,
            d.totalLogs,
            d.totalAmount.toFixed(2),
            Object.entries(d.breakdown).map(([k, v]) => `${k}: ${v}`).join('; ')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(c => `"${c}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `hakedis_raporu_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: '#11142D', marginBottom: '0.5rem' }}>Ödemeler ve Raporlar</h1>
                    <p style={{ color: '#808191' }}>Mentor hakedişlerini görüntüleyin ve yönetin.</p>
                </div>
                <button onClick={handleExport} className="btn" style={{
                    background: 'white',
                    border: '1px solid #E4E5E7',
                    color: '#11142D',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Download size={18} />
                    <span>Excel/CSV İndir</span>
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: '#F9FAFC',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    border: '1px solid #F0F0F0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#808191', fontWeight: 600 }}>
                        <Filter size={20} />
                        <span>Filtrele:</span>
                    </div>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#1a56db',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="2026-01">Ocak 2026</option>
                        <option value="2025-12">Aralık 2025</option>
                    </select>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Mentor</th>
                                <th style={{ width: '15%' }}>Toplam Hizmet</th>
                                <th style={{ width: '35%' }}>Hizmet Detayı</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>Hakediş</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr key={row.mentorId} style={{ transition: 'background 0.2s' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {row.mentorName.charAt(0)}
                                            </div>
                                            <span style={{ color: '#11142D', fontWeight: 600 }}>{row.mentorName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            background: '#eff6ff',
                                            color: '#2563eb',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {row.totalLogs} Kayıt
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {Object.entries(row.breakdown).map(([k, v]) => (
                                                <span key={k} style={{ fontSize: '0.8rem', color: '#808191', border: '1px solid #f0f0f0', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                                                    {k} <strong style={{ color: '#11142D' }}>({v})</strong>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: '#11142D' }}>
                                        {row.totalAmount.toFixed(2)} €
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span className="status-badge" style={{ background: '#fff7ed', color: '#c2410c' }}>İşleniyor</span>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#B2B3BD' }}>Veri yok.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
