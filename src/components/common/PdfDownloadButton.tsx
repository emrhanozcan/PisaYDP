'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';

interface PdfDownloadButtonProps {
    student: any;
    type: 'general' | 'scholarship' | 'accommodation' | 'residence' | 'guardian' | 'life-support' | 'universities';
    fileName: string;
    label?: string;
    className?: string;
    targetId?: string; // Kept for backward compatibility during migration, but effectively unused
}

export default function PdfDownloadButton({ student, type, fileName, label = 'PDF İndir', className = '' }: PdfDownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            await generatePDF({
                title: fileName.replace('.pdf', ''),
                student,
                type
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('PDF oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            className={`btn btn-secondary no-print flex items-center gap-2 ${className}`}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <Download size={18} />
            )}
            {isLoading ? 'Hazırlanıyor...' : label}
        </button>
    );
}
