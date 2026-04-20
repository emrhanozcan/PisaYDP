'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Clock, Send, Trash2, Edit2 } from "lucide-react";
import { updateServiceLogDetails, deleteServiceLog } from "@/app/actions/service-logs";
import FileUploader from "@/components/common/FileUploader";

interface ServiceLog {
    id: string;
    serviceTypeId: string;
    date: string;
    notes?: string;
    status: string;
    unitPrice?: number;
    durationMinutes?: number;
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
    const router = useRouter();
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Mentors can manage assigned, returned, AND submitted logs
    const manageableLogs = logs.filter(l => l.status === 'assigned' || l.status === 'returned' || l.status === 'submitted');

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid #6366f1', minHeight: '220px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={22} color="#6366f1" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Görev & İşlem Yönetimi</h2>
                    <p style={{ fontSize: '0.8rem', color: '#808191' }}>Atanan görevleri tamamlayın veya işlemlerinizi güncelleyin</p>
                </div>
            </div>

            {manageableLogs.length === 0 ? (
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
                    <p style={{ color: '#1f2937', fontWeight: 600, fontSize: '0.95rem' }}>Şu an yönetilecek bir işlem yok.</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>Atanan görev veya bekleyen işlemleriniz burada görünecektir.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {manageableLogs.map(log => {
                        const type = serviceTypes.find(t => t.id === log.serviceTypeId);
                        const isEditing = editingLogId === log.id;

                        const handleDelete = async () => {
                            if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
                            setIsDeleting(log.id);
                            try {
                                await deleteServiceLog(log.id);
                            } catch (err) {
                                alert((err as Error).message);
                            } finally {
                                setIsDeleting(null);
                            }
                        };

                        return (
                            <div key={log.id} style={{ 
                                background: isEditing ? '#fff' : '#f8fafc', 
                                borderRadius: '16px', 
                                border: isEditing ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                padding: '1.25rem',
                                transition: 'all 0.2s ease',
                                opacity: isDeleting === log.id ? 0.5 : 1
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ 
                                            width: 40, height: 40, borderRadius: 10, 
                                            background: log.status === 'returned' ? '#fef2f2' : log.status === 'submitted' ? '#fffbeb' : '#eef2ff', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                        }}>
                                            <Clock size={20} color={log.status === 'returned' ? '#dc2626' : log.status === 'submitted' ? '#d97706' : '#6366f1'} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#11142D' }}>
                                                {log.status === 'returned' && <span style={{ color: '#dc2626' }}>[REVİZYON] </span>}
                                                {log.status === 'submitted' && <span style={{ color: '#d97706' }}>[BEKLEYEN] </span>}
                                                {type?.name}
                                            </h3>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {log.status === 'submitted' ? 'Güncelleme Tarihi: ' : 'Atanma: '}
                                                {new Date(log.date).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={handleDelete}
                                                disabled={isDeleting !== null}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '10px',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    border: 'none',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                <Trash2 size={14} /> Sil
                                            </button>
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
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                <Edit2 size={14} /> {log.status === 'submitted' ? 'Düzenle' : 'Tamamla'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <form 
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            setIsSubmitting(true);
                                            try {
                                                const formData = new FormData(e.currentTarget);
                                                await updateServiceLogDetails(formData);
                                                setEditingLogId(null);
                                                router.refresh();
                                            } catch (err) {
                                                alert((err as Error).message);
                                            } finally {
                                                setIsSubmitting(false);
                                            }
                                        }}
                                        style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                                    >
                                        <input type="hidden" name="logId" value={log.id} />
                                        <input type="hidden" name="status" value="submitted" />
                                        
                                        {log.notes && (
                                            <div style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '10px', fontSize: '0.85rem', color: '#92400e', border: '1px solid #fde68a' }}>
                                                <strong>Notlar:</strong> {log.notes}
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
                                                    defaultValue={log.durationMinutes || ''}
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
                                                defaultValue={log.notes || ''}
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
