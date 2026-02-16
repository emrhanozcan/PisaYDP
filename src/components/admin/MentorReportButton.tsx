'use client';

import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface MentorReportButtonProps {
    mentors: any[];
}

export default function MentorReportButton({ mentors }: MentorReportButtonProps) {
    const handleExport = () => {
        const data = mentors.map(m => ({
            "Ad Soyad": `${m.firstName} ${m.lastName}`,
            "Kullanıcı Adı": m.username,
            "Email": m.email || '',
            "Telefon": m.phone || '',
            "Öğrenci Sayısı": m.studentCount,
            "Tamamlanan Hizmet": m.approvedServices,
            "Bekleyen Hizmet": m.pendingServices,
            "Başarı Oranı (%)": m.successRate,
            "Kayıt Tarihi": new Date(m.createdAt).toLocaleDateString('tr-TR')
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Mentor Raporu");
        XLSX.writeFile(wb, "mentor-raporu.xlsx");
    };

    return (
        <button
            onClick={handleExport}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
            <Download size={18} />
            Rapor
        </button>
    );
}
