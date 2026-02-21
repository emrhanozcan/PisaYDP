'use client';

import { useState } from 'react';
import {
    User, Search, GraduationCap,
    UserPlus, TrendingUp, Users,
    ChevronRight, Filter, Download, X, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { BranchStudent, University, BRANCH_NAMES, BranchCode } from '@/types';
import { createBranchStudent } from '@/app/actions/branch';
import { useRouter } from 'next/navigation';

interface StudentData {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    country: string;
    city?: string;
    school?: string;
    packageType?: string;
    status: string;
    createdAt: string;
    isYDP?: boolean;
}

interface AdminStudentsClientProps {
    allStudents: StudentData[];
    universities: University[];
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
}

export default function AdminStudentsClient({ allStudents, universities, totalCount, activeCount, inactiveCount }: AdminStudentsClientProps) {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const stats = [
        { label: "Toplam Öğrenci", value: totalCount, icon: Users, color: "#008C45", bg: "#eafaf3" },
        { label: "Aktif Öğrenci", value: activeCount, icon: TrendingUp, color: "#059669", bg: "#ecfdf5" },
        { label: "Pasif Öğrenci", value: inactiveCount, icon: User, color: "#6b7280", bg: "#f3f4f6" },
    ];

    const filteredStudents = allStudents.filter(s =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.school || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: '#11142D', marginBottom: '0.5rem', fontWeight: 700 }}>Öğrenciler</h1>
                    <p style={{ color: '#808191', fontSize: '1rem' }}>
                        Sistemde kayıtlı tüm öğrencileri görüntüleyin ve yönetin
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} />
                        Dışa Aktar
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <UserPlus size={18} />
                        Yeni Öğrenci
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-enhanced">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: stat.bg,
                                color: stat.color
                            }}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>{stat.value}</p>
                                <p style={{ fontSize: '0.85rem', color: '#808191', marginTop: '0.25rem' }}>{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {/* Search */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px', maxWidth: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#B2B3BD' }} />
                        <input
                            type="text"
                            placeholder="İsim, okul veya e-posta ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem 0.875rem 3rem',
                                borderRadius: '12px',
                                border: '1px solid #E4E5E7',
                                background: '#F9FAFC',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        border: '1px solid #E4E5E7',
                        borderRadius: '10px',
                        background: 'white',
                        color: '#6b7280',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}>
                        <Filter size={16} />
                        Filtrele
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="table dashboard-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>#</th>
                                <th style={{ width: '22%' }}>Öğrenci</th>
                                <th style={{ width: '15%' }}>🇮🇹 Şehir</th>
                                <th style={{ width: '18%' }}>Okul</th>
                                <th style={{ width: '12%' }}>Paket</th>
                                <th style={{ width: '10%' }}>Hizmet</th>
                                <th style={{ width: '8%' }}>Durum</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={student.id}>
                                    <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{index + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 600, fontSize: '0.85rem'
                                            }}>
                                                {student.firstName[0]}{student.lastName[0]}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, color: '#11142D', marginBottom: '2px' }}>
                                                    {student.firstName} {student.lastName}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                    {student.email || 'E-posta yok'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                            <span>🇮🇹</span>
                                            {student.country}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                            <GraduationCap size={14} />
                                            <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {student.school}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            background: '#eff6ff',
                                            color: '#2563eb',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            fontWeight: 500
                                        }}>
                                            {student.packageType}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: '#f9fafb',
                                            color: '#9ca3af',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            0/0
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: student.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                            color: student.status === 'active' ? '#059669' : '#dc2626'
                                        }}>
                                            <span style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                background: student.status === 'active' ? '#059669' : '#dc2626'
                                            }} />
                                            {student.status === 'active' ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Link
                                            href={`/admin/students/${student.id}`}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '0.5rem 0.75rem',
                                                background: '#008C45',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                gap: '0.35rem',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            Detay <ChevronRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '4rem', color: '#B2B3BD' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <Users size={48} style={{ opacity: 0.3 }} />
                                            <div>
                                                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Öğrenci bulunamadı</p>
                                                <button onClick={() => setShowModal(true)} style={{ color: '#008C45', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    İlk öğrenciyi ekleyin →
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredStudents.length > 0 && (
                    <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#9ca3af',
                        fontSize: '0.85rem'
                    }}>
                        <p>Toplam {filteredStudents.length} öğrenci gösteriliyor</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <NewStudentModal
                    universities={universities}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}

// Modal Component with INLINE STYLES (no Tailwind)
function NewStudentModal({ universities, onClose, onSuccess }: { universities: University[]; onClose: () => void; onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [student, setStudent] = useState<Partial<BranchStudent>>({
        firstName: '', lastName: '', phone: '', email: '', universityId: '', program: 'Lisans', grade: '1', city: 'Milano', passportNo: '', notes: '',
        examResult: '', selectionResult: '', visaResult: '', finalStatus: 'Beklemede', paymentStatus: 'Bekleniyor',
        packageType: 'Standard', accommodationService: 'Hayır', supportPackage: 'Hayır', scholarshipPackage: 'Hayır', ydtSupport: 'Hayır',
        status: 'active', registrationDate: new Date().toISOString().split('T')[0],
        serialNumber: '', description: '', parentName: '', parentPhone: '', parentEmail: '', fee: '', iban: '', department: '',
        branchCode: 'izmir' as BranchCode
    });

    const PROGRAMS = ['Lisans', 'Önlisans', 'Foundation', 'Dil Okulu', 'Yüksek Lisans', 'Doktora'];
    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];

    const handleSave = async () => {
        if (!student.firstName || !student.lastName || !student.branchCode) {
            alert('Lütfen zorunlu alanları doldurunuz.');
            return;
        }
        setIsSubmitting(true);
        try {
            await createBranchStudent(student as Omit<BranchStudent, 'id' | 'createdAt'>);
            onSuccess();
        } catch (error) {
            console.error('Failed to save student:', error);
            alert('Kayıt sırasında hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const gridStyle = (cols: number): React.CSSProperties => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '1rem'
    });

    const barStyle = (color: string): React.CSSProperties => ({
        width: '4px',
        height: '20px',
        backgroundColor: color,
        borderRadius: '2px'
    });

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)'
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Yeni Öğrenci Ekle</h1>
                    <button onClick={onClose} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f9fafb' }}>

                    {/* Kişisel Bilgiler */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={barStyle('#6366f1')} />
                            <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0 }}>Kişisel Bilgiler</h3>
                        </div>
                        <div style={gridStyle(3)}>
                            <FormSelect label="Şube" value={student.branchCode || ''} onChange={(v) => setStudent(p => ({ ...p, branchCode: v as BranchCode }))} options={allBranches.map(b => ({ value: b, label: BRANCH_NAMES[b] }))} />
                            <FormInput label="Ad" value={student.firstName || ''} onChange={(v) => setStudent(p => ({ ...p, firstName: v }))} />
                            <FormInput label="Soyad" value={student.lastName || ''} onChange={(v) => setStudent(p => ({ ...p, lastName: v }))} />
                        </div>
                        <div style={{ ...gridStyle(3), marginTop: '1rem' }}>
                            <FormInput label="Telefon" value={student.phone || ''} onChange={(v) => setStudent(p => ({ ...p, phone: v }))} />
                            <FormInput label="E-mail" value={student.email || ''} onChange={(v) => setStudent(p => ({ ...p, email: v }))} />
                            <FormInput label="Pasaport No" value={student.passportNo || ''} onChange={(v) => setStudent(p => ({ ...p, passportNo: v }))} />
                        </div>
                        <div style={{ ...gridStyle(2), marginTop: '1rem' }}>
                            <FormInput label="Seri No" value={student.serialNumber || ''} onChange={(v) => setStudent(p => ({ ...p, serialNumber: v }))} />
                            <FormInput label="Şehir" value={student.city || ''} onChange={(v) => setStudent(p => ({ ...p, city: v }))} />
                        </div>
                    </div>

                    {/* Eğitim Bilgileri */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={barStyle('#10b981')} />
                            <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0 }}>Eğitim Bilgileri</h3>
                        </div>
                        <div style={gridStyle(4)}>
                            <FormSelect label="Üniversite" value={student.universityId || ''} onChange={(v) => setStudent(p => ({ ...p, universityId: v }))} options={universities.map(u => ({ value: u.id, label: u.name }))} />
                            <FormInput label="Bölüm" value={student.department || ''} onChange={(v) => setStudent(p => ({ ...p, department: v }))} />
                            <FormSelect label="Program" value={student.program || ''} onChange={(v) => setStudent(p => ({ ...p, program: v }))} options={PROGRAMS.map(p => ({ value: p, label: p }))} />
                            <FormSelect label="Sınıf" value={student.grade || ''} onChange={(v) => setStudent(p => ({ ...p, grade: v }))} options={['Hazırlık', '1', '2', '3', '4', '5', '6'].map(g => ({ value: g, label: g }))} />
                        </div>
                    </div>

                    {/* Veli İletişim */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={barStyle('#f59e0b')} />
                            <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0 }}>Veli İletişim & Ücret</h3>
                        </div>
                        <div style={gridStyle(4)}>
                            <FormInput label="Veli Ad Soyad" value={student.parentName || ''} onChange={(v) => setStudent(p => ({ ...p, parentName: v }))} />
                            <FormInput label="Veli Telefon" value={student.parentPhone || ''} onChange={(v) => setStudent(p => ({ ...p, parentPhone: v }))} />
                            <FormInput label="Veli Email" value={student.parentEmail || ''} onChange={(v) => setStudent(p => ({ ...p, parentEmail: v }))} />
                            <FormInput label="Tutar Ücret (€)" value={student.fee || ''} onChange={(v) => setStudent(p => ({ ...p, fee: v }))} />
                        </div>
                    </div>

                    {/* Mali Bilgiler */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={barStyle('#f97316')} />
                            <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0 }}>Mali Bilgiler</h3>
                        </div>
                        <div style={gridStyle(5)}>
                            <FormInput label="IBAN" value={student.iban || ''} onChange={(v) => setStudent(p => ({ ...p, iban: v }))} />
                            <FormInput label="Sıralama" value={student.examResult || ''} onChange={(v) => setStudent(p => ({ ...p, examResult: v }))} />
                            <FormInput label="Bloke" value={student.visaResult || ''} onChange={(v) => setStudent(p => ({ ...p, visaResult: v }))} />
                            <FormInput label="Kira Kontratı" value={student.selectionResult || ''} onChange={(v) => setStudent(p => ({ ...p, selectionResult: v }))} />
                            <FormSelect label="Ödeme Durumu" value={student.paymentStatus || 'Bekleniyor'} onChange={(v) => setStudent(p => ({ ...p, paymentStatus: v as any }))} options={[{ value: 'Tamamlandı', label: 'Tamamlandı' }, { value: 'Kısmi Ödeme', label: 'Kısmi Ödeme' }, { value: 'Bekleniyor', label: 'Bekleniyor' }]} />
                        </div>
                    </div>

                    {/* Hizmet & Sonuç */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={barStyle('#ec4899')} />
                            <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0 }}>Hizmet & Sonuç</h3>
                        </div>
                        <div style={gridStyle(3)}>
                            <FormSelect label="Sonuç" value={student.finalStatus || 'Beklemede'} onChange={(v) => setStudent(p => ({ ...p, finalStatus: v as any }))} options={[{ value: 'Kabul', label: 'Kabul' }, { value: 'Red', label: 'Red' }, { value: 'Beklemede', label: 'Beklemede' }, { value: 'SOSPESO', label: 'SOSPESO' }]} />
                            <FormSelect label="Danışmanlık" value={student.supportPackage || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, supportPackage: v as any }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                            <FormSelect label="Konaklama" value={student.accommodationService || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, accommodationService: v as any }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                        </div>
                        <div style={{ ...gridStyle(3), marginTop: '1rem' }}>
                            <FormSelect label="Burs Paketi" value={student.scholarshipPackage || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, scholarshipPackage: v as any }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                            <FormSelect label="YDP" value={student.ydtSupport || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, ydtSupport: v as any }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                            <FormSelect label="Paket Türü" value={student.packageType || 'Standard'} onChange={(v) => setStudent(p => ({ ...p, packageType: v }))} options={[{ value: 'Standard', label: 'Standard' }, { value: 'Premium', label: 'Premium' }, { value: 'VIP', label: 'VIP' }]} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: 'white',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem'
                }}>
                    <button onClick={onClose} style={{ padding: '0.625rem 1.5rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                        İptal
                    </button>
                    <button onClick={handleSave} disabled={isSubmitting} style={{ padding: '0.625rem 1.5rem', backgroundColor: '#818cf8', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', opacity: isSubmitting ? 0.5 : 1 }}>
                        {isSubmitting ? 'Kaydediliyor...' : 'Öğrenci Ekle'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Form Components with INLINE STYLES
function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box'
                }}
            />
        </div>
    );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: '#1f2937',
                        outline: 'none',
                        appearance: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                    }}
                >
                    <option value="">Seçiniz...</option>
                    {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
                <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                    <ChevronDown size={14} />
                </div>
            </div>
        </div>
    );
}
