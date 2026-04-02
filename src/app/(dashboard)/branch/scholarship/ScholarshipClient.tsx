'use client';

import { useState, useEffect, useRef } from 'react';
import { BranchStudent, University, BRANCH_NAMES, ScholarshipTracking } from '@/types';
import { Search, Check, X, FileText, Info, Shield, Key, Award, AlertCircle, Edit2, User, ChevronLeft, ChevronRight, Calendar, Building2, GraduationCap } from 'lucide-react';
import PdfDownloadButton from '@/components/common/PdfDownloadButton';
import StudentAvatar from '@/components/common/StudentAvatar';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import ServiceNoteCard from '@/components/common/ServiceNoteCard';
import ServiceUploadsCard from '@/components/common/ServiceUploadsCard';
import { updateBranchStudent } from '@/app/actions/branch';
import { updateScholarshipTracking } from '@/app/actions/scholarship';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const StudentForm = dynamic(() => import('@/app/(dashboard)/admin/students/StudentForm'), {
    loading: () => <p>Yükleniyor...</p>,
    ssr: false
});

interface ScholarshipClientProps {
    initialStudents: (BranchStudent & { scholarshipTracking?: ScholarshipTracking })[];
    universities: University[];
}

export default function ScholarshipClient({ initialStudents, universities }: ScholarshipClientProps) {
    const [students, setStudents] = useState(initialStudents);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<(BranchStudent & { scholarshipTracking?: ScholarshipTracking }) | null>(null);
    const [userRole, setUserRole] = useState<string>('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const router = useRouter();

    // Filters
    const [scholarshipTypeFilter, setScholarshipTypeFilter] = useState<string>('');
    const [scholarshipStatusFilter, setScholarshipStatusFilter] = useState<string>('active'); // Default to active
    const scholarshipTypes = ['Lazio Disco', 'DSU (Toskana)', 'EDISU (Piemonte)', 'EDISU (Torino)', 'ERGO', 'Diğer', 'İPTAL'];

    // Filter logic
    const filteredStudents = students.filter(s => {
        const fullSearch = `${s.firstName} ${s.lastName} ${s.email || ''} ${s.phone || ''}`.toLowerCase();
        const matchSearch = fullSearch.includes(searchTerm.toLowerCase());

        const types = s.scholarshipTypes || [];
        const isCancelled = types.includes('İPTAL');
        const hasScholarship = types.length > 0 && !isCancelled; // A student "has scholarship" if they have types and are not explicitly cancelled

        const matchType = !scholarshipTypeFilter || types.includes(scholarshipTypeFilter);

        // Status Filter Logic
        let matchStatus = true;

        if (scholarshipStatusFilter === 'active') {
            // Active: Has types AND is NOT Cancelled
            matchStatus = hasScholarship;
        } else if (scholarshipStatusFilter === 'cancelled') {
            // Cancelled: Explicitly marked as Cancelled
            matchStatus = isCancelled;
        }
        // 'all' passes everything (New, Active, Cancelled)

        return matchSearch && matchType && matchStatus;
    });

    const getUniversityName = (id?: string) => universities.find(u => u.id === id)?.name || '-';

    const handleUpdateStudent = async (field: keyof BranchStudent, value: any) => {
        if (!selectedStudent) return;

        // Logic: If setting types, and new value is NOT 'İPTAL', ensure 'İPTAL' is removed
        let finalValue = value;
        if (field === 'scholarshipTypes' && Array.isArray(value)) {
            // If user selects a real type, remove 'İPTAL'
            if (value.some((v: string) => v !== 'İPTAL')) {
                finalValue = value.filter((v: string) => v !== 'İPTAL');
            }
            // If 'İPTAL' is the only selected value, keep it.
            // If no types are selected, it means no scholarship, so it's not 'İPTAL' unless explicitly set.
            if (value.length === 0 && selectedStudent.scholarshipTypes?.includes('İPTAL')) {
                finalValue = []; // If all types are deselected, and it was 'İPTAL', remove 'İPTAL'
            }
        }

        const updatedStudent = { ...selectedStudent, [field]: finalValue };
        setSelectedStudent(updatedStudent);
        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));

        try {
            // Direct object update conforming to the server action signature
            const result = await updateBranchStudent(selectedStudent.id, { [field]: finalValue });

            if (!result) throw new Error('Öğrenci bulunamadı');

            if (result.success) {
                router.refresh();
            } else {
                throw new Error('Güncelleme başarısız oldu');
            }
        } catch (error) {
            console.error('Failed to update student', error);
            alert('Güncelleme başarısız oldu.');
            // Revert local state on error
            setStudents(initialStudents);
            setSelectedStudent(initialStudents.find(s => s.id === selectedStudent.id) || null);
        }
    };

    const handleCancelScholarship = () => {
        if (!selectedStudent) return;
        setIsCancelModalOpen(true);
    };

    const confirmCancelScholarship = async () => {
        if (!selectedStudent) return;
        await handleUpdateStudent('scholarshipTypes', ['İPTAL']);
        setIsCancelModalOpen(false);
    };

    const handleReactivateScholarship = async () => {
        if (!selectedStudent) return;
        // Remove 'İPTAL' from the types array
        const newTypes = (selectedStudent.scholarshipTypes || []).filter(t => t !== 'İPTAL');
        await handleUpdateStudent('scholarshipTypes', newTypes);
    };

    const handleUpdateTracking = async (field: keyof ScholarshipTracking, value: string | number | boolean | null | undefined) => {
        if (!selectedStudent) return;

        // Optimistic update
        const updatedTracking = { ...selectedStudent.scholarshipTracking, [field]: value } as ScholarshipTracking;
        const updatedStudent = { ...selectedStudent, scholarshipTracking: updatedTracking };

        setSelectedStudent(updatedStudent);
        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));

        try {
            const result = await updateScholarshipTracking(selectedStudent.id, { [field]: value });
            if (result.success) {
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to update scholarship tracking', error);
            alert('Güncelleme başarısız oldu. Lütfen tekrar deneyin.');
            // Revert local state on error
            setStudents(initialStudents);
            setSelectedStudent(initialStudents.find(s => s.id === selectedStudent.id) || null);
        }
    };

    const [isListCollapsed, setIsListCollapsed] = useState(false);

    // Conditional Logic Helpers
    const isLazioOrSouth = (uniName: string, scholarshipTypes: string[] = []) => {
        const targets = ['Roma', 'Messina', 'Napoli', 'Genova', 'Trieste'];
        const isLazio = scholarshipTypes.includes('Lazio Disco');
        const isTargetUni = targets.some(t => uniName.includes(t));
        return isLazio || isTargetUni;
    };

    const isPadovaVenedikPolimi = (uniName: string) => {
        const targets = ['Padova', 'Venedik', 'Polimi'];
        return targets.some(t => uniName.includes(t));
    };

    const selectedUniName = getUniversityName(selectedStudent?.universityId);

    // Header Badges Helper
    const getBadgeStyle = (type: string) => {
        if (type === 'Lazio Disco') return { bg: '#dbeafe', color: '#1e40af' }; // Blue
        if (type === 'DSU (Toskana)') return { bg: '#f3e8ff', color: '#6b21a8' }; // Purple
        if (type === 'EDISU (Piemonte)') return { bg: '#ffedd5', color: '#9a3412' }; // Orange
        if (type === 'İPTAL') return { bg: '#fee2e2', color: '#991b1b' }; // Red for cancelled
        return { bg: '#f3f4f6', color: '#1f2937' }; // Gray
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '1.5rem' }}>
            {/* Left Sidebar - Student List */}
            <div style={{ width: isListCollapsed ? '60px' : '380px', transition: 'all 0.3s ease', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative' }}>
                <button
                    onClick={() => setIsListCollapsed(!isListCollapsed)}
                    style={{
                        position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)',
                        background: 'white', border: '1px solid #e0e0e0', borderRadius: '50%', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6C5CE7', zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                >
                    {isListCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f5', display: isListCollapsed ? 'none' : 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: '#1a1a2e' }}>Öğrenciler ({filteredStudents.length})</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                        <input type="text" placeholder="Öğrenci ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <select value={scholarshipStatusFilter} onChange={(e) => setScholarshipStatusFilter(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.8rem', background: '#fafafc', cursor: 'pointer', outline: 'none' }}>
                            <option value="all">Tümü</option>
                            <option value="active">Aktif Burslular</option>
                            <option value="cancelled">İptal Olanlar</option>
                        </select>
                        <select value={scholarshipTypeFilter} onChange={(e) => setScholarshipTypeFilter(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.8rem', background: '#fafafc', cursor: 'pointer', outline: 'none' }}>
                            <option value="">Burs Tipi</option>
                            {scholarshipTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: isListCollapsed ? 'none' : 'block' }}>
                    {filteredStudents.map(student => {
                        const types = student.scholarshipTypes || [];
                        const isCancelled = types.includes('İPTAL');
                        return (
                            <div key={student.id} onClick={() => setSelectedStudent(student)} style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                background: selectedStudent?.id === student.id ? '#f0f4ff' : (isCancelled ? '#fee2e2' : 'transparent'),
                                borderLeft: selectedStudent?.id === student.id ? '3px solid #6C5CE7' : '3px solid transparent',
                                borderBottom: '1px solid #f8f8f8',
                                transition: 'all 0.15s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <StudentAvatar studentId={student.id} firstName={student.firstName} lastName={student.lastName} photoUrl={student.photoUrl} size={40} canEdit={false} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: selectedStudent?.id === student.id ? '#6C5CE7' : (isCancelled ? '#991b1b' : '#1a1a2e') }}>
                                                {student.firstName} {student.lastName}
                                                {isCancelled && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '6px', fontWeight: 'normal' }}>(İptal)</span>}
                                            </div>
                                            <div style={{ 
                                                width: '10px', 
                                                height: '10px', 
                                                borderRadius: '50%', 
                                                background: student.scholarshipStatus === 'Tamamlandı' ? '#166534' : 
                                                           student.scholarshipStatus === 'Tamamlanmadı' ? '#991b1b' : '#92400e',
                                                boxShadow: '0 0 4px rgba(0,0,0,0.1)'
                                            }} title={student.scholarshipStatus || 'Bekliyor'} />
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#808191', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getUniversityName(student.universityId)}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredStudents.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#808191' }}>Öğrenci bulunamadı.</div>}
                </div>
            </div>

            {/* Right Panel - Details */}
            <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {selectedStudent ? (
                    <div id="branch-scholarship-detail-print-area" key={selectedStudent.id} className="fade-in" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

                        {/* PART 1: UI HEADER FIX (Updated for Badges) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                {/* Avatar - Clickable for Photo Upload */}
                                <div style={{ cursor: 'pointer' }} onClick={() => setIsEditModalOpen(true)}>
                                    <StudentAvatar studentId={selectedStudent.id} firstName={selectedStudent.firstName} lastName={selectedStudent.lastName} photoUrl={selectedStudent.photoUrl} size={72} canEdit={true} isAuthorized={true} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </h2>
                                    {/* Badges Container */}
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {/* Branch Badge */}
                                        <span style={{
                                            background: '#dcfce7',
                                            color: '#166534',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {BRANCH_NAMES[selectedStudent.branchCode] || selectedStudent.branchCode} Şubesi
                                        </span>
                                        {/* Scholarship Type Badges */}
                                        {selectedStudent.scholarshipTypes?.map(type => {
                                            const style = getBadgeStyle(type);
                                            return (
                                                <span key={type} style={{
                                                    background: style.bg,
                                                    color: style.color,
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {type}
                                                </span>
                                            );
                                        })}
                                        {/* General Status Selector Badge */}
                                        <div style={{ width: '130px', marginLeft: 'auto' }}>
                                            <StatusBadge 
                                                value={selectedStudent.scholarshipStatus} 
                                                options={['Bekliyor', 'Tamamlandı', 'Tamamlanmadı']} 
                                                onChange={(v) => handleUpdateStudent('scholarshipStatus', v)} 
                                                colors={{
                                                    'Tamamlandı': '#dcfce7',
                                                    'Tamamlanmadı': '#fee2e2',
                                                    'Bekliyor': '#fef3c7'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="no-print" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {selectedStudent.scholarshipTypes?.includes('İPTAL') ? (
                                    <button
                                        onClick={handleReactivateScholarship}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0',
                                            padding: '0.5rem 1rem', borderRadius: '8px',
                                            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Burs kaydını tekrar aktifleştir"
                                    >
                                        <Check size={16} />
                                        Tekrar Aktifleştir
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCancelScholarship}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca',
                                            padding: '0.5rem 1rem', borderRadius: '8px',
                                            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Burs kaydını iptal et"
                                    >
                                        <AlertCircle size={16} />
                                        Bursu İptal Et
                                    </button>
                                )}
                                <PdfDownloadButton
                                    student={selectedStudent}
                                    type="scholarship"
                                    fileName={`${selectedStudent.firstName} ${selectedStudent.lastName} - Burs Detay`}
                                />
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        background: 'white', color: '#374151', border: '1px solid #d1d5db',
                                        padding: '0.5rem 1rem', borderRadius: '8px',
                                        fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                    }}
                                >
                                    <Edit2 size={16} />
                                    Düzenle
                                </button>
                            </div>
                        </div>

                        {/* PART 2: THE CARD GRID */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Row 1: Identity & Family */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {/* Left: Student Details */}
                                <InfoCard title="Öğrenci Ayrıntıları" color="#6366f1" icon={<User size={18} />}>
                                    <DetailRow label="Ad" value={selectedStudent.firstName} />
                                    <DetailRow label="Soyad" value={selectedStudent.lastName} />
                                    <DetailRow label="Pasaport No" value={selectedStudent.passportNo} />
                                    <DetailRow label="Telefon" value={selectedStudent.phone} />
                                    <DetailRow label="Email" value={selectedStudent.email} />
                                </InfoCard>
                                {/* Right: Parent Details */}
                                <InfoCard title="Veli Ayrıntıları" color="#8b5cf6" icon={<User size={18} />}>
                                    <DetailRow label="Veli Adı" value={selectedStudent.parentName} />
                                    <DetailRow label="Veli Telefonu" value={selectedStudent.parentPhone} />
                                    <DetailRow label="Veli Email" value={selectedStudent.parentEmail} />
                                </InfoCard>
                            </div>

                            {/* Row 2: Başvuru Bilgileri (Full Width Horizontal) */}
                            <InfoCard title="Başvuru Bilgileri" color="#10B981" icon={<FileText size={18} />}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Okul Ücreti</span>
                                        <InputRow value={selectedStudent.scholarshipTracking?.applicationTuitionFee} onUpdate={(v) => handleUpdateTracking('applicationTuitionFee', v)} placeholder="€ Giriniz" />
                                        <StatusBadge
                                            value={selectedStudent.scholarshipTracking?.applicationTuitionFeeStatus}
                                            options={['Tamamlandı', 'İşleme Alındı', 'Beklemede']}
                                            onChange={(v: string) => handleUpdateTracking('applicationTuitionFeeStatus', v)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>ISEE Durumu</span>
                                        <InputRow value={selectedStudent.scholarshipTracking?.applicationIseeStatus} onUpdate={(v) => handleUpdateTracking('applicationIseeStatus', v)} placeholder="Değer/Durum" />
                                        <StatusBadge
                                            value={selectedStudent.scholarshipTracking?.applicationIseeStatusStatus}
                                            options={['Tamamlandı', 'İşleme Alındı', 'Beklemede']}
                                            onChange={(v: string) => handleUpdateTracking('applicationIseeStatusStatus', v)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Yurt Durumu</span>
                                        <InputRow value={selectedStudent.scholarshipTracking?.applicationDormStatus} onUpdate={(v) => handleUpdateTracking('applicationDormStatus', v)} placeholder="Yurt Adı/Durum" />
                                        <StatusBadge
                                            value={selectedStudent.scholarshipTracking?.applicationDormStatusStatus}
                                            options={['Tamamlandı', 'İşleme Alındı', 'Beklemede']}
                                            onChange={(v: string) => handleUpdateTracking('applicationDormStatusStatus', v)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Burs Durumu</span>
                                        <InputRow value={selectedStudent.scholarshipTracking?.applicationScholarshipStatus} onUpdate={(v) => handleUpdateTracking('applicationScholarshipStatus', v)} placeholder="Miktar/Durum" />
                                        <StatusBadge
                                            value={selectedStudent.scholarshipTracking?.applicationScholarshipStatusStatus}
                                            options={['Tamamlandı', 'İşleme Alındı', 'Beklemede']}
                                            onChange={(v: string) => handleUpdateTracking('applicationScholarshipStatusStatus', v)}
                                        />
                                    </div>
                                </div>
                            </InfoCard>

                            {/* Row 3: Evraklar (Complex Card) */}
                            <InfoCard title="Evraklar" color="#F59E0B" icon={<FileText size={18} />}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Section A: Bilgilendirme */}
                                    <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Bilgilendirme</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 300px)', gap: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Evrak Listesi</span>
                                                <div style={{ width: '140px' }}>
                                                    <StatusBadge
                                                        value={selectedStudent.scholarshipTracking?.infoDocumentList}
                                                        options={['İletildi', 'Bekleniyor']}
                                                        onChange={(v: string) => handleUpdateTracking('infoDocumentList', v)}
                                                        colors={{ 'İletildi': '#dbeafe', 'Bekleniyor': '#fee2e2' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section B: Evraklar */}
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Evraklar</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                                            <DocumentRow label="Anket" value={selectedStudent.scholarshipTracking?.documentsSurvey} status={selectedStudent.scholarshipTracking?.documentsSurveyStatus} onUpdateValue={(v) => handleUpdateTracking('documentsSurvey', v)} onUpdateStatus={(v) => handleUpdateTracking('documentsSurveyStatus', v)} />
                                            <DocumentRow label="Türkçe Evraklar" value={selectedStudent.scholarshipTracking?.documentsTurkish} status={selectedStudent.scholarshipTracking?.documentsTurkishStatus} onUpdateValue={(v) => handleUpdateTracking('documentsTurkish', v)} onUpdateStatus={(v) => handleUpdateTracking('documentsTurkishStatus', v)} />
                                            <DocumentRow label="İtalyanca Çeviriler" value={selectedStudent.scholarshipTracking?.documentsItalian} status={selectedStudent.scholarshipTracking?.documentsItalianStatus} onUpdateValue={(v) => handleUpdateTracking('documentsItalian', v)} onUpdateStatus={(v) => handleUpdateTracking('documentsItalianStatus', v)} />
                                        </div>
                                    </div>
                                </div>
                            </InfoCard>

                            {/* Row 4: Credentials (Conditional) */}
                            {isPadovaVenedikPolimi(selectedUniName) && (
                                <InfoCard title="Giriş Bilgileri" color="#8B5CF6" icon={<Key size={18} />}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <div style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.85rem', color: '#4b5563' }}>Okul Sistemi</div>
                                            <InputRow label="Kullanıcı Adı" value={selectedStudent.scholarshipTracking?.credentialsSchoolUsername} onUpdate={(v) => handleUpdateTracking('credentialsSchoolUsername', v)} />
                                            <InputRow label="Şifre" value={selectedStudent.scholarshipTracking?.credentialsSchoolPassword} onUpdate={(v) => handleUpdateTracking('credentialsSchoolPassword', v)} />
                                        </div>
                                        <div>
                                            <div style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.85rem', color: '#4b5563' }}>ISEE Sistemi</div>
                                            <InputRow label="Kullanıcı Adı" value={selectedStudent.scholarshipTracking?.credentialsIseeUsername} onUpdate={(v) => handleUpdateTracking('credentialsIseeUsername', v)} />
                                            <InputRow label="Şifre" value={selectedStudent.scholarshipTracking?.credentialsIseePassword} onUpdate={(v) => handleUpdateTracking('credentialsIseePassword', v)} />
                                        </div>
                                    </div>
                                </InfoCard>
                            )}

                            {/* Row 5: Results & CAF */}
                            {(isLazioOrSouth(selectedUniName, selectedStudent.scholarshipTypes || []) || true) && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <InfoCard title="Sonuçlar" color="#EF4444" icon={<Award size={18} />}>
                                        <InputRow label="Sıralama" value={selectedStudent.scholarshipTracking?.resultRanking} onUpdate={(v) => handleUpdateTracking('resultRanking', v)} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                                            <span style={{ color: '#808191', fontSize: '0.9rem', minWidth: '130px' }}>Sonuç:</span>
                                            <div style={{ flex: 1 }}>
                                                <StatusBadge
                                                    value={selectedStudent.scholarshipTracking?.resultStatus}
                                                    options={['Kazandı', 'Yedek', 'Kazanamadı']}
                                                    onChange={(v: string) => handleUpdateTracking('resultStatus', v)}
                                                />
                                            </div>
                                        </div>
                                        <InputRow label="Bloke Hesap" value={selectedStudent.scholarshipTracking?.resultBlockAccount} onUpdate={(v) => handleUpdateTracking('resultBlockAccount', v)} />
                                        <InputRow label="İtalya Kira Kontratı" value={selectedStudent.scholarshipTracking?.resultItalyLease} onUpdate={(v) => handleUpdateTracking('resultItalyLease', v)} />
                                        <InputRow label="IBAN" value={selectedStudent.scholarshipTracking?.resultIban} onUpdate={(v) => handleUpdateTracking('resultIban', v)} />
                                        <InputRow label="Sonuç Notları" value={selectedStudent.scholarshipTracking?.resultNotes} onUpdate={(v) => handleUpdateTracking('resultNotes', v)} />
                                    </InfoCard>

                                    {/* CAF Conditional */}
                                    {isLazioOrSouth(selectedUniName, selectedStudent.scholarshipTypes || []) && (
                                        <InfoCard title="CAF Ofisi Randevu" color="#6366F1" icon={<Calendar size={18} />}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: '#eef2ff', padding: '0.75rem', borderRadius: '8px', color: '#4338ca', fontSize: '0.85rem', border: '1px solid #c7d2fe' }}>
                                                <Info size={16} />
                                                <span style={{ fontWeight: 500 }}>Elden evrak teslim edilmelidir.</span>
                                            </div>
                                            <InputRow label="Randevu Tarihi" type="date" value={selectedStudent.scholarshipTracking?.cafAppointmentDate as any} onUpdate={(v) => handleUpdateTracking('cafAppointmentDate', v)} />
                                            <InputRow label="Randevu Durumu" value={selectedStudent.scholarshipTracking?.cafAppointmentStatus} onUpdate={(v) => handleUpdateTracking('cafAppointmentStatus', v)} />
                                        </InfoCard>
                                    )}
                                </div>
                            )}

                            {/* Service Notes & Uploads */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <ServiceNoteCard studentId={selectedStudent.id} serviceType="scholarship" />
                                <ServiceUploadsCard studentId={selectedStudent.id} serviceType="scholarship" />
                            </div>

                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#808191' }}>
                        <Award size={48} color="#e0e0e0" />
                        <p style={{ marginTop: '1rem', fontSize: '1rem' }}>Detayları görmek için sol panelden bir öğrenci seçin.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {
                isEditModalOpen && selectedStudent && (
                    <StudentForm
                        universities={universities}
                        initialData={selectedStudent as BranchStudent}
                        isEditing={true}
                        onClose={() => setIsEditModalOpen(false)}
                        onSuccess={(updatedStudent) => {
                            setIsEditModalOpen(false);
                            if (updatedStudent) {
                                router.refresh();
                                const merged = { ...selectedStudent, ...updatedStudent };
                                setSelectedStudent(merged as any);
                                setStudents(prev => prev.map(s => s.id === merged.id ? merged as any : s));
                            }
                        }}
                    />
                )
            }

            <ConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={confirmCancelScholarship}
                title="Burs İptali"
                message={`${selectedStudent?.firstName} ${selectedStudent?.lastName} isimli öğrencinin burs kaydını iptal etmek istediğinize emin misiniz? Bu işlem geri alınabilir ancak dikkatli olunmalıdır.`}
                confirmText="Evet, İptal Et"
                cancelText="Vazgeç"
                type="danger"
            />
        </div >
    );
}

// ==========================================
// Sub-Components
// ==========================================

function InfoCard({ title, color, icon, children }: { title: string; color: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div style={{ background: '#fafafc', borderRadius: '12px', padding: '1.5rem', borderLeft: `5px solid ${color}`, height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ color }}>{icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>{title}</h3>
            </div>
            {children}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
    return (
        <div style={{ display: 'flex', marginBottom: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', fontSize: '0.9rem', width: '130px', fontWeight: 500 }}>{label}:</span>
            <span style={{ color: '#111827', fontSize: '0.95rem', fontWeight: 600 }}>{value || '-'}</span>
        </div>
    )
}

function StatusBadge({ value, options, onChange, colors }: { value?: string; options: string[]; onChange: (v: string) => void; colors?: Record<string, string> }) {
    const defaultColors: Record<string, string> = {
        'Tamamlandı': '#dcfce7', 'İletildi': '#dbeafe', 'Kazandı': '#dcfce7',
        'İşleme Alındı': '#ffedd5', 'Tercümede': '#ffedd5', 'Yedek': '#ffedd5',
        'Beklemede': '#fee2e2', 'Bekleniyor': '#fee2e2', 'Kazanamadı': '#fee2e2',
    };
    const textColors: Record<string, string> = {
        'Tamamlandı': '#166534', 'İletildi': '#1e40af', 'Kazandı': '#166534',
        'İşleme Alındı': '#9a3412', 'Tercümede': '#9a3412', 'Yedek': '#9a3412',
        'Beklemede': '#991b1b', 'Bekleniyor': '#991b1b', 'Kazanamadı': '#991b1b',
    };

    const activeColor = (colors || defaultColors)[value || ''] || '#f3f4f6';
    const activeText = textColors[value || ''] || '#374151';

    return (
        <div style={{ position: 'relative' }}>
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    appearance: 'none',
                    width: '100%',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: activeColor,
                    color: activeText,
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                    textAlign: 'center'
                }}
            >
                <option value="">Seçiniz</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: activeText, opacity: 0.5 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
        </div>
    );
}

function DocumentRow({ label, value, status, onUpdateValue, onUpdateStatus }: { label: string; value?: string; status?: string; onUpdateValue: (v: string) => void; onUpdateStatus: (v: string) => void }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 2fr 140px', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{label}</span>
            <InputRow value={value} onUpdate={onUpdateValue} placeholder="Not / Açıklama ekle..." />
            <StatusBadge
                value={status}
                options={['İletildi', 'Tercümede', 'Beklemede']}
                onChange={onUpdateStatus}
                colors={{
                    'İletildi': '#dbeafe', // Blue
                    'Tercümede': '#ffedd5', // Orange
                    'Beklemede': '#fee2e2' // Red
                }}
            />
        </div>
    )
}

interface InputRowProps {
    label?: string;
    value: any;
    onUpdate: (value: string) => void;
    type?: string;
    style?: React.CSSProperties;
    placeholder?: string;
}

/**
 * InputRow with Debounced Auto-Save
 * Updates parent state after 500ms inactivity or on Blur/Enter.
 */
function InputRow({ label, value, onUpdate, type = 'text', style, placeholder }: InputRowProps) {
    const [tempValue, setTempValue] = useState(value || '');

    // Sync external changes (e.g. from optimistic update or switching students),
    // but ONLY if the user is not actively typing to avoid cursor jumps / overwrites.
    // Actually, optimistic updates come from our own actions, so it should be fine.
    // We'll use a ref to track if the last update was local.

    // Simplification: Always sync on prop change. 
    // If the prop change matches tempValue (which it should if we are the source), no flicker.
    // However, to avoid cursor jumps during rapid typing if the parent update is slightly out of sync or delayed,
    // we rely on the component remounting via key={student.id} when changing students.
    // For the same student, we trust local state and only update parent on debounce.
    // We REMOVE the sync effect to avoid "fighting" the local state.

    useEffect(() => {
        // If values match, no need to debounce update
        if (tempValue === (value || '')) return;

        const handler = setTimeout(() => {
            onUpdate(tempValue);
        }, 500);

        return () => clearTimeout(handler);
    }, [tempValue, value, onUpdate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempValue(e.target.value);
    };

    if (!label) {
        // Simple Mode (Inline)
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                <input
                    type={type}
                    value={tempValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s', background: '#fafafc' }}
                    onFocus={(e) => e.target.style.borderColor = '#6C5CE7'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
            </div>
        )
    }

    // Labeled Mode
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '32px', ...style }}>
            <span style={{ color: '#808191', fontSize: '0.9rem', minWidth: '130px' }}>{label}:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <input
                    type={type}
                    value={tempValue}
                    onChange={handleChange}
                    style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem', outline: 'none', width: '100%', flex: 1, minWidth: 0, background: '#fafafc' }}
                    onFocus={(e) => e.target.style.borderColor = '#6C5CE7'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
            </div>
        </div>
    );
}
