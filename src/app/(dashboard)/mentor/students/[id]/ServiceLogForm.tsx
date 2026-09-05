'use client';

import { useState } from 'react';
import { CheckCircle } from "lucide-react";
import { createServiceLog } from "@/app/actions/service-logs";
import FileUploader from "@/components/common/FileUploader";

interface ServiceType {
    id: string;
    name: string;
    unitPrice: number;
}

interface Props {
    studentId: string;
    serviceTypes: ServiceType[];
}

export default function ServiceLogForm({ studentId, serviceTypes }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [unitPrice, setUnitPrice] = useState('');

    const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceId = event.target.value;
        setSelectedServiceId(serviceId);
        const service = serviceTypes.find(item => item.id === serviceId);
        setUnitPrice(service ? service.unitPrice.toString() : '');
    };

    return (
        <form 
            action={createServiceLog} 
            onSubmit={() => setIsSubmitting(true)}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
            <input type="hidden" name="studentId" value={studentId} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                        Hizmet Tipi *
                    </label>
                    <select name="serviceTypeId" required className="input-field" value={selectedServiceId} onChange={handleServiceChange}>
                        <option value="">Seçiniz...</option>
                        {serviceTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                        Tarih ve Saat *
                    </label>
                    <input
                        type="datetime-local"
                        name="date"
                        required
                        className="input-field"
                        defaultValue={new Date().toISOString().slice(0, 16)}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                        Süre (Dakika)
                    </label>
                    <input type="number" name="duration" className="input-field" placeholder="Örn: 30" />
                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                        Sabit ücretli hizmetlerde boş bırakılabilir.
                    </p>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                        Hizmet Ücreti (€)
                    </label>
                    <input 
                        type="number" 
                        step="0.01" 
                        name="unitPrice" 
                        className="input-field" 
                        value={unitPrice}
                        onChange={event => setUnitPrice(event.target.value)}
                        placeholder="Örn: 50" 
                    />
                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                        Boş bırakılırsa hizmet tipinin varsayılan ücreti kullanılır.
                    </p>
                </div>
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Notlar / Açıklama
                </label>
                <textarea
                    name="notes"
                    rows={4}
                    className="input-field"
                    placeholder="Hizmet detaylarını buraya yazın..."
                    style={{ resize: 'vertical' }}
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Görseller / Belgeler
                </label>
                <FileUploader name="attachments" multiple={true} />
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ padding: '0.875rem 2rem', fontSize: '0.9rem', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                    <CheckCircle size={18} />
                    {isSubmitting ? 'Gönderiliyor...' : 'Kaydı Oluştur ve Gönder'}
                </button>
            </div>
        </form>
    );
}

