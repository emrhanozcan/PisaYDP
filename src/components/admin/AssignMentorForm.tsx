'use client';

import { useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { assignMentor } from "@/app/actions/admin";

interface AssignMentorFormProps {
    studentId: string;
    mentors: any[];
    serviceTypes: any[];
}

export default function AssignMentorForm({ studentId, mentors, serviceTypes }: AssignMentorFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setMessage(null);

        const mentorId = formData.get('mentorId');
        if (!mentorId) {
            setMessage({ type: 'error', text: 'Lütfen bir mentor seçiniz.' });
            setIsSubmitting(false);
            return;
        }

        try {
            await assignMentor(formData);
            setMessage({ type: 'success', text: 'Mentor başarıyla atandı.' });
            // Optional: reset form or clear success message after delay
        } catch (error) {
            console.error('Mentor assignment failed:', error);
            setMessage({ type: 'error', text: 'Atama sırasında bir hata oluştu.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Yeni Mentor Ata</h3>
            <input type="hidden" name="studentId" value={studentId} />

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <select name="mentorId" className="input-field" style={{ flex: 1, minWidth: '150px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} required>
                    <option value="">Mentor Seç...</option>
                    {mentors.map(m => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                </select>
                <select name="role" className="input-field" style={{ width: '140px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <option value="primary">Ana Mentor</option>
                    <option value="support">Destek Mentor</option>
                </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Verilebilecek Hizmetler</label>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                    gap: '0.5rem',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    padding: '0.5rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    {serviceTypes.map(service => (
                        <label key={service.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <input type="checkbox" name="serviceIds" value={service.id} defaultChecked />
                            <span>{service.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1rem',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    fontWeight: 600
                }}
            >
                {isSubmitting ? 'Atanıyor...' : <><UserPlus size={16} /> Mentor Ata ve Hizmetleri Kaydet</>}
            </button>

            {message && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#166534' : '#dc2626',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fee2e2'}`
                }}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}
        </form>
    );
}
