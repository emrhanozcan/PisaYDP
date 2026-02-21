'use client';

import { useState } from 'react';
import { BranchStudent, University, BRANCH_NAMES, BranchCode } from '@/types';
import { X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBranchStudent, updateBranchStudent } from '@/app/actions/branch';

interface StudentFormProps {
    universities: University[];
    initialData?: BranchStudent;
    isEditing?: boolean;
}

export default function StudentForm({ universities, initialData, isEditing = false }: StudentFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [student, setStudent] = useState<Partial<BranchStudent>>(initialData || {
        firstName: '', lastName: '', phone: '', email: '', universityId: '', program: 'Lisans', grade: '1', city: 'Milano', passportNo: '', notes: '',
        examResult: '', selectionResult: '', visaResult: '', finalStatus: 'Beklemede', paymentStatus: 'Bekleniyor',
        packageType: 'Standard', accommodationService: 'Hayır', supportPackage: 'Hayır', scholarshipPackage: 'Hayır', ydtSupport: 'Hayır',
        status: 'active', registrationDate: new Date().toISOString().split('T')[0],
        serialNumber: '', description: '', parentName: '', parentPhone: '', parentEmail: '', fee: '', iban: '', department: '',
        branchCode: 'izmir' as BranchCode
    });

    const PROGRAMS = ['Lisans', 'Önlisans', 'Foundation', 'Dil Okulu', 'Yüksek Lisans', 'Doktora'];
    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student.firstName || !student.lastName || !student.branchCode) {
            alert('Lütfen zorunlu alanları doldurunuz.');
            return;
        }
        setIsSubmitting(true);
        try {
            if (isEditing && initialData?.id) {
                await updateBranchStudent(initialData.id, student);
            } else {
                await createBranchStudent(student as Omit<BranchStudent, 'id' | 'createdAt'>);
            }
            router.push('/admin/students');
            router.refresh();
        } catch (error) {
            console.error('Failed to save student:', error);
            alert('Kayıt sırasında hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => router.back();

    // Styles
    const overlayStyle: React.CSSProperties = {
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
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    };

    const headerStyle: React.CSSProperties = {
        padding: '1rem 1.5rem',
        backgroundColor: '#818cf8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    };

    const contentStyle: React.CSSProperties = {
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        backgroundColor: '#f9fafb'
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: '1.5rem'
    };

    const sectionHeaderStyle = (color: string): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
    });

    const barStyle = (color: string): React.CSSProperties => ({
        width: '4px',
        height: '20px',
        backgroundColor: color,
        borderRadius: '2px'
    });

    const gridStyle = (cols: number): React.CSSProperties => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '1rem'
    });

    const footerStyle: React.CSSProperties = {
        padding: '1rem 1.5rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem'
    };

    return (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div style={modalStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                        {isEditing ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
                    </h1>
                    <button onClick={handleClose} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={contentStyle}>
                    {/* Kişisel Bilgiler */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle('#6366f1')}>
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
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle('#10b981')}>
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

                    {/* Veli İletişim & Ücret */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle('#f59e0b')}>
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
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle('#f97316')}>
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
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle('#ec4899')}>
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
                <div style={footerStyle}>
                    <button onClick={handleClose} style={{ padding: '0.625rem 1.5rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
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

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>{label}</label>
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', color: '#1f2937', outline: 'none', boxSizing: 'border-box' }} />
        </div>
    );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', color: '#1f2937', outline: 'none', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
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
