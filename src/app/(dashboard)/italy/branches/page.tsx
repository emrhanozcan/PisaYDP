import { getSession } from "@/app/actions/auth";
import { getAllBranchesStats } from "@/app/actions/italy";
import { redirect } from "next/navigation";
import { Building2, Users, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";

export default async function BranchesPage() {
    const session = await getSession();

    if (!session || session.role !== 'italy_staff') {
        redirect('/login');
    }

    const { branches, totals } = await getAllBranchesStats();

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '0.25rem' }}>Şubeler</h1>
                <p style={{ color: '#808191', fontSize: '0.85rem' }}>Tüm Türkiye şubelerini görüntüleyin</p>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <SummaryCard icon={<Building2 size={18} />} label="Toplam Şube" value={branches.length} color="#6C5CE7" />
                <SummaryCard icon={<Users size={18} />} label="Toplam Öğrenci" value={totals.total} color="#3498DB" />
                <SummaryCard icon={<CheckCircle size={18} />} label="Toplam Kabul" value={totals.accepted} color="#00B894" />
                <SummaryCard icon={<TrendingUp size={18} />} label="Toplam Gelir" value={`€${totals.income.toLocaleString()}`} color="#27AE60" />
            </div>

            {/* Branch Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {branches.map(branch => (
                    <a key={branch.code} href={`/italy/branches/${branch.code}`}
                        style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.15s, box-shadow 0.15s', borderLeft: '4px solid #6C5CE7' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a2e' }}>{branch.name}</h3>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6C5CE715', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C5CE7' }}>
                                <ArrowRight size={16} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                            <StatItem label="Öğrenci" value={branch.total} color="#6C5CE7" />
                            <StatItem label="Kabul" value={branch.accepted} color="#00B894" />
                            <StatItem label="Beklemede" value={branch.pending} color="#F39C12" />
                            <StatItem label="Red" value={branch.rejected} color="#E17055" />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f5' }}>
                            <div style={{ fontSize: '0.75rem', color: '#808191' }}>
                                Danışmanlık: {branch.withConsulting} • Konaklama: {branch.withAccommodation}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#27AE60' }}>€{branch.income}</div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
            <div>
                <p style={{ fontSize: '0.75rem', color: '#808191' }}>{label}</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a2e' }}>{value}</p>
            </div>
        </div>
    );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: '#fafafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#666' }}>{label}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color }}>{value}</span>
        </div>
    );
}
