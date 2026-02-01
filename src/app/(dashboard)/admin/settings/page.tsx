
import { db } from "@/lib/db";
import { Settings, Sliders, Briefcase, Trash2, Plus, DollarSign, Clock, Layers } from "lucide-react";
import { createServiceType, deleteServiceType } from "@/app/actions/admin";

export default function SettingsPage() {
    const serviceTypes = db.serviceTypes.getAll();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: '#11142D', marginBottom: '0.5rem' }}>Ayarlar</h1>
                    <p style={{ color: '#808191' }}>Sistem yapılandırması ve hizmet yönetimi.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left Column: General Settings (Placeholder) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#11142D', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Settings size={18} />
                            Genel Ayarlar
                        </h2>
                        <p style={{ color: '#808191', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Uygulama genelindeki temel ayarlar.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid #f1f1f1' }}>
                                <span style={{ fontSize: '0.95rem', color: '#333' }}>Oturum Süresi</span>
                                <span style={{ padding: '0.3rem 0.8rem', background: '#F9FAFC', borderRadius: '6px', fontSize: '0.85rem' }}>30 dk</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid #f1f1f1' }}>
                                <span style={{ fontSize: '0.95rem', color: '#333' }}>Para Birimi</span>
                                <span style={{ padding: '0.3rem 0.8rem', background: '#F9FAFC', borderRadius: '6px', fontSize: '0.85rem' }}>EUR (€)</span>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <button className="btn" style={{ width: '100%', background: '#F9FAFC', color: '#808191', border: '1px solid #E4E5E7' }} disabled>
                                    Düzenle (Devre Dışı)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Service Types Management */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* List Service Types */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#11142D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Briefcase size={18} />
                                Hizmet Türleri
                            </h2>
                        </div>

                        <div className="table-wrapper">
                            <table className="table" style={{ fontSize: '0.9rem' }}>
                                <thead>
                                    <tr>
                                        <th>Hizmet Adı</th>
                                        <th>Kategori</th>
                                        <th>Fiyatlandırma</th>
                                        <th style={{ textAlign: 'right' }}>Birim Fiyat</th>
                                        <th style={{ textAlign: 'right' }}>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceTypes.map(st => (
                                        <tr key={st.id}>
                                            <td style={{ fontWeight: 500 }}>{st.name}</td>
                                            <td>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '4px',
                                                    background: '#e0e7ff',
                                                    color: '#4338ca',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {st.category}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666' }}>
                                                    {st.pricingModel === 'hourly' ? <Clock size={14} /> : <Layers size={14} />}
                                                    {st.pricingModel === 'hourly' ? 'Saatlik' : 'Sabit'}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#11142D' }}>
                                                {st.unitPrice} €
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <form action={deleteServiceType.bind(null, st.id)}>
                                                    <button type="submit" style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        padding: '0.4rem',
                                                        borderRadius: '4px'
                                                    }} title="Sil">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Add New Service Type Form */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#11142D', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={16} />
                            Yeni Hizmet Türü Ekle
                        </h3>
                        <form action={createServiceType} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>Hizmet Adı</label>
                                <input name="name" required placeholder="Örn: Vize Danışmanlığı" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E4E5E7', outline: 'none' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>Kategori</label>
                                <select name="category" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E4E5E7', outline: 'none' }}>
                                    <option value="Consulting">Danışmanlık</option>
                                    <option value="Arrival">Karşılama</option>
                                    <option value="Accommodation">Konaklama</option>
                                    <option value="Legal">Yasal İşlemler</option>
                                    <option value="Other">Diğer</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>Model</label>
                                <select name="pricingModel" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E4E5E7', outline: 'none' }}>
                                    <option value="fixed">Sabit Ücret</option>
                                    <option value="hourly">Saatlik</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>Birim Fiyat (€)</label>
                                <input name="unitPrice" type="number" step="0.01" required placeholder="0.00" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E4E5E7', outline: 'none' }} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button type="submit" style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    borderRadius: '8px',
                                    background: '#008C45',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}>
                                    Ekle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
