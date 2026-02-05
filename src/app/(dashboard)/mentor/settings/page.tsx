
import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import {
    Settings, User, Mail, Phone, Lock, Key,
    Shield, Bell, Eye, Save, Camera
} from "lucide-react";

export default async function MentorSettingsPage() {
    const session = await getSession();
    if (!session) return null;

    const mentor = db.users.getById(session.id);
    if (!mentor) return null;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#11142D', marginBottom: '0.5rem' }}>
                    Ayarlar
                </h1>
                <p style={{ color: '#808191', fontSize: '1rem' }}>
                    Hesap bilgilerinizi görüntüleyin ve güncelleyin
                </p>
            </div>

            {/* Profile Section */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={22} color="#6366f1" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Profil Bilgileri</h2>
                        <p style={{ fontSize: '0.8rem', color: '#808191' }}>Kişisel bilgileriniz</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '2.5rem',
                            fontWeight: 700
                        }}>
                            {mentor.firstName[0]}{mentor.lastName[0]}
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-8px',
                            right: '-8px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            <Camera size={16} color="#6b7280" />
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#11142D' }}>
                            {mentor.firstName} {mentor.lastName}
                        </h3>
                        <p style={{ color: '#808191', marginBottom: '0.5rem' }}>@{mentor.username}</p>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: '#eef2ff',
                            color: '#6366f1'
                        }}>
                            <Shield size={14} />
                            Mentor
                        </span>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.25rem'
                }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                            Ad
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            defaultValue={mentor.firstName}
                            disabled
                            style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                            Soyad
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            defaultValue={mentor.lastName}
                            disabled
                            style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                            E-posta
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="email"
                                className="input-field"
                                defaultValue={mentor.email || ''}
                                placeholder="ornek@email.com"
                                style={{ paddingLeft: '40px' }}
                                disabled
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                            Telefon
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="tel"
                                className="input-field"
                                defaultValue={mentor.phone || ''}
                                placeholder="+39 ..."
                                style={{ paddingLeft: '40px' }}
                                disabled
                            />
                        </div>
                    </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '1rem', fontStyle: 'italic' }}>
                    * Profil bilgilerinizi değiştirmek için admin ile iletişime geçin.
                </p>
            </div>

            {/* Account Security */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={22} color="#dc2626" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hesap Güvenliği</h2>
                        <p style={{ fontSize: '0.8rem', color: '#808191' }}>Giriş bilgileriniz</p>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.25rem'
                }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                            Kullanıcı Adı
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text"
                                className="input-field"
                                defaultValue={mentor.username}
                                disabled
                                style={{ paddingLeft: '40px', background: '#f8fafc', cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                            Şifre
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="password"
                                className="input-field"
                                defaultValue="••••••••"
                                disabled
                                style={{ paddingLeft: '40px', background: '#f8fafc', cursor: 'not-allowed' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                            Şifre değişikliği için admin ile iletişime geçin.
                        </p>
                    </div>
                </div>

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#fef3c7',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <Shield size={20} color="#b45309" />
                    <div>
                        <p style={{ fontWeight: 600, color: '#92400e', fontSize: '0.9rem' }}>Güvenlik İpucu</p>
                        <p style={{ fontSize: '0.8rem', color: '#a16207' }}>
                            Hesap bilgilerinizi kimseyle paylaşmayın. Şüpheli bir durum fark ederseniz hemen admin ile iletişime geçin.
                        </p>
                    </div>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={22} color="#059669" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Bildirim Tercihleri</h2>
                        <p style={{ fontSize: '0.8rem', color: '#808191' }}>Hangi bildirimleri almak istiyorsunuz?</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}>
                        <div>
                            <p style={{ fontWeight: 500, color: '#374151' }}>E-posta Bildirimleri</p>
                            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Yeni atamalar ve onay durumları için e-posta alın</p>
                        </div>
                        <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#008C45' }} />
                    </label>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}>
                        <div>
                            <p style={{ fontWeight: 500, color: '#374151' }}>Hizmet Onay Bildirimleri</p>
                            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Hizmet kayıtlarınız onaylandığında bildirim alın</p>
                        </div>
                        <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#008C45' }} />
                    </label>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}>
                        <div>
                            <p style={{ fontWeight: 500, color: '#374151' }}>Ödeme Bildirimleri</p>
                            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Hakediş ödemeleri yapıldığında bildirim alın</p>
                        </div>
                        <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#008C45' }} />
                    </label>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                        <Save size={16} />
                        Tercihleri Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
}
