'use client';

import { useState } from 'react';
import { User, UserRole, BranchCode, USER_ROLE_LABELS, BRANCH_NAMES } from '@/types';
import { ArrowLeft, Save, Shield, User as UserIcon, Mail, Phone, Lock, Building, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/common/UserAvatar';

interface UserDetailClientProps {
    user: Omit<User, 'password'>;
    currentUserRole: UserRole;
}

const ROLE_COLORS: Record<UserRole, string> = {
    admin: '#ef4444',
    mentor: '#22c55e',
    branch_user: '#3b82f6',
    italy_staff: '#f59e0b',
    technical_support: '#8b5cf6'
};

export default function UserDetailClient({ user, currentUserRole }: UserDetailClientProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        branchCode: user.branchCode || ''
    });

    const [newPassword, setNewPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload: any = {
                id: user.id,
                ...formData,
                branchCode: formData.branchCode || undefined // Send undefined if empty string
            };

            if (newPassword.trim()) {
                payload.password = newPassword;
            }

            const res = await fetch('/api/technical/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccess('Kullanıcı başarıyla güncellendi');
                setNewPassword('');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Güncelleme başarısız');
            }
        } catch (err) {
            setError('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <Link href="/technical/users" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#808191', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={18} />
                    Kullanıcı Listesine Dön
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <UserAvatar
                        userId={user.id}
                        firstName={user.firstName}
                        lastName={user.lastName}
                        photoUrl={user.photoUrl}
                        size={56}
                        canEdit={false}
                    />
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                            {user.firstName} {user.lastName}
                        </h1>
                        <p style={{ color: '#808191', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                            @{user.username}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Basic Info */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a1a2e' }}>
                        <UserIcon size={18} color="#6C5CE7" />
                        Temel Bilgiler
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <FormGroup label="Ad">
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </FormGroup>
                        <FormGroup label="Soyad">
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </FormGroup>
                        <FormGroup label="Kullanıcı Adı">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </FormGroup>
                        <FormGroup label="Rol">
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                {Object.entries(USER_ROLE_LABELS).map(([role, label]) => (
                                    <option key={role} value={role}>{label}</option>
                                ))}
                            </select>
                        </FormGroup>
                        <FormGroup label="Şube (Opsiyonel)">
                            <select
                                name="branchCode"
                                value={formData.branchCode}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="">Şube Yok</option>
                                {Object.entries(BRANCH_NAMES).map(([code, name]) => (
                                    <option key={code} value={code}>{name}</option>
                                ))}
                            </select>
                        </FormGroup>
                    </div>
                </div>

                {/* Contact Info */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a1a2e' }}>
                        <Mail size={18} color="#6C5CE7" />
                        İletişim Bilgileri
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <FormGroup label="E-posta">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </FormGroup>
                        <FormGroup label="Telefon">
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </FormGroup>
                    </div>
                </div>

                {/* Security */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a1a2e' }}>
                        <Shield size={18} color="#6C5CE7" />
                        Güvenlik
                    </h3>
                    <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#9a3412', display: 'flex', gap: '0.5rem' }}>
                            <Lock size={16} style={{ marginTop: '2px' }} />
                            Şifreyi sadece değiştirmek istediğinizde doldurun. Boş bırakırsanız mevcut şifre korunur.
                        </p>
                    </div>
                    <FormGroup label="Yeni Şifre">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Değiştirmek için yeni şifre girin..."
                            style={inputStyle}
                            autoComplete="new-password"
                        />
                    </FormGroup>
                </div>

                {error && (
                    <div style={{ padding: '1rem', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ padding: '1rem', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} />
                        {success}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Link
                        href="/technical/users"
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
                        disabled={saving}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Save size={18} />
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#4b5563' }}>{label}</span>
            {children}
        </label>
    );
}

const inputStyle = {
    padding: '10px 12px',
    border: '1px solid #e8e8ef',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    background: '#fafafc'
};

// Icons needed for alerts (adding imports inside component is bad practice, they are at top)
import { AlertCircle, CheckCircle } from 'lucide-react';
