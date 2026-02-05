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
    Building2
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface SidebarProps {
    userRole: 'admin' | 'mentor' | 'branch_user' | 'italy_staff';
    firstName: string;
    lastName: string;
    branchCode?: string;
}

export default function Sidebar({ userRole, firstName, lastName, branchCode }: SidebarProps) {
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
            </div>
        </aside>
    );
}

function SidebarLink({ href, icon, label, exact = false }: { href: string; icon: React.ReactNode; label: string; exact?: boolean }) {
    const pathname = usePathname();
    // Check active state
    // exact match for /admin (so it doesn't stay active on /admin/students)
    // startsWith for others
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
        <Link
            href={href}
            className={`nav-link ${isActive ? 'active' : ''}`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
