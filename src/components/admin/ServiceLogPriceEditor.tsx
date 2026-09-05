'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateServiceLogPrice } from '@/app/actions/admin-finances';

interface Props {
    logId: string;
    price: number;
}

export default function ServiceLogPriceEditor({ logId, price }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(price.toString());
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const stop = (event: MouseEvent) => event.stopPropagation();

    const save = (event: MouseEvent) => {
        event.stopPropagation();
        const parsedPrice = Number(value);
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return;

        startTransition(async () => {
            await updateServiceLogPrice(logId, parsedPrice);
            setIsEditing(false);
            router.refresh();
        });
    };

    if (!isEditing) {
        return (
            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    setValue(price.toString());
                    setIsEditing(true);
                }}
                title="Hizmet fiyatını düzenle"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.45rem', border: '1px solid #d1fae5', borderRadius: '6px', background: '#ecfdf5', color: '#047857', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
                €{price} <Pencil size={12} />
            </button>
        );
    }

    return (
        <div onClick={stop} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={isPending}
                autoFocus
                aria-label="Hizmet fiyatı"
                style={{ width: 82, padding: '0.3rem', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '0.8rem' }}
            />
            <button type="button" onClick={save} disabled={isPending || value.trim() === ''} title="Kaydet" style={{ padding: '0.25rem', border: 0, borderRadius: '5px', background: '#059669', color: 'white', cursor: 'pointer' }}>
                <Check size={13} />
            </button>
            <button type="button" onClick={(event) => { event.stopPropagation(); setIsEditing(false); }} disabled={isPending} title="İptal" style={{ padding: '0.25rem', border: 0, borderRadius: '5px', background: '#f3f4f6', color: '#6b7280', cursor: 'pointer' }}>
                <X size={13} />
            </button>
        </div>
    );
}
