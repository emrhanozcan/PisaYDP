'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2, Trash2, X, Check } from 'lucide-react';
import { uploadUserPhoto, removeUserPhoto } from '@/app/actions/user-photo';
import { useRouter } from 'next/navigation';

interface UserAvatarProps {
    userId: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    size?: number;
    canEdit?: boolean;
    isAuthorized?: boolean;
    onUploadSuccess?: (url: string) => void;
    showDelete?: boolean;
}

export default function UserAvatar({
    userId,
    firstName,
    lastName,
    photoUrl,
    size = 40,
    canEdit: canEditProp,
    isAuthorized = true,
    onUploadSuccess,
    showDelete = false
}: UserAvatarProps) {
    const canEdit = canEditProp !== undefined ? canEditProp : isAuthorized;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const router = useRouter();

    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setShowConfirm(true);
        }
    };

    const handleUpload = async () => {
        if (!pendingFile) return;

        setIsUploading(true);
        setShowConfirm(false);

        try {
            const formData = new FormData();
            formData.append('photo', pendingFile);

            const result = await uploadUserPhoto(userId, formData);
            if (result.success) {
                if (onUploadSuccess && result.url) {
                    onUploadSuccess(result.url);
                }
                router.refresh();
            } else {
                alert('Fotoğraf yüklenirken bir hata oluştu: ' + result.error);
            }
        } catch (err) {
            alert('Beklenmedik bir hata oluştu.');
        } finally {
            setIsUploading(false);
            setPendingFile(null);
            setPreviewUrl(null);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Profil fotoğrafını silmek istediğinize emin misiniz?')) return;

        setIsUploading(true);
        try {
            const result = await removeUserPhoto(userId);
            if (result.success) {
                router.refresh();
            } else {
                alert('Fotoğraf silinemedi.');
            }
        } catch (err) {
            alert('Fotoğraf silinemedi.');
        } finally {
            setIsUploading(false);
        }
    };

    const cancelUpload = () => {
        setPendingFile(null);
        setPreviewUrl(null);
        setShowConfirm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
                onClick={() => {
                    if (!canEdit || isUploading) return;
                    if (!userId) {
                        alert('Kullanıcı kimliği bulunamadı.');
                        return;
                    }
                    fileInputRef.current?.click();
                }}
                title={canEdit ? 'Profil fotoğrafını değiştir' : ''}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: '#e0e7ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: `${size * 0.4}px`,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: canEdit ? 'pointer' : 'default',
                    flexShrink: 0,
                    border: '2px solid white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    transform: isHovered && canEdit ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s ease-in-out'
                }}
            >
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={`${firstName} ${lastName}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    initials
                )}

                {/* Upload Overlay */}
                {canEdit && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        <Camera size={size * 0.4} />
                    </div>
                )}

                {/* Loading Spinner */}
                {isUploading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Loader2 className="animate-spin" size={size * 0.5} color="#008C45" />
                    </div>
                )}
            </div>

            {canEdit && photoUrl && !isUploading && showDelete && (
                <button
                    onClick={handleDelete}
                    style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        zIndex: 10
                    }}
                    title="Fotoğrafı Kaldır"
                >
                    <Trash2 size={12} />
                </button>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        maxWidth: '350px',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>Profil Fotoğrafını Güncelle</h3>
                        <div style={{
                            width: 120,
                            height: 120,
                            borderRadius: '24px',
                            margin: '0 auto 1.5rem',
                            overflow: 'hidden',
                            border: '3px solid #e2e8f0'
                        }}>
                            <img src={previewUrl!} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                            Yeni profil fotoğrafını kaydetmek istediğinize emin misiniz?
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={cancelUpload}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <X size={18} /> İptal
                            </button>
                            <button
                                onClick={handleUpload}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Check size={18} /> Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
        </div>
    );
}
