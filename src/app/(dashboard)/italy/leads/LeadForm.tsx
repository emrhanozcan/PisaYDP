'use client';

import React, { useEffect, useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    Save,
    Plus,
    Info,
    Users,
    Check,
    ChevronDown,
    Trash2,
    AlertCircle,
    X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LeadFormProps {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

type ContactRole = 'student' | 'guardian';

export default function LeadForm({ initialData, onSave, onCancel, isSubmitting = false }: LeadFormProps) {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]);
    const [error, setError] = useState('');

    // Initialize form data
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        emails: [''] as string[],
        phone: '',
        nationality: 'Türkiye',
        contact_role: 'student' as ContactRole,
        student_info: {
            first_name: '',
            last_name: '',
            emails: [''] as string[],
            phone: '',
            nationality: 'Türkiye',
            education_level: '',
            english_level: '',
            italian_level: ''
        },
        // Education
        interested_services: [] as string[],
        service_year: '2025',
        academic_year: '2025-2026',
        registration_year: '',
        interested_programs: [] as string[],
        interested_universities: [] as string[],
        education_level: '',
        english_level: '',
        italian_level: '',
        // Meeting
        meeting_date: '',
        meeting_time: '',
        meeting_consultant: '',
        meeting_type: 'phone',
        // Status
        source: 'website',
        status: 'new_lead',
        priority: 'medium',
        discussed_price: '',
        additional_payment: '',
        notes: ''
    });

    const [newProgram, setNewProgram] = useState('');
    const [newUn, setNewUn] = useState('');

    // Check if editing
    const isEditing = !!initialData?.id;

    // Fetch dependencies
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUser(user);

            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, name, role, unit_type, branch_id');
            if (profilesData) setProfiles(profilesData);

            const { data: unisData } = await supabase
                .from('universities')
                .select('id, name')
                .eq('is_active', true)
                .order('name');
            if (unisData) setUniversities(unisData);
        };
        init();
    }, []);

    // Initialize Data
    useEffect(() => {
        if (initialData) {
            // Mapping incoming data (CamelCase from DB adapter?) to form state (snake_case mostly)
            // Or if initialData is already friendly. 
            // The DB adapter returns camelCase. The form uses snake_case mostly internally to match DB columns for write?
            // Wait, AddLeadModal used snake_case for state but `createLead` maps it?
            // `createLead` calls `db.leads.create` which maps snake_case to DB.
            // Let's standardise on using what AddLeadModal was using: snake_case keys in state.

            // If initialData comes from `LeadsClient`, it is `Lead` type (CamelCase).
            // We need to map it back to form state.

            setFormData(prev => ({
                ...prev,
                first_name: initialData.firstName || '',
                last_name: initialData.lastName || '',
                emails: initialData.emails && initialData.emails.length > 0 ? initialData.emails : [''],
                phone: initialData.phone || '',
                nationality: initialData.nationality || 'Türkiye',
                contact_role: initialData.contactRole || 'student',
                student_info: initialData.studentInfo ? {
                    ...initialData.studentInfo,
                    emails: initialData.studentInfo.emails && initialData.studentInfo.emails.length > 0 ? initialData.studentInfo.emails : ['']
                } : prev.student_info,

                interested_services: initialData.interestedServices || [],
                service_year: initialData.serviceYear || '2025',
                academic_year: initialData.academicYear || '2025-2026',
                registration_year: initialData.registrationYear || '',
                interested_programs: initialData.interestedPrograms || [],
                interested_universities: initialData.interestedUniversities || [],

                education_level: initialData.educationLevel || '',
                english_level: initialData.englishLevel || '',
                italian_level: initialData.italianLevel || '',

                meeting_date: initialData.meetingDate || '',
                meeting_time: initialData.meetingTime || '',
                meeting_consultant: initialData.meetingConsultant || '',
                meeting_type: initialData.meetingType || 'phone',

                source: initialData.source || 'website',
                status: initialData.status || 'new_lead',
                priority: initialData.priority || 'medium',
                discussed_price: initialData.discussedPrice || '',
                additional_payment: initialData.additionalPayment || '',
                notes: initialData.notes || ''
            }));
        } else {
            // Defaults for NEW lead
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const currentTime = now.toTimeString().slice(0, 5); // HH:MM
            setFormData(prev => ({
                ...prev,
                meeting_date: currentDate,
                meeting_time: currentTime,
                meeting_consultant: currentUser?.id || '',
            }));
        }
    }, [initialData, currentUser]);

    // If new and no consultant set yet, set it when profiles load or user loads
    useEffect(() => {
        if (!isEditing && !formData.meeting_consultant && currentUser) {
            setFormData(prev => ({ ...prev, meeting_consultant: currentUser.id }));
        }
    }, [currentUser, isEditing]);


    const handleEmailChange = (index: number, val: string, isStudent: boolean) => {
        if (isStudent) {
            const newEmails = [...formData.emails];
            newEmails[index] = val;
            setFormData(prev => ({ ...prev, emails: newEmails }));
        } else {
            const newEmails = [...formData.student_info.emails];
            newEmails[index] = val;
            setFormData(prev => ({ ...prev, student_info: { ...prev.student_info, emails: newEmails } }));
        }
    };

    const addProgram = () => {
        if (!newProgram.trim()) return;
        setFormData(prev => ({ ...prev, interested_programs: [...prev.interested_programs, newProgram.trim()] }));
        setNewProgram('');
    };
    const removeProgram = (p: string) => setFormData(prev => ({ ...prev, interested_programs: prev.interested_programs.filter(x => x !== p) }));

    const removeUn = (p: string) => setFormData(prev => ({ ...prev, interested_universities: prev.interested_universities.filter(x => x !== p) }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.first_name.trim()) {
            setError('Ad Soyad zorunludur');
            return;
        }

        try {
            await onSave({
                ...formData,
                emails: formData.emails.filter(e => e.trim()),
                discussed_price: formData.discussed_price ? parseFloat(formData.discussed_price.toString()) : null,
                additional_payment: formData.additional_payment ? parseFloat(formData.additional_payment.toString()) : null,
                created_by: isEditing ? undefined : currentUser?.id, // Don't overwrite creator on edit? Or keep it?
                // Logic: created_by should typically not change, but let's leave it undefined on edit to be safe unless we want to change ownership
            });
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Bir hata oluştu');
        }
    };

    // Styles & Components
    const sectionStyle: React.CSSProperties = { marginBottom: '1.5rem', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f0f0f5' };
    const SectionHeader = ({ title, color }: { title: string, color: string }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: '4px', height: '20px', backgroundColor: color, borderRadius: '2px' }} />
            <h3 style={{ fontWeight: 700, color: '#1f2937', margin: 0 }}>{title}</h3>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflow: 'hidden' }}>

            {/* Header / Actions if embedded? No, let the parent handle the container. We just return the scrollable content + footer? */}
            {/* We'll make this fit the container height */}

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {error && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* 1. Kişisel Bilgiler */}
                <div style={sectionStyle}>
                    <SectionHeader title="Kişisel Bilgiler" color="#6366f1" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <FormInput label="Ad" value={formData.first_name} onChange={v => setFormData(p => ({ ...p, first_name: v }))} required />
                            <FormInput label="Soyad" value={formData.last_name} onChange={v => setFormData(p => ({ ...p, last_name: v }))} />
                        </div>
                        <FormInput label="Telefon" value={formData.phone} onChange={v => setFormData(p => ({ ...p, phone: v }))} />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>E-posta Adresleri</label>
                        {formData.emails.map((email, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input type="email" value={email} onChange={e => handleEmailChange(i, e.target.value, true)} style={{ flex: 1, padding: '0.5rem 0.75rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }} placeholder="ornek@email.com" />
                                {formData.emails.length > 1 && (
                                    <button type="button" onClick={() => {
                                        const newEmails = [...formData.emails];
                                        newEmails.splice(i, 1);
                                        setFormData(prev => ({ ...prev, emails: newEmails }));
                                    }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => handleEmailChange(formData.emails.length, '', true)} style={{ fontSize: '0.8rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>+ E-posta Ekle</button>
                    </div>
                </div>

                {/* 2. İletişim Rolü */}
                <div style={sectionStyle}>
                    <SectionHeader title="İletişim Rolü" color="#8b5cf6" />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div onClick={() => setFormData(p => ({ ...p, contact_role: 'student' }))} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: `1px solid ${formData.contact_role === 'student' ? '#8b5cf6' : '#e5e7eb'}`, backgroundColor: formData.contact_role === 'student' ? '#f5f3ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `4px solid ${formData.contact_role === 'student' ? '#8b5cf6' : '#d1d5db'}`, backgroundColor: 'white' }} />
                            <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>Öğrenci</span>
                        </div>
                        <div onClick={() => setFormData(p => ({ ...p, contact_role: 'guardian' }))} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: `1px solid ${formData.contact_role === 'guardian' ? '#8b5cf6' : '#e5e7eb'}`, backgroundColor: formData.contact_role === 'guardian' ? '#f5f3ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `4px solid ${formData.contact_role === 'guardian' ? '#8b5cf6' : '#e5e7eb'}`, backgroundColor: 'white' }} />
                            <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>Veli</span>
                        </div>
                    </div>
                    {formData.contact_role === 'guardian' && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
                                <FormInput label="Öğrenci Adı" value={formData.student_info.first_name} onChange={v => setFormData(p => ({ ...p, student_info: { ...p.student_info, first_name: v } }))} />
                                <FormInput label="Öğrenci Soyadı" value={formData.student_info.last_name} onChange={v => setFormData(p => ({ ...p, student_info: { ...p.student_info, last_name: v } }))} />
                                <FormInput label="Öğrenci Telefon" value={formData.student_info.phone} onChange={v => setFormData(p => ({ ...p, student_info: { ...p.student_info, phone: v } }))} />
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Eğitim & İlgi */}
                <div style={sectionStyle}>
                    <SectionHeader title="Eğitim & İlgi" color="#10b981" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
                        <FormSelect label="Kayıt Yılı" value={formData.registration_year} onChange={v => setFormData(p => ({ ...p, registration_year: v }))} options={['2025', '2026', '2027', '2028'].map(y => ({ value: y, label: y }))} />

                        {/* University Select */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>İlgilenilen Üniversiteler</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value=""
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !formData.interested_universities.includes(val)) {
                                            setFormData(prev => ({ ...prev, interested_universities: [...prev.interested_universities, val] }));
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', color: '#1f2937', outline: 'none', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                                >
                                    <option value="">Üniversite Seçiniz...</option>
                                    {universities.map(u => (
                                        <option key={u.id} value={u.name}>{u.name}</option>
                                    ))}
                                </select>
                                <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {formData.interested_universities.map(uni => (
                                    <span key={uni} style={{ padding: '2px 8px', backgroundColor: '#eef2ff', color: '#4338ca', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {uni} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeUn(uni)} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Hizmetler Section */}
                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>İlgilenilen Hizmetler</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {['Konaklama Hizmeti', 'Oturum İzni', 'Vasi Hizmeti', 'Yaşam Destek Hizmeti', 'Burs Hizmeti'].map(service => {
                                const isSelected = formData.interested_services.includes(service);
                                return (
                                    <button
                                        key={service}
                                        type="button"
                                        onClick={() => {
                                            const current = formData.interested_services;
                                            const updated = isSelected
                                                ? current.filter(s => s !== service)
                                                : [...current, service];
                                            setFormData(p => ({ ...p, interested_services: updated }));
                                        }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            border: `1px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                                            backgroundColor: isSelected ? '#ecfdf5' : 'white',
                                            color: isSelected ? '#065f46' : '#374151',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {isSelected && <Check size={14} />}
                                        {service}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input type="text" value={newProgram} onChange={e => setNewProgram(e.target.value)} placeholder="Program Ekle (örn: Mimarlık)" style={{ flex: 1, padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }} />
                            <button type="button" onClick={addProgram} style={{ padding: '0.4rem 1rem', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Ekle</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {formData.interested_programs.map(p => (
                                <span key={p} style={{ padding: '2px 8px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {p} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeProgram(p)} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Görüşme Detayları */}
                <div style={sectionStyle}>
                    <SectionHeader title="Görüşme Detayları" color="#f59e0b" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <FormInput label="Tarih" value={formData.meeting_date} onChange={v => setFormData(p => ({ ...p, meeting_date: v }))} type='date' />
                        <FormInput label="Saat" value={formData.meeting_time} onChange={v => setFormData(p => ({ ...p, meeting_time: v }))} type='time' />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                        <FormSelect label="Danışman" value={formData.meeting_consultant} onChange={v => setFormData(p => ({ ...p, meeting_consultant: v }))} options={profiles.map(p => ({ value: p.id, label: p.name }))} />
                        <FormSelect label="Görüşme Tipi" value={formData.meeting_type} onChange={v => setFormData(p => ({ ...p, meeting_type: v }))} options={['Telefon', 'Online', 'Whatsapp'].map(t => ({ value: t, label: t }))} />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <FormInput label="Notlar" value={formData.notes || ''} onChange={v => setFormData(p => ({ ...p, notes: v }))} />
                    </div>
                </div>

                {/* 5. Durum & Finans */}
                <div style={sectionStyle}>
                    <SectionHeader title="Durum & Finans" color="#f97316" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
                        <FormSelect label="Durum" value={formData.status} onChange={v => setFormData(p => ({ ...p, status: v as any }))} options={[{ value: 'new_lead', label: 'Yeni Lead' }, { value: 'lead', label: 'Lead (Eski)' }, { value: 'contacted', label: 'İletişime Geçildi' }, { value: 'meeting_scheduled', label: 'Randevu' }, { value: 'proposal_sent', label: 'Teklif Gönderildi' }, { value: 'enrolled', label: 'Kayıt' }, { value: 'rejected', label: 'Red' }, { value: 'busy', label: 'Meşgul' }, { value: 'no_answer', label: 'Cevap Yok' }]} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <FormInput label="Fiyat (€)" value={formData.discussed_price} onChange={v => setFormData(p => ({ ...p, discussed_price: v }))} type='number' />
                            <FormInput label="Ek Ödeme (€)" value={formData.additional_payment} onChange={v => setFormData(p => ({ ...p, additional_payment: v }))} type='number' />
                        </div>
                        <FormSelect label="Kaynak" value={formData.source} onChange={v => setFormData(p => ({ ...p, source: v as any }))} options={['website', 'referral', 'social-media', 'advertisement', 'walk-in', 'other'].map(s => ({ value: s, label: s }))} />
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '1rem', background: '#fff' }}>
                <button type="button" onClick={onCancel} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
                    Vazgeç
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#4F46E5', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </form>
    );
}

function FormInput({ label, value, onChange, type = 'text', required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', fontWeight: 500, color: '#4b5563' }}>
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', color: '#1f2937', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
        </div>
    );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', fontWeight: 500, color: '#4b5563' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', color: '#1f2937', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'border-color 0.2s', boxSizing: 'border-box' }}>
                    <option value="">Seçiniz...</option>
                    {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
                <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                    <ChevronDown size={16} />
                </div>
            </div>
        </div>
    );
}
