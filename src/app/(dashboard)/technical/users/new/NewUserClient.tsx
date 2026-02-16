'use client';

import { useState } from 'react';
import { UserRole, USER_ROLE_LABELS, BranchCode, BRANCH_NAMES } from '@/types';
import { ArrowLeft, Save, User, Mail, Phone, Shield, Key, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewUserClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'branch_user' as UserRole,
        branchCode: '' as BranchCode | ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/technical/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    branchCode: formData.branchCode || undefined
                })
            });

            if (res.ok) {
                router.push('/technical/users');
            } else {
                const data = await res.json();
                setError(data.error || 'Kullanıcı oluşturulamadı');
            }
        } catch {
            setError('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '600px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link href="/technical/users" style={{ color: '#808191' }}>
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                        Yeni Kullanıcı Oluştur
                    </h1>
                    <p style={{ color: '#808191', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                        Sisteme yeni bir kullanıcı ekleyin
                    </p>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    marginBottom: '1rem',
                    fontSize: '0.85rem'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    {/* Personal Info */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} color="#6C5CE7" />
                            Kişisel Bilgiler
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <InputField
                                label="Ad"
                                value={formData.firstName}
                                onChange={(v) => setFormData({ ...formData, firstName: v })}
                                required
                            />
                            <InputField
                                label="Soyad"
                                value={formData.lastName}
                                onChange={(v) => setFormData({ ...formData, lastName: v })}
                                required
                            />
                        </div>
                    </div>

                    {/* Contact */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} color="#6C5CE7" />
                            İletişim
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <InputField
                                label="E-posta"
                                type="email"
                                value={formData.email}
                                onChange={(v) => setFormData({ ...formData, email: v })}
                                required
                            />
                            <InputField
                                label="Telefon"
                                value={formData.phone}
                                onChange={(v) => setFormData({ ...formData, phone: v })}
                            />
                        </div>
                    </div>

                    {/* Login */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Key size={16} color="#6C5CE7" />
                            Giriş Bilgileri
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <InputField
                                label="Kullanıcı Adı"
                                value={formData.username}
                                onChange={(v) => setFormData({ ...formData, username: v })}
                                required
                            />
                            <InputField
                                label="Şifre"
                                type="password"
                                value={formData.password}
                                onChange={(v) => setFormData({ ...formData, password: v })}
                                required
                            />
                        </div>
                    </div>

                    {/* Role & Access */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={16} color="#6C5CE7" />
                            Rol ve Erişim
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#808191', marginBottom: '0.5rem' }}>
                                    Rol *
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e8e8ef',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            {formData.role === 'branch_user' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#808191', marginBottom: '0.5rem' }}>
                                        Şube
                                    </label>
                                    <select
                                        value={formData.branchCode}
                                        onChange={(e) => setFormData({ ...formData, branchCode: e.target.value as BranchCode })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #e8e8ef',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">Şube Seçin</option>
                                        {Object.entries(BRANCH_NAMES).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}
                    >
                        <Save size={18} />
                        {loading ? 'Kaydediliyor...' : 'Kullanıcı Oluştur'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function InputField({ label, value, onChange, type = 'text', required = false }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#808191', marginBottom: '0.5rem' }}>
                {label} {required && '*'}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
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
    );
}
