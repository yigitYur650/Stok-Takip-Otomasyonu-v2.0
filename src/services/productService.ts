import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { IProductService } from './interfaces/IServices';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type VariantInsert = Database['public']['Tables']['product_variants']['Insert'];
type VariantUpdate = Database['public']['Tables']['product_variants']['Update'];

export class ProductService implements IProductService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Ürünleri ve onlara bağlı varyantları (ve kategori bilgilerini) getirir. (Deep Join)
   */
  async getProductsWithVariants() {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        product_variants (*, colors(name), sizes(name)),
        categories (id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Sadece ürünleri ve ilgili kategori bilgilerini getirir.
   */
  async getProducts(): Promise<ProductRow[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }

  /**
   * Yeni bir ürün oluşturur.
   */
  async createProduct(product: ProductInsert): Promise<ProductRow> {
    const { data, error } = await this.supabase
      .from('products')
      .insert(product as any)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Ürünü günceller.
   */
  async updateProduct(id: string, product: ProductUpdate): Promise<ProductRow> {
    const { data, error } = await this.supabase
      .from('products')
      // @ts-ignore
      .update(product as any)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Ürünü siler. Bağlı varyantlar da ON DELETE CASCADE ile silinecektir.
   */
  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }

  // --- VARIANT METOTLARI ---

  /**
   * Belirli bir ürüne ait varyantları getirir.
   */
  async getProductVariants(productId: string): Promise<VariantRow[]> {
    const { data, error } = await this.supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId);

    if (error) throw error;
    return data;
  }

  /**
   * Yeni bir ürün varyantı oluşturur.
   */
  async createVariant(variant: VariantInsert): Promise<VariantRow> {
    const { data, error } = await this.supabase
      .from('product_variants')
      .insert(variant as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Varyant bilgisini günceller.
   */
  async updateVariant(id: string, variant: VariantUpdate): Promise<VariantRow> {
    const { data, error } = await this.supabase
      .from('product_variants')
      // @ts-ignore
      .update(variant as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Varyantı siler.
   */
  async deleteVariant(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('product_variants')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async smartSearch(query: string): Promise<any[]> {
    const products = await this.getProductsWithVariants();
    if (!query) return products;
    const lq = query.toLowerCase();
    
    return products.filter((p: any) => 
      p.name?.toLowerCase().includes(lq) || 
      p.categories?.name?.toLowerCase().includes(lq) ||
      p.product_variants?.some((v: any) => 
        v.colors?.name?.toLowerCase().includes(lq) || 
        v.sizes?.name?.toLowerCase().includes(lq) ||
        v.sku?.toLowerCase().includes(lq)
      )
    );
  }
}
