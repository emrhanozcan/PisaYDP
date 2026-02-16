'use client';

import { useState, useEffect, useRef } from 'react';
import { SupportTicket, TicketResponse, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_CATEGORY_LABELS, TicketCategory, TicketPriority } from '@/types';
import { X, Send, Plus, Clock, MessageCircle, ChevronRight, Image as ImageIcon, Camera } from 'lucide-react';


interface SupportTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    initialTicketId?: string | null;
}

const STATUS_COLORS = {
    open: '#22c55e',
    in_progress: '#3b82f6',
    resolved: '#8b5cf6',
    closed: '#6b7280'
};

const PRIORITY_COLORS = {
    low: '#9ca3af',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
};

export default function SupportTicketModal({ isOpen, onClose, userId, userName, initialTicketId }: SupportTicketModalProps) {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('history');
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [responses, setResponses] = useState<TicketResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New ticket form
    const [newTicket, setNewTicket] = useState({
        category: 'question' as TicketCategory,
        priority: 'medium' as TicketPriority,
        subject: '',
        description: '',
        screenshots: [] as string[],
        deviceInfo: {
            browser: '',
            os: '',
            device: 'Desktop',
            ip: ''
        } as any
    });

    // Reply form
    const [replyMessage, setReplyMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchTickets(initialTicketId);
            // Capture Device Info
            if (typeof window !== 'undefined') {
                const userAgent = navigator.userAgent;
                let browser = 'Unknown';
                if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
                else if (userAgent.indexOf("Safari") > -1) browser = "Safari";
                else if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
                else if (userAgent.indexOf("Edge") > -1) browser = "Edge";

                let os = 'Unknown';
                if (userAgent.indexOf("Win") > -1) os = "Windows";
                else if (userAgent.indexOf("Mac") > -1) os = "MacOS";
                else if (userAgent.indexOf("Linux") > -1) os = "Linux";
                else if (userAgent.indexOf("Android") > -1) os = "Android";
                else if (userAgent.indexOf("iOS") > -1) os = "iOS";

                setNewTicket(prev => ({
                    ...prev,
                    deviceInfo: {
                        browser,
                        os,
                        device: /Mobile|Android|iPhone/i.test(userAgent) ? 'Mobile' : 'Desktop'
                    }
                }));

                // Mark notifications as read
                fetch('/api/notifications', { method: 'PUT' }).catch(console.error);
            }
        } else {
            // Reset when closed
            setSelectedTicket(null);
            setActiveTab('history');
            setShowSuccess(false);
        }
    }, [isOpen, initialTicketId]);

    const fetchTickets = async (targetId?: string | null) => {
        setLoading(true);
        try {
            const res = await fetch('/api/support/tickets');
            if (res.ok) {
                const data = await res.json();
                setTickets(data);

                // If we have a target ID, select it immediately
                if (targetId) {
                    const target = data.find((t: SupportTicket) => t.id === targetId);
                    if (target) {
                        // We duplicate handleSelectTicket logic here to avoid async/state race conditions
                        setSelectedTicket(target);
                        // Fetch responses in background
                        fetchTicketResponses(target.id);
                        setActiveTab('history');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketResponses = async (ticketId: string) => {
        try {
            const res = await fetch(`/api/support/tickets/${ticketId}/responses`);
            if (res.ok) {
                const data = await res.json();
                setResponses(data);
            }
        } catch (error) {
            console.error('Failed to fetch responses', error);
        }
    };

    const handleSelectTicket = async (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        await fetchTicketResponses(ticket.id);
    };

    const handleCreateTicket = async () => {
        if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
        setSending(true);
        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicket)
            });
            if (res.ok) {
                const created = await res.json();
                setTickets([created, ...tickets]);
                setNewTicket({
                    category: 'question',
                    priority: 'medium',
                    subject: '',
                    description: '',
                    screenshots: [],
                    deviceInfo: newTicket.deviceInfo
                });
                setActiveTab('history');
                setSelectedTicket(created);
                setSelectedTicket(created);
                setResponses([]);
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    setActiveTab('history');
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to create ticket', error);
        } finally {
            setSending(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim() || !selectedTicket) return;
        setSending(true);
        try {
            const res = await fetch(`/api/support/tickets/${selectedTicket.id}/responses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: replyMessage })
            });
            if (res.ok) {
                const created = await res.json();
                setResponses([...responses, created]);
                setReplyMessage('');
            }
        } catch (error) {
            console.error('Failed to send reply', error);
        } finally {
            setSending(false);
        }
    };

    const handleScreenshot = async () => {
        if (overlayRef.current) {
            // Hide modal overlay temporarily
            const originalDisplay = overlayRef.current.style.display;
            overlayRef.current.style.display = 'none';

            // Wait for render to update
            setTimeout(async () => {
                try {
                    const html2canvas = (await import('html2canvas')).default;
                    const canvas = await html2canvas(document.body);
                    const image = canvas.toDataURL('image/png');

                    if (newTicket.screenshots.length < 5) {
                        setNewTicket(prev => ({
                            ...prev,
                            screenshots: [...prev.screenshots, image]
                        }));
                    } else {
                        alert('En fazla 5 görsel ekleyebilirsiniz.');
                    }
                } catch (error) {
                    console.error('Screenshot failed:', error);
                    alert('Ekran görüntüsü alınamadı.');
                } finally {
                    // Show modal again
                    if (overlayRef.current) {
                        overlayRef.current.style.display = 'flex';
                    }
                }
            }, 300);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const remainingSlots = 5 - newTicket.screenshots.length;
        if (remainingSlots <= 0) {
            alert('En fazla 5 görsel ekleyebilirsiniz.');
            return;
        }

        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setNewTicket(prev => {
                    if (prev.screenshots.length >= 5) return prev;
                    return { ...prev, screenshots: [...prev.screenshots, base64String] };
                });
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeScreenshot = (index: number) => {
        setNewTicket(prev => ({
            ...prev,
            screenshots: prev.screenshots.filter((_, i) => i !== index)
        }));
    };

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '700px',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'opacity 0.2s ease-in-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #e8e8ef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                    color: 'white'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                        Destek Hattı
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                        <X size={22} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e8e8ef' }}>
                    <button
                        onClick={() => { setActiveTab('history'); setSelectedTicket(null); }}
                        style={{
                            flex: 1,
                            padding: '14px',
                            border: 'none',
                            background: activeTab === 'history' ? '#f3f0ff' : 'transparent',
                            borderBottom: activeTab === 'history' ? '2px solid #6C5CE7' : '2px solid transparent',
                            color: activeTab === 'history' ? '#6C5CE7' : '#808191',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Clock size={16} />
                        Geçmiş Talepler
                    </button>
                    <button
                        onClick={() => { setActiveTab('new'); setSelectedTicket(null); }}
                        style={{
                            flex: 1,
                            padding: '14px',
                            border: 'none',
                            background: activeTab === 'new' ? '#f3f0ff' : 'transparent',
                            borderBottom: activeTab === 'new' ? '2px solid #6C5CE7' : '2px solid transparent',
                            color: activeTab === 'new' ? '#6C5CE7' : '#808191',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Plus size={16} />
                        Yeni Talep
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                    {activeTab === 'history' && !selectedTicket && (
                        <div>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#808191' }}>
                                    Talep detayları yükleniyor...
                                </div>
                            ) : tickets.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#808191' }}>
                                    <MessageCircle size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>Henüz destek talebiniz yok.</p>
                                    <button
                                        onClick={() => setActiveTab('new')}
                                        style={{
                                            marginTop: '0.5rem',
                                            padding: '10px 20px',
                                            background: '#6C5CE7',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        Yeni Talep Oluştur
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {tickets.map(ticket => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => handleSelectTicket(ticket)}
                                            style={{
                                                padding: '1rem',
                                                background: '#fafafc',
                                                borderRadius: '10px',
                                                borderLeft: `4px solid ${STATUS_COLORS[ticket.status]}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#808191' }}>
                                                    {ticket.ticketNumber}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    background: `${STATUS_COLORS[ticket.status]}15`,
                                                    color: STATUS_COLORS[ticket.status],
                                                    fontWeight: '500'
                                                }}>
                                                    {TICKET_STATUS_LABELS[ticket.status]}
                                                </span>
                                            </div>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1a1a2e', marginBottom: '0.25rem' }}>
                                                {ticket.subject}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#808191' }}>
                                                    {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                                                </span>
                                                <ChevronRight size={16} color="#808191" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && selectedTicket && (
                        <div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6C5CE7',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    marginBottom: '1rem',
                                    padding: 0
                                }}
                            >
                                ← Geri
                            </button>

                            {/* Ticket Header */}
                            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f3f0ff', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#6C5CE7' }}>{selectedTicket.ticketNumber}</span>
                                        <h3 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1rem', color: '#1a1a2e' }}>{selectedTicket.subject}</h3>
                                    </div>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        background: `${STATUS_COLORS[selectedTicket.status]}15`,
                                        color: STATUS_COLORS[selectedTicket.status],
                                        fontWeight: '500'
                                    }}>
                                        {TICKET_STATUS_LABELS[selectedTicket.status]}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#333', margin: 0, whiteSpace: 'pre-wrap' }}>
                                    {selectedTicket.description}
                                </p>

                                {/* Screenshots in Ticket Detail */}
                                {selectedTicket.screenshots && selectedTicket.screenshots.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                        {selectedTicket.screenshots.map((shot, index) => (
                                            <img
                                                key={index}
                                                src={shot}
                                                alt={`Screenshot ${index + 1}`}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    objectFit: 'cover',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e0e0e0',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => window.open(shot, '_blank')}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div style={{ fontSize: '0.7rem', color: '#808191', marginTop: '0.5rem' }}>
                                    {new Date(selectedTicket.createdAt).toLocaleString('tr-TR')}
                                </div>
                            </div>

                            {/* Responses */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                {responses.map(response => (
                                    <div
                                        key={response.id}
                                        style={{
                                            padding: '0.75rem',
                                            background: response.userRole === 'technical_support' ? '#e0f2fe' : '#fafafc',
                                            borderRadius: '8px',
                                            borderLeft: response.userRole === 'technical_support' ? '3px solid #6C5CE7' : '3px solid #22c55e'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#1a1a2e' }}>
                                                {response.userName}
                                                {response.userRole === 'technical_support' && (
                                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: '#6C5CE7' }}>
                                                        Teknik Destek
                                                    </span>
                                                )}
                                            </span>
                                            <span style={{ fontSize: '0.65rem', color: '#808191' }}>
                                                {new Date(response.createdAt).toLocaleString('tr-TR')}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#333', margin: 0, whiteSpace: 'pre-wrap' }}>
                                            {response.message}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Box */}
                            {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input
                                        type="text"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Yanıtınızı yazın..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                        style={{
                                            flex: 1,
                                            padding: '10px 14px',
                                            border: '1px solid #e8e8ef',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleSendReply}
                                        disabled={!replyMessage.trim() || sending}
                                        style={{
                                            padding: '10px 16px',
                                            background: replyMessage.trim() && !sending ? '#6C5CE7' : '#e8e8ef',
                                            color: replyMessage.trim() && !sending ? 'white' : '#808191',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: replyMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'new' && (
                        <div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#808191', marginBottom: '0.5rem' }}>
                                    Kategori
                                </label>
                                <select
                                    value={newTicket.category}
                                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as TicketCategory })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e8e8ef',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                >
                                    {Object.entries(TICKET_CATEGORY_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#808191', marginBottom: '0.5rem' }}>
                                    Öncelik
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {Object.entries(TICKET_PRIORITY_LABELS).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setNewTicket({ ...newTicket, priority: value as TicketPriority })}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                border: `1px solid ${newTicket.priority === value ? PRIORITY_COLORS[value as TicketPriority] : '#e8e8ef'}`,
                                                background: newTicket.priority === value ? `${PRIORITY_COLORS[value as TicketPriority]}15` : 'transparent',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                color: newTicket.priority === value ? PRIORITY_COLORS[value as TicketPriority] : '#808191',
                                                fontSize: '0.8rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#808191', marginBottom: '0.5rem' }}>
                                    Konu *
                                </label>
                                <input
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    placeholder="Kısa bir başlık yazın"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e8e8ef',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#808191', marginBottom: '0.5rem' }}>
                                    Açıklama *
                                </label>
                                <textarea
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    placeholder="Sorununuzu veya talebinizi detaylı açıklayın..."
                                    rows={5}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e8e8ef',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        resize: 'vertical',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Image Attachments */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#808191', marginBottom: '0.5rem' }}>
                                    Ekran Görüntüleri/Görseller (Opsiyonel, Max: 5)
                                </label>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {/* Action Buttons */}
                                    {newTicket.screenshots.length < 5 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleScreenshot}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '80px',
                                                    height: '80px',
                                                    border: '1px dashed #6C5CE7',
                                                    borderRadius: '8px',
                                                    background: '#f3f0ff',
                                                    color: '#6C5CE7',
                                                    cursor: 'pointer',
                                                    fontSize: '0.7rem',
                                                    gap: '4px'
                                                }}
                                            >
                                                <Camera size={20} />
                                                Screenshot
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '80px',
                                                    height: '80px',
                                                    border: '1px dashed #e0e0e0',
                                                    borderRadius: '8px',
                                                    background: '#fafafc',
                                                    color: '#808191',
                                                    cursor: 'pointer',
                                                    fontSize: '0.7rem',
                                                    gap: '4px'
                                                }}
                                            >
                                                <ImageIcon size={20} />
                                                Görsel Ekle
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                multiple
                                                style={{ display: 'none' }}
                                            />
                                        </>
                                    )}

                                    {/* Thumbnails */}
                                    {newTicket.screenshots.map((shot, idx) => (
                                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img
                                                src={shot}
                                                alt={`thumb-${idx}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e0e0e0'
                                                }}
                                            />
                                            <button
                                                onClick={() => removeScreenshot(idx)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-6px',
                                                    right: '-6px',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCreateTicket}
                                disabled={!newTicket.subject.trim() || !newTicket.description.trim() || sending}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: newTicket.subject.trim() && newTicket.description.trim() && !sending
                                        ? 'linear-gradient(135deg, #6C5CE7, #a29bfe)'
                                        : '#e8e8ef',
                                    color: newTicket.subject.trim() && newTicket.description.trim() && !sending ? 'white' : '#808191',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: newTicket.subject.trim() && newTicket.description.trim() && !sending ? 'pointer' : 'not-allowed',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Send size={16} />
                                {sending ? 'Gönderiliyor...' : 'Talep Oluştur'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showSuccess && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '2rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    zIndex: 1001,
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: '#22c55e',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Send size={32} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a1a2e' }}>Talep Gönderildi!</h3>
                        <p style={{ margin: 0, color: '#808191', fontSize: '0.9rem' }}>Destek talebiniz başarıyla oluşturuldu.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
