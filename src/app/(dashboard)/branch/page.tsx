import { getSession } from "@/app/actions/auth";
import { getBranchStats } from "@/app/actions/branch";
import { redirect } from "next/navigation";
import { BRANCH_NAMES, BranchCode } from "@/types";
import { Users, CheckCircle, Clock, XCircle, Building2, Briefcase, Home, ArrowUpRight, GraduationCap, TrendingUp, DollarSign } from "lucide-react";

export default async function BranchDashboard() {
    const session = await getSession();

    if (!session || session.role !== 'branch_user') {
        redirect('/login');
    }

    const branchCode = session.branchCode as BranchCode;
    const branchName = BRANCH_NAMES[branchCode] || branchCode;
    const stats = await getBranchStats(branchCode);

    const acceptRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;
    const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;
    const rejectRate = stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;

    // Mock income data (could be fetched from backend)
    const monthlyIncome = {
        consulting: stats.withConsulting * 500,
        accommodation: stats.withAccommodation * 300,
        total: (stats.withConsulting * 500) + (stats.withAccommodation * 300)
    };

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '0.25rem' }}>
                    {branchName} Şubesi
                </h1>
                <p style={{ color: '#808191', fontSize: '0.85rem' }}>Genel Bakış</p>
            </div>

            {/* Top Stats Row - Full Width */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                <StatCard icon={<Users size={20} />} label="Toplam" value={stats.total} color="#6C5CE7" />
                <StatCard icon={<CheckCircle size={20} />} label="Kabul" value={stats.accepted} color="#00B894" percent={acceptRate} />
                <StatCard icon={<Clock size={20} />} label="Beklemede" value={stats.pending} color="#FDCB6E" percent={pendingRate} />
                <StatCard icon={<XCircle size={20} />} label="Red" value={stats.rejected} color="#E17055" percent={rejectRate} />
                <StatCard icon={<DollarSign size={20} />} label="Aylık Gelir" value={`€${monthlyIncome.total.toLocaleString()}`} color="#27AE60" isText />
            </div>

            {/* Main Grid - 3 Equal Columns */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', minHeight: 0 }}>

                {/* Column 1: Universities + Quick Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                    <div style={{ flex: 1, background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'auto', minHeight: 0 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={16} color="#6C5CE7" /> En Çok Tercih Edilen
                        </h3>
                        {stats.universityDistribution.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {stats.universityDistribution.slice(0, 5).map((uni, idx) => (
                                    <div key={uni.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: ['#6C5CE7', '#00B894', '#3498DB', '#9B59B6', '#E67E22'][idx], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: '600', flexShrink: 0 }}>{idx + 1}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uni.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#6C5CE7', fontWeight: '600', flexShrink: 0 }}>{uni.count}</span>
                                            </div>
                                            <div style={{ height: '5px', background: '#f0f0f5', borderRadius: '3px' }}>
                                                <div style={{ height: '100%', width: `${Math.min((uni.count / stats.total) * 100, 100)}%`, background: ['#6C5CE7', '#00B894', '#3498DB', '#9B59B6', '#E67E22'][idx], borderRadius: '3px' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#808191', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Henüz veri yok</p>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <QuickLink href="/branch/students" label="Öğrenciler" color="#6C5CE7" />
                        <QuickLink href="/branch/universities" label="Üniversiteler" color="#00B894" />
                    </div>
                </div>

                {/* Column 2: Recent Students */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <GraduationCap size={16} color="#00B894" /> Son Eklenen Öğrenciler
                    </h3>
                    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {stats.recentStudents.length > 0 ? stats.recentStudents.map((student) => (
                            <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem', background: '#fafafc', borderRadius: '10px', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: '600', flexShrink: 0 }}>
                                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: '0.8rem', fontWeight: '500', color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#808191', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.university}</p>
                                    </div>
                                </div>
                                <span style={{
                                    padding: '3px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '500', flexShrink: 0,
                                    background: student.status === 'Kabul' ? '#E8F5E9' : student.status === 'Red' ? '#FFEBEE' : '#FFF8E1',
                                    color: student.status === 'Kabul' ? '#2E7D32' : student.status === 'Red' ? '#C62828' : '#F57F17'
                                }}>{student.status || 'Beklemede'}</span>
                            </div>
                        )) : (
                            <p style={{ color: '#808191', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Henüz öğrenci yok</p>
                        )}
                    </div>
                </div>

                {/* Column 3: Pie Chart + Income + Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                    {/* Pie Chart */}
                    <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '0.75rem', textAlign: 'center' }}>Başvuru Durumu</h3>
                        {stats.total > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%', position: 'relative', flexShrink: 0,
                                    background: `conic-gradient(#00B894 0deg ${acceptRate * 3.6}deg, #FDCB6E ${acceptRate * 3.6}deg ${(acceptRate + pendingRate) * 3.6}deg, #E17055 ${(acceptRate + pendingRate) * 3.6}deg 360deg)`
                                }}>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', borderRadius: '50%', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1a1a2e' }}>{stats.total}</span>
                                    </div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <LegendItem color="#00B894" label="Kabul" value={stats.accepted} percent={acceptRate} />
                                    <LegendItem color="#FDCB6E" label="Beklemede" value={stats.pending} percent={pendingRate} />
                                    <LegendItem color="#E17055" label="Red" value={stats.rejected} percent={rejectRate} />
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#808191', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Veri yok</p>
                        )}
                    </div>

                    {/* Monthly Income */}
                    <div style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)', borderRadius: '14px', padding: '1rem', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                            <TrendingUp size={16} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Aylık Tahmini Gelir</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>€{monthlyIncome.total.toLocaleString()}</div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', opacity: 0.9 }}>
                            <span>Danışmanlık: €{monthlyIncome.consulting}</span>
                            <span>Konaklama: €{monthlyIncome.accommodation}</span>
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div style={{ flex: 1, background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', minHeight: 0 }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '0.75rem' }}>Ek Bilgiler</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <MiniStat icon={<Building2 size={14} />} label="Üniversite" value={stats.totalUniversities} color="#9B59B6" />
                            <MiniStat icon={<Briefcase size={14} />} label="Danışmanlık" value={stats.withConsulting} color="#3498DB" />
                            <MiniStat icon={<Home size={14} />} label="Konaklama" value={stats.withAccommodation} color="#1ABC9C" />
                            <MiniStat icon={<GraduationCap size={14} />} label="Mezun" value={stats.graduated} color="#27AE60" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, percent, isText }: { icon: React.ReactNode; label: string; value: number | string; color: string; percent?: number; isText?: boolean }) {
    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderTop: `3px solid ${color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                <div style={{ color }}>{icon}</div>
                <span style={{ fontSize: '0.75rem', color: '#808191' }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: isText ? '1.1rem' : '1.4rem', fontWeight: 'bold', color: '#1a1a2e' }}>{value}</span>
                {percent !== undefined && <span style={{ fontSize: '0.7rem', color, fontWeight: '500' }}>%{percent}</span>}
            </div>
        </div>
    );
}

function LegendItem({ color, label, value, percent }: { color: string; label: string; value: number; percent: number }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                <span style={{ fontSize: '0.75rem', color: '#666' }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#333' }}>{value} <span style={{ color: '#999' }}>(%{percent})</span></span>
        </div>
    );
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e' }}>{value}</span>
        </div>
    );
}

function QuickLink({ href, label, color }: { href: string; label: string; color: string }) {
    return (
        <a href={href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'white', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#1a1a2e' }}>{label}</span>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}><ArrowUpRight size={12} /></div>
        </a>
    );
}
