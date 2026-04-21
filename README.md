Türkçe
🚀 Proje Hakkında
Bu proje, modern işletmelerin envanter, satış ve stok hareketlerini gerçek zamanlı olarak takip etmeleri için tasarlanmış, Clean Architecture prensiplerine dayalı, bulut tabanlı bir otomasyon sistemidir. Yüksek güvenlik standartları ve çoklu dil desteği ile global kullanıma uygun bir SaaS altyapısı sunar.

✨ Temel Özellikler
🌍 Tam Yerelleştirme (i18n): Türkçe, İngilizce, Almanca, Fransızca ve İspanyolca dillerinde tam destek. Tarayıcı dilini otomatik algılama.

📊 Gelişmiş Analitik: Recharts tabanlı satış trendleri, en çok satan ürünler ve gelir grafiklerini içeren kapsamlı dashboard.

🔐 Üst Düzey Güvenlik: Supabase Role-Based Access Control (RBAC) ve Row Level Security (RLS) ile veritabanı seviyesinde izolasyon.

🏢 Mimari Yapı: Service Factory pattern ve interface tabanlı bağımlılık yönetimi sayesinde test edilebilir ve sürdürülebilir kod yapısı.

📦 Envanter Yönetimi: Ürün, kategori ve dinamik stok kritik seviye takibi.

📄 PDF Raporlama: Satışların ve stok durumlarının profesyonel PDF çıktıları.

📱 Responsive Tasarım: Tailwind CSS ve Headless UI ile tüm cihazlarda kusursuz deneyim.

🛡️ Veri Bütünlüğü: PostgreSQL Trigger'ları ve Check Constraint'ler sayesinde negatif stok oluşumu veritabanı seviyesinde engellenir.

💾 Çevrimdışı Destek: Dexie.js entegrasyonu ile bağlantı sorunlarında veri kaybını önleyen yerel veritabanı altyapısı.

🛠 Teknolojiler
Frontend: React 18, TypeScript, Vite

Backend & DB: Supabase (PostgreSQL, Auth, Realtime)

Styling: Tailwind CSS, Framer Motion

State & Logic: TanStack Query, i18next

Raporlama: jsPDF, Recharts

⚙️ Kurulum
Depoyu klonlayın: git clone https://github.com/yigityur650/stok-takip-otomasyonu-v2.0.git

Bağımlılıkları yükleyin: npm install

.env.example dosyasını .env olarak adlandırın ve Supabase bilgilerinizi girin.

Geliştirme modunda başlatın: npm run dev

English
🚀 About the Project
This project is a cloud-based automation system designed for modern businesses to track inventory, sales, and stock movements in real-time. Built on Clean Architecture principles, it offers a SaaS-ready infrastructure with high security standards and multi-language support.

✨ Key Features
🌍 Full Localization (i18n): Complete support for Turkish, English, German, French, and Spanish. Automatic browser language detection.

📊 Advanced Analytics: Comprehensive dashboard with Recharts-based sales trends, top-selling products, and revenue charts.

🔐 Top-Tier Security: Database-level isolation via Supabase Role-Based Access Control (RBAC) and Row Level Security (RLS).

🏢 Architectural Design: Testable and sustainable code structure using Service Factory pattern and interface-based dependency management.

📦 Inventory Management: Product, category, and dynamic stock critical level tracking.

📄 PDF Reporting: Professional PDF exports for sales and stock status.

📱 Responsive Design: Seamless experience across all devices with Tailwind CSS and Headless UI.

🛡️ Data Integrity: Negative stock levels are prevented at the database level using PostgreSQL Triggers and Check Constraints.

💾 Offline Readiness: Local database infrastructure via Dexie.js to prevent data loss during connectivity issues.

🛠 Tech Stack
Frontend: React 18, TypeScript, Vite

Backend & DB: Supabase (PostgreSQL, Auth, Realtime)

Styling: Tailwind CSS, Framer Motion

State & Logic: TanStack Query, i18next

Reporting: jsPDF, Recharts

⚙️ Installation
Clone the repository: git clone https://github.com/yigityur650/stok-takip-otomasyonu-v2.0.git

Install dependencies: npm install

Rename .env.example to .env and fill in your Supabase credentials.

Run in development mode: npm run dev

📄 License
This project is licensed under the MIT License.
