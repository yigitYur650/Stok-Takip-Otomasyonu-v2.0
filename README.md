# 🚀 Enterprise B2B SaaS: Stok & Satış Otomasyonu (Offline-First)

Bu proje, yüksek işlem hacmine (high-throughput) sahip, çevrimdışı çalışabilen (offline-first) ve veri kaybını sıfıra indiren kurumsal seviye bir B2B SaaS (Stok ve Satış Takip) platformunun çekirdeğidir.

Modern sistem tasarımı prensipleri (Clean Architecture, SOLID, Service Pattern) gözetilerek, dar boğazları (bottleneck) aşmak üzere **Backend for Frontend (BFF)** mimarisiyle inşa edilmiştir.

## 🏗️ Mimari Tasarım (High-Level Design)

Sistem, Supabase'in doğrudan dışa açık yapısının getireceği bağlantı (connection) darboğazlarını önlemek amacıyla **Go tabanlı yüksek performanslı bir API katmanı** ile korunmaktadır.

1. **Frontend (React/TypeScript):** İnternet kopsa dahi çalışmaya devam eder. Satışlar yerel `Dexie.js` veritabanında (`sync_queue`) sıraya alınır.
2. **BFF Katmanı (Go & Fiber):** Frontend'den gelen bulk (toplu) verileri karşılar.
3. **Idempotency Katmanı (Redis):** Her işlemin eşsiz bir `request_id`'si vardır. Ağ gecikmelerinde veya mükerrer tıklamalarda veritabanına çift kayıt atılmasını önler.
4. **Veritabanı Katmanı (PostgreSQL / pgxpool):** Go üzerinden `pgx.CopyFrom` kullanılarak saniyede binlerce kayıt tek bir I/O işlemiyle (bulk insert) işlenir. 25 bağlantılık sınırla bile devasa yükler eritilir.
5. **Hata Toleransı (Dead Letter Queue - DLQ):** Veritabanında kilitlenme (lock) veya bağlantı sorunu olursa, işlenemeyen veriler `failed_syncs` tablosuna aktarılır ve asenkron worker'lar tarafından otomatik olarak yeniden denenir.

## 🛠️ Teknoloji Yığını (Tech Stack)

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Dexie.js (Offline Storage).
*   **Backend:** Go 1.25, Fiber (Web Framework), pgx/v5 (Postgres Driver), go-redis.
*   **Veritabanı:** PostgreSQL (Supabase), Redis.
*   **Test & CI/CD:** Vitest (Unit), Playwright (E2E), k6 (Load/Stress), GitHub Actions.

---

## 📊 Performans ve Test Sonuçları

Projenin dayanıklılığı uçtan uca, hem CI/CD ortamında hem de yerel testlerde kanıtlanmıştır:

### 1. Yük Testi (k6 Load & Stress Test)
*   **Simülasyon:** 5.000 Eşzamanlı Sanal Kullanıcı (VU)
*   **Toplam İşlem:** ~600.000 bulk sync isteği.
*   **Başarı Oranı:** `%100` (Sıfır Hata, Sıfır 503 Backpressure)
*   **Gecikme (Latency):** p(95) < 200ms
*   **Sonuç:** Sadece 25 bağlantılık DB havuzuyla, Go'nun asenkron yapısı sayesinde sistem kuyruk taşırmadan saniyede binlerce veriyi başarılı bir şekilde işledi.

### 2. Çevrimdışı Dayanıklılık (Playwright E2E)
*   **Senaryo:** Kullanıcı işlem yaparken internet bağlantısının kesilmesi ve geri gelmesi simüle edildi.
*   **Sonuç:** `1 PASSED`. Ağ isteği başarısız olduğunda sistem veriyi Dexie.js üzerinde `PENDING` durumuna çekti. İnternet geri geldiğinde arka plan (background) senkronizasyonu devreye girerek veriyi Go API'ye sıfır kayıpla aktardı.

### 3. CI/CD (GitHub Actions & Vitest)
*   **Unit Tests:** 23/23 Vitest senaryosu başarılı.
*   **Pipeline:** CI ortamında Redis ve PostgreSQL şema uyumluluğu doğrulanarak CI/CD süreçlerinden tam otomasyonla geçildi.

---

## 💻 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda ayağa kaldırmak için aşağıdaki adımları izleyin.

### 1. Ön Koşullar
*   Node.js (v20+)
*   Go (v1.25+)
*   Redis (Yerel veya Docker üzerinde çalışır durumda)
*   PostgreSQL (Supabase veya yerel)

### 2. Çevresel Değişkenler (.env)
Projeyi başlatmadan önce ilgili klasörlerdeki `.env` dosyalarını oluşturun.

**`/backend/.env` İçeriği:**
```env
# Doğrudan DB bağlantısı (pgBouncer/Pooler değil, doğrudan DSN)
DATABASE_URL=postgresql://postgres:SIFRE@db.PROJE_ID.supabase.co:5432/postgres
# Idempotency için Redis bağlantısı
REDIS_URL=redis://localhost:6379
# Prometheus metriklerini koruyan güvenlik anahtarı
METRICS_TOKEN=sizin_guvenli_token_degeriniz
/.env (Frontend) İçeriği:

Kod snippet'i
VITE_SUPABASE_URL=https://PROJE_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sizin_anon_key_degeriniz
VITE_GO_API_URL=http://localhost:3001
3. Servisleri Başlatma
Adım 1: Go Backend'i Başlatın

Bash
cd backend
go mod tidy
go run main.go
# Sunucu port 3001 üzerinde dinlemeye başlayacaktır.
Adım 2: Frontend'i Başlatın

Bash
npm install
npm run dev
# Frontend port 5173 (veya Vite'ın atadığı port) üzerinde başlayacaktır.
📈 İzleme ve Metrikler (Observability)
Go API, iç durumunu izleyebilmeniz için Prometheus uyumlu metrikler sunar. Terminalinizden aşağıdaki komutla "huni (funnel)" doluluğunu ve DB bağlantılarını canlı izleyebilirsiniz:

Bash
curl -H "X-Metrics-Token: sizin_guvenli_token_degeriniz" http://localhost:3001/metrics
Takip edilebilecek özel metrikler: erp_db_connections_active, erp_dlq_failed_syncs_total."

