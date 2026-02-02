'use client';

import { useState, useEffect } from 'react';
import { BranchStudent, University, BRANCH_NAMES, BranchCode } from '@/types';
import { Search, Mail, Phone, Download, GraduationCap, CreditCard, FileText, MapPin, Edit2, Trash2, Plus, Save, X, Users, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface StudentsClientProps {
    initialStudents: (BranchStudent & { branchName: string })[];
    universities: University[];
}

export default function StudentsClient({ initialStudents, universities }: StudentsClientProps) {
    const [students, setStudents] = useState<(BranchStudent & { branchName: string })[]>(initialStudents);
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
        packageType: '', accommodationService: 'Hayır', supportPackage: 'Hayır', scholarshipPackage: 'Hayır', ydtSupport: 'Hayır',
        status: 'active', registrationDate: new Date().toISOString().split('T')[0],
        serialNumber: '', description: '', parentName: '', parentPhone: '', parentEmail: '', fee: ''
    };

    const CITIES = [
        { name: 'Milano', color: '#E17055' }, { name: 'Roma', color: '#6C5CE7' }, { name: 'Floransa', color: '#0984e3' },
        { name: 'Torino', color: '#00b894' }, { name: 'Venedik', color: '#fdcb6e' }, { name: 'Bologna', color: '#d63031' },
        { name: 'Napoli', color: '#e84393' }, { name: 'Genova', color: '#636e72' }, { name: 'Siena', color: '#2d3436' },
        { name: 'Pisa', color: '#00cec9' }
    ];

    const PROGRAMS = [
        { name: 'Lisans', color: '#3498DB' }, { name: 'Önlisans', color: '#9B59B6' },
        { name: 'Foundation', color: '#E67E22' }, { name: 'Dil Okulu', color: '#2ECC71' }
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
        else { setEditingStudent({ ...EMPTY_STUDENT, branchCode: 'izmir' }); setIsEditing(false); } // Default to Izmir or let user choose? If we have selector, maybe empty? But BranchCode type might require valid. Let's default to 'izmir' or better yet, if we want them to choose, maybe '' if allowed. But SelectField handles string values. 
        // Let's set default as 'izmir' as a safe default.
        setIsModalOpen(true);
    };


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

    const handleSaveStudent = async () => {
        const method = isEditing ? 'PUT' : 'POST';
        const body = isEditing ? editingStudent : { ...editingStudent };
        const res = await fetch('/api/branch/students', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
            window.location.reload(); // Simple reload for now as state is complex with allStudents prop
        }
    };

    const handleStartDelete = (id: string) => setDeleteCountdown({ id, count: 3 });

    const handleConfirmDelete = async () => {
        if (deleteCountdown && deleteCountdown.count === 0) {
            await fetch('/api/branch/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteCountdown.id }) });
            setDeleteCountdown(null);
            window.location.reload();
        }
    };

    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];

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

    const handleUpdateField = async (id: string, field: keyof BranchStudent, value: any) => {
        if (!selectedStudent) return;
        const updatedStudent = { ...selectedStudent, [field]: value };
        setSelectedStudent(updatedStudent);
        setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s)); // Updating 'students' state which includes branchName

        await fetch('/api/branch/students', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, [field]: value })
        });
    };

    const handleExcelExport = () => {
        if (students.length === 0) { alert('Dışa aktarılacak öğrenci yok.'); return; }
        const headers = ['Ad Soyad', 'Şube', 'Telefon', 'E-mail', 'Üniversite', 'Bölüm', 'Program', 'Sınıf', 'Sıralama', 'Bloke', 'Kira Kontratı', 'Sonuç', 'Ödeme', 'Pasaport', 'Danışmanlık'];
        const rows = students.map(s => [
            `${s.firstName} ${s.lastName}`, s.branchName, s.phone, s.email, getUniversityName(s.universityId), s.department, s.program, s.grade,
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
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '0.85rem', flexShrink: 0 }}>{student.firstName[0]}{student.lastName[0]}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '500', fontSize: '0.9rem', color: selectedStudent?.id === student.id ? '#6C5CE7' : '#1a1a2e' }}>{student.firstName} {student.lastName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#808191', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getUniversityName(student.universityId)}</div>
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
                    <div style={{ padding: '1.5rem' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.25rem' }}>{selectedStudent.firstName[0]}{selectedStudent.lastName[0]}</div>
                                <div>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', background: '#E8F5E9', color: '#2E7D32', fontWeight: '500' }}>{selectedStudent.branchName} Şubesi</span>
                                        <QuickStatusBadge status={selectedStudent.finalStatus} onUpdate={(val) => handleUpdateField(selectedStudent.id, 'finalStatus', val)} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
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
                                <InlineEditableRow label="Üniversite" value={selectedStudent.universityId} displayValue={getUniversityName(selectedStudent.universityId)} field="universityId" type="select" options={universities.map(u => ({ value: u.id, label: u.name }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'universityId', v)} />
                                <InlineEditableRow label="Bölüm" value={selectedStudent.department} field="department" onUpdate={(v) => handleUpdateField(selectedStudent.id, 'department', v)} />
                                <InlineEditableRow label="Program" value={selectedStudent.program} field="program" type="select" options={PROGRAMS.map(p => ({ value: p.name, label: p.name }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'program', v)} badge color={PROGRAMS.find(p => p.name === selectedStudent.program)?.color} />
                                <InlineEditableRow label="Sınıf" value={selectedStudent.grade} field="grade" type="select" options={['1', '2', '3', '4', '5', '6'].map(g => ({ value: g, label: g }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'grade', v)} />
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
                                <InlineEditableRow label="YDT" value={selectedStudent.ydtSupport} field="ydtSupport" type="select" options={['Evet', 'Hayır'].map(o => ({ value: o, label: o }))} onUpdate={(v) => handleUpdateField(selectedStudent.id, 'ydtSupport', v)} />
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

            {isModalOpen && (
                <div onClick={handleBackdropClick} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '20px', width: '800px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', margin: 0 }}>{isEditing ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '6px' }}><X size={18} color="white" /></button>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
                            <SectionHeader title="Kişisel Bilgiler" color="#6C5CE7" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                {!isEditing && (
                                    <SelectField
                                        label="Şube"
                                        value={editingStudent.branchCode || ''}
                                        onChange={(v) => setEditingStudent(p => ({ ...p, branchCode: v as BranchCode }))}
                                        options={allBranches.map(b => ({ value: b, label: BRANCH_NAMES[b] }))}
                                    />
                                )}
                                <InputField label="Ad" value={editingStudent.firstName || ''} onChange={(v) => setEditingStudent(p => ({ ...p, firstName: v }))} />
                                <InputField label="Soyad" value={editingStudent.lastName || ''} onChange={(v) => setEditingStudent(p => ({ ...p, lastName: v }))} />
                                <InputField label="Telefon" value={editingStudent.phone || ''} onChange={(v) => setEditingStudent(p => ({ ...p, phone: v }))} />
                                <InputField label="E-mail" value={editingStudent.email || ''} onChange={(v) => setEditingStudent(p => ({ ...p, email: v }))} />
                                <InputField label="Pasaport No" value={editingStudent.passportNo || ''} onChange={(v) => setEditingStudent(p => ({ ...p, passportNo: v }))} />
                                <InputField label="Seri No" value={editingStudent.serialNumber || ''} onChange={(v) => setEditingStudent(p => ({ ...p, serialNumber: v }))} />
                                <InputField label="Şehir" value={editingStudent.city || ''} onChange={(v) => setEditingStudent(p => ({ ...p, city: v }))} />
                            </div>

                            <SectionHeader title="Eğitim Bilgileri" color="#00B894" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <SelectField label="Üniversite" value={editingStudent.universityId || ''} onChange={(v) => setEditingStudent(p => ({ ...p, universityId: v }))} options={universities.map(u => ({ value: u.id, label: u.name }))} />
                                <InputField label="Bölüm" value={editingStudent.department || ''} onChange={(v) => setEditingStudent(p => ({ ...p, department: v }))} />
                                <SelectField label="Program" value={editingStudent.program || ''} onChange={(v) => setEditingStudent(p => ({ ...p, program: v }))} options={PROGRAMS.map(p => ({ value: p.name, label: p.name }))} />
                                <SelectField label="Sınıf" value={editingStudent.grade || ''} onChange={(v) => setEditingStudent(p => ({ ...p, grade: v }))} options={['1', '2', '3', '4', '5', '6'].map(g => ({ value: g, label: g }))} />
                            </div>

                            <SectionHeader title="Veli İletişim & Ücret" color="#fdcb6e" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <InputField label="Veli Ad Soyad" value={editingStudent.parentName || ''} onChange={(v) => setEditingStudent(p => ({ ...p, parentName: v }))} />
                                <InputField label="Veli Telefon" value={editingStudent.parentPhone || ''} onChange={(v) => setEditingStudent(p => ({ ...p, parentPhone: v }))} />
                                <InputField label="Veli Email" value={editingStudent.parentEmail || ''} onChange={(v) => setEditingStudent(p => ({ ...p, parentEmail: v }))} />
                                <InputField label="Tutar Ücret (€)" value={editingStudent.fee || ''} onChange={(v) => setEditingStudent(p => ({ ...p, fee: v }))} />
                            </div>

                            <SectionHeader title="Mali Bilgiler" color="#E67E22" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <InputField label="IBAN" value={editingStudent.iban || ''} onChange={(v) => setEditingStudent(p => ({ ...p, iban: v }))} />
                                <InputField label="Sıralama" value={editingStudent.examResult || ''} onChange={(v) => setEditingStudent(p => ({ ...p, examResult: v }))} />
                                <InputField label="Bloke" value={editingStudent.visaResult || ''} onChange={(v) => setEditingStudent(p => ({ ...p, visaResult: v }))} />
                                <InputField label="Kira Kontratı" value={editingStudent.selectionResult || ''} onChange={(v) => setEditingStudent(p => ({ ...p, selectionResult: v }))} />
                                <SelectField label="Ödeme Durumu" value={editingStudent.paymentStatus || 'Bekleniyor'} onChange={(v) => setEditingStudent(p => ({ ...p, paymentStatus: v as any }))} options={[{ value: 'Tamamlandı', label: 'Tamamlandı' }, { value: 'Kısmi Ödeme', label: 'Kısmi Ödeme' }, { value: 'Bekleniyor', label: 'Bekleniyor' }]} />
                            </div>

                            <SectionHeader title="Hizmet & Sonuç" color="#E91E63" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <SelectField label="Sonuç" value={editingStudent.finalStatus || 'Beklemede'} onChange={(v) => setEditingStudent(p => ({ ...p, finalStatus: v as any }))} options={[{ value: 'Kabul', label: 'Kabul' }, { value: 'Red', label: 'Red' }, { value: 'Beklemede', label: 'Beklemede' }, { value: 'SOSPESO', label: 'SOSPESO' }]} />
                                <SelectField label="Danışmanlık" value={editingStudent.supportPackage || 'Hayır'} onChange={(v) => setEditingStudent(p => ({ ...p, supportPackage: v as 'Evet' | 'Hayır' }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                                <SelectField label="Konaklama" value={editingStudent.accommodationService || 'Hayır'} onChange={(v) => setEditingStudent(p => ({ ...p, accommodationService: v as 'Evet' | 'Hayır' }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                                <SelectField label="Burs Paketi" value={editingStudent.scholarshipPackage || 'Hayır'} onChange={(v) => setEditingStudent(p => ({ ...p, scholarshipPackage: v as 'Evet' | 'Hayır' }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                                <SelectField label="YDT" value={editingStudent.ydtSupport || 'Hayır'} onChange={(v) => setEditingStudent(p => ({ ...p, ydtSupport: v as 'Evet' | 'Hayır' }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                                <div style={{ gridColumn: 'span 3' }}>
                                    <InputField label="Açıklama" value={editingStudent.description || ''} onChange={(v) => setEditingStudent(p => ({ ...p, description: v }))} />
                                </div>
                                <div style={{ gridColumn: 'span 3' }}>
                                    <InputField label="Notlar" value={editingStudent.notes || ''} onChange={(v) => setEditingStudent(p => ({ ...p, notes: v }))} />
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f5', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#fafafc' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 24px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>İptal</button>
                            <button onClick={handleSaveStudent} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
                                <Save size={16} /> {isEditing ? 'Kaydet' : 'Öğrenci Ekle'}
                            </button>
                        </div>
                    </div>
                </div>
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

function SectionHeader({ title, color }: { title: string; color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: color }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', margin: 0 }}>{title}</h3>
        </div>
    );
}

function InputField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: '500', color: '#666' }}>{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.85rem', background: 'white', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#6C5CE7'} onBlur={(e) => e.target.style.borderColor = '#e0e0e0'} />
        </div>
    );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: '500', color: '#666' }}>{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.85rem', background: 'white', outline: 'none', cursor: 'pointer' }}>
                <option value="">Seçiniz...</option>
                {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
        </div>
    );
}
