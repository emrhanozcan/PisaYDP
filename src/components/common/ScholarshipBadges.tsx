import React from 'react';

interface ScholarshipBadgesProps {
    scholarshipTypes?: string[];
    scholarshipPackage?: string;
}

const SCHOLARSHIP_COLORS: Record<string, { bg: string; color: string }> = {
    'Lazio Disco': { bg: '#DBEAFE', color: '#1E40AF' },
    'DSU (Toskana)': { bg: '#F3E8FF', color: '#6B21A8' },
    'EDISU (Piemonte)': { bg: '#FFEDD5', color: '#C2410C' },
    'EDISU (Torino)': { bg: '#FEF3C7', color: '#B45309' },
    'ERGO': { bg: '#D1FAE5', color: '#065F46' },
};

export default function ScholarshipBadges({ scholarshipTypes, scholarshipPackage }: ScholarshipBadgesProps) {
    if (scholarshipTypes && scholarshipTypes.length > 0) {
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {scholarshipTypes.map((type, idx) => {
                    const colors = SCHOLARSHIP_COLORS[type] || { bg: '#F3F4F6', color: '#374151' };
                    return (
                        <span key={idx} style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            background: colors.bg,
                            color: colors.color
                        }}>
                            {type}
                        </span>
                    );
                })}
            </div>
        );
    }

    if (scholarshipPackage === 'Evet') {
        return (
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontStyle: 'italic' }}>Burs seçilmedi</span>
        );
    }

    return null;
}
