'use client';

import { useState } from 'react';
import { Search, Download, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';
import StudentAvatar from '@/components/common/StudentAvatar';
import * as XLSX from 'xlsx';

interface StudentData {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    email: string;
    phone: string;
    universityName: string;
    department: string;
    status: string;
}

interface MentorStudentsTableProps {
    students: StudentData[];
}

export default function MentorStudentsTable({ students }: MentorStudentsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm)
    );

    const handleExportExcel = () => {
        const exportData = filteredStudents.map(s => ({
            'Öğrenci': `${s.firstName} ${s.lastName}`,
            'E-mail': s.email,
            'Telefon': s.phone,
            'Üniversite': s.universityName,
            'Bölüm': s.department,
            'Durum': s.status === 'active' ? 'Aktif' : 'Pasif'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Öğrencilerim');
        XLSX.writeFile(wb, 'ogrencilerim.xlsx');
    };

    return (
        <div style={{ padding: '24px 0' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Öğrencilerim</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Öğrenci ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '10px 12px 10px 40px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '14px',
                                outline: 'none',
                                width: '280px',
                                background: '#fff'
                            }}
                        />
                    </div>
                    <button
                        onClick={handleExportExcel}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: '#008C45',
                            color: '#fff',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <Download size={18} />
                        Excel
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #f3f4f6' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ÖĞRENCİ</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ÜNİVERSİTE/BÖLÜM</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>İLETİŞİM</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DURUM</th>
                            <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>İŞLEM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id} style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <StudentAvatar
                                            studentId={student.id}
                                            firstName={student.firstName}
                                            lastName={student.lastName}
                                            photoUrl={student.photoUrl}
                                            size={40}
                                            canEdit={false}
                                            table="branch_students"
                                            showDelete={false}
                                        />
                                        <span style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{student.firstName} {student.lastName}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>{student.universityName}</div>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{student.department}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ color: '#111827', fontSize: '14px' }}>{student.phone}</div>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{student.email}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        padding: '4px 12px',
                                        borderRadius: '9999px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        background: student.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                        color: student.status === 'active' ? '#059669' : '#dc2626'
                                    }}>
                                        {student.status === 'active' ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <Link
                                        href={`/mentor/students/${student.id}`}
                                        style={{
                                            display: 'inline-flex',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                            background: '#fff',
                                            color: '#374151',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                        }}
                                        className="hover:bg-gray-50"
                                    >
                                        Detay
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStudents.length === 0 && (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                        <Users size={48} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                        <p>Arama kriterlerine uygun öğrenci bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
