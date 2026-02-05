import { getSession } from "@/app/actions/auth";
import { getBranchStats, getBranchStudents, getUniversities } from "@/app/actions/branch";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import { MapPin, Phone, Mail, Users, GraduationCap, Building2, Calendar, Package } from "lucide-react";

// Branch contact information (mock data)
const BRANCH_CONTACTS: Record<BranchCode, { address: string; phone: string; email: string; manager: string }> = {
    sariyer: {
        address: 'Sarıyer, İstanbul, Türkiye',
        phone: '+90 212 XXX XX XX',
        email: 'sariyer@pisaydp.com',
        manager: 'Sarıyer Yönetici'
    },
    kadikoy: {
        address: 'Kadıköy, İstanbul, Türkiye',
        phone: '+90 216 XXX XX XX',
        email: 'kadikoy@pisaydp.com',
        manager: 'Kadıköy Yönetici'
    },
    ankara: {
        address: 'Çankaya, Ankara, Türkiye',
        phone: '+90 312 XXX XX XX',
        email: 'ankara@pisaydp.com',
        manager: 'Ankara Yönetici'
    },
    izmir: {
        address: 'Konak, İzmir, Türkiye',
        phone: '+90 232 XXX XX XX',
        email: 'izmir@pisaydp.com',
        manager: 'İzmir Yönetici'
    },
    bursa: {
        address: 'Nilüfer, Bursa, Türkiye',
        phone: '+90 224 XXX XX XX',
        email: 'bursa@pisaydp.com',
        manager: 'Bursa Yönetici'
    },
    fethiye: {
        address: 'Fethiye, Muğla, Türkiye',
        phone: '+90 252 XXX XX XX',
        email: 'fethiye@pisaydp.com',
        manager: 'Fethiye Yönetici'
    }
};

export default async function BranchInfoPage() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    const branchCode = session.branchCode as BranchCode;
    const branchName = BRANCH_NAMES[branchCode] || branchCode;
    const contact = BRANCH_CONTACTS[branchCode];
    const stats = await getBranchStats(branchCode);
    const students = await getBranchStudents(branchCode);
    const universities = await getUniversities();

    // Calculate package breakdown
    const packageBreakdown = {
        standart: students.filter(s => s.packageType === 'Standart').length,
        premium: students.filter(s => s.packageType === 'Premium').length,
        vip: students.filter(s => s.packageType === 'VIP').length,
        other: students.filter(s => !['Standart', 'Premium', 'VIP'].includes(s.packageType || '')).length
    };

    // Calculate university breakdown (top 5)
    const uniCounts = students.reduce((acc, s) => {
        if (s.universityId) {
            acc[s.universityId] = (acc[s.universityId] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const topUniversities = Object.entries(uniCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => ({
            name: universities.find(u => u.id === id)?.name || 'Bilinmiyor',
            count
        }));

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {branchName} Şubesi - Bilgi
                </h1>
                <p style={{ color: '#808191', marginTop: '0.5rem' }}>
                    Şubenize ait detaylı bilgileri görüntüleyin.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {/* Contact Info Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', color: '#6C5CE7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={20} /> İletişim Bilgileri
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#6C5CE710', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MapPin size={18} color="#6C5CE7" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#808191' }}>Adres</div>
                                <div style={{ fontWeight: '500' }}>{contact.address}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#00B89410', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Phone size={18} color="#00B894" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#808191' }}>Telefon</div>
                                <div style={{ fontWeight: '500' }}>{contact.phone}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FDCB6E10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Mail size={18} color="#FDCB6E" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#808191' }}>E-posta</div>
                                <div style={{ fontWeight: '500' }}>{contact.email}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E1705510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={18} color="#E17055" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#808191' }}>Şube Yöneticisi</div>
                                <div style={{ fontWeight: '500' }}>{contact.manager}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student Stats Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', color: '#00B894', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GraduationCap size={20} /> Öğrenci İstatistikleri
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <StatBox label="Toplam Öğrenci" value={stats.total} color="#6C5CE7" />
                        <StatBox label="Aktif Öğrenci" value={stats.active} color="#00B894" />
                        <StatBox label="Kabul Alan" value={stats.accepted} color="#00CEC9" />
                        <StatBox label="Beklemede" value={stats.pending} color="#FDCB6E" />
                        <StatBox label="Reddedilen" value={stats.rejected} color="#E17055" />
                        <StatBox label="Mezun" value={stats.graduated} color="#6C5CE7" />
                    </div>
                </div>

                {/* Package Breakdown Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', color: '#FDCB6E', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={20} /> Paket Dağılımı
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <PackageBar label="Standart" value={packageBreakdown.standart} total={stats.total} color="#00B894" />
                        <PackageBar label="Premium" value={packageBreakdown.premium} total={stats.total} color="#6C5CE7" />
                        <PackageBar label="VIP" value={packageBreakdown.vip} total={stats.total} color="#FDCB6E" />
                        <PackageBar label="Diğer" value={packageBreakdown.other} total={stats.total} color="#808191" />
                    </div>
                </div>

                {/* Top Universities Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', color: '#E17055', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} /> En Popüler Üniversiteler
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {topUniversities.length > 0 ? topUniversities.map((uni, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8f9ff', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: '#6C5CE7',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {index + 1}
                                    </span>
                                    <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{uni.name}</span>
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: '#6C5CE720',
                                    color: '#6C5CE7',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    {uni.count} öğrenci
                                </span>
                            </div>
                        )) : (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#808191' }}>
                                Henüz kayıtlı öğrenci bulunmuyor.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{
            padding: '1rem',
            background: `${color}10`,
            borderRadius: '12px',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#808191' }}>{label}</div>
        </div>
    );
}

function PackageBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem' }}>{label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{value}</span>
            </div>
            <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: color,
                    borderRadius: '4px',
                    transition: 'width 0.3s'
                }} />
            </div>
        </div>
    );
}
