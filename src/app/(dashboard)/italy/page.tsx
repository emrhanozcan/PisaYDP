import { getSession } from "@/app/actions/auth";
<<<<<<< HEAD
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BranchCode, BRANCH_NAMES } from "@/types";
import UniversitiesClient from "./universities/UniversitiesClient";

export default async function UniversitiesPage() {
=======
import { getAllBranchesStats } from "@/app/actions/italy";
import { redirect } from "next/navigation";
import { Users, CheckCircle, Clock, XCircle, DollarSign, Building2, TrendingUp, GraduationCap } from "lucide-react";

export default async function ItalyDashboard() {
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
    const session = await getSession();

    if (!session || session.role !== 'italy_staff') {
        redirect('/login');
    }

<<<<<<< HEAD
    // Get all universities
    const universities = db.universities.getAll();

    // Get user favorites
    const favorites = db.userFavorites.getByUser(session.id);
    const favoriteIds = favorites.map(f => f.universityId);

    // Get all students from all branches
    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];
    const allStudents = allBranches.flatMap(branchCode =>
        db.branchStudents.getByBranch(branchCode).map(s => ({
            ...s,
            branchName: BRANCH_NAMES[branchCode]
        }))
    );

    return (
        <div>
            <div style={{ marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                    Üniversiteler
                </h1>
                <p style={{ color: '#808191', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    İtalya üniversitelerini görüntüleyin.
                </p>
            </div>

            <UniversitiesClient
                universities={universities}
                allStudents={allStudents}
                initialFavorites={favoriteIds}
                userId={session.id}
            />
=======
    const { branches, totals } = await getAllBranchesStats();

    const acceptRate = totals.total > 0 ? Math.round((totals.accepted / totals.total) * 100) : 0;
    const pendingRate = totals.total > 0 ? Math.round((totals.pending / totals.total) * 100) : 0;
    const rejectRate = totals.total > 0 ? Math.round((totals.rejected / totals.total) * 100) : 0;

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '0.25rem' }}>
                    İtalya Genel Merkez
                </h1>
                <p style={{ color: '#808191', fontSize: '0.85rem' }}>Tüm Şubelerin Genel Bakışı</p>
            </div>

            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                <StatCard icon={<Users size={20} />} label="Toplam Öğrenci" value={totals.total} color="#6C5CE7" />
                <StatCard icon={<CheckCircle size={20} />} label="Kabul" value={totals.accepted} color="#00B894" percent={acceptRate} />
                <StatCard icon={<Clock size={20} />} label="Beklemede" value={totals.pending} color="#FDCB6E" percent={pendingRate} />
                <StatCard icon={<XCircle size={20} />} label="Red" value={totals.rejected} color="#E17055" percent={rejectRate} />
                <StatCard icon={<DollarSign size={20} />} label="Toplam Gelir" value={`€${totals.income.toLocaleString()}`} color="#27AE60" isText />
            </div>

            {/* Main Grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minHeight: 0 }}>

                {/* Branches Grid */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="#6C5CE7" /> Şube Performansları
                    </h3>
                    <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', alignContent: 'start' }}>
                        {branches.map(branch => (
                            <a key={branch.code} href={`/italy/branches/${branch.code}`} style={{ padding: '1rem', background: '#fafafc', borderRadius: '12px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'transform 0.15s, box-shadow 0.15s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e' }}>{branch.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#27AE60', fontWeight: '500' }}>€{branch.income}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem' }}>
                                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#6C5CE715', color: '#6C5CE7' }}>{branch.total} öğrenci</span>
                                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#00B89415', color: '#00B894' }}>{branch.accepted} kabul</span>
                                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#FDCB6E15', color: '#F39C12' }}>{branch.pending} beklemede</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Right Column: Pie + Income */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                    {/* Pie Chart */}
                    <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '0.75rem', textAlign: 'center' }}>Genel Başvuru Durumu</h3>
                        {totals.total > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{
                                    width: '120px', height: '120px', borderRadius: '50%', position: 'relative', flexShrink: 0,
                                    background: `conic-gradient(#00B894 0deg ${acceptRate * 3.6}deg, #FDCB6E ${acceptRate * 3.6}deg ${(acceptRate + pendingRate) * 3.6}deg, #E17055 ${(acceptRate + pendingRate) * 3.6}deg 360deg)`
                                }}>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a1a2e' }}>{totals.total}</span>
                                        <span style={{ fontSize: '0.6rem', color: '#808191' }}>Toplam</span>
                                    </div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <LegendItem color="#00B894" label="Kabul" value={totals.accepted} percent={acceptRate} />
                                    <LegendItem color="#FDCB6E" label="Beklemede" value={totals.pending} percent={pendingRate} />
                                    <LegendItem color="#E17055" label="Red" value={totals.rejected} percent={rejectRate} />
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#808191', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Henüz veri yok</p>
                        )}
                    </div>

                    {/* Income Card */}
                    <div style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)', borderRadius: '14px', padding: '1.25rem', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                            <TrendingUp size={18} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Toplam Tahmini Gelir</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>€{totals.income.toLocaleString()}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.75rem', opacity: 0.9 }}>
                            {branches.slice(0, 3).map(b => (
                                <div key={b.code}>{b.name}: €{b.income}</div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div style={{ flex: 1, background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '0.75rem' }}>Özet Bilgiler</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <MiniStat icon={<Building2 size={14} />} label="Aktif Şube" value={branches.length} color="#9B59B6" />
                            <MiniStat icon={<GraduationCap size={14} />} label="Üniversite" value={totals.totalUniversities} color="#3498DB" />
                            <MiniStat icon={<Users size={14} />} label="Aktif Öğrenci" value={totals.active} color="#00B894" />
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
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#333' }}>{value} <span style={{ color: '#999' }}>(%{percent})</span></span>
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
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
        </div>
    );
}
