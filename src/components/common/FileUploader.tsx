'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';

export default function FileUploader({ name = "attachments", multiple = true }: { name?: string, multiple?: boolean }) {
    const [files, setFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            // Append to existing if multiple, else replace
            const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
            setFiles(updatedFiles);
            updateInputFiles(updatedFiles);
        }
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        updateInputFiles(updatedFiles);
    };

    const updateInputFiles = (fileList: File[]) => {
        if (inputRef.current) {
            const dt = new DataTransfer();
            fileList.forEach(file => dt.items.add(file));
            inputRef.current.files = dt.files;
        }
    };

    const triggerInput = () => {
        inputRef.current?.click();
    };

    return (
        <div style={{ padding: '1.5rem', border: '2px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc', textAlign: 'center' }}>
            <input
                type="file"
                name={name}
                multiple={multiple}
                ref={inputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
            />

            <div
                onClick={triggerInput}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}
            >
                <div style={{
                    width: 48, height: 48,
                    background: '#eef2ff',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#6366f1'
                }}>
                    <Upload size={24} />
                </div>
                <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                        Dosya Yüklemek İçin Tıklayın
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                        veya buraya sürükleyin (PNG, JPG, PDF)
                    </p>
                </div>
            </div>

            {files.length > 0 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                    {files.map((file, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.75rem', background: 'white',
                            borderRadius: '8px', border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                                <div style={{
                                    width: 36, height: 36,
                                    background: file.type.startsWith('image/') ? '#fdf2f8' : '#f0f9ff',
                                    borderRadius: '6px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {file.type.startsWith('image/')
                                        ? <ImageIcon size={18} color="#db2777" />
                                        : <FileIcon size={18} color="#0284c7" />
                                    }
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {file.name}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                style={{
                                    width: 28, height: 28,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '6px', border: '1px solid #fee2e2',
                                    background: 'white', color: '#ef4444', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
