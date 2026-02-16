'use client';

import {
    Users,
    Building2,
    Wallet,
    ArrowUpRight,
    TrendingUp,
    Activity,
    UserCheck,
    Globe,
    GraduationCap,
    X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getStudentFullDetails } from "@/app/actions/student-details";
import StudentDetailView from "@/components/admin/StudentDetailView";
import StudentAvatar from "@/components/common/StudentAvatar";
import PendingRequestsSection from "@/components/admin/PendingRequestsSection";

interface AdminDashboardProps {
    stats: {
        totalStudents: number;
        activeStudents: number;
        totalMentors: number;
        totalBranches: number;
        totalUniversities: number;
        totalRevenue: number;
    };
    branchDistribution: { name: string; count: number; color: string }[];
    topUniversities: { name: string; count: number }[];
    recentStudents: any[];
    userRole: string;
    removalRequests?: any[];
}

export default function AdminDashboardClient({
    stats,
    branchDistribution,
    topUniversities,
    recentStudents,
    userRole,
    removalRequests = []
}: AdminDashboardProps) {
    const [isUniversitiesOpen, setIsUniversitiesOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isLoadingStudent, setIsLoadingStudent] = useState(false);

    const handleStudentDetailClick = async (studentId: string) => {
        setIsLoadingStudent(true);
        try {
            const data = await getStudentFullDetails(studentId);
            setSelectedStudent(data);
        } catch (error) {
            console.error("Failed to fetch student details:", error);
        } finally {
            setIsLoadingStudent(false);
        }
    };

    const closeModals = () => {
        setIsUniversitiesOpen(false);
        setSelectedStudent(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem', position: 'relative' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '0.5rem' }}>
                    Yönetim Paneli
                </h1>
                <p style={{ color: '#808191', fontSize: '0.95rem' }}>Platform genel durumu ve özet istatistikler</p>
            </div>

            <PendingRequestsSection requests={removalRequests} />

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users size={24} />}
                    label="Toplam Öğrenci"
                    value={stats.totalStudents}
                    trend="+12%"
                    color="#6C5CE7"
                    subLabel={`${stats.activeStudents} Aktif`}
                />
                <StatCard
                    icon={<UserCheck size={24} />}
                    label="Toplam Mentor"
                    value={stats.totalMentors}
                    trend="+5%"
                    color="#00B894"
                    subLabel="Aktif Görevde"
                />
                <StatCard
                    icon={<Building2 size={24} />}
                    label="Aktif Şube"
                    value={stats.totalBranches}
                    color="#0984e3"
                    subLabel="Türkiye Geneli"
                />
                <StatCard
                    icon={<Wallet size={24} />}
                    label="Tahmini Ciro"
                    value={`€${stats.totalRevenue.toLocaleString()}`}
                    trend="+8%"
                    color="#fdcb6e"
                    subLabel="Bu Ay"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Branch Distribution (Bar Chart) */}
                <div className="lg:col-span-2" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Globe size={18} color="#6C5CE7" /> Şube Dağılımı
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {branchDistribution.map((branch, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '100px', fontSize: '0.9rem', color: '#555', fontWeight: '500' }}>{branch.name}</div>
                                <div style={{ flex: 1, height: '10px', background: '#f1f2f6', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(branch.count / stats.totalStudents) * 100}%`,
                                        background: branch.color,
                                        borderRadius: '5px',
                                        transition: 'width 1s ease-out'
                                    }} />
                                </div>
                                <div style={{ width: '40px', fontSize: '0.9rem', fontWeight: 'bold', color: '#1a1a2e', textAlign: 'right' }}>{branch.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* University Distribution (Pie/List) */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={18} color="#00B894" /> Top Üniversiteler
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {topUniversities.slice(0, 5).map((uni, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '12px', background: '#fafafa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        background: idx === 0 ? '#ff7675' : idx === 1 ? '#74b9ff' : '#a29bfe',
                                        color: 'white', fontSize: '0.8rem', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: '#2d3436', fontWeight: '500' }}>{uni.name}</span>
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1a1a2e' }}>{uni.count}</span>
                            </div>
                        ))}
                        {topUniversities.length === 0 && <p style={{ color: '#b2bec3', textAlign: 'center' }}>Veri yok</p>}
                    </div>
                    <button
                        onClick={() => setIsUniversitiesOpen(true)}
                        style={{ display: 'block', width: '100%', marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#6C5CE7', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Tümünü Listele
                    </button>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} color="#fdcb6e" /> Son Etkileşimler
                    </h3>
                    <Link href="/admin/students" style={{ fontSize: '0.85rem', color: '#6C5CE7', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Tümünü Gör <ArrowUpRight size={14} />
                    </Link>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f1f2f6', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#b2bec3', fontWeight: '600' }}>ÖĞRENCİ</th>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#b2bec3', fontWeight: '600' }}>ŞUBE / DURUM</th>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#b2bec3', fontWeight: '600' }}>ÜNİVERSİTE</th>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#b2bec3', fontWeight: '600' }}>KAYIT TARİHİ</th>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#b2bec3', fontWeight: '600' }}>İŞLEM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentStudents.map((student) => (
                                <tr key={`${student.type}-${student.id}`} style={{ borderBottom: '1px solid #f9f9f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <StudentAvatar
                                                studentId={student.id}
                                                firstName={student.firstName}
                                                lastName={student.lastName}
                                                photoUrl={student.photoUrl}
                                                size={36}
                                                canEdit={userRole !== '' && userRole !== 'mentor'}
                                                table={student.type === 'branch' ? 'branch_students' : 'students'}
                                                showDelete={false}
                                            />
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3436' }}>{student.firstName} {student.lastName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#b2bec3' }}>{student.email || 'E-posta yok'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#2d3436', fontWeight: '500' }}>{student.branchName || 'Merkez'}</div>
                                        <div style={{ fontSize: '0.75rem', color: student.status === 'active' || student.status === 'Kabul' ? '#00b894' : '#fab1a0' }}>
                                            {student.status || 'Beklemede'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#636e72' }}>{student.school || '-'}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#636e72' }}>
                                        {new Date(student.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => handleStudentDetailClick(student.id)}
                                            style={{ padding: '6px 12px', borderRadius: '6px', background: '#f1f2f6', color: '#2d3436', fontSize: '0.8rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                                        >
                                            {isLoadingStudent ? '...' : 'Detay'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Universities Modal */}
            {isUniversitiesOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={closeModals}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px',
                        maxHeight: '80vh', overflowY: 'auto', position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button onClick={closeModals} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="#1a1a2e" />
                        </button>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a1a2e' }}>Tüm Üniversiteler</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {topUniversities.map((uni, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px', background: '#f9fafb' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: '#e0e7ff', color: '#4f46e5',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <span style={{ fontSize: '1rem', color: '#374151', fontWeight: '500' }}>{uni.name}</span>
                                    </div>
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#111827' }}>{uni.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={closeModals}>
                    <div style={{
                        background: '#f3f4f6', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '1200px',
                        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button onClick={closeModals} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            <X size={24} color="#1a1a2e" />
                        </button>

                        <StudentDetailView
                            {...selectedStudent}
                            showBackLink={false}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}

function StatCard({ icon, label, value, trend, color, subLabel }: { icon: any, label: string, value: string | number, trend?: string, color: string, subLabel?: string }) {
    return (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ color: '#808191', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>{label}</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>{value}</h2>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${color}15`, color: color }}>
                    {icon}
                </div>
            </div>
            {(trend || subLabel) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    {trend && (
                        <span style={{ color: '#00b894', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <TrendingUp size={14} /> {trend}
                        </span>
                    )}
                    {subLabel && <span style={{ color: '#b2bec3' }}>{subLabel}</span>}
                </div>
            )}
        </div>
    );
}
