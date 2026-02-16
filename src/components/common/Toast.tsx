'use client';

import { CheckCircle, XCircle, X, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Allow animation to finish
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const bgColors = {
        success: '#ecfdf5',
        error: '#fef2f2',
        info: '#eff6ff'
    };

    const borderColors = {
        success: '#059669',
        error: '#dc2626',
        info: '#3b82f6'
    };

    const textColors = {
        success: '#065f46',
        error: '#991b1b',
        info: '#1e40af'
    };

    const icons = {
        success: <CheckCircle size={20} color={borderColors.success} />,
        error: <XCircle size={20} color={borderColors.error} />,
        info: <Info size={20} color={borderColors.info} />
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: bgColors[type],
            border: `1px solid ${borderColors[type]}`,
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out',
            color: textColors[type]
        }}>
            {icons[type]}
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{message}</p>
            <button
                onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
                <X size={16} color={textColors[type]} style={{ opacity: 0.6 }} />
            </button>
            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
