'use client';

import { useState, useTransition } from 'react';
import { Save, Wallet } from 'lucide-react';
import { updateMentorIban } from '@/app/actions/mentor';
import Toast, { ToastType } from '@/components/common/Toast';

interface IbanFormProps {
    initialIban: string;
}

export default function IbanForm({ initialIban }: IbanFormProps) {
    const [iban, setIban] = useState(initialIban);
    const [isPending, startTransition] = useTransition();
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        const cleanIban = iban.trim();

        if (cleanIban && cleanIban.length < 15) {
            setToast({ message: 'Lütfen geçerli bir IBAN numarası girin.', type: 'error' });
            return;
        }

        startTransition(async () => {
            try {
                const res = await updateMentorIban(cleanIban);
                if (res.success) {
                    setToast({ message: 'IBAN başarıyla kaydedildi.', type: 'success' });
                } else {
                    setToast({ message: res.message || 'Bir hata oluştu.', type: 'error' });
                }
            } catch (err: any) {
                setToast({ message: err.message || 'İşlem sırasında hata oluştu.', type: 'error' });
            }
        });
    };

    return (
        <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    IBAN Numarası
                </label>
                <div style={{ position: 'relative' }}>
                    <Wallet size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        className="input-field"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        style={{ paddingLeft: '40px', fontFamily: 'monospace', letterSpacing: '1px' }}
                        maxLength={34}
                    />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                    IBAN bilginizi eksiksiz ve doğru girdiğinizden emin olun.
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isPending}
                    style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Save size={16} />
                    {isPending ? 'Kaydediliyor...' : 'IBAN Kaydet'}
                </button>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </form>
    );
}
