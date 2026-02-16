'use client';

import { useState } from 'react';
import { Plus, CheckCircle, X, File } from "lucide-react";
import { createServiceLog } from "@/app/actions/service-logs";

interface ServiceType {
    id: string;
    name: string;
    unitPrice: number;
}

interface Props {
    studentId: string;
    serviceTypes: ServiceType[];
}

export default function ServiceLogForm({ studentId, serviceTypes }: Props) {
    const [attachments, setAttachments] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachments(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            // Revoke old url to avoid memory leaks
            if (prev[index]) URL.revokeObjectURL(prev[index]);
            return newPreviews;
        });
    };

    return (
        <form action={createServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="studentId" value={studentId} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                        Hizmet Tipi *
                    </label>
                    <select name="serviceTypeId" required className="input-field">
                        <option value="">Seçiniz...</option>
                        {serviceTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name} (€{t.unitPrice})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                        Tarih ve Saat *
                    </label>
                    <input
                        type="datetime-local"
                        name="date"
                        required
                        className="input-field"
                        defaultValue={new Date().toISOString().slice(0, 16)}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                        Süre (Dakika)
                    </label>
                    <input type="number" name="duration" className="input-field" placeholder="Örn: 30" />
                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                        Sabit ücretli hizmetlerde boş bırakılabilir.
                    </p>
                </div>
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Notlar / Açıklama
                </label>
                <textarea
                    name="notes"
                    rows={4}
                    className="input-field"
                    placeholder="Hizmet detaylarını buraya yazın..."
                    style={{ resize: 'vertical' }}
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Görseller / Belgeler
                </label>

                {/* File Drop Area */}
                <div style={{
                    border: '2px dashed #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    marginBottom: previews.length > 0 ? '1rem' : 0
                }}>
                    {/* The actual file input - hidden but functional */}
                    <input
                        type="file"
                        // name is removed here because we will provide files via a DataTransfer or handle submission differently?
                        // Actually standard form submission with file input requires the input to have files.
                        // But React 'file' inputs can't be set programmatically easily for security.
                        // So for a pure 'form action' approach, we might need to keep the input simple.
                        // BUT if we want to delete files from the queue, we can't easily modify the input.files list.
                        // WORKAROUND: We will hide this input and use it ONLY for adding files. 
                        // But for submission, we need to append them to FormData.
                        // Since we are using a server action in `action={...}`, we can intercept the submission.
                        // OR we can just use a standard onSubmit handler and call the server action manually.
                        // Let's use `createServiceLog` as an async function in onSubmit?
                        // No, let's keep it simple: Just show previews of what's selected. 
                        // If user wants to remove, we might need a DataTransfer object to update the input.files.

                        name="attachments"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            zIndex: 2
                        }}
                    />
                    <div style={{ pointerEvents: 'none' }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#dbeafe',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.75rem auto'
                        }}>
                            <Plus size={20} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                            Dosya Yüklemek İçin Tıklayın
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            veya dosyaları buraya sürükleyin
                        </p>
                        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                            PNG, JPG, PDF (Max 5MB)
                        </p>
                    </div>
                </div>

                {/* Previews */}
                {previews.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                        {previews.map((url, idx) => {
                            // Note: This preview list is visual only. 
                            // If we can't easily remove files from the native input, the user might be confused if they click remove here but the file is still sent.
                            // To fix this without complex JS, we can use a DataTransfer to update the input's files property on every change.

                            return (
                                <div key={idx} style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                    position: 'relative',
                                    background: 'white'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Removing files from a file input is tricky.
                                            // The simplest way for this specific interaction (Server Action + Form)
                                            // might be just to clear ALL and asked to re-add, or implement a custom submission handler.
                                            // Let's implement a custom submission handler that constructs FormData manually.
                                            removeAttachment(idx);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: 2,
                                            right: 2,
                                            background: 'rgba(255,255,255,0.9)',
                                            borderRadius: '50%',
                                            width: 20,
                                            height: 20,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #fee2e2',
                                            cursor: 'pointer',
                                            color: '#ef4444',
                                            zIndex: 10
                                        }}
                                    >
                                        <X size={12} />
                                    </button>

                                    {attachments[idx]?.type.startsWith('image/') ? (
                                        <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                            <File size={24} color="#9ca3af" />
                                            <span style={{ fontSize: '0.5rem', color: '#6b7280', marginTop: '0.2rem', padding: '0 0.2rem', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {attachments[idx]?.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '0.875rem 2rem', fontSize: '0.9rem' }}
                    formAction={async (formData) => {
                        // Intercept to use our clean 'attachments' list
                        // We need to delete the original 'attachments' from the input because it might contain deleted files if we only hid them visually.
                        // But actually, we can just append our 'attachments' state to the FormData.
                        // And remove the original 'attachments' entry that came from the input.

                        formData.delete('attachments');
                        attachments.forEach(file => {
                            formData.append('attachments', file);
                        });

                        await createServiceLog(formData);
                    }}
                >
                    <CheckCircle size={18} />
                    Kaydı Oluştur ve Gönder
                </button>
            </div>
        </form>
    );
}
