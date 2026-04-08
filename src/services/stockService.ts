import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { IStockService } from './interfaces/IServices';

type StockMovementInsert = Database['public']['Tables']['stock_movements']['Insert'];

export class StockService implements IStockService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Yeni bir stok hareketi ekler. (Direct Supabase)
   * KESİNLİKLE parseInt(..., 10) cast işlemi uygulanmıştır (DB Integer uyumluluğu için).
   */
  async addStockMovement(movement: any) {
    // Veritabanı Integer beklediği için strict-casting uygulanıyor
    const payload = {
      variant_id: movement.variant_id,
      shop_id: movement.shop_id,
      user_email: movement.user_email,
      type: movement.type.toUpperCase(), // KESİNLİKLE büyük harf
      quantity: parseInt(movement.quantity, 10),
      previous_stock: parseInt(movement.previous_stock, 10),
      new_stock: parseInt(movement.new_stock, 10)
    };

    // DEBUG: Payload Reveal
    console.log("Stock Payload:", JSON.stringify(payload, null, 2));

    const { data, error } = await this.supabase
      .from('stock_movements')
      .insert(payload as any)
      .select()
      .single();

    if (error) {
      console.error("STOK HAREKET HATASI:", error.message, error.details, error.hint);
      throw error;
    }

    return data;
  }

  /**
   * Belirli bir varyantın stok hareket geçmişini çeker.
   */
  async getMovementHistory(variantId: string) {
    const { data, error } = await this.supabase
      .from('stock_movements')
      .select(`
        id,
        type,
        quantity,
        reason,
        created_at,
        user_email,
        previous_stock,
        new_stock,
        variant_id
      `)
      .eq('variant_id', variantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("StockService - Get History Error:", error);
      throw error;
    }

    return data;
  }
}
