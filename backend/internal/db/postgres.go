package db

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPostgresPool() (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
	if err != nil {
		return nil, err
	}

	// Supabase ücretsiz paket sınırlarını (genelde 60) zorlamamak için güvenli bir sınır.
	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnIdleTime = 5 * time.Minute

	return pgxpool.NewWithConfig(context.Background(), config)
}

// BulkInsertSalesAndMovements, sales ve stock_movements tablolarına toplu yazma yapar.
func BulkInsertSalesAndMovements(ctx context.Context, pool *pgxpool.Pool, sales []interface{}, movements []interface{}) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Sales Bulk Insert (pgx.CopyFrom)
	// sales slice'ını rows'a çevir
	var salesRows [][]interface{}
	for _, s := range sales {
		m := s.(map[string]interface{})
		salesRows = append(salesRows, []interface{}{
			m["id"], m["shop_id"], m["total_amount"], m["discount_amount"], 
			m["status"], m["created_at"], m["version"], m["request_id"],
		})
	}

	_, err = tx.CopyFrom(
		ctx,
		pgx.Identifier{"sales"},
		[]string{"id", "shop_id", "total_amount", "discount_amount", "status", "created_at", "version", "request_id"},
		pgx.CopyFromRows(salesRows),
	)
	if err != nil {
		return fmt.Errorf("sales copyfrom error: %v", err)
	}

	// 2. Stock Movements Bulk Insert
	var moveRows [][]interface{}
	for _, mv := range movements {
		m := mv.(map[string]interface{})
		moveRows = append(moveRows, []interface{}{
			m["id"], m["shop_id"], m["variant_id"], m["quantity"], 
			m["type"], m["reason"], m["created_at"], m["version"], m["request_id"],
		})
	}

	_, err = tx.CopyFrom(
		ctx,
		pgx.Identifier{"stock_movements"},
		[]string{"id", "shop_id", "variant_id", "quantity", "type", "reason", "created_at", "version", "request_id"},
		pgx.CopyFromRows(moveRows),
	)
	if err != nil {
		return fmt.Errorf("movements copyfrom error: %v", err)
	}

	return tx.Commit(ctx)
}

// SaveToDLQ, hatalı paketleri DLQ tablosuna kaydeder.
func SaveToDLQ(ctx context.Context, pool *pgxpool.Pool, payload interface{}, errMsg string) error {
	payloadJSON, _ := json.Marshal(payload)
	_, err := pool.Exec(ctx, 
		"INSERT INTO failed_syncs (payload, error_message) VALUES ($1, $2)", 
		payloadJSON, errMsg,
	)
	return err
}
