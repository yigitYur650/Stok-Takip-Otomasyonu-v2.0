package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"runtime"
	"strings"
	"time"

	"backend/internal/db"
	"github.com/ansrivas/fiberprometheus/v2"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

type BatchRequest struct {
	Items []SyncItem `json:"items"`
}

type SyncItem struct {
	Table     string                 `json:"table"`
	Action    string                 `json:"action"`
	Payload   map[string]interface{} `json:"payload"`
	RequestID string                 `json:"request_id"`
}

// Custom Prometheus Metrikleri
var (
	dbConnectionsGauge = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "erp_db_connections_active",
		Help: "Aktif veritabanı bağlantı sayısı",
	})
	dlqCountGauge = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "erp_dlq_failed_syncs_total",
		Help: "DLQ (failed_syncs) tablosunda bekleyen kayıt sayısı",
	})
)

func main() {
	godotenv.Load()

	// 1. Veritabanı Bağlantıları
	pool, err := db.NewPostgresPool()
	if err != nil {
		log.Fatal("DB Pool Error:", err)
	}
	defer pool.Close()

	redisCli := db.NewRedisClient()

	// 2. Worker Pool & DLQ Retry
	batchQueue := make(chan []SyncItem, 500)
	for i := 0; i < runtime.NumCPU()*2; i++ {
		go worker(i, pool, batchQueue)
	}
	go startRetryWorker(pool, batchQueue)

	// Metrikleri periyodik güncelleme
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		for range ticker.C {
			stats := pool.Stat()
			dbConnectionsGauge.Set(float64(stats.TotalConns()))

			var count int
			_ = pool.QueryRow(context.Background(), "SELECT count(*) FROM failed_syncs").Scan(&count)
			dlqCountGauge.Set(float64(count))
		}
	}()

	// 3. Fiber Framework Setup
	app := fiber.New(fiber.Config{
		AppName: "Textile ERP Batch Ingest API",
	})
	app.Use(logger.New())

	// Prometheus Middleware Entegrasyonu
	prometheusHandler := fiberprometheus.New("textile-erp-backend")
	
	// Senior Security: /metrics endpoint'ini koruma altına al
	app.Use("/metrics", func(c *fiber.Ctx) error {
		// Basit bir Token kontrolü (Gerçek senaryoda IP kısıtlaması da eklenebilir)
		token := c.Get("X-Metrics-Token")
		expectedToken := os.Getenv("METRICS_TOKEN")
		if expectedToken != "" && token != expectedToken {
			return c.Status(403).JSON(fiber.Map{"error": "Unauthorized metrics access"})
		}
		return c.Next()
	})
	
	prometheusHandler.RegisterAt(app, "/metrics")
	app.Use(prometheusHandler.Middleware)

	app.Post("/api/v1/sync/batch", func(c *fiber.Ctx) error {
		var req BatchRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON payload"})
		}

		validItems := make([]SyncItem, 0, len(req.Items))
		for _, item := range req.Items {
			key := "idempotency:" + item.RequestID
			ok, err := redisCli.SetNX(context.Background(), key, "processing", 24*time.Hour).Result()
			if err == nil && ok {
				validItems = append(validItems, item)
			}
		}

		if len(validItems) == 0 {
			return c.Status(200).JSON(fiber.Map{"message": "Already processed"})
		}

		select {
		case batchQueue <- validItems:
			return c.Status(202).JSON(fiber.Map{"status": "accepted", "count": len(validItems)})
		default:
			return c.Status(503).JSON(fiber.Map{"error": "Server busy"})
		}
	})

	log.Fatal(app.Listen(":3001"))
}

func worker(id int, pool *pgxpool.Pool, queue <-chan []SyncItem) {
	for batch := range queue {
		var sales []interface{}
		var movements []interface{}

		for _, item := range batch {
			if item.Table == "sales" {
				sales = append(sales, item.Payload)
			} else if item.Table == "stock_movements" {
				movements = append(movements, item.Payload)
			}
		}

		if len(sales) > 0 || len(movements) > 0 {
			err := db.BulkInsertSalesAndMovements(context.Background(), pool, sales, movements)
			if err != nil {
				if !strings.Contains(err.Error(), "P0001") && !strings.Contains(err.Error(), "Conflict") {
					db.SaveToDLQ(context.Background(), pool, batch, err.Error())
				}
			}
		}
	}
}

func startRetryWorker(pool *pgxpool.Pool, queue chan<- []SyncItem) {
	ticker := time.NewTicker(5 * time.Second)
	for range ticker.C {
		rows, err := pool.Query(context.Background(), "SELECT id, payload FROM failed_syncs WHERE retry_count < 5 LIMIT 10")
		if err != nil {
			continue
		}

		for rows.Next() {
			var id int
			var payloadJSON []byte
			if err := rows.Scan(&id, &payloadJSON); err == nil {
				var batch []SyncItem
				if err := json.Unmarshal(payloadJSON, &batch); err == nil {
					queue <- batch
					pool.Exec(context.Background(), "UPDATE failed_syncs SET retry_count = retry_count + 1 WHERE id = $1", id)
				}
			}
		}
		rows.Close()
	}
}
