# SaaS Textile ERP (Muhasebe & Stok Takip) - v2.0

Bu proje, tekstil sektörüne yönelik modern, ölçeklenebilir ve profesyonel bir SaaS ("Software as a Service") çözümüdür. Katmanlı mimari (Clean Architecture), "Offline-first" yaklaşımı ve kapsamlı Multi-tenancy desteği barındırmaktadır.

### ✨ Öne Çıkan Özellikler

- **Multi-Tenant (Çok Kiracılı) Yapı**: Supabase Row Level Security (RLS) ile veritabanı seviyesinde tam izolasyon.
- **Offline-First**: Dexie.js (IndexedDB) ile internet olmasa dahi satış ve stok işlemlerine devam edebilme.
- **Dinamik Temalandırma**: Sayfa bazlı otomatik renk geçişleri (Contextual Theming).
- **Proses Otomasyonu**: Stok düşüşleri ve hareketleri PostgreSQL Trigger'ları ile otonom olarak yönetilir.
- **Gelişmiş Raporlama**: Günlük ciro, kar/zarar ve kritik stok seviyeleri için hazır Analytics View'lar.

---

## 🚀 Teknoloji yığını

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (Modern & Premium Design)
- **Backend/Database**: Supabase (PostgreSQL), RPC, PL/pgSQL
- **Local Storage**: Dexie.js (IndexedDB)
- **Icons & UI**: Lucide React, Framer Motion

---

## 🛠️ Kurulum

1. **Repoyu Klonlayın**:
   ```bash
   git clone https://github.com/yigitYur650/Stok-Takip-Otomasyonu-v2.0.git
   cd Stok-Takip-Otomasyonu-v2.0
   ```

2. **Bağımlılıkları Kurun**:
   ```bash
   npm install
   ```

3. **Çevre Değişkenlerini Ayarlayın**:
   `.env.example` dosyasını `.env` olarak kopyalayın ve kendi Supabase bilgilerinizi girin.
   ```bash
   cp .env.example .env
   ```

4. **Veritabanı Şeması**:
   `supabase/migrations/full_production_schema.sql` dosyasını Supabase SQL Editor üzerinden çalıştırın.

5. **Uygulamayı Başlatın**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Mimari Yapı

Proje **Solid** prensiplerine ve **Service Pattern** yapısına uygun olarak geliştirilmiştir:
- `src/services`: İş mantığının ve veritabanı erişiminin soyutlandığı katman.
- `src/context`: Kimlik doğrulama ve ana veri yönetimi için global state yönetimi.
- `src/layout`: Dinamik sidebar ve navigasyon yapısı.

---

## 🔐 Güvenlik Uyarıları
- Bu proje **Supabase RLS** politikaları ile korunmaktadır.
- `.env` dosyanızı asla GitHub'a yüklemeyin ( `.gitignore` dosyası bu projede hazır olarak gelmektedir).

---

## 📄 Lisans
Bu proje özel mülkiyet niteliğindedir. İzinsiz kopyalanamaz ve dağıtılamaz.
