import { IStockService } from '../interfaces/IServices';
import { db, StockMovementInsert } from '../../lib/dexie';

export class MockStockService implements IStockService {
  async addStockMovement(movement: Omit<StockMovementInsert, 'id'>) {
    const id = window.crypto.randomUUID();
    const created_at = new Date().toISOString();
    
    const offlineRecord = { ...movement, id, created_at };
    await db.stock_movements_offline.add(offlineRecord);

    // In sandbox, we just pretend it syncs successfully, no Supabase call.
    return offlineRecord;
  }

  async syncPendingOperations(): Promise<void> {
    // Sandbox mode: Clear pending if any exist (no-op since we don't queue them to sync_queue here)
    console.log('[MockStockService] Synchronized operations in Sandbox mode.');
  }
}
