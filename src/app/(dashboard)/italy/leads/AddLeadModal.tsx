'use client';

import React from 'react';
import { X } from 'lucide-react';
import LeadForm from './LeadForm';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (leadData: any) => Promise<{ ok: boolean; error?: string; data?: any }>;
    defaultEmail?: string;
    prefilledData?: any;
    onSaved?: (createdLead: any) => void;
    // Props kept for compatibility but might not be used directly if LeadForm handles it
    initialRegistrationYear?: string;
}

export default function AddLeadModal({
    isOpen,
    onClose,
    onSave,
    defaultEmail,
    prefilledData,
    initialRegistrationYear,
    onSaved
}: AddLeadModalProps) {

    if (!isOpen) return null;

    const handleSave = async (data: any) => {
        if (onSave) {
            // Re-wrap to match the expected return type of onSave if it returns a promise of object
            const res = await onSave(data);
            if (!res.ok) throw new Error(res.error || 'Kaydetme hatası');
            if (onSaved) onSaved(res.data);
        }
    };

    // Overlay & Modal Styles
    const overlayStyle: React.CSSProperties = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
    };
    const modalStyle: React.CSSProperties = {
        backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    };
    const headerStyle: React.CSSProperties = {
        padding: '1rem 1.5rem', backgroundColor: '#6366f1',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0
    };

    return (
        <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={headerStyle}>
                    <h1 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Yeni Lead Oluştur</h1>
                    <button onClick={onClose} style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <LeadForm
                        onSave={handleSave}
                        onCancel={onClose}
                        initialData={prefilledData ? { ...prefilledData, emails: defaultEmail ? [defaultEmail] : [] } : { emails: defaultEmail ? [defaultEmail] : [], registration_year: initialRegistrationYear }}
                    />
                </div>
            </div>
        </div>
    );
}
