'use client';

import { useState } from 'react';
import { BranchStudent, University, BRANCH_NAMES, BranchCode } from '@/types';
import { Save, X, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBranchStudent } from '@/app/actions/branch';

interface NewStudentFormProps {
    universities: University[];
}

export default function NewStudentForm({ universities }: NewStudentFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default empty student
    const [student, setStudent] = useState<Partial<BranchStudent>>({
        firstName: '', lastName: '', phone: '', email: '', universityId: '', program: 'Lisans', grade: '1', city: 'Milano', passportNo: '', notes: '',
        infoDate: '', infoStatus: 'Hayır', offerLetter: 'Bekleniyor', applicationDeadline: '', applicationFee: '', dsuFee: '', visaFee: '',
        examResult: '', selectionResult: '', visaResult: '', finalStatus: 'Beklemede', paymentStatus: 'Bekleniyor',
        packageType: '', accommodationService: 'Hayır', supportPackage: 'Hayır', scholarshipPackage: 'Hayır', ydtSupport: 'Hayır',
        status: 'active', registrationDate: new Date().toISOString().split('T')[0],
        serialNumber: '', description: '', parentName: '', parentPhone: '', parentEmail: '', fee: '',
        branchCode: '' as BranchCode // User must select
    });

    const PROGRAMS = [
        { name: 'Lisans', color: '#3498DB' }, { name: 'Önlisans', color: '#9B59B6' },
        { name: 'Foundation', color: '#E67E22' }, { name: 'Dil Okulu', color: '#2ECC71' }
    ];

    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student.firstName || !student.lastName || !student.branchCode) {
            alert('Lütfen zorunlu alanları doldurunuz (Ad, Soyad, Şube).');
            return;
        }

        setIsSubmitting(true);
        try {
            await createBranchStudent(student as Omit<BranchStudent, 'id' | 'createdAt'>);
            router.push('/admin/students');
            router.refresh();
        } catch (error) {
            console.error('Failed to create student:', error);
            alert('Öğrenci oluşturulurken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/admin/students" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <ChevronLeft size={16} />
                Listeye Dön
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-gray-800">Yeni Öğrenci Ekle</h1>
                <p className="text-gray-500 text-sm">Öğrenci bilgilerini giriniz.</p>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">

                    {/* Kişisel Bilgiler */}
                    <div>
                        <SectionHeader title="Kişisel Bilgiler" color="#6C5CE7" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <SelectField
                                label="Şube *"
                                value={student.branchCode || ''}
                                onChange={(v) => setStudent(p => ({ ...p, branchCode: v as BranchCode }))}
                                options={allBranches.map(b => ({ value: b, label: BRANCH_NAMES[b] }))}
                            />
                            <InputField label="Ad *" value={student.firstName || ''} onChange={(v) => setStudent(p => ({ ...p, firstName: v }))} />
                            <InputField label="Soyad *" value={student.lastName || ''} onChange={(v) => setStudent(p => ({ ...p, lastName: v }))} />
                            <InputField label="E-mail" value={student.email || ''} onChange={(v) => setStudent(p => ({ ...p, email: v }))} />
                            <InputField label="Telefon" value={student.phone || ''} onChange={(v) => setStudent(p => ({ ...p, phone: v }))} />
                            <InputField label="Pasaport No" value={student.passportNo || ''} onChange={(v) => setStudent(p => ({ ...p, passportNo: v }))} />
                            <InputField label="Seri No" value={student.serialNumber || ''} onChange={(v) => setStudent(p => ({ ...p, serialNumber: v }))} />
                            <InputField label="Şehir" value={student.city || ''} onChange={(v) => setStudent(p => ({ ...p, city: v }))} />
                        </div>
                    </div>

                    {/* Eğitim Bilgileri */}
                    <div>
                        <SectionHeader title="Eğitim Bilgileri" color="#00B894" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <SelectField label="Üniversite" value={student.universityId || ''} onChange={(v) => setStudent(p => ({ ...p, universityId: v }))} options={universities.map(u => ({ value: u.id, label: u.name }))} />
                            <InputField label="Bölüm" value={student.department || ''} onChange={(v) => setStudent(p => ({ ...p, department: v }))} />
                            <SelectField label="Program" value={student.program || ''} onChange={(v) => setStudent(p => ({ ...p, program: v }))} options={PROGRAMS.map(p => ({ value: p.name, label: p.name }))} />
                            <SelectField label="Sınıf" value={student.grade || ''} onChange={(v) => setStudent(p => ({ ...p, grade: v }))} options={['1', '2', '3', '4', '5', '6'].map(g => ({ value: g, label: g }))} />
                        </div>
                    </div>

                    {/* Veli İletişim & Ücret */}
                    <div>
                        <SectionHeader title="Veli İletişim & Ücret" color="#fdcb6e" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <InputField label="Veli Ad Soyad" value={student.parentName || ''} onChange={(v) => setStudent(p => ({ ...p, parentName: v }))} />
                            <InputField label="Veli Telefon" value={student.parentPhone || ''} onChange={(v) => setStudent(p => ({ ...p, parentPhone: v }))} />
                            <InputField label="Veli Email" value={student.parentEmail || ''} onChange={(v) => setStudent(p => ({ ...p, parentEmail: v }))} />
                            <InputField label="Tutar Ücret (€)" value={student.fee || ''} onChange={(v) => setStudent(p => ({ ...p, fee: v }))} />
                        </div>
                    </div>

                    {/* Mali Bilgiler */}
                    <div>
                        <SectionHeader title="Mali Bilgiler" color="#E67E22" />
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                            <InputField label="IBAN" value={student.iban || ''} onChange={(v) => setStudent(p => ({ ...p, iban: v }))} />
                            <InputField label="Sıralama" value={student.examResult || ''} onChange={(v) => setStudent(p => ({ ...p, examResult: v }))} />
                            <InputField label="Bloke" value={student.visaResult || ''} onChange={(v) => setStudent(p => ({ ...p, visaResult: v }))} />
                            <InputField label="Kira Kontratı" value={student.selectionResult || ''} onChange={(v) => setStudent(p => ({ ...p, selectionResult: v }))} />
                            <SelectField label="Ödeme Durumu" value={student.paymentStatus || 'Bekleniyor'} onChange={(v) => setStudent(p => ({ ...p, paymentStatus: v as any }))} options={[{ value: 'Tamamlandı', label: 'Tamamlandı' }, { value: 'Kısmi Ödeme', label: 'Kısmi Ödeme' }, { value: 'Bekleniyor', label: 'Bekleniyor' }]} />
                        </div>
                    </div>

                    {/* Hizmet & Sonuç */}
                    <div>
                        <SectionHeader title="Hizmet & Sonuç" color="#E91E63" />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                            <SelectField label="Sonuç" value={student.finalStatus || 'Beklemede'} onChange={(v) => setStudent(p => ({ ...p, finalStatus: v as any }))} options={[{ value: 'Kabul', label: 'Kabul' }, { value: 'Red', label: 'Red' }, { value: 'Beklemede', label: 'Beklemede' }, { value: 'SOSPESO', label: 'SOSPESO' }]} />
                            <SelectField label="Danışmanlık" value={student.supportPackage || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, supportPackage: v as 'Evet' | 'Hayır' }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                            <SelectField label="Konaklama" value={student.accommodationService || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, accommodationService: v as 'Evet' | 'Hayır' }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                            <SelectField label="Burs Paketi" value={student.scholarshipPackage || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, scholarshipPackage: v as 'Evet' | 'Hayır' }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                            <SelectField label="YDP" value={student.ydtSupport || 'Hayır'} onChange={(v) => setStudent(p => ({ ...p, ydtSupport: v as 'Evet' | 'Hayır' }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                        </div>
                        <div className="mt-5 grid grid-cols-1 gap-5">
                            <InputField label="Açıklama" value={student.description || ''} onChange={(v) => setStudent(p => ({ ...p, description: v }))} />
                            <InputField label="Notlar" value={student.notes || ''} onChange={(v) => setStudent(p => ({ ...p, notes: v }))} />
                        </div>
                    </div>

                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <Link href="/admin/students" className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                        İptal
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-[#008C45] text-white rounded-lg text-sm font-medium hover:bg-[#007037] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isSubmitting ? 'Kaydediliyor...' : 'Öğrenci Ekle'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function SectionHeader({ title, color }: { title: string; color: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: color }} />
            <h3 className="text-gray-800 font-semibold text-sm">{title}</h3>
        </div>
    );
}

function InputField({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
    return (
        <div className="w-full">
            <label className="block mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/10 transition-all outline-none"
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div className="w-full">
            <label className="block mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/10 transition-all outline-none appearance-none cursor-pointer"
                >
                    <option value="">Seçiniz...</option>
                    {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
