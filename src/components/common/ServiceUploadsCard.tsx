'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getServiceUploads, uploadServiceFile, deleteServiceFile } from '@/app/actions/service-uploads';
import { Upload, Trash2, File, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { ServiceUpload } from '@/types';
import Skeleton from './Skeleton';

interface ServiceUploadsCardProps {
    studentId: string;
    serviceType: string; // 'accommodation' | 'life_support'
}

export default function ServiceUploadsCard({ studentId, serviceType }: ServiceUploadsCardProps) {
    const [uploads, setUploads] = useState<ServiceUpload[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadUploads();
    }, [studentId, serviceType]);

    const loadUploads = async () => {
        setLoading(true);
        const res = await getServiceUploads(studentId, serviceType);
        if (res.success && res.data) {
            setUploads(res.data);
        }
        setLoading(false);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (uploads.length >= 10) {
                alert('Maksimum 10 dosya yükleyebilirsiniz.');
                return;
            }
            const file = e.target.files[0];
            await handleUpload(file);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('studentId', studentId);
        formData.append('serviceType', serviceType);

        const res = await uploadServiceFile(formData);
        if (res.success) {
            await loadUploads();
        } else {
            alert('Dosya yüklenirken hata oluştu: ' + res.error);
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;

        // Optimistic update
        const oldUploads = [...uploads];
        setUploads(uploads.filter(u => u.id !== id));

        const res = await deleteServiceFile(id);
        if (!res.success) {
            alert('Dosya silinirken hata oluştu: ' + res.error);
            setUploads(oldUploads); // Revert
        }
    };

    const getIcon = (type: string | undefined) => {
        if (type?.startsWith('image/')) return <ImageIcon size={24} color="#8b5cf6" />;
        return <File size={24} color="#6b7280" />;
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={20} color="#8b5cf6" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', color: '#11142D', fontWeight: 600 }}>Dosyalar & Görseller</h3>
                        <p style={{ fontSize: '0.75rem', color: '#808191' }}>Maksimum 10 dosya</p>
                    </div>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || uploads.length >= 10}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            background: uploads.length >= 10 ? '#e2e8f0' : '#8b5cf6',
                            color: uploads.length >= 10 ? '#94a3b8' : 'white',
                            borderRadius: '10px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            cursor: uploads.length >= 10 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {uploading ? 'Yükleniyor...' : 'Dosya Ekle'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                            <Skeleton height="100px" borderRadius="8px" />
                            <Skeleton width="80%" height="16px" />
                            <Skeleton width="40%" height="12px" />
                        </div>
                    ))}
                </div>
            ) : uploads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '12px', color: '#9ca3af' }}>
                    <File size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '0.9rem' }}>Henüz dosya eklenmemiş</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                    {uploads.map(upload => (
                        <div key={upload.id} className="group relative file-card">
                            <div style={{
                                padding: '1rem',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s ease',
                                height: '100%',
                                position: 'relative'
                            }}>
                                {/* Preview if image */}
                                {upload.fileType?.startsWith('image/') ? (
                                    <div style={{ width: '100%', height: '100px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0' }}>
                                        <img src={upload.fileUrl} alt={upload.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px' }}>
                                        {getIcon(upload.fileType)}
                                    </div>
                                )}

                                <div style={{ width: '100%' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.2rem' }} title={upload.fileName}>
                                        {upload.fileName}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                        {formatSize(upload.fileSize)}
                                    </p>
                                </div>

                                <a
                                    href={upload.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        zIndex: 1
                                    }}
                                />

                                <div style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    zIndex: 2
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(upload.id);
                                        }}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '6px',
                                            background: 'white',
                                            border: '1px solid #fee2e2',
                                            color: '#ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}
                                        title="Sil"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
