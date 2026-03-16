'use client';

import { useState } from 'react';
import { Plus, CheckCircle, AlertCircle } from "lucide-react";
import { createServiceLog } from "@/app/actions/service-logs";
import FileUploader from "@/components/common/FileUploader";

interface Mentor {
    id: string;
    firstName: string;
    lastName: string;
}

interface ServiceType {
    id: string;
    name: string;
    unitPrice: number;
}

interface Props {
    studentId: string;
    assignedMentors: Mentor[];
    serviceTypes: ServiceType[];
}

export default function AdminServiceLogForm({ studentId, assignedMentors, serviceTypes }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [customPrice, setCustomPrice] = useState<string>('');

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedServiceId(id);
        const service = serviceTypes.find(t => t.id === id);
        if (service) {
            setCustomPrice(service.unitPrice.toString());
        } else {
            setCustomPrice('');
        }
    };

    if (assignedMentors.length === 0) {
        return (
            <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2', color: '#991b1b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertCircle size={20} />
                    <p style={{ fontWeight: 600 }}>Hizmet Ataması Yapılamıyor</p>
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Bu öğrenciye atanmış aktif bir mentor bulunmuyor. Lütfen önce mentor ataması yapın.
                </p>
            </div>
        );
    }

    return (
        <form 
            action={createServiceLog} 
            onSubmit={() => setIsSubmitting(true)}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
            <input type="hidden" name="studentId" value={studentId} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        Hizmeti Verecek Mentor *
                    </label>
                    <select name="mentorId" required className="input-field">
                        <option value="">Mentor Seçiniz...</option>
                        {assignedMentors.map(m => (
                            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        Hizmet Tipi *
                    </label>
                    <select 
                        name="serviceTypeId" 
                        required 
                        className="input-field"
                        value={selectedServiceId}
                        onChange={handleServiceChange}
                    >
                        <option value="">Seçiniz...</option>
                        {serviceTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        Birim Fiyat (€) *
                    </label>
                    <input 
                        type="number" 
                        name="unitPrice" 
                        step="0.01"
                        required 
                        className="input-field" 
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        placeholder="Örn: 25.00"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        Planlanan Tarih *
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

            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Notlar / Açıklama
                </label>
                <textarea
                    name="notes"
                    rows={3}
                    className="input-field"
                    placeholder="Hizmet detaylarını buraya yazın..."
                    style={{ resize: 'vertical' }}
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Dosyalar & Görseller
                </label>
                <FileUploader name="attachments" multiple={true} />
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        fontSize: '0.95rem',
                        background: '#008C45',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 600,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: isSubmitting ? 0.7 : 1
                    }}
                >
                    {isSubmitting ? 'Kaydediliyor...' : <><CheckCircle size={18} /> Hizmet Kaydını Oluştur</>}
                </button>
            </div>
        </form>
    );
}
