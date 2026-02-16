'use client';

import { useState, useEffect, useRef } from 'react';
import { SupportTicket, TicketResponse, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_CATEGORY_LABELS, TicketStatus, UserRole, USER_ROLE_LABELS } from '@/types';
import { Send, Clock, User, Tag, AlertCircle, CheckCircle, Image, Lock, MessageSquarePlus, Pencil, Save, X } from 'lucide-react';
import cannedResponsesData from '@/data/canned-responses.json';

interface TicketDetailModalProps {
    ticket: SupportTicket;
    onClose: () => void;
    currentUser: { id: string; name: string; role: UserRole };
    techUsers: { id: string; name: string }[];
    onUpdate?: (updatedTicket: SupportTicket) => void;
}

const PRIORITY_COLORS = {
    low: '#9ca3af',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
};

const STATUS_COLORS = {
    open: '#22c55e',
    in_progress: '#3b82f6',
    resolved: '#8b5cf6',
    closed: '#6b7280'
};

export default function TicketDetailModal({ ticket, onClose, currentUser, techUsers, onUpdate }: TicketDetailModalProps) {
    const [ticketData, setTicketData] = useState(ticket);
    const [responses, setResponses] = useState<TicketResponse[]>([]);
    const [loadingResponses, setLoadingResponses] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [sending, setSending] = useState(false);

    // Canned Responses State
    const [showCanned, setShowCanned] = useState(false);
    const [cannedResponses] = useState(cannedResponsesData);

    // Edit Ticket State
    const [isEditing, setIsEditing] = useState(false);
    const [editSubject, setEditSubject] = useState(ticket.subject);
    const [editDescription, setEditDescription] = useState(ticket.description);
    const [savingEdit, setSavingEdit] = useState(false);

    // Draft State for Status and Assignment
    const [draftStatus, setDraftStatus] = useState<TicketStatus>(ticket.status);
    const [draftAssignedTo, setDraftAssignedTo] = useState<string | undefined>(ticket.assignedTo);
    const [savingChanges, setSavingChanges] = useState(false);

    // Lightbox State
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    // Reset drafts when ticketData updates
    useEffect(() => {
        setDraftStatus(ticketData.status);
        setDraftAssignedTo(ticketData.assignedTo);
    }, [ticketData]);

    // Fetch responses on mount
    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const res = await fetch(`/api/support/tickets/${ticket.id}/responses`);
                if (res.ok) {
                    const data = await res.json();
                    setResponses(data);
                }
            } catch (error) {
                console.error('Failed to fetch responses', error);
            } finally {
                setLoadingResponses(false);
            }
        };
        fetchResponses();
    }, [ticket.id]);

    // Scroll on responses update
    useEffect(() => {
        if (!loadingResponses) {
            scrollToBottom();
            setTimeout(scrollToBottom, 100);
        }
    }, [responses, loadingResponses, ticketData.screenshots]);

    const handleSaveChanges = async () => {
        if (draftStatus === ticketData.status && draftAssignedTo === ticketData.assignedTo) return;

        setSavingChanges(true);
        try {
            const body: any = {};
            if (draftStatus !== ticketData.status) body.status = draftStatus;
            if (draftAssignedTo !== ticketData.assignedTo) body.assignedTo = draftAssignedTo;

            const res = await fetch(`/api/support/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const updated = await res.json();
                setTicketData(updated);
                onUpdate?.(updated);
            }
        } catch (error) {
            console.error('Failed to update ticket', error);
        } finally {
            setSavingChanges(false);
        }
    };

    const handleSendResponse = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            const res = await fetch(`/api/support/tickets/${ticket.id}/responses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage, isInternal })
            });
            if (res.ok) {
                const created = await res.json();
                setResponses([...responses, created]);
                setNewMessage('');
                setIsInternal(false);
            }
        } catch (error) {
            console.error('Failed to send response', error);
        } finally {
            setSending(false);
        }
    };

    const handleCannedSelect = (response: typeof cannedResponses[0]) => {
        setNewMessage(response.message);
        setShowCanned(false);
    };

    const handleSaveEdit = async () => {
        if (!editSubject.trim() || !editDescription.trim()) return;
        setSavingEdit(true);
        try {
            const res = await fetch(`/api/support/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: editSubject, description: editDescription })
            });
            if (res.ok) {
                const updated = await res.json();
                setTicketData(updated);
                onUpdate?.(updated);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Failed to update ticket content', error);
        } finally {
            setSavingEdit(false);
        }
    };

    const hasUnsavedChanges = draftStatus !== ticketData.status || draftAssignedTo !== ticketData.assignedTo;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }} onClick={onClose}>
            {/* Lightbox Overlay */}
            {expandedImage && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
                >
                    <img
                        src={expandedImage}
                        alt="Expanded"
                        style={{ maxWidth: '75%', maxHeight: '75%', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setExpandedImage(null)}
                        style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}
                    >
                        <X size={24} color="black" />
                    </button>
                </div>
            )}

            <div style={{
                background: 'white',
                width: '100%',
                maxWidth: '1200px', // Wider for better layout
                height: '90vh',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e8e8ef',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fff',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e' }}>
                            {ticketData.ticketNumber || '#'}
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                background: `${STATUS_COLORS[ticketData.status]}15`,
                                color: STATUS_COLORS[ticketData.status],
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                {TICKET_STATUS_LABELS[ticketData.status]}
                            </span>
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                background: `${PRIORITY_COLORS[ticketData.priority]}15`,
                                color: PRIORITY_COLORS[ticketData.priority]
                            }}>
                                {TICKET_PRIORITY_LABELS[ticketData.priority]}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    padding: '8px 16px',
                                    background: '#f3f0ff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#6C5CE7',
                                    fontWeight: '600',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <Pencil size={16} />
                                Düzenle
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                padding: '8px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#808191'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                    {/* Left Column: Chat & Info */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        background: '#f8f9fa'
                    }}>
                        {/* Scrollable Messages Messages */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem'
                        }}>
                            {/* Original Ticket Context */}
                            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: '600', fontSize: '0.85rem'
                                    }}>
                                        {(ticketData.userName || 'User').split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1a1a2e' }}>
                                            {ticketData.userName || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#808191' }}>
                                            {USER_ROLE_LABELS[ticketData.userRole]} • {ticketData.createdAt ? new Date(ticketData.createdAt).toLocaleString('tr-TR') : '-'}
                                        </div>
                                        {ticketData.deviceInfo && (
                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span>💻 {ticketData.deviceInfo.browser} ({ticketData.deviceInfo.os})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input
                                            type="text"
                                            value={editSubject}
                                            onChange={(e) => setEditSubject(e.target.value)}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', color: '#1a1a2e', outline: 'none' }}
                                        />
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            style={{ width: '100%', minHeight: '120px', padding: '10px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', outline: 'none' }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #e8e8ef', borderRadius: '8px', cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}>İptal</button>
                                            <button onClick={handleSaveEdit} disabled={savingEdit} style={{ padding: '8px 16px', background: '#6C5CE7', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Save size={16} /> {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a2e', margin: '0 0 0.75rem 0' }}>
                                            {ticketData.subject}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#333', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                                            {ticketData.description}
                                        </p>
                                    </>
                                )}

                                {/* Attachments Section */}
                                {(ticketData.attachments && ticketData.attachments.length > 0) || (ticketData.screenshots && ticketData.screenshots.length > 0) ? (
                                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f0f0f5', paddingTop: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '0.75rem' }}>Ekler</div>
                                        {ticketData.attachments && ticketData.attachments.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                                {ticketData.attachments.map((file, i) => (
                                                    <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '8px 12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8e8ef' }}>
                                                        <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '6px', color: '#0ea5e9' }}>
                                                            {file.type === 'image' ? <Image size={18} /> : <Tag size={18} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#333' }}>{file.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#808191' }}>
                                                                {new Date(file.uploadedAt).toLocaleString('tr-TR')} • {file.size || 'Unknown size'}
                                                            </div>
                                                        </div>
                                                        {file.type === 'image' && (
                                                            <button
                                                                onClick={() => setExpandedImage(file.url)}
                                                                style={{ fontSize: '0.75rem', color: '#6C5CE7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                                            >
                                                                Görüntüle
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {ticketData.screenshots && ticketData.screenshots.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                {ticketData.screenshots.map((img, i) => (
                                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <img
                                                            src={img}
                                                            alt={`Screenshot ${i + 1}`}
                                                            onClick={() => setExpandedImage(img)}
                                                            style={{
                                                                width: '100px', height: '80px',
                                                                borderRadius: '8px', border: '1px solid #e8e8ef',
                                                                objectFit: 'cover', cursor: 'pointer',
                                                                transition: 'transform 0.1s'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                        />
                                                        <span style={{ fontSize: '0.7rem', color: '#808191' }}>Screenshot {i + 1}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            {/* Responses */}
                            {loadingResponses ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: '#808191' }}>Yanıtlar yükleniyor...</div>
                            ) : (
                                responses.map(response => (
                                    <div key={response.id} style={{
                                        alignSelf: response.userId === currentUser.id ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                    }}>
                                        <div style={{
                                            background: response.isInternal ? '#fffbeb' : (response.userId === currentUser.id ? '#f3f0ff' : 'white'),
                                            borderRadius: '12px',
                                            borderTopRightRadius: response.userId === currentUser.id ? '2px' : '12px',
                                            borderTopLeftRadius: response.userId !== currentUser.id ? '2px' : '12px',
                                            padding: '1.25rem',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                            border: response.userId === currentUser.id ? '1px solid #e0dafd' : '1px solid #e8e8ef',
                                            position: 'relative'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: response.userRole === 'technical_support' ? 'linear-gradient(135deg, #6C5CE7, #a29bfe)' : 'linear-gradient(135deg, #22c55e, #86efac)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '0.6rem' }}>
                                                    {(response.userName || 'User').split(' ').filter(Boolean).map(n => n[0]).join('')}
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '0.8rem', color: '#1a1a2e' }}>
                                                        {response.userName || 'Unknown User'}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#808191' }}>{new Date(response.createdAt).toLocaleString('tr-TR')}</div>
                                                </div>
                                                {response.isInternal && (
                                                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#f59e0b', color: 'white', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                        <Lock size={8} /> Dahili
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#333', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{response.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} style={{ height: '1px' }} />
                        </div>

                        {/* Fixed Input Area */}
                        <div style={{
                            padding: '1.25rem',
                            background: 'white',
                            borderTop: '1px solid #e8e8ef',
                            position: 'relative',
                            zIndex: 10,
                            boxShadow: '0 -4px 12px rgba(0,0,0,0.02)'
                        }}>
                            {showCanned && (
                                <div style={{
                                    position: 'absolute',
                                    right: '1.25rem',
                                    bottom: 'calc(100% + 10px)',
                                    width: '300px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    zIndex: 100,
                                    border: '1px solid #e8e8ef',
                                    maxHeight: '250px',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{ padding: '0.75rem', borderBottom: '1px solid #e8e8ef', fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafc', position: 'sticky', top: 0 }}>
                                        <span>Hazır Cevap Seçin</span>
                                        <button onClick={() => setShowCanned(false)}><X size={14} color="#999" /></button>
                                    </div>
                                    {cannedResponses.map(resp => (
                                        <div key={resp.id} onClick={() => handleCannedSelect(resp)} style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f5', cursor: 'pointer', fontSize: '0.85rem', color: '#333' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fafafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                            <div style={{ fontWeight: '500', marginBottom: '2px' }}>{resp.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#808191', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resp.message}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ position: 'relative' }}>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Yanıt yazın..."
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        maxHeight: '150px',
                                        border: '1px solid #e8e8ef',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        paddingRight: '40px',
                                        fontSize: '0.95rem',
                                        resize: 'vertical',
                                        outline: 'none',
                                        background: '#fafafc',
                                        fontFamily: 'inherit'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendResponse();
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => setShowCanned(!showCanned)}
                                    style={{ position: 'absolute', right: '12px', top: '12px', padding: '6px', background: showCanned ? '#6C5CE7' : 'white', border: '1px solid #e8e8ef', borderRadius: '8px', cursor: 'pointer', color: showCanned ? 'white' : '#6C5CE7' }}
                                    title="Hazır Cevaplar"
                                >
                                    <MessageSquarePlus size={18} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                                    <div style={{ width: '36px', height: '20px', background: isInternal ? '#fef3c7' : '#e5e7eb', borderRadius: '12px', padding: '2px', position: 'relative', border: isInternal ? '1px solid #fcd34d' : '1px solid #d1d5db', transition: 'all 0.2s' }}>
                                        <div style={{ width: '14px', height: '14px', background: isInternal ? '#d97706' : 'white', borderRadius: '50%', position: 'absolute', left: isInternal ? '18px' : '2px', top: '2px', transition: 'all 0.2s' }} />
                                    </div>
                                    <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} style={{ display: 'none' }} />
                                    <span style={{ fontSize: '0.85rem', color: isInternal ? '#d97706' : '#6b7280', fontWeight: '500' }}>
                                        {isInternal ? 'Dahili Not' : 'Müşteriye Yanıt'}
                                    </span>
                                </label>
                                <button
                                    onClick={handleSendResponse}
                                    disabled={!newMessage.trim() || sending}
                                    style={{
                                        padding: '8px 24px',
                                        background: newMessage.trim() ? '#6C5CE7' : '#e5e7eb',
                                        color: newMessage.trim() ? 'white' : '#9ca3af',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: newMessage.trim() && !sending ? 'pointer' : 'default',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        fontSize: '0.9rem', fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {sending ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
                                    {sending ? '...' : 'Gönder'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Details & Actions */}
                    <div style={{ width: '320px', background: 'white', borderLeft: '1px solid #e8e8ef', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                        {/* Status */}
                        <div>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.85rem 0' }}>Durum</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {Object.entries(TICKET_STATUS_LABELS).map(([status, label]) => (
                                    <button
                                        key={status}
                                        onClick={() => setDraftStatus(status as TicketStatus)}
                                        style={{
                                            padding: '10px 12px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: draftStatus === status ? `${STATUS_COLORS[status as TicketStatus]}10` : 'transparent',
                                            border: draftStatus === status ? `1px solid ${STATUS_COLORS[status as TicketStatus]}` : '1px solid #f0f0f5',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            color: draftStatus === status ? STATUS_COLORS[status as TicketStatus] : '#666',
                                            fontSize: '0.85rem', fontWeight: '600',
                                            transition: 'all 0.1s'
                                        }}
                                    >
                                        {label}
                                        {draftStatus === status && <CheckCircle size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assignment */}
                        <div>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.85rem 0' }}>Atama</h3>
                            <select
                                value={draftAssignedTo || ''}
                                onChange={(e) => setDraftAssignedTo(e.target.value || undefined)}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#fafafc', cursor: 'pointer' }}
                            >
                                <option value="">Atanmamış</option>
                                <option value={currentUser.id}>Kendime Ata</option>
                                <hr />
                                {techUsers.filter(u => u.id !== currentUser.id).map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Unsaved Changes Action */}
                        {hasUnsavedChanges && (
                            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={savingChanges}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        animation: 'pulse 2s infinite',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                    }}
                                >
                                    {savingChanges ? <Clock size={16} /> : <Save size={16} />}
                                    {savingChanges ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                </button>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', marginTop: '6px', fontWeight: '500' }}>
                                    Kaydedilmemiş değişiklikler var
                                </span>
                            </div>
                        )}

                        {/* Info */}
                        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f0f0f5' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.85rem 0' }}>Talep Bilgileri</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <DetailRow icon={<Tag size={16} />} label="Kategori" value={TICKET_CATEGORY_LABELS[ticketData.category]} />
                                <DetailRow icon={<AlertCircle size={16} />} label="Öncelik" value={TICKET_PRIORITY_LABELS[ticketData.priority]} />
                                <DetailRow icon={<User size={16} />} label="Oluşturan" value={ticketData.userName || 'Unknown'} />
                                <DetailRow icon={<Clock size={16} />} label="Oluşturulma" value={ticketData.createdAt ? new Date(ticketData.createdAt).toLocaleDateString() : '-'} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ color: '#808191', marginTop: '2px' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.75rem', color: '#808191' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', color: '#1a1a2e', fontWeight: '500' }}>{value}</div>
            </div>
        </div>
    );
}
