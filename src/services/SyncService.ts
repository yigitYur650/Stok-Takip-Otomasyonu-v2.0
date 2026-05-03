import { db } from '../lib/db';
import { supabase } from '../lib/supabaseClient';

/**
 * Soyut senkronizasyon sağlayıcısı. 
 * İleride Go Backend'e geçişte bu arayüzü implemente eden yeni bir sınıf yazılması yeterlidir.
 */
export interface ISyncProvider {
  processBatch(items: any[]): Promise<{ success: boolean; results: any[] }>;
}

export class SupabaseSyncProvider implements ISyncProvider {
  async processBatch(items: any[]): Promise<{ success: boolean; results: any[] }> {
    const results = [];
    for (const item of items) {
      try {
        let error = null;
        if (item.table === 'sales' && item.action === 'INSERT') {
          const { error: rpcError } = await supabase.rpc('process_sale', { 
            payload: { ...item.payload, request_id: item.request_id } 
          });
          error = rpcError;
        } else {
          const { error: insertError } = await supabase
            .from(item.table as any)
            .upsert({ ...item.payload, request_id: item.request_id });
          error = insertError;
        }

        if (error) throw error;
        results.push({ queueId: item.id, status: 'success' });
      } catch (error: any) {
        results.push({ queueId: item.id, status: 'error', error });
      }
    }
    return { success: true, results };
  }
}

class SyncService {
  private isProcessing = false;
  private provider: ISyncProvider;

  constructor(provider: ISyncProvider) {
    this.provider = provider;
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }
  }

  /**
   * Kuyruğu paketler (batch) halinde eritir. 
   * 50K eşzamanlı kullanıcı hedefi için tek tek değil, toplu işleme odaklıdır.
   */
  async processQueue() {
    if (this.isProcessing || !navigator.onLine) return;
    this.isProcessing = true;

    try {
      const batchSize = 20;
      const pendingItems = await db.sync_queue
        .where('status')
        .equals('PENDING')
        .limit(batchSize)
        .toArray();

      if (pendingItems.length === 0) return;

      // İşleniyor olarak işaretle
      const ids = pendingItems.map(i => i.id!);
      await db.sync_queue.where('id').anyOf(ids).modify({ status: 'SYNCING' });

      const batchResult = await this.provider.processBatch(pendingItems);

      for (const res of batchResult.results) {
        if (res.status === 'success') {
          await db.sync_queue.delete(res.queueId);
        } else {
          // Hata Yönetimi ve Rollback
          const error = res.error;
          // P0001: Custom SQL Error Code for Version Mismatch (Conflict)
          if (error.code === 'P0001' || error.message?.includes('Conflict')) {
            await this.handleRollback(res.queueId);
          } else if (error.code === '23505') { // Idempotency: Unique violation (already synced)
            await db.sync_queue.delete(res.queueId);
          } else {
            await db.sync_queue.update(res.queueId, { status: 'ERROR' });
          }
        }
      }

      // Kuyrukta daha fazla öğe varsa devam et
      if (pendingItems.length === batchSize) {
        this.processQueue();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Conflict durumunda Dexie üzerindeki veriyi geri alır (Rollback).
   */
  private async handleRollback(queueId: number) {
    const item = await db.sync_queue.get(queueId);
    if (!item) return;

    try {
      if (item.table === 'sales') {
        await db.sales.delete(item.payload.id);
      } else if (item.table === 'products') {
        await db.products.delete(item.payload.id);
      }
      
      await db.sync_queue.delete(queueId);

      // UI'a uyarı gönder (Event Bus mantığı)
      window.dispatchEvent(new CustomEvent('sync_rollback', { 
        detail: { 
          table: item.table, 
          message: 'Veri güncel değil, lütfen sayfayı yenileyin.' 
        } 
      }));
    } catch (err) {
      console.error("Rollback Error:", err);
    }
  }

  /**
   * Yeni bir işlemi kuyruğa ekler.
   */
  async enqueue(table: string, action: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) {
    await db.sync_queue.add({
      table,
      action,
      payload,
      request_id: payload.request_id || window.crypto.randomUUID(),
      status: 'PENDING',
      created_at: new Date().toISOString()
    });
    
    if (navigator.onLine) {
      this.processQueue();
    }
  }
}

export const syncService = new SyncService(new SupabaseSyncProvider());
