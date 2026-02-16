'use client';

import { useState, useEffect } from 'react';
import { University, BranchStudent, BranchCode, BRANCH_NAMES } from '@/types';
import { Star, Search, Edit2, Trash2, Plus, Download, Upload, X, Save, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, ChevronDown, Check, Mail, GraduationCap, CreditCard, FileText, Users, Calendar } from 'lucide-react';
import PdfDownloadButton from '@/components/common/PdfDownloadButton';
import StudentAvatar from '@/components/common/StudentAvatar';
import StudentForm from '@/app/(dashboard)/admin/students/StudentForm';
import ScholarshipBadges from '@/components/common/ScholarshipBadges';

// Date format helpers: DD.MM.YYYY <-> YYYY-MM-DD
const ddmmyyyyToIso = (ddmmyyyy: string): string => {
    const parts = ddmmyyyy.split('.');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
};
const isoToDdmmyyyy = (iso: string): string => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
};

interface UniversitiesClientProps {
    universities: University[];
    initialFavorites: string[];
    branchCode: BranchCode;
    userId: string;
}

const EMPTY_STUDENT: Partial<BranchStudent> = {
    firstName: '', lastName: '', phone: '', email: '', universityId: '', program: '', enrollmentYear: '', city: '', passportNo: '', notes: '',
    infoDate: '', infoStatus: 'Hayır', offerLetter: 'Bekleniyor', applicationDeadline: '', applicationFee: '', dsuFee: '', visaFee: '',
    examResult: '', selectionResult: '', visaResult: '', finalStatus: 'Beklemede', packageType: '', accommodationService: 'Hayır', supportPackage: 'Hayır',
    status: 'active', registrationDate: new Date().toISOString().split('T')[0]
};

// Theme-compatible colors: Purple and Green tones
const COL_COLORS = {
    personal: '#f3f0ff',    // Light purple for personal info (name, phone, email)
    education: '#e8fdf5',   // Light mint-green for education (bölüm, program, sınıf)
    financial: '#fef9e7',   // Light yellow for financial (sıralama, bloke, iban, ödeme)
    results: '#fff0f6',     // Light pink for results (sonuç, danışmanlık)
    action: '#f8f8f8'       // Neutral for actions
};

const PROGRAMS = [
    { name: 'Lisans', color: '#BBDEFB' }, { name: 'Önlisans', color: '#E1BEE7' },
    { name: 'Foundation', color: '#FFE0B2' }, { name: 'Dil Okulu', color: '#C8E6C9' }
];

