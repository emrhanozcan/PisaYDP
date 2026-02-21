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
<<<<<<< HEAD
    Building2
} from "lucide-react";
import { logout } from "@/app/actions/auth";
=======
    Building2,
    Home,
    Shield,
    HeartHandshake,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useState } from "react";
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a

interface SidebarProps {
    userRole: 'admin' | 'mentor' | 'branch_user' | 'italy_staff';
    firstName: string;
    lastName: string;
    branchCode?: string;
}

export default function Sidebar({ userRole, firstName, lastName, branchCode }: SidebarProps) {
<<<<<<< HEAD
=======
    const [collapsed, setCollapsed] = useState(false);

>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
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
        return userRole === 'admin' ? 'Yönetici' : 'Mentor';
    };

    return (
<<<<<<< HEAD
        <aside className="sidebar">
            <div className="brand-area">
                <div className="brand-logo">P</div>
                <span className="brand-text">Pisa<span className="brand-highlight">YDP</span></span>
            </div>

            <div className="user-profile-card">
                <div className="profile-avatar">
                    {firstName[0]}{lastName[0]}
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{firstName} {lastName}</p>
                    <p style={{ fontSize: '0.75rem', color: '#808191' }}>{getRoleDisplay()}</p>
                </div>
            </div>

            <nav>
                {userRole === 'admin' && (
                    <>
                        <div className="nav-section-title">Yönetim</div>
                        <SidebarLink href="/admin" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                        <SidebarLink href="/admin/students" icon={<GraduationCap size={20} />} label="Öğrenciler" />
                        <SidebarLink href="/admin/mentors" icon={<Users size={20} />} label="Mentorlar" />
                        <SidebarLink href="/admin/services" icon={<FileText size={20} />} label="Hizmet Kayıtları" />
                        <SidebarLink href="/admin/payouts" icon={<Wallet size={20} />} label="Ödemeler & Rapor" />
                        <SidebarLink href="/admin/settings" icon={<Settings size={20} />} label="Ayarlar" />
                    </>
                )}

                {userRole === 'mentor' && (
                    <>
                        <div className="nav-section-title">Mentor Paneli</div>
                        <SidebarLink href="/mentor" exact icon={<Users size={20} />} label="Öğrencilerim" />
                        <SidebarLink href="/mentor/earnings" icon={<Wallet size={20} />} label="Hakediş & Özet" />
                        <SidebarLink href="/mentor/settings" icon={<Settings size={20} />} label="Ayarlar" />
                    </>
                )}

                {userRole === 'branch_user' && (
                    <>
                        <div className="nav-section-title">Şube Paneli</div>
                        <SidebarLink href="/branch" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                        <SidebarLink href="/branch/info" icon={<FileText size={20} />} label="Şube Bilgisi" />
                        <SidebarLink href="/branch/universities" icon={<GraduationCap size={20} />} label="Üniversiteler" />
                        <SidebarLink href="/branch/students" icon={<Users size={20} />} label="Öğrenciler" />
                    </>
                )}

                {userRole === 'italy_staff' && (
                    <>
                        <div className="nav-section-title">İtalya Paneli</div>
                        <SidebarLink href="/italy" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                        <SidebarLink href="/italy/branches" icon={<Building2 size={20} />} label="Şubeler" />
                        <SidebarLink href="/italy/students" icon={<Users size={20} />} label="Tüm Öğrenciler" />
                        <SidebarLink href="/italy/universities" icon={<GraduationCap size={20} />} label="Üniversiteler" />
                    </>
                )}
            </nav>

            <div className="support-card">
                <h4>Destek Hattı?</h4>
                <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '1rem' }}>Sorun yaşarsanız bize ulaşın.</p>
                <button className="support-btn">Yardım İste</button>
            </div>

            <div style={{ padding: '0 2rem 2rem' }}>
                <form action={logout}>
                    <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#999', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <LogOut size={18} /> Oturumu Kapat
                    </button>
                </form>
