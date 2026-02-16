import { getSession } from "@/app/actions/auth";
import { getBranchStats } from "@/app/actions/branch";
import { redirect } from "next/navigation";
import { BRANCH_NAMES, BranchCode } from "@/types";
import { Users, CheckCircle, Clock, XCircle, Building2, Briefcase, Home, ArrowUpRight, GraduationCap, TrendingUp, DollarSign } from "lucide-react";
import StudentAvatar from "@/components/common/StudentAvatar";
import Link from "next/link";

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

    const monthlyIncome = {
        consulting: stats.withConsulting * 500,
        accommodation: stats.withAccommodation * 300,
        total: (stats.withConsulting * 500) + (stats.withAccommodation * 300)
    };

    const barColors = ['#8B5CF6', '#14B8A6', '#3B82F6', '#F59E0B', '#EF4444'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>
                    {branchName} Şubesi
                </h1>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 500 }}>Genel Bakış</p>
            </div>

            {/* ═══════════════ SECTION A: TOP STATS ROW ═══════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    icon={<Users size={18} />}
                    label="Toplam"
                    value={stats.total}
                    borderColor="#6366F1"
                />
                <StatCard
                    icon={<CheckCircle size={18} />}
                    label="Kabul"
                    value={stats.accepted}
                    borderColor="#10B981"
                    percent={acceptRate}
                />
                <StatCard
                    icon={<Clock size={18} />}
                    label="Beklemede"
                    value={stats.pending}
                    borderColor="#F59E0B"
                    percent={pendingRate}
                />
                <StatCard
                    icon={<XCircle size={18} />}
                    label="Red"
                    value={stats.rejected}
                    borderColor="#F43F5E"
                    percent={rejectRate}
                />
                <StatCard
                    icon={<DollarSign size={18} />}
                    label="Aylık Gelir"
                    value={`€${monthlyIncome.total.toLocaleString()}`}
                    borderColor="#059669"
                    isText
                />
            </div>

            {/* ═══════════════ SECTION B: MAIN 3-COL GRID ═══════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ flex: 1, minHeight: 0 }}>

                {/* ── COL 1: En Çok Tercih Edilen + Quick Links ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>
                            <Building2 size={16} color="#8B5CF6" /> En Çok Tercih Edilen
                        </h3>
                        {stats.universityDistribution.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {stats.universityDistribution.slice(0, 5).map((uni, idx) => (
                                    <div key={uni.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            width: '24px', height: '24px', borderRadius: '6px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: '0.7rem', fontWeight: 700,
                                            background: barColors[idx], flexShrink: 0,
                                        }}>
                                            {idx + 1}
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uni.name}</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: barColors[idx], flexShrink: 0 }}>{uni.count}</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '9999px' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: '9999px',
                                                    width: `${Math.min((uni.count / stats.total) * 100, 100)}%`,
                                                    background: barColors[idx],
                                                    transition: 'width 0.8s ease-out',
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Henüz veri yok</p>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <QuickLink href="/branch/students" label="Öğrenciler" color="#8B5CF6" />
                        <QuickLink href="/branch/universities" label="Üniversiteler" color="#10B981" />
                    </div>
                </div>

                {/* ── COL 2: Son Eklenen Öğrenciler ── */}
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>
                        <GraduationCap size={16} color="#10B981" /> Son Eklenen Öğrenciler
                    </h3>
                    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {stats.recentStudents.length > 0 ? stats.recentStudents.map((student) => (
                            <div key={student.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.75rem', background: '#F9FAFB', borderRadius: '0.75rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                                    <StudentAvatar
                                        studentId={student.id}
                                        firstName={student.firstName || ''}
                                        lastName={student.lastName || ''}
                                        photoUrl={student.photoUrl}
                                        size={40}
                                        canEdit={false}
                                        isAuthorized={true}
                                        table="branch_students"
                                        showDelete={false}
                                    />
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.university}</p>
                                    </div>
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                                    fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                                    background: student.status === 'Kabul' ? '#D1FAE5' : student.status === 'Red' ? '#FEE2E2' : '#FEF3C7',
                                    color: student.status === 'Kabul' ? '#065F46' : student.status === 'Red' ? '#991B1B' : '#92400E',
                                }}>
                                    {student.status || 'Beklemede'}
                                </span>
                            </div>
                        )) : (
                            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Henüz öğrenci yok</p>
                        )}
                    </div>
                </div>

                {/* ── COL 3: Chart + Revenue + Ek Bilgiler ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                    {/* Donut Chart */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem', textAlign: 'center' }}>Başvuru Durumu</h3>
                        {stats.total > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%', position: 'relative', flexShrink: 0,
                                    background: `conic-gradient(#10B981 0deg ${acceptRate * 3.6}deg, #F59E0B ${acceptRate * 3.6}deg ${(acceptRate + pendingRate) * 3.6}deg, #F43F5E ${(acceptRate + pendingRate) * 3.6}deg 360deg)`,
                                }}>
                                    <div style={{
                                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                        width: '60px', height: '60px', borderRadius: '50%', background: 'white',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>{stats.total}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                    <LegendItem color="#10B981" label="Kabul" value={stats.accepted} percent={acceptRate} />
                                    <LegendItem color="#F59E0B" label="Beklemede" value={stats.pending} percent={pendingRate} />
                                    <LegendItem color="#F43F5E" label="Red" value={stats.rejected} percent={rejectRate} />
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>Veri yok</p>
                        )}
                    </div>

                    {/* ═══ GREEN REVENUE CARD ═══ */}
                    <div style={{
                        background: '#10B981', borderRadius: '1rem', padding: '1.5rem',
                        color: 'white', boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <TrendingUp size={18} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Aylık Tahmini Gelir</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>€{monthlyIncome.total.toLocaleString()}</div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', opacity: 0.85 }}>
                            <span>Danışmanlık: €{monthlyIncome.consulting}</span>
                            <span>Konaklama: €{monthlyIncome.accommodation}</span>
                        </div>
                    </div>

                    {/* Ek Bilgiler */}
                    <div style={{ ...cardStyle, flex: 1 }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem' }}>Ek Bilgiler</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <MiniStat icon={<Building2 size={15} />} label="Üniversite" value={stats.totalUniversities} color="#8B5CF6" />
                            <MiniStat icon={<Briefcase size={15} />} label="Danışmanlık" value={stats.withConsulting} color="#3B82F6" />
                            <MiniStat icon={<Home size={15} />} label="Konaklama" value={stats.withAccommodation} color="#14B8A6" />
                            <MiniStat icon={<GraduationCap size={15} />} label="Mezun" value={stats.graduated} color="#10B981" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════ SHARED STYLES ═══════════════ */

const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    border: '1px solid #F3F4F6',
    display: 'flex',
    flexDirection: 'column',
};

const cardTitleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
};

/* ═══════════════ COMPONENTS ═══════════════ */

function StatCard({ icon, label, value, borderColor, percent, isText }: {
    icon: React.ReactNode; label: string; value: number | string;
    borderColor: string; percent?: number; isText?: boolean;
}) {
    return (
        <div style={{
            background: 'white', borderRadius: '1rem', padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
            borderTop: `4px solid ${borderColor}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '120px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ color: '#9CA3AF' }}>{icon}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto' }}>
                <span style={{ fontWeight: 800, color: '#111827', fontSize: isText ? '1.5rem' : '2rem', lineHeight: 1 }}>{value}</span>
                {percent !== undefined && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: borderColor }}>%{percent}</span>
                )}
            </div>
        </div>
    );
}

function LegendItem({ color, label, value, percent }: { color: string; label: string; value: number; percent: number }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{value} <span style={{ color: '#9CA3AF' }}>(%{percent})</span></span>
        </div>
    );
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${color}15`, color,
                }}>
                    {icon}
                </div>
                <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{value}</span>
        </div>
    );
}

function QuickLink({ href, label, color }: { href: string; label: string; color: string }) {
    return (
        <Link href={href} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', background: 'white', borderRadius: '0.75rem',
            textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #F3F4F6',
        }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{label}</span>
            <div style={{
                width: '26px', height: '26px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}15`, color,
            }}>
                <ArrowUpRight size={13} />
            </div>
        </Link>
    );
}
