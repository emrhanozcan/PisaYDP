'use client';

import { useState, useRef, useEffect } from 'react';
import { SupportTicket, TicketResponse, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_CATEGORY_LABELS, TicketStatus, UserRole, USER_ROLE_LABELS } from '@/types';
import { ArrowLeft, Send, Clock, User, Tag, AlertCircle, CheckCircle, XCircle, Image, Lock, MessageSquarePlus, Pencil, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import cannedResponsesData from '@/data/canned-responses.json';

interface TicketDetailClientProps {
    ticket: SupportTicket;
    responses: TicketResponse[];
    techUsers: { id: string; name: string }[];
    currentUser: { id: string; name: string; role: UserRole };
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

export default function TicketDetailClient({ ticket, responses: initialResponses, techUsers, currentUser }: TicketDetailClientProps) {
    const router = useRouter();
    const [ticketData, setTicketData] = useState(ticket);
    const [responses, setResponses] = useState(initialResponses);
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

    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    useEffect(() => {
        scrollToBottom();
        // Fallback for image loading or layout shifts
        const timeout = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeout);
    }, [responses, ticketData.screenshots]);

    const handleStatusChange = async (newStatus: TicketStatus) => {
        try {
            const res = await fetch(`/api/support/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setTicketData(updated);
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleAssign = async (userId: string) => {
        try {
            const res = await fetch(`/api/support/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: userId })
            });
            if (res.ok) {
                const updated = await res.json();
                setTicketData(updated);
            }
        } catch (error) {
            console.error('Failed to assign', error);
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
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Failed to update ticket content', error);
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <div style={{
            height: 'calc(100vh - 60px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '1600px',
            margin: '0 auto'
        }}>
            {/* Header - Fixed Height */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #f0f0f5'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/technical/tickets" style={{
                        color: '#808191',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        border: '1px solid #e8e8ef'
                    }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                                {ticketData.ticketNumber}
                            </h1>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: `${STATUS_COLORS[ticketData.status]}15`,
                                color: STATUS_COLORS[ticketData.status]
                            }}>
                                {TICKET_STATUS_LABELS[ticketData.status]}
                            </span>
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: `${PRIORITY_COLORS[ticketData.priority]}15`,
                                color: PRIORITY_COLORS[ticketData.priority]
                            }}>
                                {TICKET_PRIORITY_LABELS[ticketData.priority]}
                            </span>
                        </div>
                    </div>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{
                            padding: '8px 16px',
                            background: 'white',
                            border: '1px solid #e8e8ef',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#6C5CE7',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Pencil size={16} />
                        Düzenle
                    </button>
                )}
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 340px',
                gap: '1.5rem',
                flex: 1,
                minHeight: 0,
                alignItems: 'start'
            }}>
                {/* Chat Column */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    border: '1px solid #f0f0f5',
                    height: '100%',
                    overflow: 'hidden'
                }}>
                    {/* Scrollable Messages Area */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        background: '#fafafc'
                    }}>
                        {/* Original Ticket Info */}
                        <div style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #e8e8ef',
                            marginBottom: '1rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: '600', fontSize: '0.85rem'
                                }}>
                                    {ticketData.userName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1a1a2e' }}>
                                        {ticketData.userName}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#808191' }}>
                                        {USER_ROLE_LABELS[ticketData.userRole]} • {new Date(ticketData.createdAt).toLocaleString('tr-TR')}
                                    </div>
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
                                        style={{ width: '100%', minHeight: '150px', padding: '10px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #e8e8ef', borderRadius: '8px', cursor: 'pointer', color: '#666', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <X size={16} /> İptal
                                        </button>
                                        <button onClick={handleSaveEdit} disabled={savingEdit} style={{ padding: '8px 16px', background: '#6C5CE7', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Save size={16} /> {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a2e', margin: '0 0 0.5rem 0' }}>{ticketData.subject}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#333', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{ticketData.description}</p>
                                </>
                            )}
                            {ticketData.screenshots && ticketData.screenshots.length > 0 && (
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {ticketData.screenshots.map((img, i) => (
                                        <img key={i} src={img} alt={`Screenshot ${i + 1}`} style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e8e8ef', objectFit: 'contain' }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Responses */}
                        {responses.map(response => (
                            <div key={response.id} style={{
                                alignSelf: response.userId === currentUser.id ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                minWidth: '300px'
                            }}>
                                <div style={{
                                    background: response.isInternal ? '#fffbeb' : (response.userId === currentUser.id ? '#f3f0ff' : 'white'),
                                    border: response.userId === currentUser.id ? '1px solid #e0dafd' : '1px solid #e8e8ef',
                                    borderRadius: '12px',
                                    borderTopRightRadius: response.userId === currentUser.id ? '2px' : '12px',
                                    borderTopLeftRadius: response.userId !== currentUser.id ? '2px' : '12px',
                                    padding: '1rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.8rem', color: response.userId === currentUser.id ? '#6C5CE7' : '#1a1a2e' }}>
                                            {response.userName}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: '#808191' }}>
                                            {new Date(response.createdAt).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })}
                                        </span>
                                        {response.isInternal && (
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '2px',
                                                padding: '2px 8px', borderRadius: '12px',
                                                background: '#f59e0b', color: 'white',
                                                fontSize: '0.6rem', fontWeight: 'bold'
                                            }}>
                                                <Lock size={8} /> Dahili
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                        {response.message}
                                    </p>
                                </div>
                            </div>
                        ))}
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
                        {/* Canned Responses Popover */}
                        {showCanned && (
                            <div style={{
                                position: 'absolute',
                                left: '1.25rem',
                                bottom: 'calc(100% + 10px)', // Gap above input
                                width: '300px',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                border: '1px solid #e8e8ef',
                                maxHeight: '250px', // Constrained height
                                overflowY: 'auto'
                            }}>
                                <div style={{
                                    padding: '10px 14px',
                                    borderBottom: '1px solid #f0f0f5',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#fafafc',
                                    position: 'sticky',
                                    top: 0
                                }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.8rem', color: '#666' }}>Hazır Şablonlar</span>
                                    <button onClick={() => setShowCanned(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={14} color="#999" /></button>
                                </div>
                                {cannedResponses.map(resp => (
                                    <div
                                        key={resp.id}
                                        onClick={() => handleCannedSelect(resp)}
                                        style={{
                                            padding: '10px 14px',
                                            borderBottom: '1px solid #f9fafb',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151', marginBottom: '2px' }}>{resp.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resp.message}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Yanıtınızı buraya yazın..."
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        maxHeight: '150px',
                                        padding: '12px',
                                        paddingRight: '40px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        resize: 'vertical',
                                        outline: 'none',
                                        background: '#fafafc',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)',
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
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '10px',
                                        padding: '6px',
                                        background: showCanned ? '#6C5CE7' : 'white',
                                        color: showCanned ? 'white' : '#6C5CE7',
                                        borderRadius: '8px',
                                        border: '1px solid #e8e8ef',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                    }}
                                    title="Hazır Cevaplar"
                                >
                                    <MessageSquarePlus size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                                    <div style={{
                                        width: '40px', height: '22px', background: isInternal ? '#fef3c7' : '#e5e7eb',
                                        borderRadius: '12px', padding: '2px', transition: 'background 0.2s', position: 'relative',
                                        border: isInternal ? '1px solid #fcd34d' : '1px solid #d1d5db'
                                    }}>
                                        <div style={{
                                            width: '16px', height: '16px', background: isInternal ? '#d97706' : 'white',
                                            borderRadius: '50%', position: 'absolute', left: isInternal ? '20px' : '2px', transition: 'left 0.2s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            top: '2px'
                                        }}>
                                            {isInternal && <Lock size={10} color="white" />}
                                        </div>
                                    </div>
                                    <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} style={{ display: 'none' }} />
                                    <span style={{ fontSize: '0.85rem', color: isInternal ? '#d97706' : '#6b7280', fontWeight: '500' }}>
                                        {isInternal ? 'Dahili Not (Ekip İçi)' : 'Müşteriye Yanıt'}
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
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        cursor: newMessage.trim() ? 'pointer' : 'default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: newMessage.trim() ? '0 4px 12px rgba(108, 92, 231, 0.2)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {sending ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
                                    {sending ? '...' : 'Gönder'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Scrollable independently */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    height: '100%', // Match chat column height
                    overflowY: 'auto',
                    paddingRight: '4px' // Space for scrollbar
                }}>
                    {/* Status Actions */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f5' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={16} color="#6C5CE7" /> Durum
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {Object.entries(TICKET_STATUS_LABELS).map(([status, label]) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status as TicketStatus)}
                                    disabled={ticketData.status === status}
                                    style={{
                                        padding: '10px 12px',
                                        background: ticketData.status === status ? 'white' : '#f9fafb',
                                        border: ticketData.status === status ? `2px solid ${STATUS_COLORS[status as TicketStatus]}` : '1px solid #f0f0f0',
                                        borderRadius: '10px',
                                        cursor: ticketData.status === status ? 'default' : 'pointer',
                                        color: ticketData.status === status ? STATUS_COLORS[status as TicketStatus] : '#6b7280',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        width: '100%',
                                        textAlign: 'left',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        opacity: ticketData.status === status ? 1 : 0.8
                                    }}
                                    onMouseEnter={(e) => {
                                        if (ticketData.status !== status) e.currentTarget.style.background = '#f3f4f6';
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (ticketData.status !== status) e.currentTarget.style.background = '#f9fafb';
                                        if (ticketData.status !== status) e.currentTarget.style.opacity = '0.8';
                                    }}
                                >
                                    {label}
                                    {ticketData.status === status && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLORS[status as TicketStatus] }} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assignment */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f5' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} color="#6C5CE7" /> Atama
                        </h3>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={ticketData.assignedTo || ''}
                                onChange={(e) => handleAssign(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    paddingRight: '32px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    background: 'white',
                                    appearance: 'none',
                                    fontWeight: '500',
                                    color: '#333'
                                }}
                            >
                                <option value="">Atanmamış</option>
                                {techUsers.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                            <User size={14} style={{ position: 'absolute', right: '12px', top: '14px', color: '#9ca3af', pointerEvents: 'none' }} />
                        </div>
                    </div>

                    {/* Info Card */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f5' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 1rem 0' }}>Bilgiler</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <DetailRow icon={<Tag size={16} />} label="Kategori" value={TICKET_CATEGORY_LABELS[ticketData.category]} />
                            <DetailRow icon={<AlertCircle size={16} />} label="Öncelik" value={TICKET_PRIORITY_LABELS[ticketData.priority]} />
                            <DetailRow icon={<Clock size={16} />} label="Tarih" value={new Date(ticketData.createdAt).toLocaleDateString('tr-TR')} />
                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#808191', marginBottom: '0.5rem' }}>Talep Sahibi</div>
                                <Link href={`/technical/users/${ticketData.userId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '600', color: '#4b5563' }}>
                                        {ticketData.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111827' }}>{ticketData.userName}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{USER_ROLE_LABELS[ticketData.userRole]}</div>
                                    </div>
                                </Link>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ color: '#808191' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: '#808191' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', color: '#1a1a2e' }}>{value}</div>
            </div>
        </div>
    );
}
