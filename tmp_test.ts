import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './src/types/database.types';

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export async function test(supabase: SupabaseClient<Database>) {
  const payload: CategoryInsert = {
    name: 'test',
    shop_id: 'test-shop'
  };
  
  return await supabase
    .from('categories')
    .insert(payload);
}