export default function UniversitiesClient({ universities, initialFavorites, branchCode, userId }: UniversitiesClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedUni, setSelectedUni] = useState<University | null>(null);
    const [favorites, setFavorites] = useState<string[]>(initialFavorites);
    const [allStudents, setAllStudents] = useState<BranchStudent[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [deleteCountdown, setDeleteCountdown] = useState<{ id: string; count: number } | null>(null);

    // Student Edit/Delete State
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<BranchStudent>>({});
    const [isStudentEditing, setIsStudentEditing] = useState(false);
    const [studentDeleteCountdown, setStudentDeleteCountdown] = useState<{ id: string; count: number } | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<BranchStudent | null>(null);
    const [isStudentListCollapsed, setIsStudentListCollapsed] = useState(false);
    const [registrationDeadlines, setRegistrationDeadlines] = useState<Record<string, string>>(() => {
        const defaults: Record<string, string> = {};
        universities.forEach(u => { defaults[u.id] = u.registrationDeadline || '01.06.2026'; });
        return defaults;
    });
    const [editingDeadline, setEditingDeadline] = useState(false);
    const [tempDeadline, setTempDeadline] = useState('');
    const [formError, setFormError] = useState('');

    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        field: keyof BranchStudent | null;
        value: any;
        label: string;
    } | null>(null);

    const SENSITIVE_FIELDS = ['finalStatus', 'supportPackage', 'accommodationService', 'scholarshipPackage', 'ydtSupport'];
    const FIELD_LABELS: Record<string, string> = {
        finalStatus: 'Sonuç',
        supportPackage: 'Danışmanlık',
        accommodationService: 'Konaklama',
        scholarshipPackage: 'Burs Paketi',
        ydtSupport: 'YDP Desteği'
    };

    const filteredUniversities = universities
        .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aFav = favorites.includes(a.id);
            const bFav = favorites.includes(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.name.localeCompare(b.name, 'tr');
        });

    // Derive students for selected university
    const students = allStudents.filter(s => {
        if (!selectedUni) return false;
        // Check educations array first
        if (s.educations && s.educations.length > 0) {
            return s.educations.some(e => e.universityId === selectedUni.id);
        }
        // Fallback to legacy
        return s.universityId === selectedUni.id;
    });

    // Filter students by search term
    const filteredStudents = students.filter(s => {
        const matchSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
            (s.email && s.email.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
            (s.phone && s.phone.includes(studentSearchTerm));
        const matchStatus = !statusFilter || s.finalStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    useEffect(() => {
        fetch(`/api/branch/students?branchCode=${branchCode}`)
            .then(res => res.json())
            .then(data => setAllStudents(data))
            .catch(() => setAllStudents([]));
    }, [branchCode]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    useEffect(() => {
        if (deleteCountdown && deleteCountdown.count > 0) {
            const timer = setTimeout(() => setDeleteCountdown({ ...deleteCountdown, count: deleteCountdown.count - 1 }), 1000);
            return () => clearTimeout(timer);
        }
    }, [deleteCountdown]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setEditingId(null);
            setDeleteCountdown(null);
            setCountdown(0);
        }
    };

    const handleToggleFavorite = async (uniId: string) => {
        const res = await fetch('/api/branch/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, universityId: uniId }) });
        if (res.ok) setFavorites(prev => prev.includes(uniId) ? prev.filter(id => id !== uniId) : [...prev, uniId]);
    };

    const handleStartEdit = (uni: University) => { setEditingId(uni.id); setEditName(uni.name); setCountdown(3); };
    const handleConfirmEdit = async () => { if (editingId && countdown === 0) { await fetch('/api/branch/universities', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, name: editName }) }); window.location.reload(); } };
    const handleStartDelete = (id: string) => setDeleteCountdown({ id, count: 3 });
    const handleConfirmDelete = async () => { if (deleteCountdown && deleteCountdown.count === 0) { await fetch('/api/branch/universities', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteCountdown.id }) }); setDeleteCountdown(null); window.location.reload(); } };

    // Student Actions
    const handleOpenStudentModal = (student?: BranchStudent) => {
        if (student) { setEditingStudent(student); setIsStudentEditing(true); }
        else { setEditingStudent({ ...EMPTY_STUDENT, universityId: selectedUni?.id, branchCode }); setIsStudentEditing(false); }
        setIsStudentModalOpen(true);
    };

    const handleStudentFormSuccess = (savedStudent?: BranchStudent) => {
        if (!savedStudent) {
            window.location.reload();
            return;
        }

        // Ensure branchCode is preserved/updated
        const updatedStudent = { ...savedStudent, branchCode: savedStudent.branchCode || branchCode };

        if (isStudentEditing) {
            setAllStudents(prev => prev.map(s => s.id === savedStudent?.id ? updatedStudent : s));
            if (selectedStudent?.id === savedStudent.id) {
                setSelectedStudent(updatedStudent);
            }
        } else {
            setAllStudents(prev => [...prev, updatedStudent]);
        }
        setIsStudentModalOpen(false);
    };

    const handleStartStudentDelete = (id: string) => setStudentDeleteCountdown({ id, count: 3 });
    const handleConfirmStudentDelete = async () => {
        if (studentDeleteCountdown && studentDeleteCountdown.count === 0) {
            await fetch('/api/branch/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: studentDeleteCountdown.id }) });
            setAllStudents(prev => prev.filter(s => s.id !== studentDeleteCountdown.id));
            setStudentDeleteCountdown(null);
        }
    };


    // Deadline & SMS Actions
    const handleSaveDeadline = async () => {
        if (!selectedUni) return;
        const newDeadline = tempDeadline;
        console.log('[handleSaveDeadline] Saving:', { uniId: selectedUni.id, deadline: newDeadline });
        setRegistrationDeadlines(prev => ({ ...prev, [selectedUni.id]: newDeadline }));
        setEditingDeadline(false);
        try {
            const res = await fetch('/api/branch/universities', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedUni.id, name: selectedUni.name, registrationDeadline: newDeadline })
            });
            if (res.ok) {
                const updated = await res.json();
                console.log('[handleSaveDeadline] Success:', updated);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('[handleSaveDeadline] API Error:', errorData);
                alert(`Son kayıt tarihi kaydedilemedi: ${errorData.details || errorData.error || 'Bilinmeyen hata'}`);
                setRegistrationDeadlines(prev => ({ ...prev, [selectedUni.id]: selectedUni.registrationDeadline || '01.06.2026' }));
            }
        } catch (err: any) {
            console.error('[handleSaveDeadline] Network Error:', err);
            alert('Bağlantı hatası oluştu.');
        }
    };

    const handleCheckReminders = async () => {
        if (!confirm('Tüm üniversiteler için kayıt tarihi yaklaşanlara (3 gün) SMS gönderilsin mi?')) return;
        try {
            const res = await fetch('/api/reminders/check?force=true'); // Force true allows manual trigger anytime
            const data = await res.json();
            const sentCount = data.results.filter((r: any) => r.success).length;
            alert(`İşlem tamamlandı. ${sentCount} SMS gönderildi.`);
        } catch (e) {
            alert('Hata oluştu.');
        }
    };

    const handleExcelExport = () => {
        if (!selectedUni || students.length === 0) { alert('Dışa aktarılacak öğrenci yok.'); return; }
        const headers = ['Ad Soyad', 'Telefon', 'E-mail', 'Bölüm', 'Program', 'Sınıf', 'Sıralama', 'Bloke', 'Kira Kontratı', 'IBAN', 'Sonuç', 'Ödeme', 'Pasaport', 'Danışmanlık'];
        const rows = students.map(s => [
            `${s.firstName} ${s.lastName}`, s.phone || '', s.email || '', s.city || '', s.program || '', s.enrollmentYear || '',
            s.examResult || '', s.visaResult || '', s.selectionResult || '', '', s.finalStatus || '',
            s.status === 'active' ? 'Tamamlandı' : 'Beklemede', s.passportNo || '', s.supportPackage || ''
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${selectedUni.name}_ogrenciler.csv`; a.click();
    };

    const getStatusBadge = (status?: string) => {
        const styles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
            'Kabul': { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircle size={11} /> },
            'Red': { bg: '#FFEBEE', color: '#C62828', icon: <XCircle size={11} /> },
            'Beklemede': { bg: '#FFF8E1', color: '#F57F17', icon: <Clock size={11} /> },
            'SOSPESO': { bg: '#E3F2FD', color: '#1565C0', icon: <Clock size={11} /> }
        };
        const s = styles[status || 'Beklemede'] || styles['Beklemede'];
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '500', background: s.bg, color: s.color }}>{s.icon} {status || 'Beklemede'}</span>;
    };

    function InlineEditableRow({ label, value, displayValue, field, onUpdate, type = 'text', options, badge, color, style }: { label: string; value?: string; displayValue?: string; field: keyof BranchStudent; onUpdate: (val: string) => void; type?: 'text' | 'select'; options?: { value: string; label: string }[]; badge?: boolean; color?: string; style?: React.CSSProperties }) {
        const [isEditing, setIsEditing] = useState(false);
        const [tempValue, setTempValue] = useState(value || '');
        useEffect(() => { setTempValue(value || ''); }, [value]);
        const handleSave = () => { onUpdate(tempValue); setIsEditing(false); };
        const handleCancel = () => { setTempValue(value || ''); setIsEditing(false); };
        if (isEditing) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '28px', ...style }}>
                    <span style={{ color: '#808191', fontSize: '0.8rem', minWidth: '90px' }}>{label}:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                        {type === 'select' ? (
                            <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }} style={{ padding: '2px 4px', borderRadius: '4px', border: '1px solid #6C5CE7', fontSize: '0.8rem', outline: 'none', background: 'white', flex: 1, minWidth: 0 }} autoFocus>
                                <option value="">Seçiniz</option>
                                {options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        ) : (
                            <input type="text" value={tempValue} onChange={(e) => setTempValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #6C5CE7', fontSize: '0.8rem', outline: 'none', width: '100%', flex: 1, minWidth: 0 }} autoFocus />
                        )}
                        <button onClick={handleSave} style={{ background: '#E8F5E9', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#2E7D32', flexShrink: 0 }}><Check size={14} /></button>
                        <button onClick={handleCancel} style={{ background: '#FFEBEE', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#C62828', flexShrink: 0 }}><X size={14} /></button>
                    </div>
                </div>
            );
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', ...style }} onClick={() => setIsEditing(true)} title="Düzenlemek için tıklayın">
                <span style={{ color: '#808191', fontSize: '0.8rem', minWidth: '90px' }}>{label}:</span>
                {badge ? (
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', background: color ? `${color}20` : (displayValue || value === 'Kabul' || value === 'Tamamlandı' ? '#E8F5E9' : value === 'Red' ? '#FFEBEE' : '#FFF8E1'), color: color || (displayValue || value === 'Kabul' || value === 'Tamamlandı' ? '#2E7D32' : value === 'Red' ? '#C62828' : '#F57F17') }}>{displayValue || value || '-'}</span>
                ) : (
                    <span style={{ fontWeight: '500', color: style?.color || '#333', fontSize: '0.85rem', borderBottom: '1px dashed transparent' }}>{displayValue || value || '-'}</span>
                )}
            </div>
        );
    }

    function QuickStatusBadge({ status, onUpdate }: { status?: string, onUpdate: (val: string) => void }) {
        const [isOpen, setIsOpen] = useState(false);
        const styles: Record<string, { bg: string; color: string }> = { 'Kabul': { bg: '#E8F5E9', color: '#2E7D32' }, 'Red': { bg: '#FFEBEE', color: '#C62828' }, 'Beklemede': { bg: '#FFF8E1', color: '#F57F17' }, 'SOSPESO': { bg: '#E3F2FD', color: '#1565C0' } };
        const s = styles[status || 'Beklemede'] || styles['Beklemede'];
        return (
            <div style={{ position: 'relative' }}>
                <span onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', background: s.bg, color: s.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>{status || 'Beklemede'} <ChevronDown size={12} /></span>
                {isOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '120px', overflow: 'hidden' }}>
                        {Object.keys(styles).map(key => (<div key={key} onClick={(e) => { e.stopPropagation(); onUpdate(key); setIsOpen(false); }} style={{ padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer', background: key === status ? '#f8f9fa' : 'white', color: styles[key].color }}>{key}</div>))}
                    </div>
                )}
            </div>
        );
    }

    function QuickStatusRow({ label, status, onUpdate }: { label: string; status?: string; onUpdate: (val: string) => void }) {
        return (<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#808191', fontSize: '0.8rem', minWidth: '90px' }}>{label}:</span><QuickStatusBadge status={status} onUpdate={onUpdate} /></div>);
    }

    function InfoCard({ title, color, icon, children }: { title: string; color: string; icon: React.ReactNode; children: React.ReactNode }) {
        return (
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', borderTop: `4px solid ${color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <div style={{ color }}>{icon}</div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color, margin: 0 }}>{title}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>{children}</div>
            </div>
        );
    }

    const executeUpdate = async (id: string, field: keyof BranchStudent, value: any) => {
        if (!selectedStudent) return;
        const updatedStudent = { ...selectedStudent, [field]: value };
        setSelectedStudent(updatedStudent);
        setAllStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
        await fetch('/api/branch/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, [field]: value }) });
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

    const handleUpdateEducation = async (index: number, field: string, value: any) => {
        if (!selectedStudent || !selectedStudent.educations) return;

        const updatedEducations = [...selectedStudent.educations];
        updatedEducations[index] = { ...updatedEducations[index], [field]: value };

        const updatedStudent = { ...selectedStudent, educations: updatedEducations };
        setSelectedStudent(updatedStudent);
        setAllStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));

        await fetch('/api/branch/students', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: selectedStudent.id,
                educations: updatedEducations
            })
        });
    };

    // Header styles with category colors
    const thBase: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.3px', borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap', position: 'sticky', top: 0 };
    const tdBase: React.CSSProperties = { padding: '12px', fontSize: '0.85rem', color: '#333', borderBottom: '1px solid #f0f0f5', whiteSpace: 'nowrap' };

    const [isListCollapsed, setIsListCollapsed] = useState(false);

    return (
        <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 60px)' }}>
            {/* Left Sidebar - University List */}
            <div style={{ width: isListCollapsed ? '60px' : '320px', transition: 'all 0.3s ease', background: isListCollapsed ? 'linear-gradient(to bottom, #eafaf3, #ffffff, #fbf1f1)' : 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'visible', flexShrink: 0, position: 'relative' }}>
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

                <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f5', opacity: isListCollapsed ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: isListCollapsed ? 'none' : 'auto', whiteSpace: 'nowrap', visibility: isListCollapsed ? 'hidden' : 'visible' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>Üniversiteler</h2>
                    </div>
                    <button onClick={handleCheckReminders} style={{ width: '100%', marginBottom: '10px', padding: '8px', fontSize: '0.8rem', background: '#e0f2f1', color: '#00695c', border: '1px solid #b2dfdb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '500' }}>
                        <Mail size={14} /> SMS Hatırlatmaları Kontrol Et
                    </button>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                        <input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc', outline: 'none' }} />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', opacity: isListCollapsed ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: isListCollapsed ? 'none' : 'auto', visibility: isListCollapsed ? 'hidden' : 'visible' }}>
                    {filteredUniversities.map(uni => (
                        <div key={uni.id} onClick={() => { setSelectedUni(uni); setSelectedStudent(null); }}
                            onMouseEnter={(e) => { const a = e.currentTarget.querySelector('.actions') as HTMLElement; if (a) a.style.opacity = '1'; }}
                            onMouseLeave={(e) => { const a = e.currentTarget.querySelector('.actions') as HTMLElement; if (a) a.style.opacity = '0'; }}
                            style={{ padding: '10px 16px', cursor: 'pointer', background: selectedUni?.id === uni.id ? '#f0f4ff' : 'transparent', borderLeft: selectedUni?.id === uni.id ? '3px solid #6C5CE7' : '3px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                {favorites.includes(uni.id) && <Star size={14} fill="#FDCB6E" color="#FDCB6E" style={{ flexShrink: 0 }} />}
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selectedUni?.id === uni.id ? '#6C5CE7' : '#333', fontWeight: selectedUni?.id === uni.id ? '500' : '400' }}>{uni.name}</span>
                            </div>
                            <div className="actions" style={{ display: 'flex', gap: '4px', opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
                                <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(uni.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Star size={14} color={favorites.includes(uni.id) ? '#FDCB6E' : '#ccc'} fill={favorites.includes(uni.id) ? '#FDCB6E' : 'none'} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleStartEdit(uni); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={14} color="#6C5CE7" /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleStartDelete(uni.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} color="#E17055" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Students Cards */}
            <div style={{ flex: 1, display: 'flex', gap: '1rem', overflow: 'hidden' }}>
                {selectedUni ? (
                    <>
                        {/* Student List Sidebar */}
                        <div style={{ width: isStudentListCollapsed ? '60px' : '320px', transition: 'all 0.3s ease', background: isStudentListCollapsed ? 'linear-gradient(to bottom, #eafaf3, #ffffff, #fbf1f1)' : 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'visible', flexShrink: 0, position: 'relative' }}>
                            <button onClick={() => setIsStudentListCollapsed(!isStudentListCollapsed)} style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '1px solid #e0e0e0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6C5CE7', zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                {isStudentListCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                            </button>
                            <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f5', opacity: isStudentListCollapsed ? 0 : 1, pointerEvents: isStudentListCollapsed ? 'none' : 'auto', visibility: isStudentListCollapsed ? 'hidden' : 'visible' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>{selectedUni.name}</h2>
                                        <p style={{ color: '#808191', fontSize: '0.75rem', margin: '2px 0 0 0' }}>{filteredStudents.length} öğrenci</p>
                                        {editingDeadline ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                <span style={{ color: '#E67E22', fontSize: '0.7rem' }}>Son Kayıt:</span>
                                                <input
                                                    type="date"
                                                    value={ddmmyyyyToIso(tempDeadline)}
                                                    onChange={(e) => setTempDeadline(isoToDdmmyyyy(e.target.value))}
                                                    style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #E67E22', fontSize: '0.7rem', outline: 'none', cursor: 'pointer' }}
                                                    autoFocus
                                                />
                                                <button onClick={handleSaveDeadline} style={{ background: '#E8F5E9', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#2E7D32' }}><Check size={12} /></button>
                                                <button onClick={() => setEditingDeadline(false)} style={{ background: '#FFEBEE', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#C62828' }}><X size={12} /></button>
                                            </div>
                                        ) : (
                                            <p onClick={() => { setTempDeadline(registrationDeadlines[selectedUni.id] || '01.06.2026'); setEditingDeadline(true); }} style={{ color: '#E67E22', fontSize: '0.7rem', margin: '4px 0 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} title="Düzenlemek için tıklayın">
                                                <Calendar size={11} /> Son Kayıt: {registrationDeadlines[selectedUni.id] || '01.06.2026'}
                                            </p>
                                        )}
                                    </div>
                                    <button onClick={() => handleOpenStudentModal()} style={{ padding: '6px 10px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '500' }}><Plus size={12} /> Ekle</button>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                                    <input type="text" placeholder="Öğrenci ara..." value={studentSearchTerm} onChange={(e) => setStudentSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 32px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.8rem', background: '#fafafc', outline: 'none' }} />
                                </div>
                                <div style={{ marginTop: '8px' }}>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e8e8ef', fontSize: '0.8rem', background: '#fafafc', outline: 'none', cursor: 'pointer', color: '#374151' }}>
                                        <option value="">Tüm Durumlar</option>
                                        <option value="Beklemede">Beklemede</option>
                                        <option value="Kabul">Kabul</option>
                                        <option value="Red">Red</option>
                                        <option value="SOSPESO">SOSPESO</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', opacity: isStudentListCollapsed ? 0 : 1, pointerEvents: isStudentListCollapsed ? 'none' : 'auto', visibility: isStudentListCollapsed ? 'hidden' : 'visible' }}>
                                {filteredStudents.map(student => (
                                    <div key={student.id} onClick={() => setSelectedStudent(student)} style={{ padding: '10px 14px', cursor: 'pointer', background: selectedStudent?.id === student.id ? '#f0f4ff' : 'transparent', borderLeft: selectedStudent?.id === student.id ? '3px solid #6C5CE7' : '3px solid transparent', borderBottom: '1px solid #f8f8f8', transition: 'all 0.15s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <StudentAvatar studentId={student.id} firstName={student.firstName} lastName={student.lastName} photoUrl={student.photoUrl} size={36} canEdit={false} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: '500', fontSize: '0.85rem', color: selectedStudent?.id === student.id ? '#6C5CE7' : '#1a1a2e' }}>{student.firstName} {student.lastName}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#808191', marginTop: '2px' }}>{student.department || 'Bölüm belirtilmemiş'}</div>
                                            </div>
                                            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0, background: student.finalStatus === 'Kabul' ? '#ECFDF5' : student.finalStatus === 'Red' ? '#FEF2F2' : student.finalStatus === 'SOSPESO' ? '#EFF6FF' : '#FFFBEB', color: student.finalStatus === 'Kabul' ? '#065F46' : student.finalStatus === 'Red' ? '#991B1B' : student.finalStatus === 'SOSPESO' ? '#1E40AF' : '#92400E' }}>@ {student.finalStatus || 'Beklemede'}</span>
                                        </div>
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#808191', fontSize: '0.85rem' }}>{students.length === 0 ? 'Bu üniversitede kayıtlı öğrenci yok.' : 'Öğrenci bulunamadı.'}</div>}
                            </div>
                        </div>

                        {/* Student Detail Panel */}
                        <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'auto' }}>
                            {selectedStudent ? (
                                <div id="branch-university-student-detail-print-area" style={{ padding: '1.25rem' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f0f0f5' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <StudentAvatar studentId={selectedStudent.id} firstName={selectedStudent.firstName} lastName={selectedStudent.lastName} photoUrl={selectedStudent.photoUrl} size={56} canEdit={true} isAuthorized={true} table="branch_students" />
                                            <div>
                                                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.7rem', background: '#f0f0f5', color: '#666', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                                                        {BRANCH_NAMES[selectedStudent.branchCode] || selectedStudent.branchCode}
                                                    </span>
                                                    <QuickStatusBadge status={selectedStudent.finalStatus} onUpdate={(val) => handleUpdateField(selectedStudent.id, 'finalStatus', val)} />
                                                    <ScholarshipBadges scholarshipTypes={selectedStudent.scholarshipTypes} scholarshipPackage={selectedStudent.scholarshipPackage} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="no-print" style={{ display: 'flex', gap: '6px' }}>
                                            <PdfDownloadButton
                                                student={selectedStudent}
                                                type="universities"
                                                fileName={`${selectedStudent.firstName} ${selectedStudent.lastName} - Üniversite Detay`}
                                                className="px-2 py-1 text-xs"
                                            />
                                            <button onClick={handleExcelExport} style={{ padding: '7px 12px', background: 'linear-gradient(135deg, #00B894, #00CEC9)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}><Download size={13} /> Excel</button>
                                            <button onClick={() => handleOpenStudentModal(selectedStudent)} style={{ padding: '7px 12px', background: '#f8f9ff', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}><Edit2 size={13} /> Düzenle</button>
                                            <button onClick={() => handleStartStudentDelete(selectedStudent.id)} style={{ padding: '7px 12px', background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: '8px', cursor: 'pointer', color: '#E17055', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}><Trash2 size={13} /> Sil</button>
                                        </div>
                                    </div>

                                    {/* Info Cards Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                        <InfoCard title="Kişisel Bilgiler" color="#6C5CE7" icon={<Mail size={16} />}>
                                            <InlineEditableRow label="E-mail" value={selectedStudent.email} field="email" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'email', v)} />
                                            <InlineEditableRow label="Telefon" value={selectedStudent.phone} field="phone" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'phone', v)} />
                                            <InlineEditableRow label="Şehir" value={selectedStudent.city} field="city" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'city', v)} />
                                            <InlineEditableRow label="Pasaport No" value={selectedStudent.passportNo} field="passportNo" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'passportNo', v)} />
                                            <InlineEditableRow label="Seri No" value={selectedStudent.serialNumber} field="serialNumber" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'serialNumber', v)} />
                                        </InfoCard>
                                        <InfoCard title="Eğitim Bilgileri" color="#00B894" icon={<GraduationCap size={16} />}>
                                            {(selectedStudent.educations && selectedStudent.educations.length > 0) ? (
                                                selectedStudent.educations.map((edu, index) => (
                                                    <div key={index} style={{ marginBottom: index < (selectedStudent.educations!.length - 1) ? '1rem' : 0, paddingBottom: index < (selectedStudent.educations!.length - 1) ? '1rem' : 0, borderBottom: index < (selectedStudent.educations!.length - 1) ? '1px dashed #eee' : 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                        <InlineEditableRow
                                                            label="Üniversite"
                                                            value={edu.universityId}
                                                            displayValue={universities.find(u => u.id === edu.universityId)?.name}
                                                            field="universityId"
                                                            type="select"
                                                            options={universities.map(u => ({ value: u.id, label: u.name }))}
                                                            onUpdate={(v) => handleUpdateEducation(index, 'universityId', v)}
                                                        />
                                                        <InlineEditableRow
                                                            label="Bölüm"
                                                            value={edu.department}
                                                            field="department"
                                                            onUpdate={(v) => handleUpdateEducation(index, 'department', v)}
                                                        />
                                                        <InlineEditableRow
                                                            label="Program"
                                                            value={edu.program}
                                                            field="program"
                                                            type="select"
                                                            options={PROGRAMS.map(p => ({ value: p.name, label: p.name }))}
                                                            onUpdate={(v) => handleUpdateEducation(index, 'program', v)}
                                                            badge
                                                            color={PROGRAMS.find(p => p.name === edu.program)?.color}
                                                        />
                                                        <InlineEditableRow
                                                            label="Sınıf"
                                                            value={edu.grade}
                                                            field="grade"
                                                            type="select"
                                                            options={['Hazırlık', '1', '2', '3', '4', '5', '6'].map(g => ({ value: g, label: g }))}
                                                            onUpdate={(v) => handleUpdateEducation(index, 'grade', v)}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>Eğitim bilgisi bulunamadı.</div>
                                            )}
                                        </InfoCard>
                                        <InfoCard title="Veli İletişim Bilgileri" color="#fdcb6e" icon={<Users size={16} />}>
                                            <InlineEditableRow label="Veli Adı" value={selectedStudent.parentName} field="parentName" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'parentName', v)} />
                                            <InlineEditableRow label="Veli Tel" value={selectedStudent.parentPhone} field="parentPhone" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'parentPhone', v)} />
                                            <InlineEditableRow label="Veli Email" value={selectedStudent.parentEmail} field="parentEmail" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'parentEmail', v)} />
                                            <InlineEditableRow label="Ücret" value={selectedStudent.fee} field="fee" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'fee', v)} style={{ fontWeight: 'bold', color: '#27AE60' }} />
                                        </InfoCard>

                                        <InfoCard title="Mali Bilgiler" color="#E67E22" icon={<CreditCard size={16} />}>
                                            <InlineEditableRow label="IBAN" value={selectedStudent.iban} field="iban" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'iban', v)} />
                                            <InlineEditableRow label="Sıralama" value={selectedStudent.examResult} field="examResult" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'examResult', v)} />
                                            <InlineEditableRow label="Bloke" value={selectedStudent.visaResult} field="visaResult" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'visaResult', v)} />
                                            <InlineEditableRow label="Kira Kontratı" value={selectedStudent.selectionResult} field="selectionResult" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'selectionResult', v)} />
                                            <InlineEditableRow label="Ödeme" value={selectedStudent.status === 'active' ? 'Tamamlandı' : 'Beklemede'} field="status" type="select" options={[{ value: 'active', label: 'Tamamlandı' }, { value: 'frozen', label: 'Beklemede' }]} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'status', v)} badge />
                                        </InfoCard>
                                        <InfoCard title="Hizmet & Sonuç" color="#E91E63" icon={<FileText size={16} />}>
                                            <QuickStatusRow label="Sonuç" status={selectedStudent.finalStatus} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'finalStatus', v)} />
                                            <InlineEditableRow label="Danışmanlık" value={selectedStudent.supportPackage} field="supportPackage" type="select" options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'supportPackage', v)} />
                                            <InlineEditableRow label="Konaklama" value={selectedStudent.accommodationService} field="accommodationService" type="select" options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'accommodationService', v)} />
                                            <InlineEditableRow label="Burs Paketi" value={selectedStudent.scholarshipPackage} field="scholarshipPackage" type="select" options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'scholarshipPackage', v)} />
                                            <InlineEditableRow label="YDP" value={selectedStudent.ydtSupport} field="ydtSupport" type="select" options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'ydtSupport', v)} />
                                        </InfoCard>
                                    </div>
                                    {selectedStudent.notes && (
                                        <div style={{ marginTop: '1rem', background: '#fafafc', borderRadius: '12px', padding: '1rem' }}>
                                            <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Notlar</h4>
                                            <p style={{ color: '#555', fontSize: '0.8rem', margin: 0, fontStyle: 'italic' }}>{selectedStudent.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#808191' }}>
                                    <GraduationCap size={44} color="#e0e0e0" />
                                    <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Detayları görmek için sol panelden bir öğrenci seçin.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#808191' }}>
                        <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>Detayları görmek için sol panelden bir üniversite seçin</p>
                        <button onClick={handleCheckReminders} style={{ padding: '10px 20px', fontSize: '0.9rem', background: '#e0f2f1', color: '#00695c', border: '1px solid #b2dfdb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={16} /> Manuel SMS Kontrolü Yap
                        </button>
                    </div>
                )}
            </div>

            {/* Edit University Modal */}
            {editingId && (
                <div onClick={handleBackdropClick} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', width: '400px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Üniversite Adını Düzenle</h3>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }} />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setEditingId(null); setCountdown(0); }} style={{ padding: '10px 20px', background: '#f5f5fa', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>İptal</button>
                            <button onClick={handleConfirmEdit} disabled={countdown > 0} style={{ padding: '10px 20px', background: countdown > 0 ? '#e0e0e0' : 'linear-gradient(135deg, #6C5CE7, #a29bfe)', color: countdown > 0 ? '#999' : 'white', border: 'none', borderRadius: '10px', cursor: countdown > 0 ? 'not-allowed' : 'pointer', minWidth: '100px', fontSize: '0.85rem' }}>
                                {countdown > 0 ? `Kaydet (${countdown})` : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete University Modal */}
            {deleteCountdown && (
                <div onClick={handleBackdropClick} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><Trash2 size={28} color="#E17055" /></div>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Silmek istediğinize emin misiniz?</h3>
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

            {/* Student Delete Modal */}
            {
                studentDeleteCountdown && (
                    <div onClick={handleBackdropClick} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><Trash2 size={28} color="#E17055" /></div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Öğrenciyi silmek istediğinize emin misiniz?</h3>
                            <p style={{ color: '#808191', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Bu işlem geri alınamaz.</p>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button onClick={() => setStudentDeleteCountdown(null)} style={{ padding: '10px 24px', background: '#f5f5fa', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>İptal</button>
                                <button onClick={handleConfirmStudentDelete} disabled={studentDeleteCountdown.count > 0} style={{ padding: '10px 24px', background: studentDeleteCountdown.count > 0 ? '#e0e0e0' : 'linear-gradient(135deg, #E17055, #FF7675)', color: studentDeleteCountdown.count > 0 ? '#999' : 'white', border: 'none', borderRadius: '10px', cursor: studentDeleteCountdown.count > 0 ? 'not-allowed' : 'pointer', minWidth: '100px', fontSize: '0.85rem' }}>
                                    {studentDeleteCountdown.count > 0 ? `Sil (${studentDeleteCountdown.count})` : 'Sil'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Global Student Edit Modal */}
            {
                isStudentModalOpen && (
                    <StudentForm
                        universities={universities}
                        initialData={editingStudent as BranchStudent}
                        isEditing={isStudentEditing}
                        onClose={() => setIsStudentModalOpen(false)}
                        onSuccess={handleStudentFormSuccess}
                    />
                )
            }
        </div>
    );
}


