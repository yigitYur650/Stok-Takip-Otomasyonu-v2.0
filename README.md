ENGLİSH
SaaS Textile ERP (Accounting & Inventory Management) - v2.0
This project is a modern, scalable, and professional SaaS ("Software as a Service") solution designed specifically for the textile industry. It is built with a layered architecture (Clean Architecture), a "DB-First" security approach, and comprehensive reporting support.

🚀 New in V2.0
In this version, the system architecture has been made "Bulletproof," and professional reporting modules have been integrated:

Advanced PDF Reporting:

Sales Receipt: Digital receipt generation in 80mm thermal roll format with full Turkish character support.

Inventory List: Export full stock status as an A4 format table.

Periodic Analysis: Download daily, weekly, and monthly sales data as summary reports.

Database-Level Protection:

Negative Stock Preventer: Physical impossibilities (negative stock) are prohibited at the database level using CHECK CONSTRAINT.

Smart Delete Shield: Deletion of products with active variants is blocked by PostgreSQL Triggers to guarantee data integrity.

Code Refactoring: productService.ts and AuthContext.tsx layers have been streamlined for increased performance and to remove sensitive log data.

Comprehensive Test Suite: 17 unit test scenarios added to the service layer to ensure 100% accuracy of business logic.

✨ Key Features
Multi-Tenant Architecture: Full data isolation between shops provided by Supabase Row Level Security (RLS).

Offline-First Ready: Local data management infrastructure via Dexie.js integration.

Process Automation: Autonomous management of stock deductions and movements through PL/pgSQL Triggers.

Dynamic Reporting: Real-time date filtering and revenue calculation engine on the sales page.

🛠️ Tech Stack
Frontend: React 18, Vite, TypeScript

Styling: Tailwind CSS (Modern & Premium Design)

Backend/Database: Supabase (PostgreSQL), RPC, PL/pgSQL

Reporting: jsPDF, jspdf-autotable (Advanced Table Support)

Icons & UI: Lucide React, Framer Motion

⚙️ Installation
Clone the Repo:

Bash
git clone https://github.com/yigitYur650/Stok-Takip-Otomasyonu-v2.0.git
cd Stok-Takip-Otomasyonu-v2.0
Install Dependencies:

Bash
npm install
Add PDF Libraries:

Bash
npm install jspdf jspdf-autotable
Configure Environment Variables:
Copy .env.example to .env and enter your Supabase API credentials.

Database Schema:
Run supabase/migrations/full_production_schema.sql followed by the V2 security triggers in the Supabase SQL Editor.

🏗️ Architecture
The project is developed in accordance with SOLID principles and the Service Pattern:

src/services/pdfService.ts: Central management of all reporting logic.

src/services/productService.ts: Streamlined service layer working in sync with database triggers.

src/context/AuthContext.tsx: Secure authentication management stripped of development logs.

🔐 Security & Data Integrity
RLS (Row Level Security): No user can access the data of another shop.

Constraint-Based Safety: The database prevents incorrect data entry (e.g., negative stock) even if a software error occurs.

Production Logs: Application is production-ready with sensitive developer logs cleaned.

📄 License
This project is proprietary. Unauthorized copying and distribution are prohibited.
# SaaS Textile ERP (Muhasebe & Stok Takip) - v2.0
TÜRKÇE
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
- Kapsamlı Test Suite: İş mantığının %100 doğruluğunu sağlamak için servis katmanına 17 farklı senaryoyu kapsayan unit testler eklendi.

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
