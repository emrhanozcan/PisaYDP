'use client';

import { useState } from 'react';
import { SupportTicket, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_CATEGORY_LABELS, TicketStatus, UserRole, BRANCH_NAMES, USER_ROLE_LABELS, BranchCode } from '@/types';
import { Search, Ticket, Clock, CheckCircle, XCircle, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import TicketDetailModal from '@/components/TicketDetailModal';

interface TicketsClientProps {
    initialTickets: SupportTicket[];
    users: { id: string; name: string; role: UserRole; branchCode?: BranchCode }[];
    currentUserId: string;
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

export default function TicketsClient({ initialTickets, users, currentUserId }: TicketsClientProps) {
    const searchParams = useSearchParams();
    const [tickets, setTickets] = useState(initialTickets);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Sort tickets by createdAt descending
    const sortedTickets = [...tickets].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const filteredTickets = sortedTickets.filter(ticket => {
        const ticketUser = users.find(u => u.id === ticket.userId);
        const userBranch = ticketUser?.branchCode;
        const userRole = ticketUser?.role;

        const matchSearch = ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = !statusFilter || ticket.status === statusFilter;
        const matchPriority = !priorityFilter || ticket.priority === priorityFilter;
        const matchCategory = !categoryFilter || ticket.category === categoryFilter;
        const matchBranch = !branchFilter || userBranch === branchFilter;
        const matchRole = !roleFilter || userRole === roleFilter;

        return matchSearch && matchStatus && matchPriority && matchCategory && matchBranch && matchRole;
    });

    const getStatusIcon = (status: TicketStatus) => {
        switch (status) {
            case 'open': return <AlertCircle size={16} />;
            case 'in_progress': return <Clock size={16} />;
            case 'resolved': return <CheckCircle size={16} />;
            case 'closed': return <XCircle size={16} />;
        }
    };

    // Filter tech users for assignment (tech support and admins)
    const techUsers = users.filter(u => u.role === 'technical_support' || u.role === 'admin')
        .map(u => ({ id: u.id, name: u.name }));

    // Get current user info
    const currentUserInfo = users.find(u => u.id === currentUserId) || { id: currentUserId, name: 'User', role: 'technical_support' as UserRole };

    // Modal State
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                        Destek Talepleri
                    </h1>
                    <p style={{ color: '#808191', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                        Tüm destek taleplerini görüntüleyin ve yönetin
                    </p>
                </div>
                <Link
                    href="/technical/tickets/new"
                    style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textDecoration: 'none'
                    }}
                >
                    <Ticket size={18} />
                    Yeni Talep Oluştur
                </Link>
            </div>

            {/* Filters */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                    <input
                        type="text"
                        placeholder="Talep no, konu veya kullanıcı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 36px',
                            border: '1px solid #e8e8ef',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            background: '#fafafc',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Branch Filter */}
                <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #e8e8ef',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        background: '#fafafc',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '120px'
                    }}
                >
                    <option value="">Tüm Şubeler</option>
                    {Object.entries(BRANCH_NAMES).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>

                {/* Role Filter */}
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #e8e8ef',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        background: '#fafafc',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '120px'
                    }}
                >
                    <option value="">Tüm Roller / Panel</option>
                    {Object.entries(USER_ROLE_LABELS).map(([role, label]) => (
                        <option key={role} value={role}>{label}</option>
                    ))}
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #e8e8ef',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        background: '#fafafc',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '120px'
                    }}
                >
                    <option value="">Tüm Durumlar</option>
                    {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                {/* Priority Filter */}
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #e8e8ef',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        background: '#fafafc',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '120px'
                    }}
                >
                    <option value="">Tüm Öncelikler</option>
                    {Object.entries(TICKET_PRIORITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                {/* Category Filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #e8e8ef',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        background: '#fafafc',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '140px'
                    }}
                >
                    <option value="">Tüm Kategoriler</option>
                    {Object.entries(TICKET_CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Stats Summary */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {Object.entries(TICKET_STATUS_LABELS).map(([status, label]) => {
                    const count = tickets.filter(t => t.status === status).length;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: statusFilter === status ? `${STATUS_COLORS[status as TicketStatus]}15` : 'white',
                                border: `1px solid ${statusFilter === status ? STATUS_COLORS[status as TicketStatus] : '#e8e8ef'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: STATUS_COLORS[status as TicketStatus],
                                fontSize: '0.8rem',
                                fontWeight: '500'
                            }}
                        >
                            {getStatusIcon(status as TicketStatus)}
                            {label}: {count}
                        </button>
                    );
                })}
            </div>

            {/* Tickets List */}
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {filteredTickets.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#808191' }}>
                        <Ticket size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Görüntülenecek talep bulunamadı.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fafafc', borderBottom: '1px solid #e8e8ef' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#808191', textTransform: 'uppercase' }}>Talep No</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#808191', textTransform: 'uppercase' }}>Konu</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#808191', textTransform: 'uppercase' }}>Kullanıcı</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#808191', textTransform: 'uppercase' }}>Şube</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#808191', textTransform: 'uppercase' }}>Kategori</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#808191', textTransform: 'uppercase' }}>Öncelik</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#808191', textTransform: 'uppercase' }}>Durum</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#808191', textTransform: 'uppercase' }}>Tarih</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map(ticket => {
                                const ticketUser = users.find(u => u.id === ticket.userId);
                                return (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        style={{ borderBottom: '1px solid #f0f0f5', cursor: 'pointer', transition: 'background 0.1s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fafafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ color: '#6C5CE7', fontWeight: '500', fontSize: '0.85rem' }}>
                                                {ticket.ticketNumber}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1a1a2e', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {ticket.subject}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {ticket.userName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#333' }}>{ticket.userName}</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#808191' }}>{USER_ROLE_LABELS[ticketUser?.role as UserRole]}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#808191' }}>
                                                {ticketUser?.branchCode && BRANCH_NAMES[ticketUser.branchCode] ? BRANCH_NAMES[ticketUser.branchCode] : '-'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#808191' }}>
                                                {TICKET_CATEGORY_LABELS[ticket.category]}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                background: `${PRIORITY_COLORS[ticket.priority]}15`,
                                                color: PRIORITY_COLORS[ticket.priority]
                                            }}>
                                                {TICKET_PRIORITY_LABELS[ticket.priority]}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                background: `${STATUS_COLORS[ticket.status]}15`,
                                                color: STATUS_COLORS[ticket.status]
                                            }}>
                                                {getStatusIcon(ticket.status)}
                                                {TICKET_STATUS_LABELS[ticket.status]}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#808191' }}>
                                                {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    currentUser={{ id: currentUserInfo.id!, name: currentUserInfo.name, role: currentUserInfo.role! }}
                    techUsers={techUsers as any}
                />
            )}
        </div>
    );
}
