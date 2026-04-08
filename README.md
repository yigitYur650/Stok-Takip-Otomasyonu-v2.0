# SaaS Textile ERP (Muhasebe & Stok Takip)

Bu proje, tekstil sektörüne yönelik modern, ölçeklenebilir ve profesyonel bir SaaS ("Software as a Service") çözümüdür. Katmanlı mimari (Clean Architecture), "Offline-first" yaklaşımı ve kapsamlı Multi-tenancy desteği barındırmaktadır.

## Mimarisi ve Teknoloji Yığını

- **Veritabanı ve Auth**: Supabase (PostgreSQL), Supabase Auth.
- **Tip Güvenliği**: TypeScript (Uçtan uça `database.types.ts` ile %100 Typed).
- **Offline-First Storage**: Dexie.js (IndexedDB).
- **Backend Lock / Atomicity**: PostgreSQL RPC (Remote Procedure Call), PL/pgSQL Triggers & Functions.
- **Tasarım Kalıpları**: Service Pattern, SOLID Prensibi.

## Çekirdek Özellikler

### 1. Multi-Tenant (Çok Kiracılı) Yapı ve RLS
Her müşteri (şirket) kendi `shop_id` değerine sahiptir. Supabase üzerinde etkinleştirilen güçlü **Row Level Security (RLS)** politikaları sayesinde, her mağaza yetkilisi sadece kendi mağazasının ürününü, stoklarını ve raporlarını görebilir. Güvenlik ve veri izolasyonu PostgreSQL sunucusu katmanında (veritabanının kendisinde) sağlanır.

### 2. Kesintisiz Deneyim: Offline-First
Ağ kopukluklarına karşı (Sahada, fuarlarda veya yavaş internet ortamlarında) sistem hiçbir zaman durmaz:
- Tüm işlemler (Satış, Stok Ekleme) IndexedDB (Dexie) kullanılarak **optimistic (peşinen)** yerelde (UUID'ler atanarak) tamamlanır ve arayüze anında yansır.
- İnternet yoksa, istekler arkaplanda "Sync Queue (Senkronizasyon Kuyruğu)" olarak tutulur. 
- Cihaz online (internete bağlı) olduğu an tetiklenen *Sync Engine Hook* kuyruktaki işlemleri sırayla Supabase üzerine (Atomic RPC'lerle) aktarır.

### 3. Otomatik Stok Düşüşü (Event-Driven Triggers)
Ürün stok takibinde insan hatası faktörünü kaldırdık:
Bir satış tamamlandığında (`sale_items` tablosuna INSERT yapıldığnda), PostgreSQL içerisindeki `after insert` trigger kendi kendine `stock_movements` tablosuna bir 'OUT' (Stok Çıkışı) hareketi yazar. O da ilgili varyantın `stock_quantity` alanını otomatik günceller.
(Ayrıca `stock_quantity` alanına manuel müdahaleyi reddeden özel bir `pg_trigger_depth` koruması da kullanılmıştır.)

### 4. Analytic Views (Sanal Tablolar)
Çok yüksek işlem veya okuma hacminde Frontend'in donmaması adına; **Günlük Kar/Zarar Özeti**, **Çok Satanlar** ve **Kritik Stoklar** sorguları doğrudan SQL `VIEW` mimarisi kullanarak tek satır veri gibi alınmaktadır. `analyticsService.ts` üzerinden n8n Webhook gibi dış entegrasyonlar tetiklenebilir.

## Kurulum ve Başlangıç

1. Kod tabanını klonlayın.
2. `supabase/migrations/` içindeki 5 SQL dosyasını kendi Supabase Studio konsolunuzdan uygulayarak veritabanı haritasını çıkartın.
3. `.env.example` dosyasını kullanarak `.env` (veya `.env.local`) oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ey..."
```
4. Gerekli kütüphaneleri (Dexie, UUID, Supabase-js, React vb.) kurun:
```bash
npm install
npm run dev
```

## Ölçeklenebilirlik (Scalability)
Bu mimari **binlerce şirket (tenant) ve on binlerce ürünü** aynı anda kusursuz çalıştırabilir.
- Join ve aggregations işlemleri Frontend veya Backend Node.JS sunucusunda değil, doğrudan C ile çalıştırılan güçlü PostgreSQL mantığında hesaplanır.
- I/O bekleme süresine karşı "Offline Dexie Queue" sayesinde satıcıların sistemi beklemesine gerek yoktur.
