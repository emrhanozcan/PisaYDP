'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { updateMentorAssignmentServices } from '@/app/actions/admin';

interface ServiceType {
    id: string;
    name: string;
    unitPrice: number;
}

interface Props {
    assignmentId: string;
    studentId: string;
    allowedServiceIds?: string[];
    servicePrices?: Record<string, number>;
    serviceTypes: ServiceType[];
}

export default function MentorAssignmentServicesForm({
    assignmentId,
    studentId,
    allowedServiceIds,
    servicePrices = {},
    serviceTypes
}: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const selectedIds = allowedServiceIds ?? serviceTypes.map(service => service.id);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setMessage(null);
        try {
            await updateMentorAssignmentServices(formData);
            setMessage('Hizmetler ve mentor fiyatları güncellendi.');
        } catch (error) {
            console.error(error);
            setMessage(error instanceof Error ? error.message : 'Güncelleme sırasında bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
            <input type="hidden" name="assignmentId" value={assignmentId} />
            <input type="hidden" name="studentId" value={studentId} />
            <p style={{ marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Hizmetler ve mentor fiyatları</p>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
                {serviceTypes.map(service => (
                    <div key={service.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 90px', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <input type="checkbox" name="serviceIds" value={service.id} defaultChecked={selectedIds.includes(service.id)} />
                        <span>{service.name}</span>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                name={`servicePrice:${service.id}`}
                                defaultValue={servicePrices[service.id] ?? service.unitPrice}
                                min="0"
                                step="0.01"
                                aria-label={`${service.name} mentor fiyatı`}
                                style={{ width: '100%', padding: '0.3rem 1.1rem 0.3rem 0.35rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />
                            <span style={{ position: 'absolute', right: '0.35rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>€</span>
                        </div>
                    </div>
                ))}
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                style={{ marginTop: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.65rem', border: 0, borderRadius: '6px', background: '#eef2ff', color: '#4f46e5', fontSize: '0.75rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
                <CheckCircle2 size={13} /> {isSubmitting ? 'Kaydediliyor...' : 'Hizmetleri Kaydet'}
            </button>
            {message && <p style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#4b5563' }}>{message}</p>}
        </form>
    );
}
