import React, { memo } from 'react';
import Link from "next/link";
import { GraduationCap, ChevronRight, Users } from "lucide-react";
import StudentAvatar from '@/components/common/StudentAvatar';

interface StudentListRowProps {
    student: any;
    index: number;
    canEditPhoto: boolean;
    sessionRole: string;
    getUniversityName: (student: any) => string;
}

const StudentListRow = memo(({ student, index, canEditPhoto, sessionRole, getUniversityName }: StudentListRowProps) => {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{index + 1}</td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StudentAvatar
                        studentId={student.id}
                        firstName={student.firstName}
                        lastName={student.lastName}
                        photoUrl={student.photoUrl}
                        size={40}
                        canEdit={canEditPhoto}
                        isAuthorized={sessionRole !== 'mentor'}
                        table={student.isYDP ? 'branch_students' : 'students'}
                        showDelete={false}
                    />
                    <div>
                        <p style={{ fontWeight: 600, color: '#11142D', marginBottom: '2px' }}>
                            {student.firstName} {student.lastName}
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {student.email || 'E-posta yok'}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    <span>🇮🇹</span>
                    {student.country}
                </div>
            </td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    <GraduationCap size={14} />
                    <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getUniversityName(student)}>
                        {getUniversityName(student)}
                    </span>
                </div>
            </td>
            <td>
                <span style={{
                    padding: '0.35rem 0.75rem',
                    background: '#eff6ff',
                    color: '#2563eb',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 500
                }}>
                    {student.packageType}
                </span>
            </td>
            <td>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    background: '#f9fafb',
                    color: '#9ca3af',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                }}>
                    0/0
                </span>
            </td>
            <td>
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: student.status === 'active' ? '#ecfdf5' : '#fef2f2',
                    color: student.status === 'active' ? '#059669' : '#dc2626'
                }}>
                    <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: student.status === 'active' ? '#059669' : '#dc2626'
                    }} />
                    {student.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td style={{ textAlign: 'right' }}>
                <Link
                    href={`/admin/students/${student.id}`}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        background: '#008C45',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        gap: '0.35rem',
                        textDecoration: 'none'
                    }}
                >
                    Detay <ChevronRight size={14} />
                </Link>
            </td>
        </tr>
    );
});

StudentListRow.displayName = 'StudentListRow';

export default StudentListRow;
