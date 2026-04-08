import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

/**
 * .env dosyalarından aldığı argümanlarla güvenli (Typed) bir Supabase instance'ı oluşturur.
 * (Vite ve Next.js'in Env standartlarına uygun fallback'li)
 */
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase/Environment configuration is missing or incomplete!');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
