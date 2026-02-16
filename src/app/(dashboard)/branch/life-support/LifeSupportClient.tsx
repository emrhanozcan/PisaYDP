'use client';

import { useState, useEffect } from 'react';
import { BranchStudent, University, BRANCH_NAMES, BranchCode } from '@/types';
import { Search, Check, X, FileText, Info, MapPin, Calendar, Clock, UserCheck, Plane, Briefcase, HeartHandshake, Phone, CreditCard, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import PdfDownloadButton from '@/components/common/PdfDownloadButton';
import StudentAvatar from '@/components/common/StudentAvatar';
import { getSession } from '@/app/actions/auth';
import ServiceNoteCard from '@/components/common/ServiceNoteCard';
import ServiceUploadsCard from '@/components/common/ServiceUploadsCard';

interface LifeSupportClientProps {
    initialStudents: (BranchStudent & { branchName: string })[];
    universities: University[];
    branchCode: BranchCode;
}

export default function LifeSupportClient({ initialStudents, universities, branchCode }: LifeSupportClientProps) {
    const [students, setStudents] = useState<(BranchStudent & { branchName: string })[]>(initialStudents);

    useEffect(() => {
        setStudents(initialStudents);
    }, [initialStudents]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<(BranchStudent & { branchName: string }) | null>(null);
    const [uniFilter, setUniFilter] = useState<string>('');
    const [cityFilter, setCityFilter] = useState<string>('');
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

    const CITIES = [
        { name: 'Milano', color: '#ffbca8' }, { name: 'Venezia', color: '#ffcccc' }, { name: 'Rome', color: '#ffeaa7' },
        { name: 'Torino', color: '#cbf0f8' }, { name: 'Pavia', color: '#dff9fb' }, { name: 'Padova', color: '#c7ecee' },
        { name: 'Floransa', color: '#e0dcfc' }, { name: 'Bologna', color: '#f7d794' }, { name: 'Genova', color: '#dcdde1' }
    ];

    const PROGRAMS = [
        { name: 'Lisans', color: '#BBDEFB' }, { name: 'Önlisans', color: '#E1BEE7' },
        { name: 'Foundation', color: '#FFE0B2' }, { name: 'Dil Okulu', color: '#C8E6C9' }
    ];

    const STATUS_OPTIONS = ['Bekleniyor', 'İşlemde', 'Tamamlandı', 'Sorun Var'].map(s => ({ value: s, label: s }));

    const filteredStudents = students.filter(s => {
        const fullSearch = `${s.firstName} ${s.lastName} ${s.email} ${s.phone}`.toLowerCase();
        return fullSearch.includes(searchTerm.toLowerCase()) && (!uniFilter || s.universityId === uniFilter) && (!cityFilter || s.accommodationCity === cityFilter);
    });

    const getUniversityName = (student: any) => {
        if (student.educations && student.educations.length > 0) {
            return student.educations.map((e: any) => universities.find(u => u.id === e.universityId)?.name || '-').join(', ');
        }
        return universities.find(u => u.id === student.universityId)?.name || '-';
    };

    const handleUpdateField = async (id: string, field: keyof BranchStudent, value: any) => {
        if (!selectedStudent) return;
        const updatedStudent = { ...selectedStudent, [field]: value };
        setSelectedStudent(updatedStudent);
        setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
        try {
            await fetch('/api/branch/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, [field]: value }) });
        } catch (error) { console.error('Failed to update student', error); }
    };

    const handleUpdateEducation = async (index: number, field: string, value: any) => {
        if (!selectedStudent || !selectedStudent.educations) return;

        const updatedEducations = [...selectedStudent.educations];
        updatedEducations[index] = { ...updatedEducations[index], [field]: value };

        const updatedStudent = { ...selectedStudent, educations: updatedEducations };
        setSelectedStudent(updatedStudent);
        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));

        await fetch('/api/branch/students', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: selectedStudent.id,
                educations: updatedEducations
            })
        });
    };

    function InlineEditableRow({ label, value, displayValue, icon, field, onUpdate, type = 'text', options, badge, color, style }: any) {
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
                            <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={{ padding: '2px 4px', borderRadius: '4px', border: '1px solid #6C5CE7', fontSize: '0.8rem', flex: 1 }} autoFocus>
                                <option value="">Seçiniz</option>
                                {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        ) : type === 'date' || type === 'time' ? (
                            <input type={type} value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #6C5CE7', fontSize: '0.8rem', flex: 1 }} autoFocus />
                        ) : (
                            <input type="text" value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #6C5CE7', fontSize: '0.8rem', flex: 1 }} autoFocus />
                        )}
                        <button onClick={handleSave} style={{ background: '#E8F5E9', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#2E7D32' }}><Check size={14} /></button>
                        <button onClick={handleCancel} style={{ background: '#FFEBEE', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: '#C62828' }}><X size={14} /></button>
                    </div>
                </div>
            );
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', ...style }} onClick={() => setIsEditing(true)}>
                {icon}
                <span style={{ color: '#808191', fontSize: '0.8rem', minWidth: '90px' }}>{label}:</span>
                {badge ? <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', background: color || '#f0f0f5', color: '#333' }}>{displayValue || value || '-'}</span> : <span style={{ fontWeight: '500', color: '#333', fontSize: '0.85rem' }}>{displayValue || value || '-'}</span>}
            </div>
        );
    }

    function YDTPairRow({ label, dateField, statusField }: { label: string; dateField: keyof BranchStudent; statusField: keyof BranchStudent }) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#808191', fontSize: '0.85rem', fontWeight: '500', width: '140px' }}>{label}</span>
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    <div style={{ flex: 1 }}>
                        <InlineEditableRow label="Tarih" value={selectedStudent?.[dateField] as string} field={dateField} type="date" onUpdate={(v: string) => handleUpdateField(selectedStudent!.id, dateField, v)} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <InlineEditableRow label="Durum" value={selectedStudent?.[statusField] as string} field={statusField} type="select" options={STATUS_OPTIONS} onUpdate={(v: string) => handleUpdateField(selectedStudent!.id, statusField, v)} badge />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '1.5rem' }}>
            <div style={{ width: isListCollapsed ? '60px' : '380px', transition: 'all 0.3s', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <button onClick={() => setIsListCollapsed(!isListCollapsed)} style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '1px solid #e0e0e0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6C5CE7', zIndex: 20 }}>
                    {isListCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f5', opacity: isListCollapsed ? 0 : 1, visibility: isListCollapsed ? 'hidden' : 'visible' }}>
                    <span style={{ fontWeight: '600', color: '#1a1a2e' }}>Öğrenciler ({filteredStudents.length})</span>
                    <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                        <input type="text" placeholder="Öğrenci ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc' }} />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', opacity: isListCollapsed ? 0 : 1, visibility: isListCollapsed ? 'hidden' : 'visible' }}>
                    {filteredStudents.map(student => (
                        <div key={student.id} onClick={() => setSelectedStudent(student)} style={{ padding: '12px 16px', cursor: 'pointer', background: selectedStudent?.id === student.id ? '#f0f4ff' : 'transparent', borderLeft: selectedStudent?.id === student.id ? '3px solid #6C5CE7' : '3px solid transparent', borderBottom: '1px solid #f8f8f8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <StudentAvatar
                                    studentId={student.id}
                                    firstName={student.firstName || ''}
                                    lastName={student.lastName || ''}
                                    photoUrl={student.photoUrl}
                                    size={40}
                                    canEdit={false} // List view is read-only
                                    isAuthorized={true} // View only
                                    table="branch_students"
                                    showDelete={false}
                                />
                                <div><div style={{ fontWeight: '600', color: selectedStudent?.id === student.id ? '#6C5CE7' : '#1a1a2e' }}>{student.firstName} {student.lastName}</div><div style={{ fontSize: '0.75rem', color: '#808191' }}>{getUniversityName(student)}</div></div>
                            </div>
                        </div>
                    ))}
                    {filteredStudents.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#808191' }}>Öğrenci bulunamadı.</div>}
                </div>
            </div>

            <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                {selectedStudent ? (
                    <div id="branch-life-support-detail-print-area" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
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
                                    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', background: '#E8F5E9', color: '#2E7D32' }}>{selectedStudent.branchName} Şubesi</span>
                                </div>
                            </div>
                            <div className="no-print">
                                <PdfDownloadButton
                                    student={selectedStudent}
                                    type="life-support"
                                    fileName={`${selectedStudent.firstName} ${selectedStudent.lastName} - Yaşam Destek Detay`}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <InfoCard title="Öğrenci Ayrıntıları" color="#6C5CE7" icon={<FileText size={18} />}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.2rem 2rem' }}>
                                    <InlineEditableRow label="Adı" value={selectedStudent.firstName} field="firstName" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'firstName', v)} />
                                    <InlineEditableRow label="Soyadı" value={selectedStudent.lastName} field="lastName" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'lastName', v)} />
                                    <InlineEditableRow label="Telefon" value={selectedStudent.phone} field="phone" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'phone', v)} />
                                </div>
                            </InfoCard>

                            <InfoCard title="Eğitim Bilgileri" color="#00B894" icon={<FileText size={18} />}>
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
                                                onUpdate={(v: string) => handleUpdateEducation(index, 'universityId', v)}
                                            />
                                            <InlineEditableRow
                                                label="Bölüm"
                                                value={edu.department}
                                                field="department"
                                                onUpdate={(v: string) => handleUpdateEducation(index, 'department', v)}
                                            />
                                            <InlineEditableRow
                                                label="Program"
                                                value={edu.program}
                                                field="program"
                                                type="select"
                                                options={PROGRAMS.map(p => ({ value: p.name, label: p.name }))}
                                                onUpdate={(v: string) => handleUpdateEducation(index, 'program', v)}
                                                badge
                                                color={PROGRAMS.find(p => p.name === edu.program)?.color}
                                            />
                                            <InlineEditableRow
                                                label="Sınıf"
                                                value={edu.grade}
                                                field="grade"
                                                type="select"
                                                options={['Hazırlık', '1', '2', '3', '4', '5', '6'].map(g => ({ value: g, label: g }))}
                                                onUpdate={(v: string) => handleUpdateEducation(index, 'grade', v)}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>Eğitim bilgisi bulunamadı.</div>
                                )}
                            </InfoCard>
                            <InfoCard title="Geliş Ayrıntıları" color="#00B894" icon={<Plane size={18} />}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.2rem 2rem' }}>
                                    <InlineEditableRow label="Şehir" icon={<MapPin size={14} color="#808191" />} value={selectedStudent.arrivalCity} field="arrivalCity" type="select" options={CITIES.map(c => ({ value: c.name, label: c.name }))} onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'arrivalCity', v)} badge color={CITIES.find(c => c.name === selectedStudent.arrivalCity)?.color} />
                                    <InlineEditableRow label="Ödeme Durumu" icon={<CreditCard size={14} color="#808191" />} value={selectedStudent.arrivalPaymentStatus} field="arrivalPaymentStatus" type="select" options={['Tamamlandı', 'Kısmi Ödeme', 'Bekleniyor'].map(s => ({ value: s, label: s }))} onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'arrivalPaymentStatus', v)} badge />
                                    <InlineEditableRow label="İşlemi Yapan" icon={<UserCheck size={14} color="#808191" />} value={selectedStudent.arrivalOperator} field="arrivalOperator" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'arrivalOperator', v)} />
                                    <InlineEditableRow label="Geliş Tarihi" icon={<Calendar size={14} color="#808191" />} value={selectedStudent.arrivalDate} field="arrivalDate" type="date" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'arrivalDate', v)} />
                                    <InlineEditableRow label="Havalimanı" value={selectedStudent.arrivalAirport} field="arrivalAirport" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'arrivalAirport', v)} />
                                    <InlineEditableRow label="Uçuş Saati" icon={<Clock size={14} color="#808191" />} value={selectedStudent.arrivalTime} field="arrivalTime" type="time" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'arrivalTime', v)} />
                                </div>
                            </InfoCard>
                            <InfoCard title="Yaşam Destek Paketi" color="#E67E22" icon={<HeartHandshake size={18} />}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                    <YDTPairRow label="Karşılama" dateField="ydtWelcomeDate" statusField="ydtWelcomeStatus" />
                                    <YDTPairRow label="Okul Kayıt İşlemleri" dateField="ydtSchoolRegDate" statusField="ydtSchoolRegStatus" />
                                    <YDTPairRow label="Oturum İzni" dateField="ydtResPermitDate" statusField="ydtResPermitStatus" />
                                    <YDTPairRow label="Ulaşım Kartı / SİM" dateField="ydtSimDate" statusField="ydtSimStatus" />
                                    <YDTPairRow label="Banka Hesabı" dateField="ydtBankDate" statusField="ydtBankStatus" />
                                </div>
                            </InfoCard>

                            <InfoCard title="Codice Fiscale" color="#2D3436" icon={<CreditCard size={18} />}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Randevu Ayrıntıları</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.2rem 2rem' }}>
                                        <InlineEditableRow label="İşlemi Yapan" icon={<UserCheck size={14} color="#808191" />} value={selectedStudent.codiceFiscaleHandler} field="codiceFiscaleHandler" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'codiceFiscaleHandler', v)} />
                                        <InlineEditableRow label="Geliş Tarihi" icon={<Plane size={14} color="#808191" />} value={selectedStudent.codiceFiscaleArrivalDate} field="codiceFiscaleArrivalDate" type="date" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'codiceFiscaleArrivalDate', v)} />
                                        <InlineEditableRow label="Randevu Tarihi" icon={<Calendar size={14} color="#808191" />} value={selectedStudent.codiceFiscaleAppointmentDate} field="codiceFiscaleAppointmentDate" type="date" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'codiceFiscaleAppointmentDate', v)} />
                                        <InlineEditableRow label="Yeri" icon={<MapPin size={14} color="#808191" />} value={selectedStudent.codiceFiscalePlace} field="codiceFiscalePlace" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'codiceFiscalePlace', v)} />
                                        <InlineEditableRow label="Saati" icon={<Clock size={14} color="#808191" />} value={selectedStudent.codiceFiscaleTime} field="codiceFiscaleTime" type="time" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'codiceFiscaleTime', v)} />
                                        <InlineEditableRow label="Durumu" icon={<Info size={14} color="#808191" />} value={selectedStudent.codiceFiscaleStatus} field="codiceFiscaleStatus" type="select" options={STATUS_OPTIONS} onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'codiceFiscaleStatus', v)} badge />
                                    </div>
                                </div>
                            </InfoCard>
                            <InfoCard title="Danışman" color="#9B59B6" icon={<Briefcase size={18} />}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.2rem 2rem' }}>
                                    <InlineEditableRow label="Adı Soyadı" icon={<Users size={14} color="#808191" />} value={selectedStudent.consultantName} field="consultantName" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'consultantName', v)} />
                                    <InlineEditableRow label="İletişim Bilgileri" icon={<Phone size={14} color="#808191" />} value={selectedStudent.consultantContact} field="consultantContact" onUpdate={(v: string) => handleUpdateField(selectedStudent.id, 'consultantContact', v)} />
                                </div>
                            </InfoCard>
                        </div>

                        {/* Service Notes & Uploads */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                            <ServiceNoteCard studentId={selectedStudent.id} serviceType="life_support" />
                            <ServiceUploadsCard studentId={selectedStudent.id} serviceType="life_support" />
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#808191' }}>
                        <Info size={48} color="#e0e0e0" />
                        <p style={{ marginTop: '1rem' }}>Detayları görmek için sol panelden bir öğrenci seçin.</p>
                    </div>
                )}
            </div>
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
