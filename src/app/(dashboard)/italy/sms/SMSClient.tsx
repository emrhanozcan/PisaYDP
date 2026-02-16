'use client';

import { useState, useEffect } from 'react';
import { Send, Search, Check, AlertCircle, Loader2, Phone, X, User, Plus, Trash2 } from 'lucide-react';
import { sendManualSMS } from '@/app/actions/sms';
import { BranchStudent, BRANCH_NAMES } from '@/types';

interface SMSClientProps {
    students: (BranchStudent & { branchName: string })[];
}

interface Recipient {
    id: string; // 'manual-' + phone for manual numbers
    name: string;
    phone: string;
    type: 'student' | 'manual';
    photoUrl?: string;
}

export default function SMSClient({ students }: SMSClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState<(BranchStudent & { branchName: string })[]>([]);

    // Recipients list
    const [recipients, setRecipients] = useState<Recipient[]>([]);

    const [manualPhone, setManualPhone] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // Search logic
    useEffect(() => {
        if (!searchTerm) {
            setFilteredStudents([]);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = students.filter(s =>
            (s.firstName + ' ' + s.lastName).toLowerCase().includes(lower) ||
            s.phone?.includes(lower)
        ).slice(0, 5);
        setFilteredStudents(filtered);
    }, [searchTerm, students]);

    const handleAddStudent = (s: (BranchStudent & { branchName: string })) => {
        if (recipients.some(r => r.id === s.id)) return; // Already added
        if (!s.phone) return; // No phone

        setRecipients(prev => [...prev, {
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            phone: s.phone!,
            type: 'student',
            photoUrl: s.photoUrl
        }]);
        setSearchTerm('');
        setFilteredStudents([]);
    };

    const handleAddManualPhone = () => {
        if (!manualPhone) return;
        const clean = manualPhone.replace(/\D/g, '');
        if (clean.length < 10) return; // Basic validation

        const id = `manual-${Date.now()}`;
        setRecipients(prev => [...prev, {
            id,
            name: manualPhone,
            phone: manualPhone,
            type: 'manual'
        }]);
        setManualPhone('');
    };

    const handleRemoveRecipient = (id: string) => {
        setRecipients(prev => prev.filter(r => r.id !== id));
    };

    const handleSend = async () => {
        if (recipients.length === 0 || !message) return;

        setLoading(true);
        setResult(null);

        try {
            const phones = recipients.map(r => r.phone);
            const res = await sendManualSMS(phones, message);
            if (res.success) {
                setResult({ success: true, message: `${recipients.length} kişiye SMS başarıyla gönderildi.` });
                setMessage('');
                setRecipients([]);
            } else {
                setResult({ success: false, message: 'Hata: ' + (res.error || 'Bilinmeyen hata') });
            }
        } catch (error) {
            setResult({ success: false, message: 'Bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '10px', background: '#e0e7ff', borderRadius: '12px', color: '#6C5CE7' }}>
                        <Send size={24} />
                    </div>
                    Toplu SMS Gönderimi
                </h1>
                <p style={{ color: '#808191', fontSize: '1rem' }}>
                    Birden fazla öğrenci seçerek veya numara ekleyerek toplu SMS gönderin.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '1.5rem', alignItems: 'start' }}>

                {/* Left Column: Input & Selection */}
                <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '2rem', border: '1px solid #f3f4f6' }}>

                    {/* Student Search */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>
                            Öğrenci Ara ve Ekle
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '2px solid #e5e7eb',
                                borderRadius: '16px',
                                padding: '10px 16px',
                                background: '#f9fafb',
                                transition: 'all 0.2s',
                                borderColor: searchTerm ? '#6C5CE7' : '#e5e7eb'
                            }}>
                                <Search size={20} color={searchTerm ? '#6C5CE7' : '#9ca3af'} />
                                <input
                                    type="text"
                                    placeholder="İsim veya numara ile ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        background: 'transparent',
                                        paddingLeft: '12px',
                                        color: '#1f2937'
                                    }}
                                />
                            </div>

                            {/* Search Results */}
                            {filteredStudents.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                    border: '1px solid #f3f4f6',
                                    zIndex: 50,
                                    overflow: 'hidden',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    {filteredStudents.map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => handleAddStudent(s)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderBottom: '1px solid #f9fafb',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C5CE7' }}>
                                                    {s.photoUrl ? <img src={s.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={16} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>{s.firstName} {s.lastName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.branchName}</div>
                                                </div>
                                            </div>
                                            {recipients.some(r => r.id === s.id) ? (
                                                <span style={{ fontSize: '0.75rem', color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '10px' }}>Ekli</span>
                                            ) : (
                                                <Plus size={18} color="#6C5CE7" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manual Number */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>
                            Manuel Numara Ekle
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px 16px',
                                borderRadius: '16px',
                                background: '#f9fafb',
                                border: '2px solid #e5e7eb'
                            }}>
                                <Phone size={20} color="#9ca3af" style={{ marginRight: '12px' }} />
                                <input
                                    type="text"
                                    placeholder="5xxxxxxxxx"
                                    value={manualPhone}
                                    onChange={(e) => setManualPhone(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddManualPhone()}
                                    style={{
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        color: '#374151'
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleAddManualPhone}
                                disabled={!manualPhone}
                                style={{
                                    padding: '0 20px',
                                    borderRadius: '16px',
                                    background: manualPhone ? '#e0e7ff' : '#f3f4f6',
                                    color: manualPhone ? '#4338ca' : '#9ca3af',
                                    border: 'none',
                                    cursor: manualPhone ? 'pointer' : 'not-allowed',
                                    fontWeight: '600'
                                }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Message Area */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>
                            Mesaj İçeriği
                        </label>
                        <textarea
                            rows={6}
                            placeholder="Mesajınızı buraya yazın..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                border: '2px solid #e5e7eb',
                                fontSize: '1rem',
                                outline: 'none',
                                resize: 'vertical',
                                minHeight: '120px',
                                background: '#f9fafb',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#6C5CE7'; e.target.style.background = 'white'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px', fontWeight: '500' }}>
                            {message.length} karakter
                        </div>
                    </div>
                </div>

                {/* Right Column: Recipients List & Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '1.5rem', border: '1px solid #f3f4f6', maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                                Alıcı Listesi
                            </h3>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#6C5CE7', background: '#e0e7ff', padding: '4px 10px', borderRadius: '10px' }}>
                                {recipients.length} Kişi
                            </span>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                            {recipients.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af', fontSize: '0.9rem' }}>
                                    Henüz alıcı eklenmedi.
                                </div>
                            ) : (
                                recipients.map(r => (
                                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#f9fafb', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: r.type === 'student' ? '#e0e7ff' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: r.type === 'student' ? '#6C5CE7' : '#d97706' }}>
                                                {r.photoUrl ? <img src={r.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (r.type === 'student' ? <User size={16} /> : <Phone size={16} />)}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{r.phone}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveRecipient(r.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={loading || recipients.length === 0 || !message}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            background: loading ? '#c7d2fe' : 'linear-gradient(135deg, #6C5CE7, #818cf8)',
                            color: 'white',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(108, 92, 231, 0.4)',
                            transform: loading ? 'none' : 'translateY(0)',
                            transition: 'all 0.2s'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                        {loading ? 'Gönderiliyor...' : `SMS Gönder (${recipients.length})`}
                    </button>

                    {/* Result Message */}
                    {result && (
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '16px',
                            background: result.success ? '#ecfdf5' : '#fef2f2',
                            border: `1px solid ${result.success ? '#d1fae5' : '#fee2e2'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            animation: 'fadeIn 0.3s ease-in-out'
                        }}>
                            <div style={{ padding: '8px', borderRadius: '50%', background: result.success ? '#d1fae5' : '#fee2e2', color: result.success ? '#059669' : '#dc2626' }}>
                                {result.success ? <Check size={20} /> : <AlertCircle size={20} />}
                            </div>
                            <span style={{ color: result.success ? '#065f46' : '#b91c1c', fontWeight: '600', fontSize: '1rem' }}>{result.message}</span>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(style);
