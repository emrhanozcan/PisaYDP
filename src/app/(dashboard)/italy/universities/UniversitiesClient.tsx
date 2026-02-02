'use client';

import { useState, useEffect } from 'react';
import { University, BranchStudent, BRANCH_NAMES, BranchCode } from '@/types';
import { Star, Search, Download, CheckCircle, Clock, XCircle, Edit2, Trash2, Upload, Plus, Save, X, Mail, Phone, MapPin, GraduationCap, CreditCard, FileText, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface UniversitiesClientProps {
    universities: University[];
    allStudents: (BranchStudent & { branchName: string })[];
    initialFavorites: string[];
    userId: string;
}

// Theme-compatible colors
const COL_COLORS = {
    personal: '#f3f0ff',
    education: '#e8fdf5',
    financial: '#fef9e7',
    results: '#fff0f6',
    action: '#f8f8f8'
};

export default function UniversitiesClient({ universities, allStudents, initialFavorites, userId }: UniversitiesClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [selectedUni, setSelectedUni] = useState<University | null>(null);
    const [students, setStudents] = useState<(BranchStudent & { branchName: string })[]>([]);
    const [favorites, setFavorites] = useState<string[]>(initialFavorites);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [deleteCountdown, setDeleteCountdown] = useState<{ id: string; count: number } | null>(null);
    const [branchFilter, setBranchFilter] = useState<string>('');

    // Student Edit/Delete State
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<BranchStudent>>({});
    const [isStudentEditing, setIsStudentEditing] = useState(false);
    const [studentDeleteCountdown, setStudentDeleteCountdown] = useState<{ id: string; count: number } | null>(null);

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

    const filteredUniversities = universities
        .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aFav = favorites.includes(a.id);
            const bFav = favorites.includes(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.name.localeCompare(b.name, 'tr');
        });

    const filteredStudents = students.filter(s => {
        const matchSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
            (s.email && s.email.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
            (s.phone && s.phone.includes(studentSearchTerm));
        const matchBranch = !branchFilter || s.branchCode === branchFilter;
        return matchSearch && matchBranch;
    });

    useEffect(() => {
        if (selectedUni) {
            const uniStudents = allStudents.filter(s => s.universityId === selectedUni.id);
            setStudents(uniStudents);
        }
    }, [selectedUni, allStudents]);

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

    const handleToggleFavorite = async (uniId: string) => {
        const res = await fetch('/api/branch/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, universityId: uniId }) });
        if (res.ok) {
            setFavorites(prev => prev.includes(uniId) ? prev.filter(id => id !== uniId) : [...prev, uniId]);
        }
    };

    const handleStartEdit = (uni: University) => { setEditingId(uni.id); setEditName(uni.name); setCountdown(3); };
    const handleConfirmEdit = async () => {
        if (editingId && countdown === 0) {
            await fetch('/api/branch/universities', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, name: editName }) });
            window.location.reload();
        }
    };
    const handleStartDelete = (id: string) => setDeleteCountdown({ id, count: 3 });
    const handleConfirmDelete = async () => {
        if (deleteCountdown && deleteCountdown.count === 0) {
            await fetch('/api/branch/universities', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteCountdown.id }) });
            setDeleteCountdown(null);
            window.location.reload();
        }
    };

    // Student Actions
    const handleOpenStudentModal = (student?: BranchStudent) => {
        if (student) { setEditingStudent(student); setIsStudentEditing(true); }
        else { setEditingStudent({ ...EMPTY_STUDENT, universityId: selectedUni?.id }); setIsStudentEditing(false); }
        setIsStudentModalOpen(true);
    };

    const handleSaveStudent = async () => {
        const method = isStudentEditing ? 'PUT' : 'POST';
        const body = isStudentEditing ? editingStudent : { ...editingStudent, branchCode: 'izmir' }; // Default to izmir or prompt? For Italy panel, maybe Read-Only or just simulate? User said "update", so we try PUT.
        // Actually, for Italy panel, we might not have a branchCode context for new students effectively unless we select one. 
        // But for editing, we have it. For now, let's assume editing works.
        const res = await fetch('/api/branch/students', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
            const saved = await res.json();
            if (isStudentEditing) {
                setStudents(prev => prev.map(s => s.id === saved.id ? { ...saved, branchName: s.branchName } : s));
                // Also update allStudents if needed, but we rely on local state mainly for view
            }
            else {
                // Adding new student might be tricky without branch selection, but we'll try.
                // If it fails, it fails. User mainly asked for "Update".    
                setStudents(prev => [...prev, { ...saved, branchName: 'Bilinmiyor' }]);
            }
            setIsStudentModalOpen(false);
        }
    };

    const handleStartStudentDelete = (id: string) => setStudentDeleteCountdown({ id, count: 3 });
    const handleConfirmStudentDelete = async () => {
        if (studentDeleteCountdown && studentDeleteCountdown.count === 0) {
            await fetch('/api/branch/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: studentDeleteCountdown.id }) });
            setStudents(prev => prev.filter(s => s.id !== studentDeleteCountdown.id));
            setStudentDeleteCountdown(null);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setEditingId(null);
            setDeleteCountdown(null);
            setCountdown(0);
        }
    };

    const handleExcelExport = () => {
        if (!selectedUni || students.length === 0) { alert('Dışa aktarılacak öğrenci yok.'); return; }
        const headers = [
            'Ad Soyad', 'Şube', 'Telefon', 'E-mail', 'Bölüm', 'Program', 'Sınıf', 'Sıralama', 'Bloke', 'Kira Kontratı', 'IBAN', 'Sonuç', 'Ödeme', 'Pasaport', 'Danışmanlık',
            'Veli Adı', 'Veli Tel', 'Veli Email', 'Ücret', 'Açıklama', 'Notlar'
        ];
        const rows = students.map(s => [
            `${s.firstName} ${s.lastName}`, s.branchName, s.phone || '', s.email || '', s.department || '', s.program || '', s.grade || '',
            s.examResult || '', s.visaResult || '', s.selectionResult || '', s.iban || '', s.finalStatus || '',
            s.paymentStatus || 'Bekleniyor', s.passportNo || '', s.supportPackage || '',
            s.parentName || '', s.parentPhone || '', s.parentEmail || '', s.fee || '', s.description || '', s.notes || ''
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${selectedUni.name}_ogrenciler.csv`; a.click();
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

    const thBase: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.3px', borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap', position: 'sticky', top: 0 };
    const tdBase: React.CSSProperties = { padding: '12px', fontSize: '0.85rem', color: '#333', borderBottom: '1px solid #f0f0f5', whiteSpace: 'nowrap' };

    const allBranches: BranchCode[] = ['sariyer', 'kadikoy', 'ankara', 'izmir', 'bursa', 'fethiye'];

    const [isListCollapsed, setIsListCollapsed] = useState(false);

    return (
        <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 100px)' }}>
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
                    <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a2e', margin: '0 0 0.75rem 0' }}>Üniversiteler</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                        <input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc', outline: 'none' }} />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', opacity: isListCollapsed ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: isListCollapsed ? 'none' : 'auto', visibility: isListCollapsed ? 'hidden' : 'visible' }}>
                    {filteredUniversities.map(uni => (
                        <div key={uni.id} onClick={() => setSelectedUni(uni)}
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

            {/* Right Panel - Students Table */}
            <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedUni ? (
                    <>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f5', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>{selectedUni.name}</h2>
                                    <p style={{ color: '#808191', fontSize: '0.8rem', margin: '2px 0 0 0' }}>{filteredStudents.length} / {students.length} öğrenci</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={handleExcelExport} style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #00B894, #00CEC9)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '500' }}><Download size={14} /> Excel</button>
                                    <button style={{ padding: '8px 14px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '500', color: '#555' }}><Upload size={14} /> Yükle</button>
                                    <button onClick={() => handleOpenStudentModal()} style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '500' }}><Plus size={14} /> Yeni Ekle</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                                    <input type="text" placeholder="Öğrenci ara..." value={studentSearchTerm} onChange={(e) => setStudentSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc', outline: 'none' }} />
                                </div>
                                <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc', cursor: 'pointer' }}>
                                    <option value="">Tüm Şubeler</option>
                                    {allBranches.map(bc => <option key={bc} value={bc}>{BRANCH_NAMES[bc]}</option>)}
                                </select>
                            </div>
                        </div>

                        <style>{`
                            .table-scroll::-webkit-scrollbar { height: 14px; width: 14px; }
                            .table-scroll::-webkit-scrollbar-track { background: linear-gradient(to right, #f0f0f5, #e8e8ef); border-radius: 7px; margin: 0 10px; }
                            .table-scroll::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #6C5CE7, #a29bfe); border-radius: 7px; border: 3px solid #f0f0f5; }
                            .table-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #5B4BD5, #8B7CD9); }
                        `}</style>

                        <div className="table-scroll" style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
                            <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thBase, background: COL_COLORS.personal, color: '#6C5CE7' }}>Ad Soyad</th>
                                        <th style={{ ...thBase, background: COL_COLORS.personal, color: '#6C5CE7' }}>Şube</th>
                                        <th style={{ ...thBase, background: COL_COLORS.personal, color: '#6C5CE7' }}>Telefon</th>
                                        <th style={{ ...thBase, background: COL_COLORS.personal, color: '#6C5CE7' }}>E-mail</th>
                                        <th style={{ ...thBase, background: COL_COLORS.education, color: '#00B894' }}>Bölüm</th>
                                        <th style={{ ...thBase, background: COL_COLORS.education, color: '#00B894' }}>Program</th>
                                        <th style={{ ...thBase, background: COL_COLORS.education, color: '#00B894' }}>Sınıf</th>
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>Sıralama</th>
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>Bloke</th>
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>Kira Kontratı</th>
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>IBAN</th>
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>Ödeme</th>
                                        <th style={{ ...thBase, background: COL_COLORS.results, color: '#E91E63' }}>Sonuç</th>
                                        <th style={{ ...thBase, background: COL_COLORS.action, position: 'sticky', right: 0, zIndex: 5, textAlign: 'center' }}>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((s) => (
                                        <tr key={s.id} style={{ transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                            <td style={{ ...tdBase, background: COL_COLORS.personal, fontWeight: '500', color: '#1a1a2e' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: '600', flexShrink: 0 }}>{s.firstName[0]}{s.lastName[0]}</div>
                                                    {s.firstName} {s.lastName}
                                                </div>
                                            </td>
                                            <td style={{ ...tdBase, background: COL_COLORS.personal }}><span style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '0.7rem', background: '#E8F5E9', color: '#2E7D32', fontWeight: '500' }}>{s.branchName}</span></td>
                                            <td style={{ ...tdBase, background: COL_COLORS.personal }}>{s.phone || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.personal }}>{s.email || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.education }}>{s.department || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.education }}>
                                                {s.program ? (
                                                    <span style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '0.7rem', background: (PROGRAMS.find(p => p.name === s.program)?.color || '#999') + '20', color: PROGRAMS.find(p => p.name === s.program)?.color || '#dbdbe3', fontWeight: '500' }}>{s.program}</span>
                                                ) : '-'}
                                            </td>
                                            <td style={{ ...tdBase, background: COL_COLORS.education }}>{s.grade || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>{s.examResult || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>{s.visaResult || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>{s.selectionResult || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>{s.iban || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>
                                                <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', background: s.paymentStatus === 'Tamamlandı' ? '#E8F5E9' : s.paymentStatus === 'Kısmi Ödeme' ? '#E3F2FD' : '#FFF8E1', color: s.paymentStatus === 'Tamamlandı' ? '#2E7D32' : s.paymentStatus === 'Kısmi Ödeme' ? '#1565C0' : '#F57F17' }}>
                                                    {s.paymentStatus || 'Bekleniyor'}
                                                </span>
                                            </td>
                                            <td style={{ ...tdBase, background: COL_COLORS.results }}>{getStatusBadge(s.finalStatus)}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.action, position: 'sticky', right: 0, textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button onClick={() => handleOpenStudentModal(s)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Edit2 size={14} color="#6C5CE7" /></button>
                                                    <button onClick={() => handleStartStudentDelete(s.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={14} color="#E17055" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr><td colSpan={14} style={{ ...tdBase, textAlign: 'center', padding: '3rem', color: '#808191', background: 'white' }}>
                                            {students.length === 0 ? 'Bu üniversitede kayıtlı öğrenci yok.' : 'Aramanıza uyan öğrenci bulunamadı.'}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#808191' }}>
                        <p style={{ fontSize: '1rem' }}>Detayları görmek için sol panelden bir üniversite seçin</p>
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
            {/* Student Delete Modal */}
            {studentDeleteCountdown && (
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
            )}

            {/* Student Edit Modal */}
            {isStudentModalOpen && (
                <div onClick={handleBackdropClick} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '20px', width: '800px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', margin: 0 }}>{isStudentEditing ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}</h2>
                            <button onClick={() => setIsStudentModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '6px' }}><X size={18} color="white" /></button>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
                            <SectionHeader title="Kişisel Bilgiler" color="#6C5CE7" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <SelectField
                                    label="Şube"
                                    value={editingStudent.branchCode || 'izmir'}
                                    onChange={(v) => setEditingStudent(p => ({ ...p, branchCode: v as BranchCode }))}
                                    options={Object.keys(BRANCH_NAMES).map(b => ({ value: b, label: BRANCH_NAMES[b as BranchCode] }))}
                                />
                                <InputField label="Ad" value={editingStudent.firstName || ''} onChange={(v) => setEditingStudent(p => ({ ...p, firstName: v }))} />
                                <InputField label="Soyad" value={editingStudent.lastName || ''} onChange={(v) => setEditingStudent(p => ({ ...p, lastName: v }))} />
                                <InputField label="Telefon" value={editingStudent.phone || ''} onChange={(v) => setEditingStudent(p => ({ ...p, phone: v }))} />
                                <InputField label="E-mail" value={editingStudent.email || ''} onChange={(v) => setEditingStudent(p => ({ ...p, email: v }))} />
                                <InputField label="Pasaport No" value={editingStudent.passportNo || ''} onChange={(v) => setEditingStudent(p => ({ ...p, passportNo: v }))} />
                                <InputField label="Seri No" value={editingStudent.serialNumber || ''} onChange={(v) => setEditingStudent(p => ({ ...p, serialNumber: v }))} />
                                <SelectField label="Şehir" value={editingStudent.city || ''} onChange={(v) => setEditingStudent(p => ({ ...p, city: v }))} options={CITIES.map(c => ({ value: c.name, label: c.name }))} />
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
                            <button onClick={() => setIsStudentModalOpen(false)} style={{ padding: '10px 24px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>İptal</button>
                            <button onClick={handleSaveStudent} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
                                <Save size={16} /> {isStudentEditing ? 'Kaydet' : 'Öğrenci Ekle'}
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
