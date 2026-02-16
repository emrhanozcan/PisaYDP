'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { User, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import { useState } from 'react';

const initialState = {
    message: '',
};

export default function LoginPage() {
    const [state, formAction] = useActionState(login, initialState);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F0F2F5', // Soft background
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: 'white',
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 20px rgba(108, 92, 231, 0.2)'
                    }}>
                        <GraduationCap size={32} strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.5rem' }}>Tekrar Hoşgeldiniz</h1>
                    <p style={{ color: '#808191', fontSize: '0.95rem' }}>Lütfen hesabınıza giriş yapın</p>
                </div>

                {/* Form Section */}
                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#A0A3BD' }} />
                        <input
                            name="username"
                            type="text"
                            required
                            placeholder="Kullanıcı Adı"
                            style={{
                                width: '100%',
                                padding: '14px 14px 14px 48px',
                                borderRadius: '12px',
                                border: '1px solid #F0F0F0',
                                background: '#FAFAFB',
                                fontSize: '0.95rem',
                                color: '#1a1a2e',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#6C5CE7'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 4px 12px rgba(108, 92, 231, 0.08)'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#F0F0F0'; e.target.style.background = '#FAFAFB'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#A0A3BD' }} />
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="Şifre"
                            style={{
                                width: '100%',
                                padding: '14px 14px 14px 48px',
                                borderRadius: '12px',
                                border: '1px solid #F0F0F0',
                                background: '#FAFAFB',
                                fontSize: '0.95rem',
                                color: '#1a1a2e',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#6C5CE7'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 4px 12px rgba(108, 92, 231, 0.08)'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#F0F0F0'; e.target.style.background = '#FAFAFB'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {state?.message && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: '#FFF5F5',
                            color: '#E17055',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#E17055' }} />
                            {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            background: isHovered ? 'linear-gradient(135deg, #5B4BD5, #8B7CD9)' : 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: isHovered ? '0 8px 20px rgba(108, 92, 231, 0.3)' : '0 4px 10px rgba(108, 92, 231, 0.2)',
                            transition: 'all 0.2s',
                            transform: isHovered ? 'translateY(-1px)' : 'none'
                        }}
                    >
                        Giriş Yap <ArrowRight size={18} />
                    </button>
                </form>

                {/* Footer / Demo Details */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#A0A3BD', marginBottom: '0.5rem' }}>Yönetim Paneli Girişi</p>
                    <div style={{ fontSize: '0.75rem', color: '#C0C2D6', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                ::placeholder { color: #A0A3BD; opacity: 1; }
                :-ms-input-placeholder { color: #A0A3BD; }
                ::-ms-input-placeholder { color: #A0A3BD; }
            `}</style>
        </div>
    );
}
