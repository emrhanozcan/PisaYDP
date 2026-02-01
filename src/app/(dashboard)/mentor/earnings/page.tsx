
import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import {
    Wallet, TrendingUp, CheckCircle, Clock,
    Calendar, FileText, Award, AlertCircle,
    Euro, ArrowUpRight, Filter
} from "lucide-react";
import Link from "next/link";

export default async function MentorEarningsPage() {
    const session = await getSession();
    if (!session) return null;

    // Get my data
    const myLogs = db.logs.getAll().filter(l => l.mentorId === session.id);
    const serviceTypes = db.serviceTypes.getAll();
    const students = db.students.getAll();
    const myAssignments = db.assignments.getAll().filter(a => a.mentorId === session.id);
    const myStudentIds = myAssignments.map(a => a.studentId);
    const myStudents = students.filter(s => myStudentIds.includes(s.id));

    // Status counts
    const approvedLogs = myLogs.filter(l => l.status === 'approved');
    const pendingLogs = myLogs.filter(l => l.status === 'submitted');
    const rejectedLogs = myLogs.filter(l => l.status === 'rejected');

    // Earnings calculations
    const approvedEarnings = approvedLogs.reduce((acc, log) => {
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);
        return acc + (service?.unitPrice || 0);
    }, 0);

    const pendingEarnings = pendingLogs.reduce((acc, log) => {
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);
        return acc + (service?.unitPrice || 0);
    }, 0);

    const totalEarnings = approvedEarnings;
    const totalHours = myLogs.reduce((acc, log) => acc + log.durationMinutes, 0) / 60;

    // Service type breakdown
    const serviceBreakdown = serviceTypes.map(type => {
        const typeLogs = approvedLogs.filter(l => l.serviceTypeId === type.id);
        return {
            ...type,
            count: typeLogs.length,
            total: typeLogs.length * type.unitPrice
        };
    }).filter(t => t.count > 0).sort((a, b) => b.total - a.total);

    // Student breakdown
    const studentBreakdown = myStudents.map(student => {
        const studentLogs = approvedLogs.filter(l => l.studentId === student.id);
        const studentEarnings = studentLogs.reduce((acc, log) => {
            const service = serviceTypes.find(s => s.id === log.serviceTypeId);
            return acc + (service?.unitPrice || 0);
        }, 0);
        return {
            ...student,
            serviceCount: studentLogs.length,
            earnings: studentEarnings
        };
    }).sort((a, b) => b.earnings - a.earnings);

    const stats = [
        { label: "Toplam Kazanç", value: `€${totalEarnings}`, icon: Wallet, color: "#059669", bg: "#ecfdf5", highlight: true },
        { label: "Bekleyen", value: `€${pendingEarnings}`, icon: Clock, color: "#f59e0b", bg: "#fef3c7" },
        { label: "Onaylı Hizmet", value: approvedLogs.length.toString(), icon: CheckCircle, color: "#6366f1", bg: "#eef2ff" },
        { label: "Toplam Süre", value: `${totalHours.toFixed(1)} saat`, icon: TrendingUp, color: "#8b5cf6", bg: "#f5f3ff" },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#11142D', marginBottom: '0.5rem' }}>
                    Hakediş & Özet
                </h1>
                <p style={{ color: '#808191', fontSize: '1rem' }}>
                    Kazançlarınızı ve hizmet istatistiklerinizi görüntüleyin
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="stat-card-enhanced"
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            background: stat.highlight ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : undefined,
                            border: stat.highlight ? '2px solid #059669' : undefined
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 52,
                                height: 52,
                                borderRadius: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: stat.highlight ? 'white' : stat.bg,
                                color: stat.color
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: stat.highlight ? '2rem' : '1.75rem', fontWeight: 700, color: stat.highlight ? '#059669' : '#11142D', lineHeight: 1 }}>
                                    {stat.value}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#808191', marginTop: '0.25rem' }}>{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
                {/* Recent Transactions */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={22} color="#6366f1" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hizmet Kayıtları</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>{myLogs.length} toplam kayıt</p>
                            </div>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Tarih</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Öğrenci</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Hizmet</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Durum</th>
                                    <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myLogs.slice().reverse().slice(0, 15).map(log => {
                                    const type = serviceTypes.find(t => t.id === log.serviceTypeId);
                                    const student = students.find(s => s.id === log.studentId);
                                    return (
                                        <tr key={log.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '0.875rem 0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                                {new Date(log.date).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        background: '#008C45',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600
                                                    }}>
                                                        {student?.firstName[0]}{student?.lastName[0]}
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', color: '#374151' }}>{student?.firstName} {student?.lastName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                                                {type?.name}
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem', textAlign: 'center' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    background: log.status === 'approved' ? '#ecfdf5' :
                                                        log.status === 'submitted' ? '#fef3c7' : '#fef2f2',
                                                    color: log.status === 'approved' ? '#059669' :
                                                        log.status === 'submitted' ? '#b45309' : '#dc2626'
                                                }}>
                                                    {log.status === 'approved' ? 'Onaylandı' :
                                                        log.status === 'submitted' ? 'Bekliyor' : 'Reddedildi'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right', fontWeight: 600, color: log.status === 'approved' ? '#059669' : '#9ca3af' }}>
                                                €{type?.unitPrice || 0}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {myLogs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Henüz hizmet kaydınız bulunmuyor</p>
                        </div>
                    )}

                    {myLogs.length > 15 && (
                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                            Son 15 kayıt gösteriliyor ({myLogs.length - 15} daha var)
                        </p>
                    )}
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Service Type Breakdown */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Award size={20} color="#8b5cf6" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#11142D', fontWeight: 600 }}>Hizmet Dağılımı</h3>
                                <p style={{ fontSize: '0.75rem', color: '#808191' }}>Onaylı kazançlar</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {serviceBreakdown.map((service, i) => (
                                <div key={service.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px'
                                }}>
                                    <div>
                                        <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.85rem' }}>{service.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{service.count} adet × €{service.unitPrice}</p>
                                    </div>
                                    <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>€{service.total}</span>
                                </div>
                            ))}

                            {serviceBreakdown.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '1rem' }}>
                                    Henüz onaylı hizmet yok
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Student Breakdown */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eafaf3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={20} color="#008C45" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#11142D', fontWeight: 600 }}>Öğrenci Bazlı</h3>
                                <p style={{ fontSize: '0.75rem', color: '#808191' }}>Onaylı kazançlar</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {studentBreakdown.slice(0, 5).map((student, i) => (
                                <div key={student.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: 600
                                        }}>
                                            {student.firstName[0]}{student.lastName[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.85rem' }}>{student.firstName} {student.lastName}</p>
                                            <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{student.serviceCount} hizmet</p>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>€{student.earnings}</span>
                                </div>
                            ))}

                            {studentBreakdown.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '1rem' }}>
                                    Henüz veri yok
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #11142D 0%, #1e293b 100%)',
                        borderRadius: '1rem'
                    }}>
                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>Özet</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Onaylı</p>
                                <p style={{ color: '#4ade80', fontSize: '1.5rem', fontWeight: 700 }}>€{approvedEarnings}</p>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Bekleyen</p>
                                <p style={{ color: '#fbbf24', fontSize: '1.5rem', fontWeight: 700 }}>€{pendingEarnings}</p>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Toplam Potansiyel</span>
                                <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>€{approvedEarnings + pendingEarnings}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
