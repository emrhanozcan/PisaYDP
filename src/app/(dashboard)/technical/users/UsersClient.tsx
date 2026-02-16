'use client';

import { useState } from 'react';
import { UserRole, USER_ROLE_LABELS, BranchCode, BRANCH_NAMES } from '@/types';
import { Search, Plus, Edit2, Trash2, Users, Mail, Phone, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/common/UserAvatar';

interface UserData {
    id: string;
    username: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    branchCode?: BranchCode;
    photoUrl?: string;
    createdAt: string;
}

interface UsersClientProps {
    initialUsers: UserData[];
}

const ROLE_COLORS: Record<UserRole, string> = {
    admin: '#ef4444',
    mentor: '#22c55e',
    branch_user: '#3b82f6',
    italy_staff: '#f59e0b',
    technical_support: '#8b5cf6'
};

export default function UsersClient({ initialUsers }: UsersClientProps) {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');

    const filteredUsers = users.filter(user => {
        const matchSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = !roleFilter || user.role === roleFilter;
        const matchBranch = !branchFilter || user.branchCode === branchFilter;
        return matchSearch && matchRole && matchBranch;
    });

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                        Kullanıcı Yönetimi
                    </h1>
                    <p style={{ color: '#808191', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                        Sistem kullanıcılarını görüntüleyin ve yönetin
                    </p>
                </div>
                <Link
                    href="/technical/users/new"
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
                    <Plus size={18} />
                    Yeni Kullanıcı
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
                alignItems: 'center'
            }}>

                <div style={{ position: 'relative', flex: '1' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                    <input
                        type="text"
                        placeholder="Kullanıcı ara..."
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
                        minWidth: '160px'
                    }}
                >
                    <option value="">Tüm Şubeler</option>
                    {Object.entries(BRANCH_NAMES).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>
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
                        minWidth: '160px'
                    }}
                >
                    <option value="">Tüm Roller</option>
                    {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Role Stats */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {Object.entries(USER_ROLE_LABELS).map(([role, label]) => {
                    const count = users.filter(u => u.role === role).length;
                    return (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
                            style={{
                                padding: '8px 14px',
                                background: roleFilter === role ? `${ROLE_COLORS[role as UserRole]}15` : 'white',
                                border: `1px solid ${roleFilter === role ? ROLE_COLORS[role as UserRole] : '#e8e8ef'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: ROLE_COLORS[role as UserRole],
                                fontSize: '0.8rem',
                                fontWeight: '500'
                            }}
                        >
                            <Shield size={14} />
                            {label}: {count}
                        </button>
                    );
                })}
            </div>

            {/* Users Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {filteredUsers.map(user => (
                    <Link
                        key={user.id}
                        href={`/technical/users/${user.id}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            borderLeft: `4px solid ${ROLE_COLORS[user.role]}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <UserAvatar
                                    userId={user.id}
                                    firstName={user.firstName}
                                    lastName={user.lastName}
                                    photoUrl={user.photoUrl}
                                    size={48}
                                    canEdit={false}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '1rem', color: '#1a1a2e' }}>
                                        {user.firstName} {user.lastName}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#808191' }}>
                                        @{user.username}
                                    </div>
                                </div>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.7rem',
                                    fontWeight: '500',
                                    background: `${ROLE_COLORS[user.role]}15`,
                                    color: ROLE_COLORS[user.role]
                                }}>
                                    {USER_ROLE_LABELS[user.role]}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#808191' }}>
                                    <Mail size={14} />
                                    {user.email}
                                </div>
                                {user.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#808191' }}>
                                        <Phone size={14} />
                                        {user.phone}
                                    </div>
                                )}
                                {user.branchCode && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#808191' }}>
                                        <Users size={14} />
                                        {BRANCH_NAMES[user.branchCode]} Şube
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#808191' }}>
                    <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Görüntülenecek kullanıcı bulunamadı.</p>
                </div>
            )}
        </div>
    );
}