=======
        <aside className="sidebar" style={{ width: collapsed ? '80px' : '280px', transition: 'width 0.3s ease', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
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

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                <div className="brand-area" style={{ padding: collapsed ? '1.5rem 1rem' : '2rem', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <div className="brand-logo" style={{ width: collapsed ? '32px' : '40px', height: collapsed ? '32px' : '40px', fontSize: collapsed ? '1rem' : '1.2rem' }}>P</div>
                    {!collapsed && <span className="brand-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s' }}>Pisa<span className="brand-highlight">YDP</span></span>}
                </div>

                <div className="user-profile-card" style={{ margin: collapsed ? '0 0.5rem 0.5rem' : '0 1.5rem 0.5rem', padding: collapsed ? '0.5rem' : '1rem', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <div className="profile-avatar" style={{ width: collapsed ? '32px' : '40px', height: collapsed ? '32px' : '40px', fontSize: collapsed ? '0.8rem' : '1rem' }}>
                        {firstName[0]}{lastName[0]}
                    </div>
                    {!collapsed && (
                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{firstName} {lastName}</p>
                            <p style={{ fontSize: '0.75rem', color: '#808191' }}>{getRoleDisplay()}</p>
                        </div>
                    )}
                </div>

                <nav style={{ flex: 1, overflow: 'hidden' }}>
                    {userRole === 'admin' && (
                        <>
                            {!collapsed && <div className="nav-section-title">Yönetim</div>}
                            <SidebarLink collapsed={collapsed} href="/admin" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                            <SidebarLink collapsed={collapsed} href="/admin/students" icon={<GraduationCap size={20} />} label="Öğrenciler" />
                            <SidebarLink collapsed={collapsed} href="/admin/mentors" icon={<Users size={20} />} label="Mentorlar" />
                            <SidebarLink collapsed={collapsed} href="/admin/services" icon={<FileText size={20} />} label="Hizmet Kayıtları" />
                            <SidebarLink collapsed={collapsed} href="/admin/payouts" icon={<Wallet size={20} />} label="Ödemeler & Rapor" />
                            <SidebarLink collapsed={collapsed} href="/admin/settings" icon={<Settings size={20} />} label="Ayarlar" />
                        </>
                    )}

                    {userRole === 'mentor' && (
                        <>
                            {!collapsed && <div className="nav-section-title">Mentor Paneli</div>}
                            <SidebarLink collapsed={collapsed} href="/mentor" exact icon={<Users size={20} />} label="Öğrencilerim" />
                            <SidebarLink collapsed={collapsed} href="/mentor/earnings" icon={<Wallet size={20} />} label="Hakediş & Özet" />
                            <SidebarLink collapsed={collapsed} href="/mentor/settings" icon={<Settings size={20} />} label="Ayarlar" />
                        </>
                    )}

                    {userRole === 'branch_user' && (
                        <>
                            {!collapsed && <div className="nav-section-title">Şube Paneli</div>}
                            <SidebarLink collapsed={collapsed} href="/branch" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                            <SidebarLink collapsed={collapsed} href="/branch/info" icon={<FileText size={20} />} label="Şube Bilgisi" />
                            <SidebarLink collapsed={collapsed} href="/branch/universities" icon={<GraduationCap size={20} />} label="Üniversiteler" />
                            <SidebarLink collapsed={collapsed} href="/branch/students" icon={<Users size={20} />} label="Öğrenciler" />
                        </>
                    )}

                    {userRole === 'italy_staff' && (
                        <>
                            {!collapsed && <div className="nav-section-title" style={{ marginTop: '0' }}>İtalya Paneli</div>}
                            <SidebarLink collapsed={collapsed} href="/italy" exact icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
                            <SidebarLink collapsed={collapsed} href="/italy/branches" icon={<Building2 size={20} />} label="Şubeler" />
                            <SidebarLink collapsed={collapsed} href="/italy/students" icon={<Users size={20} />} label="Tüm Öğrenciler" />
                            <SidebarLink collapsed={collapsed} href="/italy/universities" icon={<GraduationCap size={20} />} label="Üniversiteler" />
                            <SidebarLink collapsed={collapsed} href="/italy/accommodation" icon={<Home size={20} />} label="Konaklama Hizmeti" />
                            <SidebarLink collapsed={collapsed} href="/italy/residence-permit" icon={<FileText size={20} />} label="Oturum İzni" />
                            <SidebarLink collapsed={collapsed} href="/italy/guardian-service" icon={<Shield size={20} />} label="Vasi Hizmeti" />
                            <SidebarLink collapsed={collapsed} href="/italy/life-support" icon={<HeartHandshake size={20} />} label="Yaşam Destek Hizmeti" />
                        </>
                    )}
                </nav>

                {!collapsed && (
                    <div className="support-card" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s' }}>
                        <h4>Destek Hattı?</h4>
                        <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '1rem' }}>Sorun yaşarsanız bize ulaşın.</p>
                        <button className="support-btn">Yardım İste</button>
                    </div>
                )}

                <div style={{ padding: collapsed ? '0 1rem 2rem' : '0 2rem 2rem', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <form action={logout}>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#999', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <LogOut size={18} /> {!collapsed && 'Oturumu Kapat'}
                        </button>
                    </form>
                </div>
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
            </div>
        </aside>
    );
}

<<<<<<< HEAD
function SidebarLink({ href, icon, label, exact = false }: { href: string; icon: React.ReactNode; label: string; exact?: boolean }) {
    const pathname = usePathname();
    // Check active state
    // exact match for /admin (so it doesn't stay active on /admin/students)
    // startsWith for others
=======
function SidebarLink({ href, icon, label, exact = false, collapsed }: { href: string; icon: React.ReactNode; label: string; exact?: boolean; collapsed: boolean }) {
    const pathname = usePathname();
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
        <Link
            href={href}
            className={`nav-link ${isActive ? 'active' : ''}`}
<<<<<<< HEAD
        >
            {icon}
            <span>{label}</span>
=======
            style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '0.9rem 0' : '0.9rem 1.5rem',
                margin: collapsed ? '0.25rem 0.5rem' : '0.25rem 1rem'
            }}
            title={collapsed ? label : ''}
        >
            {icon}
            {!collapsed && <span>{label}</span>}
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
        </Link>
    );
}
