# YDP Takip Sistemi

Yurt Dışı Eğitim Danışmanlığı için Mentor ve Öğrenci Takip Sistemi.

## Özellikler

- **Yönetici (Admin) Paneli**: Mentor ve öğrenci yönetimi, atamalar, raporlama.
- **Mentor Paneli**: Öğrenci takibi, hizmet kaydı girme, hakediş görüntüleme.
- **Hizmet Günlüğü**: Öğrencilere verilen hizmetlerin detaylı kaydı.
- **Otomatik Hakediş**: Hizmet türlerine göre mentor ücretlerinin hesaplanması.
- **Denetim İzi (Audit Log)**: Kritik işlemlerin loglanması.

## Kurulum ve Çalıştırma

1.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

2.  Geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```

3.  Tarayıcıda `http://localhost:3000` adresine gidin.

## Giriş Bilgileri (Demo)

Sistem ilk açıldığında aşağıdaki demo hesap kullanılabilir:

- **Admin**:
    - Kullanıcı Adı: `admin`
    - Şifre: `123`

Yeni mentorlar Admin panelinden oluşturulabilir.

## Teknoloji Yığını

- **Framework**: Next.js 14+ (App Router)
- **Dil**: TypeScript
- **Stil**: Vanilla CSS (CSS Modules & Variables) - "Premium Glassmorphism" Tasarım
- **Veri Tabanı**: Yerel JSON Dosyası (`ydp-data.json`) - Prototip amaçlı

## Notlar

- Veriler `ydp-data.json` dosyasında saklanır. Bu dosya silinirse veriler sıfırlanır (varsayılan seed verileri tekrar oluşturulur).
- Proje `c:/Projeler/YDP` dizinindedir.
