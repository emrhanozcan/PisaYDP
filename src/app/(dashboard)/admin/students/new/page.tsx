<<<<<<< HEAD

import { createStudent } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewStudentPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/admin/students" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft size={16} />
                Listeye Dön
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-gray-800">Yeni Öğrenci Ekle</h1>
                <p className="text-gray-500 text-sm">Öğrenci bilgilerini giriniz.</p>
            </div>

            <form action={createStudent} className="glass-panel p-8 space-y-8">
                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-gray-100 pb-2">Kişisel Bilgiler</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                            <input name="firstName" required className="input-field" placeholder="Örn: Ayşe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                            <input name="lastName" required className="input-field" placeholder="Örn: Demir" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                            <input name="email" type="email" className="input-field" placeholder="ayse@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                            <input name="phone" className="input-field" placeholder="+90 5..." />
                        </div>
                    </div>
                </div>

                {/* Education & Location */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-gray-100 pb-2">Eğitim ve Konum</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
                            <select name="country" required className="input-field">
                                <option value="">Şehir Seçin...</option>
                                <option value="Pisa">Pisa</option>
                                <option value="Floransa">Floransa (Firenze)</option>
                                <option value="Roma">Roma</option>
                                <option value="Milano">Milano</option>
                                <option value="Bologna">Bologna</option>
                                <option value="Torino">Torino</option>
                                <option value="Napoli">Napoli</option>
                                <option value="Padova">Padova</option>
                                <option value="Venedik">Venedik (Venezia)</option>
                                <option value="Perugia">Perugia</option>
                                <option value="Siena">Siena</option>
                                <option value="Diğer">Diğer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Okul / Üniversite</label>
                            <input name="school" className="input-field" placeholder="Università di Pisa" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bölüm / Program</label>
                        <input name="program" className="input-field" placeholder="Bilgisayar Mühendisliği Lisans" />
                    </div>
                </div>

                {/* Package & Status */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide border-b border-gray-100 pb-2">Paket Detayları</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paket Türü *</label>
                            <select name="packageType" className="input-field">
                                <option value="Standard">Standart Paket</option>
                                <option value="Premium">Premium Paket</option>
                                <option value="VIP">VIP Paket</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                            <input type="date" name="startDate" className="input-field" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary px-8">
                        Kaydet
                    </button>
                </div>
            </form>
        </div>
=======
import { db } from "@/lib/db";
import StudentForm from "../StudentForm";

export default function NewStudentPage() {
    const universities = db.universities.getAll().sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    return (
        <StudentForm universities={universities} />
>>>>>>> 888427508d7d4764e3aecfbe87738d6ff7861c4a
    );
}
