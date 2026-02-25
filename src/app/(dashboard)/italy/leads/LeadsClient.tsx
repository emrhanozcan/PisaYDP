'use client';

import { useState, useEffect } from 'react';
import { Lead, LEAD_STATUS_LABELS } from '@/types';
import {
    Search, Mail, Phone, Plus, Edit2, Trash2, User,
    Calendar, FileText, ChevronRight, ChevronLeft,
    GraduationCap, Briefcase, MapPin, CreditCard,
    Check, X, ChevronDown, Save
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddLeadModal from './AddLeadModal';
import { createLead, updateLead } from '@/app/actions/leads';
import LeadForm from './LeadForm';
// Assuming we might need to update a lead (client-side or separate action)
// For now we reuse createLead logic or add updateLead later. 
// We will focus on the read-only view matching Students page first.

interface LeadsClientProps {
    initialLeads: Lead[];
    branchId?: string;
}

export default function LeadsClient({ initialLeads, branchId }: LeadsClientProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingLead, setEditingLead] = useState<Partial<Lead>>({});
    const [isListCollapsed, setIsListCollapsed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);

    // Filter Logic
    const filteredLeads = leads.filter(l => {
        const fullSearch = `${l.firstName} ${l.lastName || ''} ${l.emails.join(' ')} ${l.phone || ''}`.toLowerCase();
        const matchSearch = fullSearch.includes(searchTerm.toLowerCase());
        const matchStatus = !statusFilter || l.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Handlers
    const handleOpenModal = (lead?: Lead) => {
        if (lead) {
            setEditingLead(lead);
            // If lead is present, we might want to use modal for edit? 
            // NO, we switched to side panel edit. 
            // So if handleOpenModal is called with a lead, it might be from a legacy call or we should redirect to side panel edit?
            // "Düzenle" button now calls setIsEditing(true).
            // "Yeni Ekle" calls handleOpenModal().
            // So handleOpenModal should probably only handle NEW leads.
            // But let's keep it safe.
        } else {
            setEditingLead({});
        }
        setIsModalOpen(true);
    };

    const handleSaveLead = async (savedLead: Lead) => {
        // Optimistic or refresh
        // For now, let's trust router.refresh or handle manual state update
        // If savedLead is returned from modal/action
        if (editingLead.id) {
            setLeads(prev => prev.map(l => l.id === savedLead.id ? savedLead : l));
            setSelectedLead(savedLead);
        } else {
            setLeads(prev => [savedLead, ...prev]);
        }
        router.refresh(); // Ensure strict sync
    };

    // Helper for badge color matches
    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string }> = {
            'lead': { bg: '#E3F2FD', color: '#1565C0' }, // Blue
            'contacted': { bg: '#FFF3E0', color: '#EF6C00' }, // Orange
            'meeting_scheduled': { bg: '#F3E5F5', color: '#7B1FA2' }, // Purple
            'proposal_sent': { bg: '#E0F2F1', color: '#00695C' }, // Teal
            'enrolled': { bg: '#E8F5E9', color: '#2E7D32' }, // Green
            'rejected': { bg: '#FFEBEE', color: '#C62828' }, // Red
            'busy': { bg: '#FBE9E7', color: '#D84315' }, // Deep Orange
            'no_answer': { bg: '#ECEFF1', color: '#546E7A' }, // Blue Grey
        };
        const s = styles[status] || { bg: '#F5F5F5', color: '#616161' };
        return <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', background: s.bg, color: s.color }}>{(LEAD_STATUS_LABELS as any)[status] || status}</span>;
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '1.5rem', fontFamily: 'inherit' }}>
            {/* Left Sidebar - Lead List */}
            <div style={{ width: isListCollapsed ? '60px' : '380px', transition: 'all 0.3s ease', background: isListCollapsed ? 'linear-gradient(to bottom, #eafaf3, #ffffff, #fbf1f1)' : 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'visible', flexShrink: 0, position: 'relative' }}>
                <button
                    onClick={() => setIsListCollapsed(!isListCollapsed)}
                    style={{
                        position: 'absolute',
                        right: '-16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#6C5CE7',
                        zIndex: 20,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                >
                    {isListCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f5', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: isListCollapsed ? 0 : 1, pointerEvents: isListCollapsed ? 'none' : 'auto', transition: 'opacity 0.2s', visibility: isListCollapsed ? 'hidden' : 'visible' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: '600', color: '#1a1a2e' }}>Leadler ({filteredLeads.length})</span>
                        <button onClick={() => handleOpenModal()} style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '500' }}>
                            <Plus size={14} /> Yeni Ekle
                        </button>
                    </div>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#808191' }} />
                        <input type="text" placeholder="Lead ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e8e8ef', borderRadius: '10px', fontSize: '0.85rem', background: '#fafafc', outline: 'none' }} />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e8e8ef', borderRadius: '8px', fontSize: '0.8rem', background: '#fafafc', cursor: 'pointer', outline: 'none' }}>
                        <option value="">Tüm Durumlar</option>
                        {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', opacity: isListCollapsed ? 0 : 1, pointerEvents: isListCollapsed ? 'none' : 'auto', transition: 'opacity 0.2s', visibility: isListCollapsed ? 'hidden' : 'visible' }}>
                    {filteredLeads.map(lead => (
                        <div key={lead.id} onClick={() => setSelectedLead(lead)} style={{ padding: '12px 16px', cursor: 'pointer', background: selectedLead?.id === lead.id ? '#f0f4ff' : 'transparent', borderLeft: selectedLead?.id === lead.id ? '3px solid #6C5CE7' : '3px solid transparent', borderBottom: '1px solid #f8f8f8', transition: 'all 0.15s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {/* Avatar placeholder */}
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                                    {lead.firstName.charAt(0)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '500', fontSize: '0.9rem', color: selectedLead?.id === lead.id ? '#6C5CE7' : '#1a1a2e' }}>{lead.firstName} {lead.lastName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#808191', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {lead.interestedPrograms?.[0] || 'Program Belirtilmedi'}
                                    </div>
                                </div>
                                {getStatusBadge(lead.status)}
                            </div>
                        </div>
                    ))}
                    {filteredLeads.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#808191' }}>Lead bulunamadı.</div>}
                </div>
            </div>

            {/* Right Panel - Details */}
            <div style={{ flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {selectedLead ? (
                    isEditing ? (
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Lead Düzenle</h2>
                                <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={20} /></button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                                <LeadForm
                                    initialData={selectedLead}
                                    onCancel={() => setIsEditing(false)}
                                    onSave={async (data) => {
                                        const res = await updateLead(selectedLead.id, data);
                                        if (res.success && res.data) {
                                            handleSaveLead(res.data);
                                            setIsEditing(false);
                                        } else {
                                            alert('Hata: ' + res.error);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f5' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
                                        {selectedLead.firstName.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>{selectedLead.firstName} {selectedLead.lastName}</h2>
                                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                            <div style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', background: '#F3E5F5', color: '#7B1FA2', fontWeight: '500' }}>
                                                {selectedLead.contactRole === 'guardian' ? 'Veli İletişimi' : 'Öğrenci İletişimi'}
                                            </div>
                                            {/* Status badge again or quick edit */}
                                            {getStatusBadge(selectedLead.status)}
                                        </div>
                                    </div>
                                </div>
                                <div className="no-print" style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setIsEditing(true)} style={{ padding: '8px 14px', background: '#f8f9ff', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}><Edit2 size={14} /> Düzenle</button>
                                </div>
                            </div>

                            {/* Info Cards Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {/* Kişisel Bilgiler */}
                                <InfoCard title="İletişim Bilgileri" color="#6C5CE7" icon={<Mail size={18} />}>
                                    <InfoRow label="Email" value={selectedLead.emails.join(', ')} />
                                    <InfoRow label="Telefon" value={selectedLead.phone} />
                                    <InfoRow label="Uyruk" value={selectedLead.nationality} />
                                    <InfoRow label="Şehir" value={selectedLead.studentInfo?.city || '-'} />
                                </InfoCard>

                                {/* Eğitim Bilgileri */}
                                <InfoCard title="Eğitim & İlgi" color="#00B894" icon={<GraduationCap size={18} />}>
                                    <InfoRow label="Kayıt Yılı" value={selectedLead.registrationYear} />
                                    <InfoRow label="Programlar" value={selectedLead.interestedPrograms?.join(', ')} />
                                    <InfoRow label="Üniversiteler" value={selectedLead.interestedUniversities?.join(', ')} />
                                    {/* <InfoRow label="Tıp Akışı" value={selectedLead.medicalTrack === 'tip_ingilizce' ? 'Tıp (İngilizce)' : selectedLead.medicalTrack === 'both' ? 'Her İkisi' : 'Yok'} /> */}
                                    <InfoRow label="Seviye" value={selectedLead.educationLevel} />
                                </InfoCard>

                                {/* Görüşme Bilgileri */}
                                <InfoCard title="Görüşme & Durum" color="#fdcb6e" icon={<Calendar size={18} />}>
                                    <InfoRow label="Tarih" value={selectedLead.meetingDate} />
                                    <InfoRow label="Saat" value={selectedLead.meetingTime} />
                                    <InfoRow label="Danışman" value={selectedLead.consultant?.name || selectedLead.meetingConsultant} />
                                    <InfoRow label="Tip" value={selectedLead.meetingType} />
                                    <InfoRow label="Kaynak" value={selectedLead.source} />
                                </InfoCard>

                                {/* MALI & Notlar */}
                                <InfoCard title="Finansal & Notlar" color="#E67E22" icon={<CreditCard size={18} />}>
                                    <InfoRow label="Fiyat" value={selectedLead.discussedPrice ? `${selectedLead.discussedPrice} EUR` : '-'} style={{ fontWeight: 'bold', color: '#27AE60' }} />
                                    <InfoRow label="Ek Ödeme" value={selectedLead.additionalPayment ? `${selectedLead.additionalPayment} EUR` : '-'} />
                                    <InfoRow label="İndirim" value={selectedLead.hasDiscount ? `Var (${selectedLead.discountInfo})` : 'Yok'} />
                                </InfoCard>
                            </div>

                            {/* Description / Notes */}
                            {(selectedLead.notes || selectedLead.meetingSummary) && (
                                <div style={{ marginTop: '1rem', background: '#fafafc', borderRadius: '12px', padding: '1rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Görüşme Özeti & Notlar</h4>
                                    {selectedLead.meetingSummary && <p style={{ color: '#333', fontSize: '0.9rem', margin: '0 0 0.5rem' }}><strong>Özet:</strong> {selectedLead.meetingSummary}</p>}
                                    {selectedLead.notes && <p style={{ color: '#555', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}><strong>Not:</strong> {selectedLead.notes}</p>}
                                </div>
                            )}

                            {selectedLead.contactRole === 'guardian' && selectedLead.studentInfo && (
                                <div style={{ marginTop: '1rem' }}>
                                    <InfoCard title="Öğrenci Detayları (Veli Kaydı)" color="#E91E63" icon={<User size={18} />}>
                                        <InfoRow label="Öğrenci Adı" value={`${selectedLead.studentInfo.first_name || ''} ${selectedLead.studentInfo.last_name || ''}`} />
                                        <InfoRow label="Öğrenci Tel" value={selectedLead.studentInfo.phone} />
                                        <InfoRow label="Öğrenci Email" value={selectedLead.studentInfo.emails?.join(', ')} />
                                    </InfoCard>
                                </div>
                            )}

                        </div>
                    )
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#808191' }}>
                        <User size={48} color="#e0e0e0" />
                        <p style={{ marginTop: '1rem', fontSize: '1rem' }}>Detayları görmek için sol panelden bir lead seçin.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AddLeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={async (data) => {
                    const res = await createLead({ ...data, branchId });
                    if (res.success && res.data) {
                        handleSaveLead(res.data);
                        return { ok: true, data: res.data };
                    }
                    return { ok: false, error: res.error as string };
                }}
            />
        </div>
    );
}

// Helpers copied from StudentsClient
function InfoCard({ title, color, icon, children }: { title: string; color: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div style={{ background: '#fafafc', borderRadius: '12px', padding: '1.25rem', borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ color }}>{icon}</div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color, margin: 0 }}>{title}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>{children}</div>
        </div>
    );
}

function InfoRow({ label, value, icon, badge, color, style }: { label: string; value?: string; icon?: React.ReactNode; badge?: boolean; color?: string; style?: React.CSSProperties }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
            {icon}
            <span style={{ color: '#808191', fontSize: '0.8rem', minWidth: '90px' }}>{label}:</span>
            {badge ? (
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', background: color ? `${color}20` : '#F5F5F5', color: color || '#616161' }}>{value || '-'}</span>
            ) : (
                <span style={{ fontWeight: '500', color: '#333', fontSize: '0.85rem' }}>{value || '-'}</span>
            )}
        </div>
    );
}
