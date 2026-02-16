'use client';

import { SupportTicket, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_CATEGORY_LABELS, USER_ROLE_LABELS } from '@/types';
import { LayoutDashboard, Ticket, Users, CheckCircle, Clock, AlertCircle, BarChart3, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import TicketDetailModal from '@/components/TicketDetailModal';

interface TechnicalDashboardClientProps {
    stats: {
        totalTickets: number;
        openTickets: number;
        inProgressTickets: number;
        resolvedTickets: number;
        totalUsers: number;
        usersByRole: {
            admin: number;
            mentor: number;
            branch_user: number;
            italy_staff: number;
            technical_support: number;
        };
    };
    recentTickets: SupportTicket[];
    allTickets: SupportTicket[];
    userName: string;
    techUsers: { id: string; name: string }[];
}

const PRIORITY_COLORS = {
    low: '#9ca3af',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
};
const PRIORITY_BG_colors = {
    low: '#f3f4f6',
    medium: '#eff6ff',
    high: '#fffbeb',
    urgent: '#fef2f2'
};

const STATUS_COLORS = {
    open: '#22c55e',
    in_progress: '#3b82f6',
    resolved: '#8b5cf6',
    closed: '#6b7280'
};

export default function TechnicalDashboardClient({ stats, recentTickets, allTickets, userName, techUsers }: TechnicalDashboardClientProps) {
    const [tickets, setTickets] = useState(allTickets);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [dashboardSearch, setDashboardSearch] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'priority' | 'category'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Update tickets when a modal saves
    const handleTicketUpdate = (updatedTicket: SupportTicket) => {
        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t));
    };

    // Quick Status Update
    const handleQuickStatusUpdate = async (e: React.SyntheticEvent, ticket: SupportTicket, newStatus: string) => {
        e.stopPropagation(); // Accessing dropdown shouldn't open modal
        try {
            const res = await fetch(`/api/support/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updated = await res.json();
                handleTicketUpdate(updated);
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const filteredDashboardTickets = tickets.filter(t => {
        const matchesSearch =
            (t.subject || '').toLowerCase().includes(dashboardSearch.toLowerCase()) ||
            (t.ticketNumber || '').toLowerCase().includes(dashboardSearch.toLowerCase());
        const isActive = t.status !== 'closed' && t.status !== 'resolved';
        return dashboardSearch ? matchesSearch : isActive;
    }).sort((a, b) => {
        if (sortBy === 'date') {
            return sortOrder === 'desc'
                ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'priority') {
            const pMap = { urgent: 3, high: 2, medium: 1, low: 0 };
            return sortOrder === 'desc'
                ? pMap[b.priority] - pMap[a.priority]
                : pMap[a.priority] - pMap[b.priority];
        }
        if (sortBy === 'category') {
            return sortOrder === 'desc'
                ? (b.category || '').localeCompare(a.category || '')
                : (a.category || '').localeCompare(b.category || '');
        }
        return 0;
    });

    const displayTickets = dashboardSearch || sortBy !== 'date' || sortOrder !== 'desc' ? filteredDashboardTickets : filteredDashboardTickets.slice(0, 10);

    // Analytics Calculations
    const urgentCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length;
    const highCount = tickets.filter(t => t.priority === 'high' && t.status !== 'resolved' && t.status !== 'closed').length;
    const openCount = tickets.filter(t => t.status === 'open').length;

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                        Teknik Destek Paneli <span style={{ fontSize: '0.8rem', color: '#22c55e', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle' }}>v2.2</span>
                    </h1>
                    <p style={{ color: '#808191', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                        Hoş geldin, {userName}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link
                        href="/technical/tickets/new"
                        style={{
                            padding: '12px 24px',
                            background: '#6C5CE7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.2)'
                        }}
                    >
                        <Ticket size={18} />
                        Yeni Talep
                    </Link>
                </div>
            </div>

            {/* Analytics & Suggestions Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Analytics */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={20} color="#6C5CE7" />
                        Aciliyet Analizi
                    </h3>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', height: '100px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Acil Durumlar</div>
                            <div style={{ width: '100%', background: '#f3f4f6', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min((urgentCount / 10) * 100, 100)}%`, background: '#ef4444', height: '100%', borderRadius: '8px' }}></div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e' }}>{urgentCount} <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#808191' }}>Talep</span></div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Yüksek Öncelik</div>
                            <div style={{ width: '100%', background: '#f3f4f6', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min((highCount / 10) * 100, 100)}%`, background: '#f59e0b', height: '100%', borderRadius: '8px' }}></div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e' }}>{highCount} <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#808191' }}>Talep</span></div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Yeni Açılanlar</div>
                            <div style={{ width: '100%', background: '#f3f4f6', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min((openCount / 20) * 100, 100)}%`, background: '#22c55e', height: '100%', borderRadius: '8px' }}></div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e' }}>{openCount} <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#808191' }}>Talep</span></div>
                        </div>
                    </div>
                </div>

                {/* AI Suggestions (Mock) */}
                <div style={{ background: 'linear-gradient(135deg, #1e1e2e, #2d2d44)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>✨</div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>AI Önerileri</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {urgentCount > 0 && (
                            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', fontSize: '0.85rem' }}>
                                🚨 <strong>{urgentCount} Acil</strong> talep beklemede. Önce bunlara öncelik verin.
                            </div>
                        )}
                        {openCount > 5 && (
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}>
                                💡 Açık talep sayısı arttı. Bazılarını &quot;İşlem Bekleyen&quot; durumuna alabilirsiniz.
                            </div>
                        )}
                        {stats.resolvedTickets > 10 && (
                            <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
                                ✅ Harika gidiyorsunuz! Bu hafta {stats.resolvedTickets} talep çözüldü.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard
                    title="Toplam Talep"
                    value={stats.totalTickets}
                    icon={<Ticket size={24} color="#6C5CE7" />}
                    trend="Tümü"
                    color="#6C5CE7"
                />
                <StatCard
                    title="Açık Talepler"
                    value={stats.openTickets}
                    icon={<AlertCircle size={24} color="#22c55e" />}
                    trend="İşlem Bekleyen"
                    color="#22c55e"
                />
                <StatCard
                    title="İşlemde"
                    value={stats.inProgressTickets}
                    icon={<Clock size={24} color="#3b82f6" />}
                    trend="Çözüm Sürecinde"
                    color="#3b82f6"
                />
                <StatCard
                    title="Çözüldü"
                    value={stats.resolvedTickets}
                    icon={<CheckCircle size={24} color="#8b5cf6" />}
                    trend="Tamamlanan"
                    color="#8b5cf6"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
                {/* Main Content: Tickets List */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        {/* Title & Controls same as before */}
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                            Aktif Talepler
                        </h2>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                                <input
                                    type="text"
                                    placeholder="Talep ara..."
                                    value={dashboardSearch}
                                    onChange={(e) => setDashboardSearch(e.target.value)}
                                    style={{ padding: '8px 12px 8px 36px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.85rem', width: '200px', outline: 'none' }}
                                />
                            </div>

                            {/* Sort Controls */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'category')}
                                style={{ padding: '8px 12px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                            >
                                <option value="date">Tarihe Göre</option>
                                <option value="priority">Aciliyete Göre</option>
                                <option value="category">Kategoriye Göre</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                style={{ padding: '8px', border: '1px solid #e8e8ef', borderRadius: '8px', cursor: 'pointer', background: 'white', color: '#666' }}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>

                    {displayTickets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', border: '1px dashed #e8e8ef' }}>
                            <div style={{ color: '#808191', marginBottom: '0.5rem' }}>Talep bulunamadı</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {displayTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    style={{
                                        padding: '1.25rem',
                                        background: 'white',
                                        borderRadius: '12px',
                                        border: `1px solid ${PRIORITY_COLORS[ticket.priority]}40`,
                                        borderLeft: `6px solid ${PRIORITY_COLORS[ticket.priority]}`,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.15s, box-shadow 0.15s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                                    }}
                                >
                                    {/* Priority Icon */}
                                    <div style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        width: '60px', padding: '10px 0',
                                        background: PRIORITY_BG_colors[ticket.priority],
                                        borderRadius: '8px',
                                        color: PRIORITY_COLORS[ticket.priority]
                                    }}>
                                        <AlertCircle size={20} />
                                        <span style={{ fontSize: '0.65rem', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase' }}>
                                            {TICKET_PRIORITY_LABELS[ticket.priority]}
                                        </span>
                                    </div>

                                    {/* Content (Title etc) - Same as before */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: PRIORITY_COLORS[ticket.priority] }}>
                                                #{ticket.ticketNumber}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#808191' }}>
                                                {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a2e', margin: '0 0 6px 0' }}>
                                            {ticket.subject}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#6C5CE7', color: 'white', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {(ticket.userName || 'User').charAt(0)}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{ticket.userName || 'Unknown'}</span>
                                            </div>
                                            <span style={{
                                                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px',
                                                background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb'
                                            }}>
                                                {TICKET_CATEGORY_LABELS[ticket.category]}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Actions / Status */}
                                    <div style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={ticket.status}
                                            onChange={(e) => handleQuickStatusUpdate(e, ticket, e.target.value)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: `${STATUS_COLORS[ticket.status]}15`,
                                                color: STATUS_COLORS[ticket.status],
                                                border: 'none',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                appearance: 'none',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <option value="open">Açık</option>
                                            <option value="in_progress">İşlemde</option>
                                            <option value="resolved">Çözüldü</option>
                                            <option value="closed">Kapatıldı</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedTicket && (
                    <TicketDetailModal
                        ticket={tickets.find(t => t.id === selectedTicket.id) || selectedTicket}
                        onClose={() => setSelectedTicket(null)}
                        currentUser={{ id: 'technical_dashboard_user', name: userName, role: 'technical_support' }}
                        techUsers={techUsers}
                        onUpdate={handleTicketUpdate}
                    />
                )}

                {/* Sidebar: User Stats & Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* User Statistics */}
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={18} color="#6C5CE7" />
                            Kullanıcı İstatistikleri
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <StatRow label="Toplam Kullanıcı" count={stats.totalUsers} color="#6C5CE7" />
                            <StatRow label="Admin" count={stats.usersByRole.admin} color="#ef4444" />
                            <StatRow label="Mentor" count={stats.usersByRole.mentor} color="#22c55e" />
                            <StatRow label="Şube Yöneticisi" count={stats.usersByRole.branch_user} color="#3b82f6" />
                            <StatRow label="İtalya Ekibi" count={stats.usersByRole.italy_staff} color="#f59e0b" />
                            <StatRow label="Teknik Destek" count={stats.usersByRole.technical_support} color="#8b5cf6" />
                        </div>
                        <Link href="/technical/users" style={{
                            display: 'block',
                            textAlign: 'center',
                            marginTop: '1.5rem',
                            padding: '10px',
                            background: '#f3f0ff',
                            color: '#6C5CE7',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}>
                            Kullanıcıları Yönet
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, color }: { title: string, value: number, icon: React.ReactNode, trend?: string, color: string }) {
    return (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${color}15` }}>{icon}</div>
                {trend && <span style={{ fontSize: '0.75rem', color: '#808191', background: '#f3f4f6', padding: '4px 8px', borderRadius: '6px' }}>{trend}</span>}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.25rem' }}>{value}</div>
            <div style={{ fontSize: '0.9rem', color: '#808191' }}>{title}</div>
        </div>
    );
}

function StatRow({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
                <span style={{ fontSize: '0.9rem', color: '#555' }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e' }}>{count}</span>
        </div>
    );
}
