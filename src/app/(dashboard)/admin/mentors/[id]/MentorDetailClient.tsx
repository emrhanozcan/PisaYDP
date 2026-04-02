'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Users, Calendar, Mail, Phone,
    FileText, CheckCircle2, Clock, AlertCircle,
    User, TrendingUp, Star, Activity, Award,
    GraduationCap, MapPin, Key, Lock, Shield, Edit2, Save, X,
    LucideIcon
} from "lucide-react";
import { updateMentor } from "@/app/actions/admin";
import UserAvatar from "@/components/common/UserAvatar";

interface MentorData {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone?: string;
    password?: string;
    photoUrl?: string;
    createdAt: string;
}

interface AssignedStudent {
    id: string;
    firstName: string;
    lastName: string;
    country?: string;
    packageType?: string;
    photoUrl?: string;
    assignment: {
        role: string;
    };
    serviceCount: number;
    approvedCount: number;
}

interface ServiceLog {
    id: string;
    serviceTypeId: string;
    studentId: string;
    status: string;
    date: string;
    notes?: string;
    attachments?: string[];
}

interface ServiceType {
    id: string;
    name: string;
    unitPrice: number;
}

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

interface Props {
    mentor: MentorData;
    stats: { label: string; value: number; icon: string; color: string; bg: string }[];
    assignedStudents: AssignedStudent[];
    serviceLogs: ServiceLog[];
    serviceTypes: ServiceType[];
    students: Student[];
    totalEarnings: number;
    successRate: number;
}

