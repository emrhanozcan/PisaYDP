'use client';

import { useState, useEffect } from 'react';
import { University, BranchStudent, BranchCode } from '@/types';
import { Star, Search, Edit2, Trash2, Plus, Download, Upload, X, Save, CheckCircle, Clock, XCircle } from 'lucide-react';

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

export default function UniversitiesClient({ universities, initialFavorites, branchCode, userId }: UniversitiesClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [selectedUni, setSelectedUni] = useState<University | null>(null);
    const [favorites, setFavorites] = useState<string[]>(initialFavorites);
    const [students, setStudents] = useState<BranchStudent[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [deleteCountdown, setDeleteCountdown] = useState<{ id: string; count: number } | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<BranchStudent>>(EMPTY_STUDENT);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

    const filteredUniversities = universities
        .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aFav = favorites.includes(a.id);
            const bFav = favorites.includes(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.name.localeCompare(b.name, 'tr');
        });

    // Filter students by search term
    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
        (s.phone && s.phone.includes(studentSearchTerm))
    );

    useEffect(() => {
        if (selectedUni) {
            fetch(`/api/branch/students?universityId=${selectedUni.id}&branchCode=${branchCode}`)
                .then(res => res.json())
                .then(data => setStudents(data))
                .catch(() => setStudents([]));
        }
    }, [selectedUni, branchCode]);

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
            setShowAddModal(false);
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

    const handleOpenAddModal = () => { setEditingStudent({ ...EMPTY_STUDENT, universityId: selectedUni?.id, branchCode }); setEditingStudentId(null); setShowAddModal(true); };
    const handleEditStudent = (student: BranchStudent) => { setEditingStudent(student); setEditingStudentId(student.id); setShowAddModal(true); };
    const handleSaveStudent = async () => {
        const method = editingStudentId ? 'PUT' : 'POST';
        const body = editingStudentId ? editingStudent : { ...editingStudent, branchCode, universityId: editingStudent.universityId || selectedUni?.id };
        const res = await fetch('/api/branch/students', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
            const saved = await res.json();
            // If university changed, navigate to new university
            if (editingStudentId && saved.universityId !== selectedUni?.id) {
                const newUni = universities.find(u => u.id === saved.universityId);
                if (newUni) {
                    setSelectedUni(newUni);
                }
            } else if (editingStudentId) {
                setStudents(prev => prev.map(s => s.id === saved.id ? saved : s));
            } else {
                setStudents(prev => [...prev, saved]);
            }
            setShowAddModal(false);
        }
    };
    const handleDeleteStudent = async (id: string) => { if (!confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) return; await fetch('/api/branch/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); setStudents(prev => prev.filter(s => s.id !== id)); };

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

    // Header styles with category colors
    const thBase: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.3px', borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap', position: 'sticky', top: 0 };
    const tdBase: React.CSSProperties = { padding: '12px', fontSize: '0.85rem', color: '#333', borderBottom: '1px solid #f0f0f5', whiteSpace: 'nowrap' };

    return (
        <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 60px)' }}>
            {/* Left Sidebar - University List */}
            <div style={{ width: '320px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f5' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a2e', margin: '0 0 0.75rem 0' }}>Üniversiteler</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                        <input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc', outline: 'none' }} />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
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
                        {/* Fixed Header with Search */}
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f5', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>{selectedUni.name}</h2>
                                    <p style={{ color: '#808191', fontSize: '0.8rem', margin: '2px 0 0 0' }}>{filteredStudents.length} / {students.length} öğrenci</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={handleExcelExport} style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #00B894, #00CEC9)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '500' }}><Download size={14} /> Excel</button>
                                    <button style={{ padding: '8px 14px', background: '#f5f5fa', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '500', color: '#666' }}><Upload size={14} /> Yükle</button>
                                    <button onClick={handleOpenAddModal} style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '500' }}><Plus size={14} /> Yeni Ekle</button>
                                </div>
                            </div>
                            {/* Student Search */}
                            <div style={{ position: 'relative', maxWidth: '350px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                                <input type="text" placeholder="Öğrenci ara (ad, e-mail, telefon)..." value={studentSearchTerm} onChange={(e) => setStudentSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc', outline: 'none' }} />
                            </div>
                        </div>

                        {/* Horizontal Scrollbar - Visible */}
                        <style>{`
                            .table-scroll::-webkit-scrollbar { height: 14px; width: 14px; }
                            .table-scroll::-webkit-scrollbar-track { background: linear-gradient(to right, #f0f0f5, #e8e8ef); border-radius: 7px; margin: 0 10px; }
                            .table-scroll::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #6C5CE7, #a29bfe); border-radius: 7px; border: 3px solid #f0f0f5; }
                            .table-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #5B4BD5, #8B7CD9); }
                            .table-scroll::-webkit-scrollbar-corner { background: #f0f0f5; }
                        `}</style>

                        {/* Scrollable Table Container */}
                        <div className="table-scroll" style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
                            <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {/* KİŞİSEL BİLGİLER - Purple */}
                                        <th style={{ ...thBase, background: COL_COLORS.personal, color: '#6C5CE7' }}>Ad Soyad</th>
                                        <th style={{ ...thBase, background: COL_COLORS.personal, color: '#6C5CE7' }}>Telefon</th>
                                        <th style={{ ...thBase, background: COL_COLORS.personal, color: '#6C5CE7' }}>E-mail</th>
                                        {/* EĞİTİM BİLGİLERİ - Green */}
                                        <th style={{ ...thBase, background: COL_COLORS.education, color: '#00B894' }}>Bölüm</th>
                                        <th style={{ ...thBase, background: COL_COLORS.education, color: '#00B894' }}>Program</th>
                                        <th style={{ ...thBase, background: COL_COLORS.education, color: '#00B894' }}>Sınıf</th>
                                        {/* MALİ BİLGİLER - Yellow */}
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>Sıralama</th>
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>Bloke</th>
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>Kira Kontratı</th>
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>IBAN</th>
                                        <th style={{ ...thBase, background: COL_COLORS.financial, color: '#E67E22' }}>Ödeme</th>
                                        {/* SONUÇ BİLGİLERİ - Pink */}
                                        <th style={{ ...thBase, background: COL_COLORS.results, color: '#E91E63' }}>Sonuç</th>
                                        <th style={{ ...thBase, background: COL_COLORS.results, color: '#E91E63' }}>Pasaport</th>
                                        <th style={{ ...thBase, background: COL_COLORS.results, color: '#E91E63' }}>Danışmanlık</th>
                                        {/* İŞLEM */}
                                        <th style={{ ...thBase, background: COL_COLORS.action, position: 'sticky', right: 0, boxShadow: '-2px 0 4px rgba(0,0,0,0.05)' }}>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((s) => (
                                        <tr key={s.id} style={{ transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                            {/* KİŞİSEL */}
                                            <td style={{ ...tdBase, background: COL_COLORS.personal, fontWeight: '500', color: '#1a1a2e' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: '600', flexShrink: 0 }}>{s.firstName[0]}{s.lastName[0]}</div>
                                                    {s.firstName} {s.lastName}
                                                </div>
                                            </td>
                                            <td style={{ ...tdBase, background: COL_COLORS.personal }}>{s.phone || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.personal }}>{s.email || '-'}</td>
                                            {/* EĞİTİM */}
                                            <td style={{ ...tdBase, background: COL_COLORS.education }}>{s.department || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.education }}>{s.program || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.education }}>{s.enrollmentYear || '-'}</td>
                                            {/* MALİ */}
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>{s.examResult || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>{s.visaResult || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>{s.selectionResult || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>{s.iban || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.financial }}>
                                                <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', background: s.status === 'active' ? '#E8F5E9' : '#FFF8E1', color: s.status === 'active' ? '#2E7D32' : '#F57F17' }}>
                                                    {s.status === 'active' ? 'Tamamlandı' : 'Beklemede'}
                                                </span>
                                            </td>
                                            {/* SONUÇ */}
                                            <td style={{ ...tdBase, background: COL_COLORS.results }}>{getStatusBadge(s.finalStatus)}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.results }}>{s.passportNo || '-'}</td>
                                            <td style={{ ...tdBase, background: COL_COLORS.results }}>{s.supportPackage || '-'}</td>
                                            {/* İŞLEM */}
                                            <td style={{ ...tdBase, background: COL_COLORS.action, position: 'sticky', right: 0, boxShadow: '-2px 0 4px rgba(0,0,0,0.05)' }}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => handleEditStudent(s)} style={{ padding: '6px 10px', background: '#6C5CE715', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Edit2 size={14} color="#6C5CE7" /></button>
                                                    <button onClick={() => handleDeleteStudent(s.id)} style={{ padding: '6px 10px', background: '#E1705515', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14} color="#E17055" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr><td colSpan={15} style={{ ...tdBase, textAlign: 'center', padding: '3rem', color: '#808191', background: 'white' }}>
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

            {/* Add/Edit Student Modal */}
            {showAddModal && (
                <div onClick={handleBackdropClick} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '20px', width: '800px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', margin: 0 }}>{editingStudentId ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '6px' }}><X size={18} color="white" /></button>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
                            <SectionHeader title="Kişisel Bilgiler" color="#6C5CE7" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <InputField label="Ad" value={editingStudent.firstName || ''} onChange={(v) => setEditingStudent(p => ({ ...p, firstName: v }))} />
                                <InputField label="Soyad" value={editingStudent.lastName || ''} onChange={(v) => setEditingStudent(p => ({ ...p, lastName: v }))} />
                                <InputField label="Telefon" value={editingStudent.phone || ''} onChange={(v) => setEditingStudent(p => ({ ...p, phone: v }))} />
                                <InputField label="E-mail" value={editingStudent.email || ''} onChange={(v) => setEditingStudent(p => ({ ...p, email: v }))} />
                                <InputField label="Pasaport No" value={editingStudent.passportNo || ''} onChange={(v) => setEditingStudent(p => ({ ...p, passportNo: v }))} />
                                <InputField label="Şehir" value={editingStudent.city || ''} onChange={(v) => setEditingStudent(p => ({ ...p, city: v }))} />
                            </div>

                            <SectionHeader title="Eğitim Bilgileri" color="#00B894" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <SelectField label="Üniversite" value={editingStudent.universityId || ''} onChange={(v) => setEditingStudent(p => ({ ...p, universityId: v }))} options={universities.map(u => ({ value: u.id, label: u.name }))} />
                                <InputField label="Bölüm" value={editingStudent.department || ''} onChange={(v) => setEditingStudent(p => ({ ...p, department: v }))} />
                                <InputField label="Program" value={editingStudent.program || ''} onChange={(v) => setEditingStudent(p => ({ ...p, program: v }))} />
                                <InputField label="Sınıf" value={editingStudent.enrollmentYear || ''} onChange={(v) => setEditingStudent(p => ({ ...p, enrollmentYear: v }))} />
                            </div>

                            <SectionHeader title="Mali Bilgiler" color="#E67E22" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <InputField label="IBAN" value={editingStudent.iban || ''} onChange={(v) => setEditingStudent(p => ({ ...p, iban: v }))} />
                                <InputField label="Sıralama" value={editingStudent.examResult || ''} onChange={(v) => setEditingStudent(p => ({ ...p, examResult: v }))} />
                                <InputField label="Bloke" value={editingStudent.visaResult || ''} onChange={(v) => setEditingStudent(p => ({ ...p, visaResult: v }))} />
                                <InputField label="Kira Kontratı" value={editingStudent.selectionResult || ''} onChange={(v) => setEditingStudent(p => ({ ...p, selectionResult: v }))} />
                                <SelectField label="Ödeme Durumu" value={editingStudent.status || 'active'} onChange={(v) => setEditingStudent(p => ({ ...p, status: v as 'active' | 'frozen' }))} options={[{ value: 'active', label: 'Tamamlandı' }, { value: 'frozen', label: 'Beklemede' }]} />
                            </div>

                            <SectionHeader title="Sonuç Bilgileri" color="#E91E63" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <SelectField label="Sonuç" value={editingStudent.finalStatus || 'Beklemede'} onChange={(v) => setEditingStudent(p => ({ ...p, finalStatus: v as 'Kabul' | 'Red' | 'Beklemede' }))} options={[{ value: 'Kabul', label: 'Kabul' }, { value: 'Red', label: 'Red' }, { value: 'Beklemede', label: 'Beklemede' }, { value: 'SOSPESO', label: 'SOSPESO' }]} />
                                <SelectField label="Danışmanlık" value={editingStudent.supportPackage || 'Hayır'} onChange={(v) => setEditingStudent(p => ({ ...p, supportPackage: v as 'Evet' | 'Hayır' }))} options={[{ value: 'Evet', label: 'Evet' }, { value: 'Hayır', label: 'Hayır' }]} />
                                <InputField label="Notlar" value={editingStudent.notes || ''} onChange={(v) => setEditingStudent(p => ({ ...p, notes: v }))} />
                            </div>
                        </div>

                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f5', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#fafafc' }}>
                            <button onClick={() => setShowAddModal(false)} style={{ padding: '10px 24px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>İptal</button>
                            <button onClick={handleSaveStudent} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
                                <Save size={16} /> {editingStudentId ? 'Kaydet' : 'Öğrenci Ekle'}
                            </button>
                        </div>
                    </div>
                </div>
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

function InputField({ label, value, onChange, type = 'text', disabled = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: '500', color: '#666' }}>{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.85rem', background: disabled ? '#f5f5f5' : 'white', outline: 'none' }}
                onFocus={(e) => { if (!disabled) e.target.style.borderColor = '#6C5CE7'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }} />
        </div>
    );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: '500', color: '#666' }}>{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.85rem', background: 'white', outline: 'none', cursor: 'pointer' }}>
                {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
        </div>
    );
}
