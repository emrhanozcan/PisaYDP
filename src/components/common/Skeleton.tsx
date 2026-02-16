import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    style?: React.CSSProperties;
    className?: string;
}

export default function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', style, className }: SkeletonProps) {
    return (
        <div
            className={`skeleton-loader ${className || ''}`}
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: '#e5e7eb',
                ...style
            }}
        />
    );
}
