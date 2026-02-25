'use client';

import { useState, useEffect } from 'react';
import { BranchStudent, University, BRANCH_NAMES, BranchCode } from '@/types';
import PdfDownloadButton from '@/components/common/PdfDownloadButton';
import { Search, Mail, Phone, Download, GraduationCap, CreditCard, FileText, MapPin, Edit2, Trash2, Plus, Save, X, Users, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import StudentForm from '@/app/(dashboard)/admin/students/StudentForm';
import StudentAvatar from '@/components/common/StudentAvatar';
import { getSession } from '@/app/actions/auth';

interface StudentsClientProps {
    initialStudents: (BranchStudent & { branchName: string })[];
    universities: University[];
}

export default function StudentsClient({ initialStudents, universities }: StudentsClientProps) {
    const [students, setStudents] = useState<(BranchStudent & { branchName: string })[]>(initialStudents);

    useEffect(() => {
        setStudents(initialStudents);
    }, [initialStudents]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<(BranchStudent & { branchName: string }) | null>(null);
    const [branchFilter, setBranchFilter] = useState<string>('');
    const [uniFilter, setUniFilter] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<BranchStudent>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [deleteCountdown, setDeleteCountdown] = useState<{ id: string; count: number } | null>(null);

    const EMPTY_STUDENT: Partial<BranchStudent> = {
        firstName: '', lastName: '', phone: '', email: '', universityId: '', program: 'Lisans', grade: '1', city: 'Milano', passportNo: '', notes: '',
        infoDate: '', infoStatus: 'Hayır', offerLetter: 'Bekleniyor', applicationDeadline: '', applicationFee: '', dsuFee: '', visaFee: '',
        examResult: '', selectionResult: '', visaResult: '', finalStatus: 'Beklemede', paymentStatus: 'Bekleniyor',
        packageType: 'Standard', accommodationService: 'Hayır', supportPackage: 'Hayır', scholarshipPackage: 'Hayır', guardianService: 'Hayır', ydtSupport: 'Hayır',
        status: 'active', registrationDate: new Date().toISOString().split('T')[0],
        serialNumber: '', description: '', parentName: '', parentPhone: '', parentEmail: '', fee: '', iban: '', department: '', branchCode: 'izmir', educations: []
    };

    const PROGRAMS = [
        { name: 'Lisans', color: '#BBDEFB' }, { name: 'Önlisans', color: '#E1BEE7' },
        { name: 'Foundation', color: '#FFE0B2' }, { name: 'Dil Okulu', color: '#C8E6C9' }
    ];

    useEffect(() => {
        if (deleteCountdown && deleteCountdown.count > 0) {
            const timer = setTimeout(() => setDeleteCountdown({ ...deleteCountdown, count: deleteCountdown.count - 1 }), 1000);
            return () => clearTimeout(timer);
        }
    }, [deleteCountdown]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) { setIsModalOpen(false); setDeleteCountdown(null); }
    };

    const handleOpenModal = (student?: BranchStudent & { branchName: string }) => {
        if (student) { setEditingStudent(student); setIsEditing(true); }
        else { setEditingStudent({ ...EMPTY_STUDENT }); setIsEditing(false); }
        setIsModalOpen(true);
    };

    const handleSaveStudent = async (student?: BranchStudent) => {
        if (student) {
            const studentWithBranchName = { ...student, branchName: BRANCH_NAMES[student.branchCode] } as (BranchStudent & { branchName: string });

            if (isEditing) {
                setStudents(prev => prev.map(s => s.id === student.id ? studentWithBranchName : s));
                setSelectedStudent(studentWithBranchName);
            } else {
                setStudents(prev => [studentWithBranchName, ...prev]);
            }
        }
        setIsModalOpen(false);
    };

    const handleStartDelete = (id: string) => setDeleteCountdown({ id, count: 3 });

    const handleConfirmDelete = async () => {
        if (deleteCountdown && deleteCountdown.count === 0) {
            await fetch('/api/branch/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteCountdown.id }) });
            setStudents(prev => prev.filter(s => s.id !== deleteCountdown.id));
            if (selectedStudent?.id === deleteCountdown.id) setSelectedStudent(null);
            setDeleteCountdown(null);
        }
    };

    const [statusFilter, setStatusFilter] = useState('');

    const filteredStudents = students.filter(s => {
        const fullSearch = `${s.firstName} ${s.lastName} ${s.email} ${s.phone}`.toLowerCase();
        const matchSearch = fullSearch.includes(searchTerm.toLowerCase());
        const matchBranch = !branchFilter || s.branchCode === branchFilter;
        const matchUni = !uniFilter || s.universityId === uniFilter;
        const matchStatus = !statusFilter || s.finalStatus === statusFilter;
        return matchSearch && matchBranch && matchUni && matchStatus;
    });

    const getUniversityName = (id?: string) => universities.find(u => u.id === id)?.name || '-';

    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        field: keyof BranchStudent | null;
        value: any;
        label: string;
    } | null>(null);

    const SENSITIVE_FIELDS = ['finalStatus', 'supportPackage', 'accommodationService', 'scholarshipPackage', 'guardianService', 'ydtSupport'];
    const FIELD_LABELS: Record<string, string> = {
        finalStatus: 'Sonuç',
        supportPackage: 'Danışmanlık',
        accommodationService: 'Konaklama',
        scholarshipPackage: 'Burs Paketi',
        guardianService: 'Vasi Hizmeti',
        ydtSupport: 'YDP Desteği'
    };

    const executeUpdate = async (id: string, field: keyof BranchStudent, value: any) => {
        if (!selectedStudent) return;
        const updatedStudent = { ...selectedStudent, [field]: value };
        setSelectedStudent(updatedStudent);
        setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));

        await fetch('/api/branch/students', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, [field]: value })
        });
    };

    const handleUpdateField = async (id: string, field: keyof BranchStudent, value: any) => {
        if (!selectedStudent) return;

        if (SENSITIVE_FIELDS.includes(field as string)) {
            setConfirmationModal({
                isOpen: true,
                field,
                value,
                label: FIELD_LABELS[field as string] || field
            });
            return;
        }

        await executeUpdate(id, field, value);
    };

    const handleConfirmUpdate = async () => {
        if (!confirmationModal || !selectedStudent || !confirmationModal.field) return;
        await executeUpdate(selectedStudent.id, confirmationModal.field, confirmationModal.value);
        setConfirmationModal(null);
    };

    const handleExcelExport = () => {
        if (students.length === 0) { alert('Dışa aktarılacak öğrenci yok.'); return; }
        const headers = ['Ad Soyad', 'Şube', 'Telefon', 'E-mail', 'Üniversite', 'Bölüm', 'Program', 'Sınıf', 'Sıralama', 'Bloke', 'Kira Kontratı', 'Sonuç', 'Ödeme', 'Pasaport', 'Danışmanlık'];
        const rows = students.map(s => [
            `${s.firstName} ${s.lastName}`, s.branchName, s.phone || '', s.email || '', getUniversityName((s.educations && s.educations.length > 0) ? s.educations[0].universityId : s.universityId), s.department || '', s.program || '', s.grade || '',
            s.examResult, s.visaResult, s.selectionResult, s.finalStatus, s.paymentStatus, s.passportNo, s.supportPackage
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tum_ogrenciler.csv'; a.click();
    };

    const getStatusBadge = (status?: string) => {
        const styles: Record<string, { bg: string; color: string }> = {
            'Kabul': { bg: '#E8F5E9', color: '#2E7D32' },
            'Red': { bg: '#FFEBEE', color: '#C62828' },
            'Beklemede': { bg: '#FFF8E1', color: '#F57F17' },
            'SOSPESO': { bg: '#E3F2FD', color: '#1565C0' }
        };
        const s = styles[status || 'Beklemede'] || styles['Beklemede'];
        return <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', background: s.bg, color: s.color }}>{status || 'Beklemede'}</span>;
    };

    const [isListCollapsed, setIsListCollapsed] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const fetchSession = async () => {
            const session = await getSession();
            if (session) setUserRole(session.role);
        };
        fetchSession();
    }, []);

    const canEditPhoto = userRole !== '' && userRole !== 'mentor';

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '1.5rem' }}>
            {/* Left Sidebar - Student List  */}
            <div style={{ width: isListCollapsed ? '60px' : '380px', transition: 'all 0.3s ease', background: isListCollapsed ? 'linear-gradient(to bottom, #eafaf3, #ffffff, #fbf1f1)' : 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'visible', flexShrink: 0, position: 'relative' }}>
                <button
                    onClick={() => setIsListCollapsed(!isListCollapsed)}
                    style={{
                        position: 'absolute',
                        right: '-16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#008C45',
                        zIndex: 20,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                >
                    {isListCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f5', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: isListCollapsed ? 0 : 1, pointerEvents: isListCollapsed ? 'none' : 'auto', transition: 'opacity 0.2s', visibility: isListCollapsed ? 'hidden' : 'visible' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: '600', color: '#1a1a2e' }}>Öğrenciler ({filteredStudents.length})</span>
                        <button onClick={() => handleOpenModal()} style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '500' }}>
                            <Plus size={14} /> Yeni Ekle
                        </button>
                    </div>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                        <input type="text" placeholder="Öğrenci ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.8rem', background: '#fafafc', cursor: 'pointer', outline: 'none' }}>
                            <option value="">Tüm Şubeler</option>
                            {Object.entries(BRANCH_NAMES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                        </select>
                        <select value={uniFilter} onChange={(e) => setUniFilter(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.8rem', background: '#fafafc', cursor: 'pointer', outline: 'none' }}>
                            <option value="">Tüm Okullar</option>
                            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.8rem', background: '#fafafc', cursor: 'pointer', outline: 'none' }}>
                        <option value="">Tüm Durumlar</option>
                        <option value="Beklemede">Beklemede</option>
                        <option value="Kabul">Kabul</option>
                        <option value="Red">Red</option>
                        <option value="SOSPESO">SOSPESO</option>
                    </select>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', opacity: isListCollapsed ? 0 : 1, pointerEvents: isListCollapsed ? 'none' : 'auto', transition: 'opacity 0.2s', visibility: isListCollapsed ? 'hidden' : 'visible' }}>
                    {filteredStudents.map(student => (
                        <div key={student.id} onClick={() => setSelectedStudent(student)} style={{ padding: '12px 16px', cursor: 'pointer', background: selectedStudent?.id === student.id ? '#f0f4ff' : 'transparent', borderLeft: selectedStudent?.id === student.id ? '3px solid #6C5CE7' : '3px solid transparent', borderBottom: '1px solid #f8f8f8', transition: 'all 0.15s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <StudentAvatar
                                    studentId={student.id}
                                    firstName={student.firstName || ''}
                                    lastName={student.lastName || ''}
                                    photoUrl={student.photoUrl}
                                    size={40}
                                    canEdit={canEditPhoto}
                                    isAuthorized={userRole !== 'mentor'}
                                    table="branch_students"
                                    showDelete={false}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '500', fontSize: '0.9rem', color: selectedStudent?.id === student.id ? '#6C5CE7' : '#1a1a2e' }}>{student.firstName} {student.lastName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#808191', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {getUniversityName((student.educations && student.educations.length > 0) ? student.educations[0].universityId : student.universityId)}
                                    </div>
                                </div>
                                {getStatusBadge(student.finalStatus)}
                            </div>
                        </div>
                    ))}
                    {filteredStudents.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#808191' }}>Öğrenci bulunamadı.</div>}
                </div>
            </div>

            {/* Right Panel - Student Details */}
            <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'auto' }}>
                {selectedStudent ? (
                    <div id="student-detail-print-area" style={{ padding: '1.5rem' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <StudentAvatar
                                    studentId={selectedStudent.id}
                                    firstName={selectedStudent.firstName || ''}
                                    lastName={selectedStudent.lastName || ''}
                                    photoUrl={selectedStudent.photoUrl}
                                    size={64}
                                    canEdit={canEditPhoto}
                                    isAuthorized={canEditPhoto}
                                    table="branch_students"
                                />
                                <div>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', background: '#E8F5E9', color: '#2E7D32', fontWeight: '500' }}>{selectedStudent.branchName} Şubesi</span>
                                        <QuickStatusBadge status={selectedStudent.finalStatus} onUpdate={(val) => handleUpdateField(selectedStudent.id, 'finalStatus', val)} />
                                    </div>
                                </div>
                            </div>
                            <div className="no-print" style={{ display: 'flex', gap: '8px' }}>
                                <PdfDownloadButton
                                    student={selectedStudent}
                                    type="general"
                                    fileName={`${selectedStudent.firstName} ${selectedStudent.lastName} - Öğrenci Detay`}
                                    className="px-3 py-2 text-xs"
                                />
                                <button onClick={handleExcelExport} style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #00B894, #00CEC9)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}><Download size={14} /> Excel</button>
                                <button onClick={() => handleOpenModal(selectedStudent)} style={{ padding: '8px 14px', background: '#f8f9ff', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}><Edit2 size={14} /> Düzenle</button>
                                <button onClick={() => handleStartDelete(selectedStudent.id)} style={{ padding: '8px 14px', background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: '8px', cursor: 'pointer', color: '#E17055', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}><Trash2 size={14} /> Sil</button>
                            </div>
                        </div>

                        {/* Info Cards Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {/* Kişisel Bilgiler */}
                            <InfoCard title="Kişisel Bilgiler" color="#6C5CE7" icon={<Mail size={18} />}>
                                <InlineEditableRow label="E-mail" value={selectedStudent.email} field="email" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'email', v)} />
                                <InlineEditableRow label="Telefon" value={selectedStudent.phone} field="phone" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'phone', v)} />
                                <InlineEditableRow label="Şehir" value={selectedStudent.city} field="city" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'city', v)} />
                                <InlineEditableRow label="Pasaport No" value={selectedStudent.passportNo} field="passportNo" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'passportNo', v)} />
                                <InlineEditableRow label="Seri No" value={selectedStudent.serialNumber} field="serialNumber" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'serialNumber', v)} />
                            </InfoCard>

                            {/* Eğitim Bilgileri */}
                            <InfoCard title="Eğitim Bilgileri" color="#00B894" icon={<GraduationCap size={18} />}>
                                {(selectedStudent.educations && selectedStudent.educations.length > 0) ? (
                                    selectedStudent.educations.map((edu, index) => (
                                        <div key={index} style={{ marginBottom: index < (selectedStudent.educations!.length - 1) ? '1rem' : 0, paddingBottom: index < (selectedStudent.educations!.length - 1) ? '1rem' : 0, borderBottom: index < (selectedStudent.educations!.length - 1) ? '1px dashed #eee' : 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <InfoRow label="Üniversite" value={getUniversityName(edu.universityId)} icon={index > 0 ? undefined : undefined} />
                                            <InfoRow label="Bölüm" value={edu.department} />
                                            <InfoRow label="Program" value={edu.program} badge color={PROGRAMS.find(p => p.name === edu.program)?.color} />
                                            <InfoRow label="Sınıf" value={edu.grade} />
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <InfoRow label="Üniversite" value={getUniversityName(selectedStudent.universityId)} />
                                        <InfoRow label="Bölüm" value={selectedStudent.department} />
                                        <InfoRow label="Program" value={selectedStudent.program} badge color={PROGRAMS.find(p => p.name === selectedStudent.program)?.color} />
                                        <InfoRow label="Sınıf" value={selectedStudent.grade} />
                                    </div>
                                )}
                            </InfoCard>

                            {/* Veli Bilgileri */}
                            <InfoCard title="Veli İletişim Bilgileri" color="#fdcb6e" icon={<Users size={18} />}>
                                <InlineEditableRow label="Veli Adı" value={selectedStudent.parentName} field="parentName" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'parentName', v)} />
                                <InlineEditableRow label="Veli Tel" value={selectedStudent.parentPhone} field="parentPhone" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'parentPhone', v)} />
                                <InlineEditableRow label="Veli Email" value={selectedStudent.parentEmail} field="parentEmail" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'parentEmail', v)} />
                                <InlineEditableRow label="Ücret" value={selectedStudent.fee} field="fee" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'fee', v)} style={{ fontWeight: 'bold', color: '#27AE60' }} />
                            </InfoCard>

                            {/* Mali Bilgiler */}
                            <InfoCard title="Mali Bilgiler" color="#E67E22" icon={<CreditCard size={18} />}>
                                <InlineEditableRow label="IBAN" value={selectedStudent.iban} field="iban" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'iban', v)} />
                                <InlineEditableRow label="Sıralama" value={selectedStudent.examResult} field="examResult" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'examResult', v)} />
                                <InlineEditableRow label="Bloke" value={selectedStudent.visaResult} field="visaResult" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'visaResult', v)} />
                                <InlineEditableRow label="Kira Kontratı" value={selectedStudent.selectionResult} field="selectionResult" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'selectionResult', v)} />
                                <InlineEditableRow label="Ödeme" value={selectedStudent.paymentStatus} field="paymentStatus" type="select" options={['Tamamlandı', 'Kısmi Ödeme', 'Bekleniyor'].map(o => ({ value: o, label: o }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'paymentStatus', v)} badge />
                            </InfoCard>

                            {/* Hizmet & Sonuç */}
                            <InfoCard title="Hizmet & Sonuç" color="#E91E63" icon={<FileText size={18} />}>
                                <QuickStatusRow label="Sonuç" status={selectedStudent.finalStatus} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'finalStatus', v)} />
                                <InlineEditableRow label="Danışmanlık" value={selectedStudent.supportPackage} field="supportPackage" type="select" options={['Evet', 'Hayır'].map(o => ({ value: o, label: o }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'supportPackage', v)} />
                                <InlineEditableRow label="Konaklama" value={selectedStudent.accommodationService} field="accommodationService" type="select" options={['Evet', 'Hayır'].map(o => ({ value: o, label: o }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'accommodationService', v)} />
                                <InlineEditableRow label="Burs Paketi" value={selectedStudent.scholarshipPackage} field="scholarshipPackage" type="select" options={['Evet', 'Hayır'].map(o => ({ value: o, label: o }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'scholarshipPackage', v)} />
                                <InlineEditableRow label="Vasi Hizmeti" value={selectedStudent.guardianService} field="guardianService" type="select" options={['Evet', 'Hayır'].map(o => ({ value: o, label: o }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'guardianService', v)} />
                                <InlineEditableRow label="YDP" value={selectedStudent.ydtSupport} field="ydtSupport" type="select" options={['Evet', 'Hayır'].map(o => ({ value: o, label: o }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'ydtSupport', v)} />
                            </InfoCard>
                        </div>

                        {/* Description / Notes */}
                        {(selectedStudent.notes || selectedStudent.description) && (
                            <div style={{ marginTop: '1rem', background: '#fafafc', borderRadius: '12px', padding: '1rem' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Açıklama / Notlar</h4>
                                <p style={{ color: '#333', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>{selectedStudent.description}</p>
                                {selectedStudent.notes && <p style={{ color: '#555', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>Not: {selectedStudent.notes}</p>}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#808191' }}>
                        <GraduationCap size={48} color="#e0e0e0" />
                        <p style={{ marginTop: '1rem', fontSize: '1rem' }}>Detayları görmek için sol panelden bir öğrenci seçin.</p>
                    </div>
                )}
            </div>
            {/* Delete Modal */}
            {deleteCountdown && (
                <div onClick={handleBackdropClick} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><Trash2 size={28} color="#E17055" /></div>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Öğrenciyi silmek istediğinize emin misiniz?</h3>
                        <p style={{ color: '#808191', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Bu işlem geri alınamaz.</p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => setDeleteCountdown(null)} style={{ padding: '10px 24px', background: '#f5f5fa', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>İptal</button>
                            <button onClick={handleConfirmDelete} disabled={deleteCountdown.count > 0} style={{ padding: '10px 24px', background: deleteCountdown.count > 0 ? '#e0e0e0' : 'linear-gradient(135deg, #E17055, #FF7675)', color: deleteCountdown.count > 0 ? '#999' : 'white', border: 'none', borderRadius: '10px', cursor: deleteCountdown.count > 0 ? 'not-allowed' : 'pointer', minWidth: '100px', fontSize: '0.85rem' }}>
                                {deleteCountdown.count > 0 ? `Sil (${deleteCountdown.count})` : 'Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmationModal && confirmationModal.isOpen && (
                <div onClick={() => setConfirmationModal(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Save size={28} color="#2196F3" />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: '#1a1a2e' }}>Değişikliği Onayla</h3>
                        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            <strong>{confirmationModal.label}</strong> alanını güncellemek istediğinize emin misiniz?
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => setConfirmationModal(null)} style={{ padding: '10px 24px', background: '#f5f5fa', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#666' }}>İptal</button>
                            <button onClick={handleConfirmUpdate} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2196F3, #64B5F6)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                                Onayla ve Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <StudentForm
                    universities={universities}
                    initialData={editingStudent as BranchStudent}
                    isEditing={isEditing}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSaveStudent}
                />
            )}
        </div>
    );
}

function InfoCard({ title, color, icon, children }: { title: string; color: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div style={{ background: '#fafafc', borderRadius: '12px', padding: '1.25rem', borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ color }}>{icon}</div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color, margin: 0 }}>{title}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>{children}</div>
        </div>
    );
}

function InfoRow({ label, value, icon, badge, color, style }: { label: string; value?: string; icon?: React.ReactNode; badge?: boolean; color?: string; style?: React.CSSProperties }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
            {icon}
            <span style={{ color: '#808191', fontSize: '0.8rem', minWidth: '90px' }}>{label}:</span>
            {badge ? (
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', background: color ? `${color}20` : (value === 'Kabul' || value === 'Tamamlandı' ? '#E8F5E9' : value === 'Red' ? '#FFEBEE' : '#FFF8E1'), color: color || (value === 'Kabul' || value === 'Tamamlandı' ? '#2E7D32' : value === 'Red' ? '#C62828' : '#F57F17') }}>{value || '-'}</span>
            ) : (
                <span style={{ fontWeight: '500', color: '#333', fontSize: '0.85rem' }}>{value || '-'}</span>
            )}
        </div>
    );
}

function InlineEditableRow({ label, value, displayValue, icon, field, onUpdate, type = 'text', options, badge, color, style }: { label: string; value?: string; displayValue?: string; icon?: React.ReactNode; field: keyof BranchStudent; onUpdate: (val: string) => void; type?: 'text' | 'select'; options?: { value: string; label: string }[]; badge?: boolean; color?: string; style?: React.CSSProperties }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value || '');

    useEffect(() => { setTempValue(value || ''); }, [value]);

    const handleSave = () => {
        onUpdate(tempValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempValue(value || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '28px', ...style }}>
                <span style={{ color: '#808191', fontSize: '0.8rem', minWidth: '90px' }}>{label}:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    {type === 'select' ? (
                        <select
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                            style={{ padding: '2px 4px', borderRadius: '4px', border: '1px solid #6C5CE7', fontSize: '0.8rem', outline: 'none', background: 'white', flex: 1, minWidth: 0 }}
                            autoFocus
                        >
                            <option value="">Seçiniz</option>
                            {options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                            style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #6C5CE7', fontSize: '0.8rem', outline: 'none', width: '100%', flex: 1, minWidth: 0 }}
                            autoFocus
                        />
                    )}
                    <button onClick={handleSave} style={{ background: '#E8F5E9', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#2E7D32', flexShrink: 0 }}><Check size={14} /></button>
                    <button onClick={handleCancel} style={{ background: '#FFEBEE', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#C62828', flexShrink: 0 }}><X size={14} /></button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', ...style }} onClick={() => setIsEditing(true)} title="Düzenlemek için tıklayın">
            {icon}
            <span style={{ color: '#808191', fontSize: '0.8rem', minWidth: '90px' }}>{label}:</span>
            {badge ? (
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', background: color ? `${color}20` : (displayValue || value === 'Kabul' || value === 'Tamamlandı' ? '#E8F5E9' : value === 'Red' ? '#FFEBEE' : '#FFF8E1'), color: color || (displayValue || value === 'Kabul' || value === 'Tamamlandı' ? '#2E7D32' : value === 'Red' ? '#C62828' : '#F57F17') }}>{displayValue || value || '-'}</span>
            ) : (
                <span style={{ fontWeight: '500', color: style?.color || '#333', fontSize: '0.85rem', borderBottom: '1px dashed transparent', transition: 'border-color 0.2s', ...style }} onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = '#ccc'} onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}>{displayValue || value || (field === 'fee' ? '' : '-')}</span>
            )}
        </div>
    );
}

function QuickStatusBadge({ status, onUpdate }: { status?: string, onUpdate: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const styles: Record<string, { bg: string; color: string }> = {
        'Kabul': { bg: '#E8F5E9', color: '#2E7D32' },
        'Red': { bg: '#FFEBEE', color: '#C62828' },
        'Beklemede': { bg: '#FFF8E1', color: '#F57F17' },
        'SOSPESO': { bg: '#E3F2FD', color: '#1565C0' }
    };
    const s = styles[status || 'Beklemede'] || styles['Beklemede'];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isOpen && !(e.target as Element).closest('.status-badge-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="status-badge-container" style={{ position: 'relative' }}>
            <span
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', background: s.bg, color: s.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
                {status || 'Beklemede'} <ChevronDown size={12} />
            </span>
            {isOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '120px', overflow: 'hidden' }}>
                    {Object.keys(styles).map(key => (
                        <div
                            key={key}
                            onClick={(e) => { e.stopPropagation(); onUpdate(key); setIsOpen(false); }}
                            style={{ padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer', background: key === status ? '#f8f9fa' : 'white', color: styles[key].color, fontWeight: key === status ? '600' : '400' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = key === status ? '#f8f9fa' : 'white'}
                        >
                            {key}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function QuickStatusRow({ label, status, onUpdate }: { label: string; status?: string; onUpdate: (val: string) => void }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#808191', fontSize: '0.8rem', minWidth: '90px' }}>{label}:</span>
            <QuickStatusBadge status={status} onUpdate={onUpdate} />
        </div>
    );
}
