export default function LoadingSkeleton() {
    return (
        <div style={{ padding: '2rem', animation: 'fadeIn 0.5s ease-in-out' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0f0f5', animation: 'pulse 1.5s infinite ease-in-out' }} />
                <div>
                    <div style={{ width: '120px', height: '24px', borderRadius: '6px', background: '#f0f0f5', marginBottom: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                    <div style={{ width: '200px', height: '16px', borderRadius: '6px', background: '#f0f0f5', animation: 'pulse 1.5s infinite ease-in-out' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '120px', borderRadius: '16px', background: 'white', padding: '1.5rem', border: '1px solid #f0f0f5', animation: 'pulse 1.5s infinite ease-in-out' }} />
                ))}
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f0f0f5', minHeight: '400px', animation: 'pulse 1.5s infinite ease-in-out' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '100px', height: '36px', borderRadius: '8px', background: '#f0f0f5' }} />
                    <div style={{ width: '100px', height: '36px', borderRadius: '8px', background: '#f0f0f5' }} />
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ height: '60px', marginBottom: '1rem', borderRadius: '8px', background: '#f9fafb' }} />
                ))}
            </div>

            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
}
