import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { ISaleService } from './interfaces/IServices';

export class SaleService implements ISaleService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Atomik olarak bir satış işlemi kurgular. (Direct Supabase RPC)
   */
  async processSale(salePayload: any): Promise<any> {
    
    const id = window.crypto.randomUUID();
    const created_at = new Date().toISOString();

    const finalizedPayload = {
      ...salePayload,
      id,
      created_at,
      user_email: salePayload.user_email || 'Bilinmeyen',
      customer_note: salePayload.customer_note || '',
      payment_type: salePayload.payment_method === 'CASH' ? 'CASH' : 'CARD', 
      discount_amount: salePayload.discount_amount || 0, // Eksik olan alan eklendi
      items: salePayload.items.map((item: any) => ({
        ...item, 
        id: window.crypto.randomUUID()
      })),
      payments: (salePayload.payments || []).map((p: any) => ({
        ...p, 
        id: window.crypto.randomUUID(), 
        created_at: new Date().toISOString()
      }))
    };

    // --- ÜRETİM ORTAMI SERVİS YAPILANDIRMASI ---
    // Sistem genelinde Mock servis kullanımı durdurulmuş, tamamen Supabase'e geçilmiştir.

    // @ts-ignore
    const { data, error } = await this.supabase.rpc('process_sale', {
      payload: finalizedPayload as any
    });

    if (error) {
      console.error("SaleService - processSale Error:", error);
      throw error;
    }

    return finalizedPayload;
  }

  /**
   * Bugün yapılan satışları, kalemleriyle birlikte getirir.
   */
  async getTodaySales(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await this.supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          product_variants (
            *,
            products (name)
          )
        )
      `)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Bugünün özet verisini (Ciro ve Ödeme Tipi Dağılımı) hesaplar.
   */
  async getTodaySummary(): Promise<any> {
    const sales = await this.getTodaySales();
    
    const summary = {
      totalRevenue: 0,
      cash: 0,
      card: 0,
      mailOrder: 0,
      unspecified: 0,
      count: sales.length
    };

    sales.forEach(sale => {
      const amount = Number(sale.total_amount) || 0;
      summary.totalRevenue += amount;

      switch(sale.payment_method) {
        case 'CASH': summary.cash += amount; break;
        case 'CREDIT_CARD': summary.card += amount; break;
        case 'MAIL_ORDER': summary.mailOrder += amount; break;
        default: summary.unspecified += amount; break;
      }
    });

    return summary;
  }

  /**
   * Bir satış kalemini iade alır. (Stok artırımı + İade kaydı)
   */
  async processReturn(returnPayload: any): Promise<any> {
    // @ts-ignore
    const { data, error } = await this.supabase.rpc('process_return', {
      payload: returnPayload
    });

    if (error) {
      console.error("SaleService - processReturn Error:", error);
      throw error;
    }
    return data;
  }

  /**
   * Bir satışa ait tüm iadeleri çeker.
   */
  async getReturnsBySale(saleId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('returns')
      .select('*')
      .eq('sale_id', saleId);
    
    if (error) throw error;
    return data;
  }
}
