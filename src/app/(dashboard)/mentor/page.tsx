
<<<<<<< HEAD
import { db } from "@/lib/db";
import { createServiceLog } from "@/app/actions/mentor";
import { getSession } from "@/app/actions/auth";
import Link from "next/link";
import {
    ArrowLeft, Clock, FileText, CheckCircle, User,
    MapPin, GraduationCap, Package, Calendar, Phone,
    Mail, Activity, Plus, AlertCircle, TrendingUp,
    Star, Award
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function MentorStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) redirect('/login');

    const student = db.students.getById(id);

    if (!student) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                color: '#9ca3af'
            }}>
                <User size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <h2 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>Öğrenci Bulunamadı</h2>
                <p style={{ marginBottom: '1.5rem' }}>Bu ID ile eşleşen öğrenci kaydı mevcut değil.</p>
                <Link href="/mentor" className="btn btn-primary">
                    <ArrowLeft size={16} /> Geri Dön
                </Link>
            </div>
        );
    }

    // Verify assignment
    const assignment = db.assignments.getAll().find(a => a.studentId === id && a.mentorId === session.id);

    const serviceTypes = db.serviceTypes.getAll().filter(t => t.isActive);
    const logs = db.logs.getAll().filter(l => l.studentId === id && l.mentorId === session.id);

    const approvedLogs = logs.filter(l => l.status === 'approved');
    const pendingLogs = logs.filter(l => l.status === 'submitted');
    const rejectedLogs = logs.filter(l => l.status === 'rejected');

    // Calculate earnings for this student
=======
import { getSession } from "@/app/actions/auth";
import { db } from "@/lib/db";
import {
    Clock, CheckCircle, Wallet, Users, Calendar,
    TrendingUp, FileText, ChevronRight, Star,
    AlertCircle, Award, Activity, MapPin, GraduationCap
} from "lucide-react";
import Link from "next/link";

export default async function MentorDashboard() {
    const session = await getSession();
    if (!session) return null;

    // Get my assignments
    const myAssignments = db.assignments.getAll().filter(a => a.mentorId === session.id);
    const assignedStudentIds = myAssignments.map(a => a.studentId);

    // Get assigned students AND students with YDP support
    // Get assigned students AND students with YDP support
    const myStudents = db.branchStudents.getAll().filter(s =>
        assignedStudentIds.includes(s.id) || s.ydtSupport === 'Evet'
    );

    // Get my logs
    const myLogs = db.logs.getAll().filter(l => l.mentorId === session.id);
    const serviceTypes = db.serviceTypes.getAll();
    const totalHours = myLogs.reduce((acc, log) => acc + log.durationMinutes, 0) / 60;

    // Status counts
    const approvedLogs = myLogs.filter(l => l.status === 'approved');
    const pendingLogs = myLogs.filter(l => l.status === 'submitted');
    const rejectedLogs = myLogs.filter(l => l.status === 'rejected');

    // Earnings calc
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
    const approvedEarnings = approvedLogs.reduce((acc, log) => {
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);
        return acc + (service?.unitPrice || 0);
    }, 0);

    const pendingEarnings = pendingLogs.reduce((acc, log) => {
        const service = serviceTypes.find(s => s.id === log.serviceTypeId);
        return acc + (service?.unitPrice || 0);
    }, 0);