export default function MentorDetailClient({
    mentor,
    stats,
    assignedStudents,
    serviceLogs,
    serviceTypes,
    students,
    totalEarnings,
    successRate
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        email: mentor.email || '',
        phone: mentor.phone || '',
        username: mentor.username,
        password: mentor.password || ''
    });
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSave = () => {
        startTransition(async () => {
            await updateMentor(mentor.id, formData);
            setIsEditing(false);
            router.refresh();
        });
    };

    const handleCancel = () => {
        setFormData({
            firstName: mentor.firstName,
            lastName: mentor.lastName,
            email: mentor.email || '',
            phone: mentor.phone || '',
            username: mentor.username,
            password: mentor.password || ''
        });
        setIsEditing(false);
    };

    const iconMap: Record<string, LucideIcon> = {
        Users, FileText, CheckCircle2, Clock
    };

    const approvedLogs = serviceLogs.filter(l => l.status === 'approved');

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Back Button */}
            <Link
                href="/admin/mentors"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem',
                    textDecoration: 'none'
                }}
            >
                <ArrowLeft size={18} />
                Mentor Listesine Dön
            </Link>

            {/* Header Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{ flexShrink: 0, position: 'relative' }}>
                        <UserAvatar
                            userId={mentor.id}
                            firstName={mentor.firstName}
                            lastName={mentor.lastName}
                            photoUrl={mentor.photoUrl}
                            size={100}
                            showDelete={true}
                        />
                        {serviceLogs.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-8px',
                                right: '-8px',
                                background: '#f59e0b',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid white',
                                zIndex: 5
                            }}>
                                <Star size={14} color="white" fill="white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                {isEditing ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="Ad"
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                                fontSize: '1.25rem',
                                                fontWeight: 600,
                                                width: '150px'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="Soyad"
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                                fontSize: '1.25rem',
                                                fontWeight: 600,
                                                width: '150px'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#11142D', marginBottom: '0.25rem' }}>
                                        {formData.firstName} {formData.lastName}
                                    </h1>
                                )}
                                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>@{formData.username}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #6366f1',
                                            background: 'white',
                                            color: '#6366f1',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <Edit2 size={16} />
                                        Düzenle
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isPending}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: '#059669',
                                                color: 'white',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                opacity: isPending ? 0.7 : 1
                                            }}
                                        >
                                            <Save size={16} />
                                            {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={isPending}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e5e7eb',
                                                background: 'white',
                                                color: '#6b7280',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <X size={16} />
                                            İptal
                                        </button>
                                    </>
                                )}
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    background: '#eef2ff',
                                    color: '#6366f1'
                                }}>
                                    <Award size={16} />
                                    Mentor
                                </span>
                                <span style={{
                                    padding: '0.5rem 1rem',
                                    background: successRate >= 80 ? '#ecfdf5' : successRate >= 50 ? '#fef3c7' : '#fef2f2',
                                    color: successRate >= 80 ? '#059669' : successRate >= 50 ? '#b45309' : '#dc2626',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                                    %{successRate} Başarı
                                </span>
                            </div>
                        </div>

                        {/* Contact & Details Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '12px'
                        }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>E-posta</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="E-posta"
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '0.9rem',
                                            width: '100%'
                                        }}
                                    />
                                ) : (
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500 }}>
                                        <Mail size={14} /> {formData.email || 'Belirtilmemiş'}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Telefon</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Telefon"
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '0.9rem',
                                            width: '100%'
                                        }}
                                    />
                                ) : (
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500 }}>
                                        <Phone size={14} /> {formData.phone || 'Belirtilmemiş'}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Kayıt Tarihi</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151', fontWeight: 500 }}>
                                    <Calendar size={14} /> {new Date(mentor.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Toplam Kazanç</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 700, fontSize: '1.1rem' }}>
                                    €{totalEarnings.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {stats.map((stat, i) => {
                    const IconComponent = iconMap[stat.icon] || Users;
                    return (
                        <div key={i} className="stat-card-enhanced">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: stat.bg,
                                    color: stat.color
                                }}>
                                    <IconComponent size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#11142D', lineHeight: 1 }}>{stat.value}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#808191', marginTop: '0.2rem' }}>{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Account Information Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={20} color="#dc2626" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hesap Bilgileri</h2>
                            <p style={{ fontSize: '0.8rem', color: '#808191' }}>Giriş bilgileri ve güvenlik</p>
                        </div>
                    </div>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: '#fef3c7',
                        color: '#b45309'
                    }}>
                        <Lock size={12} />
                        Sadece Admin Görüntüleyebilir
                    </span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                }}>
                    {/* Username */}
                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <User size={16} color="#6366f1" />
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Kullanıcı Adı</span>
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '1rem',
                                    fontFamily: 'monospace'
                                }}
                            />
                        ) : (
                            <p style={{
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                color: '#11142D',
                                fontFamily: 'monospace',
                                background: 'white',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                            }}>
                                {formData.username}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Key size={16} color="#dc2626" />
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Şifre</span>
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '1rem',
                                    fontFamily: 'monospace'
                                }}
                            />
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'white',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <p style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: '#11142D',
                                    fontFamily: 'monospace'
                                }}>
                                    {formData.password}
                                </p>
                            </div>
                        )}
                        <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertCircle size={10} />
                            Bu bilgiyi güvenli tutun
                        </p>
                    </div>

                    {/* Account Status */}
                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Shield size={16} color="#059669" />
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Hesap Durumu</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                background: '#ecfdf5',
                                color: '#059669'
                            }}>
                                <CheckCircle2 size={16} />
                                Aktif
                            </span>
                        </div>
                    </div>

                    {/* Role */}
                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Award size={16} color="#6366f1" />
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 500 }}>Rol</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                background: '#eef2ff',
                                color: '#6366f1'
                            }}>
                                <Award size={16} />
                                Mentor
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Assigned Students */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eafaf3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GraduationCap size={20} color="#008C45" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Atanan Öğrenciler</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>{assignedStudents.length} öğrenci</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {assignedStudents.map((student) => (
                            <Link
                                key={student.id}
                                href={`/admin/students/${student.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #f1f5f9',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #008C45 0%, #16a34a 100%)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                            overflow: 'hidden'
                                        }}>
                                            {student.photoUrl ? (
                                                <img
                                                    src={student.photoUrl}
                                                    alt={`${student.firstName} ${student.lastName}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <>{student.firstName?.[0]}{student.lastName?.[0]}</>
                                            )}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#11142D' }}>{student.firstName} {student.lastName}</p>
                                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={10} /> {student.country}
                                                </span>
                                                <span style={{
                                                    padding: '0.15rem 0.4rem',
                                                    background: '#eff6ff',
                                                    color: '#2563eb',
                                                    borderRadius: '4px'
                                                }}>
                                                    {student.packageType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            background: student.assignment.role === 'primary' ? '#fef3c7' : '#f3f4f6',
                                            color: student.assignment.role === 'primary' ? '#b45309' : '#6b7280',
                                            borderRadius: '8px'
                                        }}>
                                            {student.assignment.role === 'primary' ? '⭐ Ana' : 'Destek'}
                                        </p>
                                        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                            {student.approvedCount}/{student.serviceCount} hizmet
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {assignedStudents.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#9ca3af',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '12px'
                            }}>
                                <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>Henüz öğrenci atanmamış</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Service History */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={20} color="#f59e0b" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', color: '#11142D', fontWeight: 600 }}>Hizmet Geçmişi</h2>
                                <p style={{ fontSize: '0.8rem', color: '#808191' }}>{serviceLogs.length} hizmet kaydı</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {serviceLogs.slice(0, 10).map(log => {
                            const serviceType = serviceTypes.find(t => t.id === log.serviceTypeId);
                            const student = students.find(s => s.id === log.studentId);
                            const isExpanded = expandedLogId === log.id;

                            return (
                                <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                    <div
                                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem 1rem',
                                            background: '#f8fafc',
                                            borderRadius: isExpanded ? '10px 10px 0 0' : '10px',
                                            borderLeft: `3px solid ${log.status === 'approved' ? '#059669' :
                                                log.status === 'assigned' ? '#6366f1' :
                                                    log.status === 'submitted' ? '#f59e0b' : '#dc2626'
                                                }`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            borderBottom: isExpanded ? 'none' : 'visible'
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 500, color: '#374151', fontSize: '0.9rem' }}>{serviceType?.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                {student?.firstName} {student?.lastName} • {log.date.split('T')[0]}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    background: log.status === 'approved' ? '#ecfdf5' :
                                                        log.status === 'assigned' ? '#eef2ff' :
                                                            log.status === 'submitted' ? '#fef3c7' : '#fef2f2',
                                                    color: log.status === 'approved' ? '#059669' :
                                                        log.status === 'assigned' ? '#6366f1' :
                                                            log.status === 'submitted' ? '#b45309' : '#dc2626'
                                                }}>
                                                    {log.status === 'approved' ? 'Onaylandı' :
                                                        log.status === 'assigned' ? 'Atandı' :
                                                            log.status === 'submitted' ? 'Bekliyor' : 'Reddedildi'}
                                                </span>
                                                {serviceType?.unitPrice && log.status === 'approved' && (
                                                    <p style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.25rem', fontWeight: 600 }}>
                                                        €{serviceType.unitPrice}
                                                    </p>
                                                )}
                                            </div>
                                            {isExpanded ? <Clock size={16} color="#6b7280" /> : <Activity size={16} color="#9ca3af" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{
                                            padding: '1rem',
                                            background: '#ffffff',
                                            border: '1px solid #f1f5f9',
                                            borderLeft: `3px solid ${log.status === 'approved' ? '#059669' :
                                                log.status === 'assigned' ? '#6366f1' :
                                                    log.status === 'submitted' ? '#f59e0b' : '#dc2626'
                                                }`,
                                            borderRadius: '0 0 10px 10px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {log.notes && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Notlar</p>
                                                    <p style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{log.notes}</p>
                                                </div>
                                            )}

                                            {log.attachments && log.attachments.length > 0 && (
                                                <div>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Ekler</p>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        {log.attachments.map((url, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '6px',
                                                                    overflow: 'hidden',
                                                                    border: '1px solid #e5e7eb',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    background: '#f9fafb'
                                                                }}
                                                            >
                                                                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {
                                                                    (e.target as any).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTQuNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWNy41TDE0LjUgMnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxNCAyIDE0IDggMjAgOCI+PC9wb2x5bGluZT48L3N2Zz4=';
                                                                }} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {!log.notes && (!log.attachments || log.attachments.length === 0) && (
                                                <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Detay bulunmuyor.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {serviceLogs.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#9ca3af',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '12px'
                            }}>
                                <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>Henüz hizmet kaydı bulunmuyor</p>
                            </div>
                        )}
                    </div>

                    {serviceLogs.length > 10 && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link href="/admin/services" style={{ color: '#6366f1', fontSize: '0.85rem', fontWeight: 500 }}>
                                Tüm hizmetleri görüntüle ({serviceLogs.length - 10} daha fazla) →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Summary */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #11142D 0%, #1e293b 100%)',
                borderRadius: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1.5rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Toplam Öğrenci</p>
                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>{assignedStudents.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Başarı Oranı</p>
                    <p style={{ color: successRate >= 80 ? '#4ade80' : successRate >= 50 ? '#fbbf24' : '#f87171', fontSize: '1.5rem', fontWeight: 700 }}>
                        %{successRate}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Onaylı Hizmet</p>
                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>{approvedLogs.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Toplam Kazanç</p>
                    <p style={{ color: '#4ade80', fontSize: '1.5rem', fontWeight: 700 }}>€{totalEarnings.toLocaleString()}</p>
                </div>
            </div>
        </div >
    );
}
