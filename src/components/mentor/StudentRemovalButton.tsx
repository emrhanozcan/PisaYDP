'use client';

import { useState, useTransition } from 'react';
import { UserMinus, AlertTriangle } from 'lucide-react';
import { requestStudentRemoval } from '@/app/actions/mentor';

export default function StudentRemovalButton({ studentId, studentName }: { studentId: string, studentName: string }) {
    const [showModal, setShowModal] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = () => {
        if (!reason.trim()) {
            setFeedback({ type: 'error', message: "Lütfen bir sebep belirtin." });
            return;
        }

        startTransition(async () => {
            try {
                const result = await requestStudentRemoval(studentId, reason);
                if (result.success) {
                    setFeedback({ type: 'success', message: result.message });
                    setTimeout(() => setShowModal(false), 2000);
                } else {
                    setFeedback({ type: 'error', message: result.message || "Bir hata oluştu." });
                }
            } catch (error) {
                setFeedback({ type: 'error', message: "Bir hata oluştu." });
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fee2e2',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    alignSelf: 'flex-start'
                }}
            >
                <UserMinus size={16} />
                Öğrenciyi Çıkar
            </button>

            {showModal && (
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem', textAlign: 'center' }}>
                            Öğrenciyi Çıkarma Talebi
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                            {studentName} adlı öğrenciyi listenizden kaldırmak istediğinize emin misiniz? Bu talep yöneticilere iletilecektir.
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                Sebep / Açıklama *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem'
                                }}
                                placeholder="Örn: Danışmanlık süreci tamamlandı..."
                            />
                        </div>

                        {feedback && (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.85rem',
                                background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: feedback.type === 'success' ? '#047857' : '#b91c1c'
                            }}>
                                {feedback.message}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isPending}
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
                                onClick={handleSubmit}
                                disabled={isPending}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '8px',
                                    backgroundColor: '#dc2626',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 500,
                                    cursor: isPending ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem',
                                    opacity: isPending ? 0.7 : 1
                                }}
                            >
                                {isPending ? 'Gönderiliyor...' : 'Talep Gönder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
