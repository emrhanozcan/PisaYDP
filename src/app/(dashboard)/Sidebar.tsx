'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    GraduationCap,
    LayoutDashboard,
    FileText,
    LogOut,
    Wallet,
    Settings,
    Building2,
    Home,
    Shield,
    HeartHandshake,
    ChevronLeft,
    ChevronRight,
    Search,
    Ticket,
    MessageCircle,
    Bell,
    X,
    Award,
    Activity,
    UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const SupportTicketModal = dynamic(() => import("@/components/SupportTicketModal"), {
    ssr: false,
});

interface SidebarProps {
    userRole: 'admin' | 'mentor' | 'branch_user' | 'italy_staff' | 'technical_support';
    firstName: string;
    lastName: string;
    photoUrl?: string;
    userId: string;
    branchCode?: string;
}

export default function Sidebar({ userRole, firstName, lastName, photoUrl, userId, branchCode }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const router = useRouter();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Fetch unread notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setNotifications(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        };
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (notification: any) => {
        try {
            // Optimistically mark as read in UI
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));

            // Call API to mark as read
            await fetch('/api/notifications', {
                method: 'PUT',
                body: JSON.stringify({ id: notification.id })
            });
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
        setShowNotifications(false);
    };

    // Get display name for role/branch
    const getRoleDisplay = () => {
        if (userRole === 'branch_user' && branchCode) {
            const branchNames: Record<string, string> = {
                sariyer: 'Sarıyer',
                fethiye: 'Fethiye',
                kadikoy: 'Kadıköy',
                ankara: 'Ankara',
                bursa: 'Bursa',
                izmir: 'İzmir'
            };
            return `${branchNames[branchCode] || branchCode} Şube`;
        }
        if (userRole === 'italy_staff') {
            return 'İtalya Görevlisi';
        }
        if (userRole === 'technical_support') {
            return 'Teknik Destek';
        }
        return userRole === 'admin' ? 'Yönetici' : 'Mentor';
    };

    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [router]); // simplified dependency

    return (
        <>
            {/* Mobile Header */}
            <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileOpen(true)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>PisaYDP</span>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', overflow: 'hidden' }}>
                    {photoUrl ? (
                        <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#555' }}>
                            {firstName[0]}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
                onClick={() => setMobileOpen(false)}
            />

            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{ width: collapsed ? '80px' : '280px', transition: 'width 0.3s ease', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        position: 'absolute',
                        right: '-16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        color: '#6C5CE7',
                        zIndex: 50
                    }}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible', minHeight: 0 }}>

                    <div className="brand-area" style={{ padding: collapsed ? '1.5rem 1rem' : '2rem', justifyContent: collapsed ? 'center' : 'flex-start', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="brand-logo" style={{ width: collapsed ? '32px' : '40px', height: collapsed ? '32px' : '40px', fontSize: collapsed ? '1rem' : '1.2rem' }}>P</div>
                            {!collapsed && <span className="brand-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s' }}>Pisa<span className="brand-highlight">YDP</span></span>}
                        </div>

                        {/* Notification Bell */}
                        {!collapsed && (
                            <div style={{ position: 'relative', marginLeft: 'auto' }}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6C5CE7',
                                        position: 'relative',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-2px',
                                            right: '-2px',
                                            background: '#ef4444',
                                            color: 'white',
                                            fontSize: '0.6rem',
                                            fontWeight: 'bold',
                                            minWidth: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid white'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Popup */}
                                {showNotifications && (
                                    <>
                                        <div
                                            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '0',
                                            left: '100%',
                                            marginLeft: '10px',
                                            width: '320px',
                                            background: 'white',
                                            borderRadius: '16px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                            border: '1px solid #e0e0e0',
                                            zIndex: 1000,
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#111827' }}>Bildirimler</h4>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    {notifications.length > 0 && (
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    await fetch('/api/notifications', { method: 'PUT' });
                                                                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                                                } catch (err) {
                                                                    console.error(err);
                                                                }
                                                            }}
                                                            style={{
                                                                border: 'none',
                                                                background: 'none',
                                                                cursor: 'pointer',
                                                                color: '#6C5CE7',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            Tümünü Okundu
                                                        </button>
                                                    )}
                                                    <button onClick={() => setShowNotifications(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                                                        Bildirim yok
                                                    </div>
                                                ) : (
                                                    notifications.map((notif: any) => (
                                                        <div
                                                            key={notif.id}
                                                            onClick={async () => {
                                                                await handleNotificationClick(notif);
                                                                if (userRole === 'technical_support' || userRole === 'admin') {
                                                                    // Tech support goes to full page
                                                                    if (notif.relatedTicketId) {
                                                                        router.push(`/technical/tickets/${notif.relatedTicketId}`);
                                                                    }
                                                                } else {
                                                                    // Standard users open modal
                                                                    if (notif.relatedTicketId) {
                                                                        setSelectedTicketId(notif.relatedTicketId);
                                                                        setShowSupportModal(true);
                                                                    }
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '12px 16px',
                                                                borderBottom: '1px solid #f0f0f0',
                                                                cursor: 'pointer',
                                                                background: notif.isRead ? 'white' : '#f9fafb',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? 'white' : '#f9fafb'}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{notif.title}</span>
                                                                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.4' }}>
                                                                {notif.message}
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="user-profile-card" style={{ margin: collapsed ? '0 0.5rem 0.5rem' : '0 1.5rem 0.5rem', padding: collapsed ? '0.5rem' : '1rem', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                        <div className="profile-avatar" style={{ width: collapsed ? '32px' : '40px', height: collapsed ? '32px' : '40px', fontSize: collapsed ? '0.8rem' : '1rem', overflow: 'hidden' }}>
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={`${firstName} ${lastName}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <>{firstName[0]}{lastName[0]}</>
                            )}
                        </div>
                        {!collapsed && (
                            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{firstName} {lastName}</p>
                                <p style={{ fontSize: '0.75rem', color: '#808191' }}>{getRoleDisplay()}</p>
                            </div>
                        )}
                    </div>

                    <nav className="nav-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                        {userRole === 'admin' && (
                            <>
                                {!collapsed && <div className="nav-section-title">Yönetim</div>}
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/admin" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/admin/students" icon={<GraduationCap size={20} />} label="Öğrenciler" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/admin/mentors" icon={<Users size={20} />} label="Mentorlar" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/admin/services" icon={<FileText size={20} />} label="Hizmet Kayıtları" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/admin/payouts" icon={<Wallet size={20} />} label="Ödemeler & Rapor" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/admin/settings" icon={<Settings size={20} />} label="Ayarlar" />
                            </>
                        )}

                        {userRole === 'mentor' && (
                            <>
                                {!collapsed && <div className="nav-section-title">Mentor Paneli</div>}
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/mentor" exact icon={<Activity size={20} />} label="Genel Bakış" />

                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/mentor/earnings" icon={<Wallet size={20} />} label="Hakediş & Özet" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/mentor/settings" icon={<Settings size={20} />} label="Ayarlar" />
                            </>
                        )}

                        {userRole === 'branch_user' && (
                            <>
                                {!collapsed && <div className="nav-section-title">Şube Paneli</div>}
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/info" icon={<FileText size={20} />} label="Şube Bilgisi" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/universities" icon={<GraduationCap size={20} />} label="Üniversiteler" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/students" icon={<Users size={20} />} label="Öğrenciler" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/accommodation" icon={<Home size={20} />} label="Konaklama Hizmeti" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/residence-permit" icon={<FileText size={20} />} label="Oturum İzni" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/guardian-service" icon={<Shield size={20} />} label="Vasi Hizmeti" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/life-support" icon={<HeartHandshake size={20} />} label="Yaşam Destek Hizmeti" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/scholarship" icon={<Award size={20} />} label="Burs Hizmeti" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/leads" icon={<UserPlus size={20} />} label="Leadler" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/branch/sms" icon={<MessageCircle size={20} />} label="SMS Gönder" />
                            </>
                        )}

                        {userRole === 'italy_staff' && (
                            <>
                                {!collapsed && <div className="nav-section-title" style={{ marginTop: '0' }}>İtalya Paneli</div>}
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/branches" icon={<Building2 size={20} />} label="Şubeler" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/students" icon={<Users size={20} />} label="Tüm Öğrenciler" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/universities" icon={<GraduationCap size={20} />} label="Üniversiteler" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/accommodation" icon={<Home size={20} />} label="Konaklama Hizmeti" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/residence-permit" icon={<FileText size={20} />} label="Oturum İzni" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/guardian-service" icon={<Shield size={20} />} label="Vasi Hizmeti" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/life-support" icon={<HeartHandshake size={20} />} label="Yaşam Destek Hizmeti" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/scholarship" icon={<Award size={20} />} label="Burs Hizmeti" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/leads" icon={<UserPlus size={20} />} label="Leadler" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/italy/sms" icon={<MessageCircle size={20} />} label="SMS Gönder" />
                            </>
                        )}

                        {userRole === 'technical_support' && (
                            <>
                                {!collapsed && <div className="nav-section-title">Teknik Destek</div>}
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/technical" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/technical/tickets" icon={<Ticket size={20} />} label="Destek Talepleri" />
                                <SidebarLink onClick={() => setMobileOpen(false)} collapsed={collapsed} href="/technical/users" icon={<Users size={20} />} label="Kullanıcı Yönetimi" />
                            </>
                        )}
                        {/* Support Card - Only show for non-technical support users */}
                        {userRole !== 'technical_support' && !collapsed && (
                            <div className="support-card" style={{ margin: '1rem 1.5rem', opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s', textAlign: 'center' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0 }}>Destek Hattı</h4>
                                </div>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '1rem' }}>Sorun yaşarsanız bize ulaşın.</p>
                                <button
                                    className="support-btn"
                                    onClick={() => setShowSupportModal(true)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <MessageCircle size={16} />
                                    Yardım İste
                                </button>
                            </div>
                        )}

                        {/* Collapsed support button for inside nav if desired, or keep outside? 
                            Keeping it inside for consistency or outside? 
                            If collapsed, the card is hidden. The button "Collapsed support button" was outside. 
                            Let's put the collapsed button inside nav too or just keep it simple.
                            Actually, simpler to keep collapsed button logic here too if we want it to scroll, 
                            BUT collapsed sidebar usually doesn't need scroll. 
                            Let's put the Collapsed button here too.
                        */}
                        {userRole !== 'technical_support' && collapsed && (
                            <div style={{ padding: '0 0.5rem', marginBottom: '1rem', marginTop: 'auto' }}>
                                <button
                                    onClick={() => setShowSupportModal(true)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        position: 'relative'
                                    }}
                                    title="Destek Hattı"
                                >
                                    <MessageCircle size={18} />
                                </button>
                            </div>
                        )}
                    </nav>

                    <div style={{ padding: collapsed ? '0 1rem 2rem' : '0 2rem 2rem', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                        <form action={logout} style={{ width: '100%' }}>
                            <button
                                type="submit"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    gap: '0.75rem',
                                    color: '#E53935',
                                    background: '#FFEBEE',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    padding: collapsed ? '0.75rem' : '0.75rem 1.25rem',
                                    borderRadius: '10px',
                                    width: '100%',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#FFCDD2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#FFEBEE';
                                }}
                            >
                                <LogOut size={18} /> {!collapsed && 'Oturumu Kapat'}
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            <SupportTicketModal
                isOpen={showSupportModal}
                onClose={() => {
                    setShowSupportModal(false);
                    setSelectedTicketId(null);
                }}
                userId={userId}
                userName={`${firstName} ${lastName}`}
                initialTicketId={selectedTicketId}
            />
        </>
    );
}

function SidebarLink({ href, icon, label, exact = false, collapsed, onClick }: { href: string; icon: React.ReactNode; label: string; exact?: boolean; collapsed: boolean; onClick?: () => void }) {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
        <Link
            href={href}
            prefetch={true}
            onClick={onClick}
            className={`nav-link ${isActive ? 'active' : ''}`}
            style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '0.9rem 0' : '0.9rem 1.5rem',
                margin: collapsed ? '0.25rem 0.5rem' : '0.25rem 1rem'
            }}
            title={collapsed ? label : ''}
        >
            {icon}
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}
