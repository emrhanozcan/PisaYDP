'use client';

import { useState, useEffect } from 'react';
import {
    User, Search, GraduationCap,
    UserPlus, TrendingUp, Users,
    ChevronRight, Filter, Download, X, ChevronDown, AlertCircle
} from "lucide-react";
import * as XLSX from 'xlsx';
import Link from "next/link";
import { BranchStudent, University, BRANCH_NAMES, BranchCode } from '@/types';
import { createBranchStudent } from '@/app/actions/branch';
import { useRouter } from 'next/navigation';
import StudentForm from './StudentForm';
import StudentListRow from './StudentListRow';
import StudentAvatar from '@/components/common/StudentAvatar';
import { getSession } from '@/app/actions/auth';

interface StudentData {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    country: string;
    city?: string;
    school?: string;
    packageType?: string;
    status: string;
    createdAt: string;
    isYDP?: boolean;
}

interface AdminStudentsClientProps {
    allStudents: any[];
    universities: any[];
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
}

export default function AdminStudentsClient({ allStudents, universities, totalCount, activeCount, inactiveCount }: AdminStudentsClientProps) {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState("all");
    const router = useRouter();

    const [sessionRole, setSessionRole] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getSession().then((session: any) => {
            if (session) setSessionRole(session.role);
            setIsLoading(false);
        });
    }, []);

    const canEditPhoto = sessionRole !== '' && sessionRole !== 'mentor';

    const stats = [
        { label: "Toplam Öğrenci", value: totalCount, icon: Users, color: "#008C45", bg: "#eafaf3" },
        { label: "Aktif Öğrenci", value: activeCount, icon: TrendingUp, color: "#059669", bg: "#ecfdf5" },
        { label: "Pasif Öğrenci", value: inactiveCount, icon: User, color: "#6b7280", bg: "#f3f4f6" },
    ];

    const filteredStudents = allStudents.filter(student => {
        const matchesSearch =
            student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' ? true :
            statusFilter === 'active' ? student.status === 'active' || student.status === 'Kabul' :
                student.status !== 'active' && student.status !== 'Kabul';

        return matchesSearch && matchesStatus;
    });

    const getUniversityName = (student: any) => {
        if (student.educations && student.educations.length > 0) {
            return student.educations.map((e: any) => universities.find(u => u.id === e.universityId)?.name || '-').join(', ');
        }
        return universities.find(u => u.id === student.universityId)?.name || '-';
    };

    const handleExport = () => {
        const data = filteredStudents.map(s => ({
            "ID": s.id,
            "Ad Soyad": `${s.firstName} ${s.lastName}`,
            "Email": s.email || '',
            "Telefon": s.phone || '',
            "Üniversite": getUniversityName(s),
            "Şehir": s.city || '',
            "Program": (s.educations && s.educations.length > 0) ? s.educations[0].program : '',
            "Not Ortalaması": (s.educations && s.educations.length > 0) ? s.educations[0].grade : '',
            "Şehir/Ülke": `${s.city || '-'} / ${s.country}`,
            "Paket": s.packageType || '',
            "Durum": s.status === 'active' || s.status === 'Kabul' ? 'Aktif' : 'Pasif',
            "Türü": s.isYDP ? 'Şube Öğrencisi' : 'Normal',
            "Kayıt Tarihi": new Date(s.createdAt).toLocaleDateString('tr-TR')
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Öğrenciler");
        XLSX.writeFile(wb, "ogrenci-listesi.xlsx");
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: '#11142D', marginBottom: '0.5rem', fontWeight: 700 }}>Öğrenciler</h1>
                    <p style={{ color: '#808191', fontSize: '1rem' }}>
                        Sistemde kayıtlı tüm öğrencileri görüntüleyin ve yönetin
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleExport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} />
                        Dışa Aktar
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <UserPlus size={18} />
                        Yeni Öğrenci
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-enhanced">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: stat.bg,
                                color: stat.color
                            }}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>{stat.value}</p>
                                <p style={{ fontSize: '0.85rem', color: '#808191', marginTop: '0.25rem' }}>{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {/* Search */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px', maxWidth: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#B2B3BD' }} />
                        <input
                            type="text"
                            placeholder="İsim, okul veya e-posta ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem 0.875rem 3rem',
                                borderRadius: '12px',
                                border: '1px solid #E4E5E7',
                                background: '#F9FAFC',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        border: '1px solid #E4E5E7',
                        borderRadius: '10px',
                        background: 'white',
                        color: '#6b7280',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}>
                        <Filter size={16} />
                        Filtrele
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="table dashboard-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>#</th>
                                <th style={{ width: '22%' }}>Öğrenci</th>
                                <th style={{ width: '15%' }}>🇮🇹 Şehir</th>
                                <th style={{ width: '18%' }}>Üniversite</th>
                                <th style={{ width: '12%' }}>Paket</th>
                                <th style={{ width: '10%' }}>Hizmet</th>
                                <th style={{ width: '8%' }}>Durum</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <StudentListRow
                                    key={`${student.isYDP ? 'branch' : 'main'}-${student.id}`}
                                    student={student}
                                    index={index}
                                    canEditPhoto={canEditPhoto}
                                    sessionRole={sessionRole}
                                    getUniversityName={getUniversityName}
                                />
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '4rem', color: '#B2B3BD' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <Users size={48} style={{ opacity: 0.3 }} />
                                            <div>
                                                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Öğrenci bulunamadı</p>
                                                <button onClick={() => setShowModal(true)} style={{ color: '#008C45', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    İlk öğrenciyi ekleyin →
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredStudents.length > 0 && (
                    <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#9ca3af',
                        fontSize: '0.85rem'
                    }}>
                        <p>Toplam {filteredStudents.length} öğrenci gösteriliyor</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <StudentForm
                    universities={universities}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}


