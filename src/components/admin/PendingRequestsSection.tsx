'use client';

import { useState, useTransition } from 'react';
import { UserMinus, CheckCircle, XCircle } from 'lucide-react';
import { processRemovalRequest } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function PendingRequestsSection({ requests }: { requests: any[] }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleProcess = (ticketId: string, approved: boolean) => {
        startTransition(async () => {
            try {
                await processRemovalRequest(ticketId, approved);
                router.refresh();
            } catch (error) {
                console.error("Failed to process request:", error);
                alert("İşlem sırasında bir hata oluştu.");
            }
        });
    };

    if (!requests || requests.length === 0) return null;

    return (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '1.5rem', border: '1px solid #fee2e2' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <UserMinus size={20} /> Bekleyen Mentor İstekleri
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requests.map((req) => (
                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '12px' }}>
                        <div>
                            <p style={{ fontWeight: '600', color: '#1f2937' }}>{req.subject}</p>
                            <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                                {req.description}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                {new Date(req.createdAt).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => handleProcess(req.id, true)}
                                disabled={isPending}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    padding: '0.5rem 1rem', borderRadius: '8px',
                                    background: '#059669', color: 'white', border: 'none',
                                    fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                                    opacity: isPending ? 0.7 : 1
                                }}
                            >
                                <CheckCircle size={16} /> Onayla
                            </button>
                            <button
                                onClick={() => handleProcess(req.id, false)}
                                disabled={isPending}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    padding: '0.5rem 1rem', borderRadius: '8px',
                                    background: 'white', color: '#dc2626', border: '1px solid #dc2626',
                                    fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                                    opacity: isPending ? 0.7 : 1
                                }}
                            >
                                <XCircle size={16} /> Reddet
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
