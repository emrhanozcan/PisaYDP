'use client';

import { useState } from 'react';
import { BranchStudent, University, BRANCH_NAMES, BranchCode, StudentEducation } from '@/types';
import { X, ChevronDown, AlertCircle, Plus, Minus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBranchStudent, updateBranchStudent } from '@/app/actions/branch';
import StudentAvatar from '@/components/common/StudentAvatar';

interface StudentFormProps {
    universities: University[];
    initialData?: BranchStudent;
    isEditing?: boolean;
    onClose?: () => void;
    onSuccess?: (student?: BranchStudent) => void;
}

export default function StudentForm({ universities, initialData, isEditing = false, onClose, onSuccess }: StudentFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSecondUniversity, setShowSecondUniversity] = useState(!!initialData?.university2Id);

    const [student, setStudent] = useState<Partial<BranchStudent>>(() => {
        const base: Partial<BranchStudent> = initialData || {
            firstName: '', lastName: '', phone: '', email: '', universityId: '', program: 'Lisans', grade: '1', city: 'Milano', passportNo: '', notes: '',
            examResult: '', selectionResult: '', visaResult: '', finalStatus: 'Beklemede', paymentStatus: 'Bekleniyor',
            packageType: 'Standard', accommodationService: 'Hayır', supportPackage: 'Hayır', scholarshipPackage: 'Hayır', ydtSupport: 'Hayır', guardianService: 'Hayır',
            status: 'active', registrationDate: new Date().toISOString().split('T')[0],
            scholarshipTypes: [],
            serialNumber: '', description: '', parentName: '', parentPhone: '', parentEmail: '', fee: '', iban: '', department: '',
            branchCode: 'izmir' as BranchCode,
            educations: [],
            id: `bs-${Date.now()}`
        };

        // Normalize educations if not present
        if (!base.educations || base.educations.length === 0) {
            const edus: StudentEducation[] = [];

            // Primary from columns
            if (base.universityId) {
                edus.push({
                    universityId: base.universityId,
                    department: base.department,
                    program: base.program,
                    grade: base.grade
                });
            } else if (!initialData) {
                // Default empty for new student
                edus.push({ universityId: '', program: 'Lisans', grade: '1' });
            }

            // Secondary from columns (Legacy)
            if ((base as any).university2Id) {
                edus.push({
                    universityId: (base as any).university2Id,
                    department: (base as any).department2,
                    program: (base as any).program2,
                    grade: (base as any).grade2
                });
            }

            base.educations = edus;
        }

        return base;
    });

    const PROGRAMS = [
        { name: 'Lisans', color: '#BBDEFB' }, { name: 'Önlisans', color: '#E1BEE7' },
        { name: 'Foundation', color: '#FFE0B2' }, { name: 'Dil Okulu', color: '#C8E6C9' }
    ];
    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!student.firstName || !student.lastName || !student.branchCode) {
            setError('Lütfen zorunlu alanları (Ad, Soyad, Şube) doldurunuz.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Filter out educations with empty universityId
            const cleanedEducations = student.educations?.filter(e => e.universityId && e.universityId.trim() !== '') || [];

            // If it's a new student and cleanedEducations is empty, createBranchStudent might try to add a default one, 
            // but let's ensure we pass what the user intended. If they deleted all, it's empty.

            const studentToSave = {
                ...student,
                educations: cleanedEducations
            };

            let result;
            if (isEditing && initialData?.id) {
                result = await updateBranchStudent(initialData.id, studentToSave);
            } else {
                result = await createBranchStudent(studentToSave as Omit<BranchStudent, 'createdAt'>);
            }

            if (result && !result.success && result.error) {
                throw new Error(result.error);
            }

            // Show success state
            setIsSuccess(true);

            // Wait a bit before redirecting or calling onSuccess
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess(result?.data as BranchStudent);
                } else {
                    router.push('/admin/students');
                    router.refresh();
                }
            }, 1000); // 1 second delay
        } catch (error: any) {
            console.error('Failed to save student:', error);
            const errorMessage = error?.message || error?.details || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyiniz.';
            setError(`Hata: ${errorMessage}`);
            setIsSubmitting(false); // Only stop submitting on error
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    // ... (Styles remain the same until footerStyle) ...

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
        backgroundColor: isEditing ? '#6366f1' : '#818cf8', // Slightly different color for edit maybe? Or keep same.
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
        <div style={overlayStyle} onClick={(e) => {
            // Close if clicking the overlay itself (backdrop)
            if (e.target === e.currentTarget) {
                handleClose();
            }
        }}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={headerStyle}>
                    <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                        {isEditing ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
                    </h1>
                    <button onClick={handleClose} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Validation Error Message */}
                {error && (
                    <div style={{
                        margin: '1rem 1.5rem 0',
                        padding: '0.75rem',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fee2e2',
                        borderRadius: '8px',
                        color: '#dc2626',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Content */}
                <div style={contentStyle}>
                    {/* Kişisel Bilgiler */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle('#6366f1')}>
                            <div style={barStyle('#6366f1')} />
                            <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0 }}>Kişisel Bilgiler</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0 }}>
                                <StudentAvatar
                                    studentId={student.id || ''}
                                    firstName={student.firstName || ''}
                                    lastName={student.lastName || ''}
                                    photoUrl={student.photoUrl}
                                    size={80}
                                    canEdit={true}
                                    table={student.branchCode ? 'branch_students' : 'students'}
                                    showDelete={true}
                                    onUploadSuccess={(url) => setStudent(prev => ({ ...prev, photoUrl: url }))}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
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
                            </div>
                        </div>
                        <div style={{ ...gridStyle(2), marginTop: '1rem' }}>
                            <FormInput label="Seri No" value={student.serialNumber || ''} onChange={(v) => setStudent(p => ({ ...p, serialNumber: v }))} />
                            <FormInput label="Seri No" value={student.serialNumber || ''} onChange={(v) => setStudent(p => ({ ...p, serialNumber: v }))} />
                            <FormInput
                                label="Şehir"
                                value={student.city || ''}
                                onChange={(v: string) => {
                                    setStudent((p: Partial<BranchStudent>) => {
                                        const newCity = v;
                                        let suggested: string[] = p.scholarshipTypes || [];

                                        // Auto-suggest logic
                                        if (['Roma', 'Rome', 'Messina', 'Napoli', 'Genova', 'Trieste'].some(c => newCity.toLowerCase().includes(c.toLowerCase()))) {
                                            if (!suggested.includes('Lazio Disco')) suggested = [...suggested, 'Lazio Disco'];
                                        }

                                        return { ...p, city: newCity, scholarshipTypes: suggested };
                                    });
                                }}
                            />
                        </div>
                    </div>

                    {/* Eğitim Bilgileri */}
                    <div style={sectionStyle}>
                        <div style={{ ...sectionHeaderStyle('#10b981'), justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={barStyle('#10b981')} />
                                <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0 }}>Eğitim Bilgileri</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const newEdus = [...(student.educations || [])];
                                    newEdus.push({ universityId: '', program: 'Lisans', grade: '1' });
                                    setStudent(p => ({ ...p, educations: newEdus }));
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: '#10b981', fontSize: '0.85rem', fontWeight: 600
                                }}
                            >
                                <Plus size={16} /> Üniversite Ekle
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {student.educations?.map((edu, index) => (
                                <div key={index} style={{
                                    position: 'relative',
                                    padding: '1rem',
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }}>
                                    {/* Header for Education Item */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                                            {index + 1}. Üniversite
                                        </span>
                                        {student.educations && student.educations.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newEdus = [...(student.educations || [])];
                                                    newEdus.splice(index, 1);
                                                    setStudent(p => ({ ...p, educations: newEdus }));
                                                }}
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div style={gridStyle(4)}>
                                        <FormSelect
                                            label="Üniversite"
                                            value={edu.universityId || ''}
                                            onChange={(v) => {
                                                const newEdus = [...(student.educations || [])];
                                                newEdus[index] = { ...newEdus[index], universityId: v };
                                                setStudent(p => ({ ...p, educations: newEdus }));
                                            }}
                                            options={universities.map(u => ({ value: u.id, label: u.name }))}
                                        />
                                        <FormInput
                                            label="Bölüm"
                                            value={edu.department || ''}
                                            onChange={(v) => {
                                                const newEdus = [...(student.educations || [])];
                                                newEdus[index] = { ...newEdus[index], department: v };
                                                setStudent(p => ({ ...p, educations: newEdus }));
                                            }}
                                        />
                                        <FormSelect
                                            label="Program"
                                            value={edu.program || ''}
                                            onChange={(v) => {
                                                const newEdus = [...(student.educations || [])];
                                                newEdus[index] = { ...newEdus[index], program: v };
                                                setStudent(p => ({ ...p, educations: newEdus }));
                                            }}
                                            options={PROGRAMS.map(p => ({ value: p.name, label: p.name }))}
                                        />
                                        <FormSelect
                                            label="Sınıf"
                                            value={edu.grade || ''}
                                            onChange={(v) => {
                                                const newEdus = [...(student.educations || [])];
                                                newEdus[index] = { ...newEdus[index], grade: v };
                                                setStudent(p => ({ ...p, educations: newEdus }));
                                            }}
                                            options={['Hazırlık', '1', '2', '3', '4', '5', '6'].map(g => ({ value: g, label: g }))}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!student.educations || student.educations.length === 0) && (
                                <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280', fontStyle: 'italic' }}>
                                    Henüz eğitim bilgisi eklenmedi.
                                </div>
                            )}
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
                        <div style={{ ...gridStyle(4), marginTop: '1rem' }}>
                            <FormSelect label="Burs Paketi" value={student.scholarshipPackage || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, scholarshipPackage: v as any }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                            <FormSelect label="YDP" value={student.ydtSupport || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, ydtSupport: v as any }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                            <FormSelect label="Vasi Hizmeti" value={student.guardianService || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, guardianService: v as any }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                            <FormSelect label="Paket Türü" value={student.packageType || 'Standard'} onChange={(v) => setStudent(p => ({ ...p, packageType: v }))} options={[{ value: 'Standard', label: 'Standard' }, { value: 'Premium', label: 'Premium' }, { value: 'VIP', label: 'VIP' }]} />
                        </div>

                        {/* Conditional Scholarship Types */}
                        {student.scholarshipPackage === 'Evet' && (
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>Burs Tipi Seçin (Çoklu Seçim)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {['Lazio Disco', 'DSU (Toskana)', 'EDISU (Piemonte)', 'Diğer'].map(type => {
                                        const isSelected = (student.scholarshipTypes || []).includes(type);
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    const current = student.scholarshipTypes || [];
                                                    const updated = isSelected
                                                        ? current.filter(t => t !== type)
                                                        : [...current, type];
                                                    setStudent((p: any) => ({ ...p, scholarshipTypes: updated }));
                                                }}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '20px',
                                                    border: `1px solid ${isSelected ? '#6366f1' : '#e5e7eb'}`,
                                                    background: isSelected ? '#eef2ff' : 'white',
                                                    color: isSelected ? '#4f46e5' : '#374151',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {type}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={footerStyle}>
                    <button onClick={handleClose} style={{ padding: '0.625rem 1.5rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        style={{
                            padding: '0.625rem 1.5rem',
                            backgroundColor: isSuccess ? '#059669' : '#818cf8',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting && !isSuccess ? 0.5 : 1,
                            transition: 'all 0.3s'
                        }}
                    >
                        {isSuccess ? 'Kaydedildi' : (isSubmitting ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Öğrenci Ekle'))}
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
