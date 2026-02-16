'use client';

import React, { useState, useEffect } from 'react';
import { getServiceNote, saveServiceNote } from '@/app/actions/service-notes';
import { Save, Loader2, FileText } from 'lucide-react';
import Skeleton from './Skeleton';

interface ServiceNoteCardProps {
    studentId: string;
    serviceType: string; // 'accommodation' | 'life_support'
}

export default function ServiceNoteCard({ studentId, serviceType }: ServiceNoteCardProps) {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        loadNote();
    }, [studentId, serviceType]);

    const loadNote = async () => {
        setLoading(true);
        const res = await getServiceNote(studentId, serviceType);
        if (res.success && res.data) {
            setNote(res.data.note || '');
            setLastSaved(res.data.updatedAt);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const res = await saveServiceNote(studentId, serviceType, note);
        if (res.success) {
            setLastSaved(new Date().toISOString());
        } else {
            alert('Not kaydedilirken hata oluştu: ' + res.error);
        }
        setSaving(false);
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} color="#3b82f6" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', color: '#11142D', fontWeight: 600 }}>Açıklamalar</h3>
                        <p style={{ fontSize: '0.75rem', color: '#808191' }}>Bu hizmet ile ilgili notlar</p>
                    </div>
                </div>
                {lastSaved && (
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        Son kayıt: {new Date(lastSaved).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>

            {loading ? (
                <div style={{ padding: '0.5rem' }}>
                    <Skeleton height="120px" />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                        <Skeleton width="80px" height="36px" />
                    </div>
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Notlarınızı buraya girebilirsiniz..."
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            resize: 'vertical',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.25rem',
                                background: '#3b82f6',
                                color: 'white',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
