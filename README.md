# SaaS Textile ERP (Muhasebe & Stok Takip) - v2.0

Bu proje, tekstil sektörüne yönelik modern, ölçeklenebilir ve profesyonel bir SaaS ("Software as a Service") çözümüdür. Katmanlı mimari (Clean Architecture), "DB-First" güvenlik yaklaşımı ve kapsamlı raporlama desteği ile donatılmıştır.

## 🚀 V2.0 Güncellemesi ile Gelen Yenilikler

Bu sürümde sistem mimarisi "Kurşun Geçirmez" hale getirilmiş ve profesyonel raporlama modülleri eklenmiştir:

- **Gelişmiş PDF Raporlama**: 
  - **Satış Fişi**: 80mm termal rulo formatında, Türkçe karakter destekli dijital fiş üretimi.
  - **Envanter Dökümü**: Tüm stok durumunu A4 formatında tablo olarak dışa aktarma.
  - **Dönemlik Analiz**: Günlük, haftalık ve aylık satış verilerini özet rapor olarak indirme.
- **Veritabanı Seviyesinde Koruma**: 
  - **Negatif Stok Engelleyici**: `CHECK CONSTRAINT` ile fiziksel imkansızlıklar (eksi stok) veritabanı seviyesinde yasaklanmıştır.
  - **Akıllı Silme Kalkanı**: İçinde aktif varyantı bulunan ürünlerin silinmesi PostgreSQL Trigger'ları ile engellenerek veri bütünlüğü garanti altına alınmıştır.
- **Kod Refactoring**: `productService.ts` ve `AuthContext.tsx` katmanları sadeleştirilerek performans artırılmış ve hassas log verileri temizlenmiştir.

---

### ✨ Öne Çıkan Özellikler

- **Multi-Tenant (Çok Kiracılı) Yapı**: Supabase Row Level Security (RLS) ile dükkanlar arası tam veri izolasyonu.
- **Offline-First Ready**: Dexie.js entegrasyonu ile yerel veri yönetimi altyapısı.
- **Proses Otomasyonu**: Stok düşüşleri ve hareketleri PL/pgSQL Trigger'ları ile otonom olarak yönetilir.
- **Dinamik Raporlama**: Satışlar sayfasında anlık tarih filtreleme ve ciro hesaplama motoru.

---

## 🛠️ Teknoloji Yığını

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (Modern & Premium Design)
- **Backend/Database**: Supabase (PostgreSQL), RPC, PL/pgSQL
- **Reporting**: jsPDF, jspdf-autotable (Gelişmiş Tablo Desteği)
- **Icons & UI**: Lucide React, Framer Motion

---

## ⚙️ Kurulum

1. **Repoyu Klonlayın**:
   ```bash
   git clone [https://github.com/yigitYur650/Stok-Takip-Otomasyonu-v2.0.git](https://github.com/yigitYur650/Stok-Takip-Otomasyonu-v2.0.git)
   cd Stok-Takip-Otomasyonu-v2.0
Bağımlılıkları Kurun:

Bash
npm install
PDF Kütüphanelerini Ekleyin:

Bash
npm install jspdf jspdf-autotable
Çevre Değişkenlerini Ayarlayın:
.env.example dosyasını .env olarak kopyalayın ve Supabase API bilgilerinizi girin.

Veritabanı Şeması:
supabase/migrations/full_production_schema.sql dosyasını ve ardından V2 güvenlik trigger'larını Supabase SQL Editor üzerinden çalıştırın.

🏗️ Mimari Yapı
Proje SOLID prensiplerine ve Service Pattern yapısına uygun olarak geliştirilmiştir:

src/services/pdfService.ts: Tüm raporlama mantığının merkezi yönetimi.

src/services/productService.ts: Veritabanı trigger'ları ile eşgüdümlü çalışan sadeleştirilmiş servis katmanı.

src/context/AuthContext.tsx: Güvenli ve loglardan arındırılmış kimlik doğrulama yönetimi.

🔐 Güvenlik ve Veri Bütünlüğü
RLS (Row Level Security): Hiçbir kullanıcı başka bir dükkanın verisine erişemez.

Constraint-Based Safety: Yazılım hatası olsa dahi veritabanı hatalı veri girişine (negatif stok vb.) izin vermez.

Production Logs: Uygulama canlıya hazır hale getirilmiş, hassas geliştirici logları temizlenmiştir.

📄 Lisans
Bu proje özel mülkiyet niteliğindedir. İzinsiz kopyalanamaz ve dağıtılamaz.


---
