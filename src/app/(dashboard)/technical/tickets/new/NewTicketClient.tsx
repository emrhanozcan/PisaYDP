'use client';

import { useState } from 'react';
import { UserRole, USER_ROLE_LABELS, TicketCategory, TICKET_CATEGORY_LABELS, TicketPriority, TICKET_PRIORITY_LABELS, User } from '@/types';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NewTicketClientProps {
    users: Partial<User>[];
    currentUserId: string;
}

export default function NewTicketClient({ users, currentUserId }: NewTicketClientProps) {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [category, setCategory] = useState<TicketCategory>('question');
    const [priority, setPriority] = useState<TicketPriority>('medium');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const filteredUsers = users.filter(u =>
        u.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username?.toLowerCase().includes(userSearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) {
            setError('Lütfen bir kullanıcı seçin');
            return;
        }
        setSending(true);
        setError('');

        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser, // Create on behalf of this user
                    category,
                    priority,
                    subject,
                    description,
                    screenshots: []
                })
            });

            if (res.ok) {
                router.push('/technical/tickets');
                router.refresh();
            } else {
                setError('Talep oluşturulurken bir hata oluştu');
            }
        } catch (error) {
            console.error(error);
            setError('Bir hata oluştu');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/technical/tickets" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#808191', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={18} />
                    Taleplere Dön
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                    Yeni Destek Talebi Oluştur
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Bir kullanıcı adına yeni destek talebi oluşturun.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* User Selection */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1a1a2e' }}>
                        Kullanıcı Seçimi
                    </h3>

                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Kullanıcı ara..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 36px',
                                border: '1px solid #e8e8ef',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                    </div>

                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e8e8ef', borderRadius: '8px' }}>
                        {filteredUsers.map(user => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user.id!)}
                                style={{
                                    padding: '10px',
                                    borderBottom: '1px solid #f0f0f5',
                                    cursor: 'pointer',
                                    background: selectedUser === user.id ? '#f3f0ff' : 'white',
                                    transition: 'background 0.1s'
                                }}
                            >
                                <div style={{ fontWeight: '500', color: '#1a1a2e' }}>{user.firstName} {user.lastName}</div>
                                <div style={{ fontSize: '0.8rem', color: '#808191' }}>@{user.username} • {USER_ROLE_LABELS[user.role as UserRole]}</div>
                            </div>
                        ))}
                    </div>
                    {selectedUser && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6C5CE7', fontWeight: '500' }}>
                            Seçili Kullanıcı ID: {selectedUser}
                        </div>
                    )}
                </div>

                {/* Ticket Details */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1a1a2e' }}>
                        Talep Detayları
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#4b5563' }}>Kategori</span>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e8e8ef', outline: 'none' }}
                            >
                                {Object.entries(TICKET_CATEGORY_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#4b5563' }}>Öncelik</span>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e8e8ef', outline: 'none' }}
                            >
                                {Object.entries(TICKET_PRIORITY_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#4b5563' }}>Konu</span>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            placeholder="Örn: Sisteme giriş yapamıyorum"
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e8e8ef', outline: 'none', width: '100%' }}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#4b5563' }}>Açıklama</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Sorunu detaylı bir şekilde açıklayın..."
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e8e8ef', outline: 'none', width: '100%', minHeight: '150px', resize: 'vertical' }}
                        />
                    </label>
                </div>

                {error && (
                    <div style={{ padding: '1rem', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Link
                        href="/technical/tickets"
                        style={{
                            padding: '12px 24px',
                            background: 'white',
                            border: '1px solid #e8e8ef',
                            borderRadius: '10px',
                            color: '#666',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        İptal
                    </Link>
                    <button
                        type="submit"
                        disabled={sending}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: sending ? 'not-allowed' : 'pointer',
                            opacity: sending ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Send size={18} />
                        {sending ? 'Oluşturuluyor...' : 'Talep Oluştur'}
                    </button>
                </div>
            </form>
        </div>
    );
}
