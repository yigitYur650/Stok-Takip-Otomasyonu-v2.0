import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { ICategoryService } from './interfaces/IServices';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export class CategoryService implements ICategoryService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Tüm kategorileri getirir (RLS sayesinde sadece ilgili mağazanınkiler gelir).
   */
  async getAllCategories(): Promise<CategoryRow[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  }

  /**
   * Yeni bir kategori oluşturur.
   */
  async createCategory(category: CategoryInsert): Promise<CategoryRow> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert(category as any)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Kategoriyi günceller.
   */
  async updateCategory(id: string, category: CategoryUpdate): Promise<CategoryRow> {
    const { data, error } = await this.supabase
      .from('categories')
      // @ts-ignore
      .update(category as any)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Kategoriyi siler.
   */
  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
}
