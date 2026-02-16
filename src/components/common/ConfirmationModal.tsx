import React from 'react';
import { AlertTriangle, X, Check, Info } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    type = 'warning',
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle size={24} color="#ef4444" />;
            case 'warning': return <AlertTriangle size={24} color="#f59e0b" />;
            case 'success': return <Check size={24} color="#10b981" />;
            case 'info': return <Info size={24} color="#3b82f6" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'danger': return { bg: '#fee2e2', text: '#991b1b', button: '#ef4444', buttonHover: '#dc2626' };
            case 'warning': return { bg: '#fef3c7', text: '#92400e', button: '#f59e0b', buttonHover: '#d97706' };
            case 'success': return { bg: '#d1fae5', text: '#065f46', button: '#10b981', buttonHover: '#059669' };
            case 'info': return { bg: '#dbeafe', text: '#1e40af', button: '#3b82f6', buttonHover: '#2563eb' };
        }
    };

    const colors = getColors();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                transform: 'scale(1)',
                transition: 'transform 0.2s',
                animation: 'scaleIn 0.2s ease-out'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                    <div style={{
                        padding: '12px',
                        backgroundColor: colors.bg,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {getIcon()}
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                            {title}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            {message}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                color: '#374151',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                backgroundColor: colors.button,
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {isLoading ? 'İşleniyor...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
