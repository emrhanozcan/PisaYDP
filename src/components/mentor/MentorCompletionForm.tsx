'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Send } from "lucide-react";
import { updateServiceLogDetails } from "@/app/actions/service-logs";
import FileUploader from "@/components/common/FileUploader";

interface ServiceLog {
    id: string;
    serviceTypeId: string;
    date: string;
    notes?: string;
    status: string;
    unitPrice?: number;
}

interface ServiceType {
    id: string;
    name: string;
    unitPrice?: number;
}

interface Props {
    logs: ServiceLog[];
    serviceTypes: ServiceType[];
}

export default function MentorCompletionForm({ logs, serviceTypes }: Props) {
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const assignedLogs = logs.filter(l => l.status === 'assigned' || l.status === 'returned');

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid #6366f1', minHeight: '220px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={22} color="#6366f1" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Bekleyen Görevlerim</h2>
                    <p style={{ fontSize: '0.8rem', color: '#808191' }}>Yönetimin size atadığı aktif görevleri buradan yönetin</p>
                </div>
            </div>

            {assignedLogs.length === 0 ? (
                <div style={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    background: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px dashed #e2e8f0',
                    textAlign: 'center'
                }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <CheckCircle size={24} color="#059669" style={{ opacity: 0.5 }} />
                    </div>
                    <p style={{ color: '#1f2937', fontWeight: 600, fontSize: '0.95rem' }}>Harika! Bekleyen görev yok.</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>Yönetici size yeni bir servis atadığında burada görünecektir.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assignedLogs.map(log => {
                        const type = serviceTypes.find(t => t.id === log.serviceTypeId);
                        const isEditing = editingLogId === log.id;

                        return (
                            <div key={log.id} style={{ 
                                background: isEditing ? '#fff' : '#f8fafc', 
                                borderRadius: '16px', 
                                border: isEditing ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                padding: '1.25rem',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ 
                                            width: 40, height: 40, borderRadius: 10, 
                                            background: log.status === 'returned' ? '#fef2f2' : '#eef2ff', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                        }}>
                                            <Clock size={20} color={log.status === 'returned' ? '#dc2626' : '#6366f1'} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#11142D' }}>
                                                {log.status === 'returned' && <span style={{ color: '#dc2626' }}>[REVİZYON] </span>}
                                                {type?.name}
                                            </h3>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                Atanma: {new Date(log.date).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <button 
                                            onClick={() => setEditingLogId(log.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '10px',
                                                background: '#6366f1',
                                                color: 'white',
                                                border: 'none',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Görevi Tamamla
                                        </button>
                                    )}
                                </div>

                                {isEditing && (
                                    <form 
                                        action={updateServiceLogDetails} 
                                        onSubmit={() => setIsSubmitting(true)}
                                        style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                                    >
                                        <input type="hidden" name="logId" value={log.id} />
                                        
                                        {log.notes && (
                                            <div style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '10px', fontSize: '0.85rem', color: '#92400e', border: '1px solid #fde68a' }}>
                                                <strong>Yönetici Notu:</strong> {log.notes}
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                                    Harcanan Süre (Dakika) *
                                                </label>
                                                <input 
                                                    type="number" 
                                                    name="duration" 
                                                    required 
                                                    className="input-field" 
                                                    placeholder="Örn: 45"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                                    Hizmet Ücreti (€)
                                                </label>
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    name="unitPrice" 
                                                    className="input-field" 
                                                    defaultValue={log.unitPrice !== undefined ? log.unitPrice : type?.unitPrice}
                                                    placeholder="Örn: 100"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                                Hizmet Notları & Detaylar *
                                            </label>
                                            <textarea
                                                name="notes"
                                                required
                                                rows={3}
                                                className="input-field"
                                                placeholder="Neler yapıldı? Örn: Öğrenci ile görüşüldü..."
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                                Dosya Yükle
                                            </label>
                                            <FileUploader name="attachments" multiple={true} />
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => setEditingLogId(null)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    borderRadius: '12px',
                                                    border: '1px solid #d1d5db',
                                                    background: 'white',
                                                    color: '#374151',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Vazgeç
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                style={{
                                                    flex: 2,
                                                    padding: '0.75rem',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    background: '#6366f1',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                    opacity: isSubmitting ? 0.7 : 1
                                                }}
                                            >
                                                {isSubmitting ? 'Gönderiliyor...' : <><Send size={18} /> Onaya Gönder</>}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
