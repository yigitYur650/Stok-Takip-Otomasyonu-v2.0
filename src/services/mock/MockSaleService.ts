import { ISaleService } from '../interfaces/IServices';
import { db, OfflineSale } from '../../lib/dexie';

export class MockSaleService implements ISaleService {
  async processSale(salePayload: Omit<OfflineSale, 'id' | 'created_at'> & {
    items: Omit<OfflineSale['items'][0], 'id'>[],
    payments: Omit<OfflineSale['payments'][0], 'id' | 'created_at'>[]
  }): Promise<OfflineSale> {
    
    const id = window.crypto.randomUUID();
    const created_at = new Date().toISOString();

    const finalizedPayload: OfflineSale = {
      ...salePayload,
      id,
      created_at,
      items: salePayload.items.map(item => ({...item, id: window.crypto.randomUUID()})),
      payments: salePayload.payments.map(payment => ({...payment, id: window.crypto.randomUUID(), created_at: new Date().toISOString()}))
    };

    // Just save to offline DB for Sandbox, skip syncing
    await db.sales_offline.add(finalizedPayload);
    
    return finalizedPayload;
  }

  async syncPendingSales(): Promise<void> {
    console.log('[MockSaleService] Synchronized sales in Sandbox mode.');
  }
}