<<<<<<< HEAD
    const totalHours = logs.reduce((acc, log) => acc + log.durationMinutes, 0) / 60;

    const stats = [
        { label: "Toplam Hizmet", value: logs.length.toString(), icon: FileText, color: "#6366f1", bg: "#eef2ff" },
        { label: "Onaylanan", value: approvedLogs.length.toString(), icon: CheckCircle, color: "#059669", bg: "#ecfdf5" },
        { label: "Bekleyen", value: pendingLogs.length.toString(), icon: Clock, color: "#f59e0b", bg: "#fef3c7" },
        { label: "Kazanç", value: `€${approvedEarnings}`, icon: Award, color: "#8b5cf6", bg: "#f5f3ff" },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Back Button */}
            <Link
                href="/mentor"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem',
                    textDecoration: 'none'
                }}
            >
                <ArrowLeft size={18} />
                Öğrencilerime Dön
            </Link>

            {/* Student Header Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 700,
                        flexShrink: 0
                    }}>
                        {student.firstName[0]}{student.lastName[0]}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#11142D', marginBottom: '0.25rem' }}>
                                    {student.firstName} {student.lastName}
                                </h1>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        🇮🇹 {student.country}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <GraduationCap size={14} /> {student.school}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    background: student.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                    color: student.status === 'active' ? '#059669' : '#dc2626'
                                }}>
                                    <span style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: student.status === 'active' ? '#059669' : '#dc2626'
                                    }} />
                                    {student.status === 'active' ? 'Aktif' : 'Pasif'}
                                </span>
                                <span style={{
                                    padding: '0.5rem 1rem',
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    {student.packageType}
                                </span>
                                {assignment && (
                                    <span style={{
                                        padding: '0.5rem 1rem',
                                        background: assignment.role === 'primary' ? '#fef3c7' : '#f3f4f6',
                                        color: assignment.role === 'primary' ? '#b45309' : '#6b7280',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}>
                                        {assignment.role === 'primary' ? '⭐ Ana Mentor' : 'Destek Mentor'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '1rem',
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '12px'
                        }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.2rem', textTransform: 'uppercase' }}>E-posta</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500, fontSize: '0.85rem' }}>
                                    <Mail size={13} /> {student.email || 'Belirtilmemiş'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Telefon</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500, fontSize: '0.85rem' }}>
                                    <Phone size={13} /> {student.phone || 'Belirtilmemiş'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Kayıt Tarihi</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500, fontSize: '0.85rem' }}>
                                    <Calendar size={13} /> {new Date(student.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Toplam Süre</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500, fontSize: '0.85rem' }}>
                                    <Clock size={13} /> {totalHours.toFixed(1)} saat
                                </p>
                            </div>
                        </div>
=======
    // Get recent logs
    const recentLogs = myLogs.slice(-5).reverse();

    // Calculate success rate
    const successRate = myLogs.length > 0 ? Math.round((approvedLogs.length / myLogs.length) * 100) : 0;

    const stats = [
        { label: "Toplam Süre", value: `${totalHours.toFixed(1)}`, unit: "saat", icon: Clock, color: "#3b82f6", bg: "#eff6ff" },
        { label: "Tamamlanan", value: approvedLogs.length.toString(), unit: "hizmet", icon: CheckCircle, color: "#059669", bg: "#ecfdf5" },
        { label: "Bekleyen", value: pendingLogs.length.toString(), unit: "hizmet", icon: AlertCircle, color: "#f59e0b", bg: "#fef3c7" },
        { label: "Onaylanan Kazanç", value: `€${approvedEarnings}`, unit: "", icon: Wallet, color: "#8b5cf6", bg: "#f5f3ff" },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#11142D', marginBottom: '0.5rem' }}>
                        Merhaba, {session.firstName} 👋
                    </h1>
                    <p style={{ color: '#808191', fontSize: '1rem' }}>
                        Bugün öğrencileriniz için neler yaptınız? İşte güncel durumunuz.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{
                        padding: '0.75rem 1.25rem',
                        background: successRate >= 80 ? '#ecfdf5' : successRate >= 50 ? '#fef3c7' : '#fef2f2',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <TrendingUp size={18} color={successRate >= 80 ? '#059669' : successRate >= 50 ? '#f59e0b' : '#dc2626'} />
                        <span style={{
                            fontWeight: 600,
                            color: successRate >= 80 ? '#059669' : successRate >= 50 ? '#b45309' : '#dc2626'
                        }}>
                            %{successRate} Onay Oranı
                        </span>
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
<<<<<<< HEAD
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-enhanced" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
=======
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-enhanced" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 52,
                                height: 52,
                                borderRadius: 14,
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: stat.bg,
                                color: stat.color
                            }}>
<<<<<<< HEAD
                                <stat.icon size={18} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>{stat.value}</p>
                                <p style={{ fontSize: '0.75rem', color: '#808191', marginTop: '0.15rem' }}>{stat.label}</p>
=======
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>
                                    {stat.value} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#808191' }}>{stat.unit}</span>
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#808191', marginTop: '0.25rem' }}>{stat.label}</p>
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
                            </div>
                        </div>
                    </div>
                ))}
            </div>

<<<<<<< HEAD
            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                {/* Service Log Form */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eafaf3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={22} color="#008C45" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Yeni Hizmet Kaydı</h2>
                            <p style={{ fontSize: '0.8rem', color: '#808191' }}>Gerçekleştirdiğiniz hizmeti kaydedin</p>
                        </div>
                    </div>

                    <form action={createServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <input type="hidden" name="studentId" value={student.id} />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                    Hizmet Tipi *
                                </label>
                                <select name="serviceTypeId" required className="input-field">
                                    <option value="">Seçiniz...</option>
                                    {serviceTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} (€{t.unitPrice})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                    Tarih ve Saat *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="date"
                                    required
                                    className="input-field"
                                    defaultValue={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                    Süre (Dakika)
                                </label>
                                <input type="number" name="duration" className="input-field" placeholder="Örn: 30" />
                                <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                                    Sabit ücretli hizmetlerde boş bırakılabilir.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                Notlar / Açıklama
                            </label>
                            <textarea
                                name="notes"
                                rows={4}
                                className="input-field"
                                placeholder="Hizmet detaylarını buraya yazın..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ paddingTop: '0.5rem' }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ padding: '0.875rem 2rem', fontSize: '0.9rem' }}
                            >
                                <CheckCircle size={18} />
                                Kaydı Oluştur ve Gönder
                            </button>
                        </div>
                    </form>
                </div>

                {/* Service History Sidebar */}
                <div className="glass-panel" style={{ padding: '1.5rem', alignSelf: 'start', maxHeight: '600px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'sticky', top: 0, background: 'white', paddingBottom: '0.5rem' }}>
=======
            {/* Pending Earnings Banner */}
            {pendingEarnings > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '1rem',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Wallet size={22} color="#f59e0b" />
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, color: '#92400e', fontSize: '0.9rem' }}>Onay Bekleyen Hakediş</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#78350f' }}>€{pendingEarnings}</p>
                        </div>
                    </div>
                    <span style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        borderRadius: '8px',
                        color: '#b45309',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}>
                        {pendingLogs.length} hizmet bekliyor
                    </span>
                </div>
            )}

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                {/* Students Section */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eafaf3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={22} color="#008C45" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', color: '#11142D', fontWeight: 600 }}>Öğrencilerim</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>{myStudents.length} öğrenci atanmış</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {myStudents.map(student => {
                            const studentLogs = myLogs.filter(l => l.studentId === student.id);
                            const studentApproved = studentLogs.filter(l => l.status === 'approved').length;
                            const studentPending = studentLogs.filter(l => l.status === 'submitted').length;
                            const assignment = myAssignments.find(a => a.studentId === student.id);

                            return (
                                <div
                                    key={student.id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '1rem',
                                        border: '1px solid #f1f5f9',
                                        padding: '1.25rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                fontSize: '1rem'
                                            }}>
                                                {student.firstName[0]}{student.lastName[0]}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, color: '#11142D', fontSize: '1rem' }}>{student.firstName} {student.lastName}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    🇮🇹 İtalya
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            background: student.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                            color: student.status === 'active' ? '#059669' : '#dc2626'
                                        }}>
                                            {student.status === 'active' ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div style={{
                                        padding: '0.75rem',
                                        background: '#f8fafc',
                                        borderRadius: '10px',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem' }}>
                                            <GraduationCap size={14} />
                                            {db.universities.getById(student.universityId || '')?.name || 'Okul belirtilmemiş'}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                                            <span style={{ color: '#9ca3af' }}>
                                                Paket: <span style={{ color: '#2563eb', fontWeight: 500 }}>{student.packageType}</span>
                                            </span>
                                            <span style={{ color: '#9ca3af' }}>
                                                Rol: <span style={{ color: '#6366f1', fontWeight: 500 }}>{assignment?.role === 'primary' ? 'Ana Mentor' : 'Destek'}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f0fdf4', borderRadius: '8px' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{studentApproved}</p>
                                            <p style={{ fontSize: '0.65rem', color: '#6b7280' }}>Onaylı</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: studentPending > 0 ? '#fef3c7' : '#f8fafc', borderRadius: '8px' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: studentPending > 0 ? '#b45309' : '#9ca3af' }}>{studentPending}</p>
                                            <p style={{ fontSize: '0.65rem', color: '#6b7280' }}>Bekleyen</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: '#eff6ff', borderRadius: '8px' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>{studentLogs.length}</p>
                                            <p style={{ fontSize: '0.65rem', color: '#6b7280' }}>Toplam</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link
                                            href={`/mentor/students/${student.id}`}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.35rem',
                                                padding: '0.65rem',
                                                background: '#f8fafc',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '10px',
                                                color: '#6b7280',
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <FileText size={14} />
                                            Detay
                                        </Link>
                                        <Link
                                            href={`/mentor/students/${student.id}`}
                                            style={{
                                                flex: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.35rem',
                                                padding: '0.65rem',
                                                background: '#008C45',
                                                border: 'none',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Activity size={14} />
                                            Hizmet Gir
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}

                        {myStudents.length === 0 && (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '3rem',
                                color: '#9ca3af',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '1rem'
                            }}>
                                <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p style={{ fontWeight: 500 }}>Henüz atanmış öğrenciniz bulunmuyor</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Admin tarafından öğrenci ataması yapıldığında burada görünecektir.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Sidebar */}
                <div className="glass-panel" style={{ padding: '1.5rem', alignSelf: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={20} color="#f59e0b" />
                        </div>
                        <div>
<<<<<<< HEAD
                            <h3 style={{ fontSize: '1rem', color: '#11142D', fontWeight: 600 }}>Hizmet Geçmişi</h3>
                            <p style={{ fontSize: '0.75rem', color: '#808191' }}>{logs.length} kayıt</p>
=======
                            <h3 style={{ fontSize: '1rem', color: '#11142D', fontWeight: 600 }}>Son Aktiviteler</h3>
                            <p style={{ fontSize: '0.75rem', color: '#808191' }}>Son 5 hizmet</p>
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
<<<<<<< HEAD
                        {logs.slice().reverse().map(log => {
                            const type = serviceTypes.find(t => t.id === log.serviceTypeId);
                            return (
                                <div key={log.id} style={{
                                    padding: '1rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    borderLeft: `4px solid ${log.status === 'approved' ? '#059669' :
                                            log.status === 'submitted' ? '#f59e0b' : '#dc2626'
                                        }`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <p style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{type?.name}</p>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
=======
                        {recentLogs.map(log => {
                            const type = serviceTypes.find(t => t.id === log.serviceTypeId);
                            const student = myStudents.find(s => s.id === log.studentId);
                            return (
                                <div key={log.id} style={{
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '10px',
                                    borderLeft: `3px solid ${log.status === 'approved' ? '#059669' :
                                        log.status === 'submitted' ? '#f59e0b' : '#dc2626'
                                        }`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                                        <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.85rem' }}>{type?.name}</p>
                                        <span style={{
                                            padding: '0.15rem 0.5rem',
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
                                            borderRadius: '8px',
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                            background: log.status === 'approved' ? '#ecfdf5' :
                                                log.status === 'submitted' ? '#fef3c7' : '#fef2f2',
                                            color: log.status === 'approved' ? '#059669' :
                                                log.status === 'submitted' ? '#b45309' : '#dc2626'
                                        }}>
<<<<<<< HEAD
                                            {log.status === 'approved' ? 'Onaylandı' :
                                                log.status === 'submitted' ? 'Bekliyor' : 'Reddedildi'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.35rem' }}>
                                        {new Date(log.date).toLocaleDateString('tr-TR')} - {new Date(log.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {log.notes && (
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4 }}>
                                            {log.notes.length > 80 ? log.notes.substring(0, 80) + '...' : log.notes}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.7rem' }}>
                                        {log.durationMinutes > 0 && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#9ca3af' }}>
                                                <Clock size={10} /> {log.durationMinutes} dk
                                            </span>
                                        )}
                                        {type?.unitPrice && log.status === 'approved' && (
                                            <span style={{ color: '#059669', fontWeight: 600 }}>
                                                €{type.unitPrice}
                                            </span>
                                        )}
                                    </div>
=======
                                            {log.status === 'approved' ? '✓' :
                                                log.status === 'submitted' ? '⏳' : '✗'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                        {student?.firstName} {student?.lastName} • {log.date.split('T')[0]}
                                    </p>
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
                                </div>
                            );
                        })}

<<<<<<< HEAD
                        {logs.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#9ca3af',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '12px'
                            }}>
                                <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.85rem' }}>Henüz hizmet kaydı yok</p>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Yukarıdaki formu kullanarak ilk kaydınızı oluşturun.</p>
=======
                        {recentLogs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.85rem' }}>Henüz aktivite yok</p>
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
                            </div>
                        )}
                    </div>

<<<<<<< HEAD
                    {/* Summary */}
                    {logs.length > 0 && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #11142D 0%, #1e293b 100%)',
                            borderRadius: '12px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Onaylı</p>
                                <p style={{ color: '#4ade80', fontSize: '1.1rem', fontWeight: 700 }}>€{approvedEarnings}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Bekleyen</p>
                                <p style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 700 }}>€{pendingEarnings}</p>
                            </div>
                        </div>
                    )}
=======
                    {/* Quick Stats */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #11142D 0%, #1e293b 100%)',
                        borderRadius: '12px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Bu Ay</p>
                            <p style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>{myLogs.length}</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.65rem' }}>hizmet</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Toplam</p>
                            <p style={{ color: '#4ade80', fontSize: '1.25rem', fontWeight: 700 }}>€{approvedEarnings}</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.65rem' }}>kazanç</p>
                        </div>
                    </div>
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
                </div>
            </div>
        </div>
    );
}
