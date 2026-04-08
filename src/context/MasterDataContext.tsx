import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface MasterDataContextType {
  categories: any[];
  colors: any[];
  sizes: any[];
  loading: boolean;
  refreshMasterData: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMasterData = useCallback(async () => {
    if (!profile?.shop_id) return;
    
    try {
      setLoading(true);
      const [cats, cols, szs] = await Promise.all([
        supabase.from('categories').select('*').eq('shop_id', profile.shop_id).order('name'),
        supabase.from('colors').select('*').eq('shop_id', profile.shop_id).order('name'),
        supabase.from('sizes').select('*').eq('shop_id', profile.shop_id).order('name')
      ]);

      if (cats.data) setCategories(cats.data);
      if (cols.data) setColors(cols.data);
      if (szs.data) setSizes(szs.data);
    } catch (err) {
      console.error("Master Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.shop_id]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  return (
    <MasterDataContext.Provider value={{ 
      categories, colors, sizes, loading, 
      refreshMasterData: fetchMasterData 
    }}>
      {children}
    </MasterDataContext.Provider>
  );
}

export function useMasterData() {
  const context = useContext(MasterDataContext);
  if (context === undefined) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
}
