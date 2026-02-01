
import { createMentor } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewMentorPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/admin/mentors" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft size={16} />
                Listeye Dön
            </Link>

            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-800">Yeni Mentor Ekle</h1>
                <p className="text-gray-500 text-sm">Mentor sisteme giriş yaparak öğrencilerini yönetebilecek.</p>
            </div>

            <form action={createMentor} className="glass-panel p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                        <input name="firstName" required className="input-field" placeholder="Örn: Ahmet" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                        <input name="lastName" required className="input-field" placeholder="Örn: Yılmaz" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                        <input name="email" type="email" className="input-field" placeholder="ahmet@ornek.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input name="phone" className="input-field" placeholder="+90 555 ..." />
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Giriş Bilgileri</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı *</label>
                            <input name="username" required className="input-field" placeholder="ahmetyilmaz" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Geçici Şifre *</label>
                            <input name="password" required className="input-field" defaultValue="123456" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary w-full md:w-auto px-8">
                        Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
}
