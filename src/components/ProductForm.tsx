import React, { useState, useEffect } from 'react';
import { useServices } from './ServiceProvider';
import { useRefresh } from './RefreshContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Package, History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useMasterData } from '../context/MasterDataContext';

interface ProductFormProps {
  onClose: () => void;
  initialData?: any; // Düzenleme için gelen ürün verisi
}

export function ProductForm({ onClose, initialData }: ProductFormProps) {
  const { productService } = useServices();
  const { triggerRefresh } = useRefresh();
  const { profile } = useAuth();
  const { categories, colors, sizes } = useMasterData();
  const [loading, setLoading] = useState(false);
  
  // Ana Ürün State
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  
  // Varyant State (Array)
  const [variants, setVariants] = useState<any[]>([]);

  // initialData Senkronizasyonu (Edit/New Modu Geçişi)
  useEffect(() => {
    if (initialData) {
      // DÜZENLEME MODU (Edit)
      setCategoryId(initialData.category_id || '');
      setDescription(initialData.description || '');
      
      const mappedVariants = initialData.product_variants?.map((v: any) => ({
        id: v.id,
        color_id: v.color || v.color_id || '', // Veritabanı şemasına (color) öncelik ver
        size_id: v.size || v.size_id || '',   // Veritabanı şemasına (size) öncelik ver
        sku: v.sku || '',
        retail_price: v.retail_price || '',
        stock_quantity: v.stock_quantity || '',
        low_stock_threshold: v.low_stock_threshold || '',
        isExisting: true
      })) || [];

      // Eğer varyant yoksa en az bir boş varyant göster (Opsiyonel ama UX için iyi)
      setVariants(mappedVariants.length > 0 ? mappedVariants : [{
        id: Date.now().toString(),
        color_id: '', size_id: '', sku: '', retail_price: '', stock_quantity: '', low_stock_threshold: '', isExisting: false
      }]);
    } else {
      // YENİ EKLEME MODU (Reset)
      setCategoryId('');
      setDescription('');
      setVariants([{
        id: Date.now().toString(),
        color_id: '', size_id: '', sku: '', retail_price: '', stock_quantity: '', low_stock_threshold: '', isExisting: false
      }]);
    }
  }, [initialData]);
  
  const handleAddVariant = () => {
    setVariants([...variants, {
      id: Date.now().toString(),
      color_id: '', size_id: '', sku: '', retail_price: '', stock_quantity: '', low_stock_threshold: '', isExisting: false
    }]);
  };

  const handleUpdateVariant = (id: string, field: string, value: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return alert("Lütfen ürün kategorisini seçin.");
    
    for (const v of variants) {
      if (!v.color_id || !v.size_id) {
        return alert("Lütfen her varyant için Renk ve Beden seçiniz.");
      }
      if (v.low_stock_threshold === '' || v.low_stock_threshold === null) {
        return alert("Lütfen her varyant için Kritik Stok Eşiği belirleyin.");
      }
    }
    
    setLoading(true);
    try {
      const selectedCat = categories.find(c => c.id === categoryId);
      
      const productPayload = {
        name: selectedCat?.name || 'İsimsiz Kategori',
        description: description.trim() || null,
        shop_id: profile?.shop_id || '',
        category_id: categoryId
      };
      
      let productId = initialData?.id;

      if (initialData) {
        // GÜNCELLEME MODU
        // @ts-ignore
        await productService.updateProduct(productId, productPayload);
        console.log("✅ Ana Ürün Güncellendi.");
      } else {
        // YENİ EKLEME MODU
        const product = await productService.createProduct(productPayload as any);
        productId = product.id;
        console.log("✅ Ana Ürün Kaydedildi. ID:", productId);
      }

      // --- VARYANT SENKRONİZASYONU ---
      
      // 1. Silinecekleri belirle
      if (initialData) {
        const currentVariantIds = variants.filter(v => v.isExisting).map(v => v.id);
        const originalVariantIds = initialData.product_variants.map((v: any) => v.id);
        const toDelete = originalVariantIds.filter((id: string) => !currentVariantIds.includes(id));
        
        for (const deleteId of toDelete) {
          await productService.deleteVariant(deleteId);
        }
      }

      // 2. Ekle veya Güncelle
      for (const [index, v] of variants.entries()) {
        const retailPriceNum = parseFloat(v.retail_price.toString().replace(',', '.')) || 0;
        const stockQtyNum = parseInt(v.stock_quantity.toString()) || 0;
        const lowStockThresholdNum = parseInt(v.low_stock_threshold.toString()) || 0;

        const variantPayload = {
          product_id: productId,
          color_id: v.color_id || null,
          size_id: v.size_id || null,
          sku: v.sku?.trim() || null,
          retail_price: retailPriceNum,
          wholesale_price: retailPriceNum * 0.8,
          stock_quantity: stockQtyNum,
          low_stock_threshold: lowStockThresholdNum
        };

        if (v.isExisting) {
          await productService.updateVariant(v.id, variantPayload);
        } else {
          await productService.createVariant(variantPayload);
        }
      }
      
      console.log("🎉 Başarıyla Tamamlandı.");
      triggerRefresh();
      onClose();
    } catch (err: any) {
      console.error("Supabase Error:", err);
      alert(`Ürün kaydedilirken hata oluştu: ${err.message || 'Bilinmiyor'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 space-y-8 pb-10">
        
        {/* Adım 1: Ürün Kartı */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-indigo-600 mb-4 tracking-wider uppercase">1. Ana Ürün Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">Kategori / Ürün Cinsi</label>
              <select
                required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
              >
                <option value="">Seçiniz...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">Kısa Açıklama</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm resize-none text-sm"
                placeholder="Örn: 2024 kış sezonu yeni kesim..."
              />
            </div>
          </div>
        </div>
        
        {/* Adım 2: Varyantlar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-blue-600 tracking-wider uppercase">2. Ürün Varyantları</h3>
            <button 
              type="button" 
              onClick={handleAddVariant}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus size={14} /> Yeni Varyant
            </button>
          </div>
          
          <div className="space-y-4 relative">
            <div className="absolute top-4 bottom-4 left-[23px] w-0.5 bg-slate-100 -z-10 rounded-full"></div>
            
            <AnimatePresence mode="popLayout">
              {variants.length > 0 ? (
                variants.map((variant, index) => (
                  <motion.div 
                    key={variant.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="relative pl-12"
                  >
                    <div className="absolute left-[19px] top-6 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm z-10"></div>
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          # {index + 1}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveVariant(variant.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                         <div>
                           <label className="block text-[11px] font-semibold text-slate-500 mb-1 ml-1 uppercase">Renk</label>
                           <select
                             required value={variant.color_id} onChange={(e) => handleUpdateVariant(variant.id, 'color_id', e.target.value)}
                             className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                           >
                             <option value="">Renk Seçin</option>
                             {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                         </div>
                         <div>
                           <label className="block text-[11px] font-semibold text-slate-500 mb-1 ml-1 uppercase">Beden / Ölçü</label>
                           <select
                             required value={variant.size_id} onChange={(e) => handleUpdateVariant(variant.id, 'size_id', e.target.value)}
                             className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                           >
                             <option value="">Beden Seçin</option>
                             {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                           </select>
                         </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                         <div>
                           <label className="block text-[11px] font-semibold text-slate-500 mb-1 ml-1 uppercase">Stok</label>
                           <input 
                             required type="number" min="0" value={variant.stock_quantity} onChange={(e) => handleUpdateVariant(variant.id, 'stock_quantity', e.target.value)}
                             className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                             placeholder="Adet"
                           />
                         </div>
                         <div>
                           <label className="block text-[11px] font-semibold text-slate-500 mb-1 ml-1 uppercase">Kritik Stok</label>
                           <input 
                             required type="number" min="0" value={variant.low_stock_threshold} onChange={(e) => handleUpdateVariant(variant.id, 'low_stock_threshold', e.target.value)}
                             className="w-full px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-rose-500 outline-none transition-colors text-rose-600 font-bold"
                             placeholder="Eşik"
                           />
                         </div>
                         <div>
                           <label className="block text-[11px] font-semibold text-slate-500 mb-1 ml-1 uppercase">Satış Fiyatı (₺)</label>
                           <input 
                             required type="number" min="0" step="0.01" value={variant.retail_price} onChange={(e) => handleUpdateVariant(variant.id, 'retail_price', e.target.value)}
                             className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-emerald-600 font-bold"
                             placeholder="0.00"
                           />
                         </div>
                         <div>
                           <label className="block text-[11px] font-semibold text-slate-500 mb-1 ml-1 uppercase">Barkod/SKU</label>
                           <input 
                             value={variant.sku} onChange={(e) => handleUpdateVariant(variant.id, 'sku', e.target.value)}
                             className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-mono focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                             placeholder="Oto-Kayıt"
                           />
                         </div>
                      </div>

                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 gap-3"
                >
                  <Package size={40} className="opacity-20" />
                  <p className="font-bold text-sm">Bu ürüne ait varyant bulunmuyor.</p>
                  <button 
                    type="button" 
                    onClick={handleAddVariant}
                    className="text-xs font-black text-blue-600 underline underline-offset-4"
                  >
                    Hemen yeni varyant ekleyin
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {initialData && (
        <div className="mt-12 bg-slate-50 rounded-3xl p-8 border border-white shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <HistoryIcon size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800">Son Stok Hareketleri (Audit Trail)</h3>
          </div>
          
          <div className="space-y-4">
            {variants.filter(v => v.isExisting).map((v: any) => (
              <MovementHistoryList key={v.id} variantId={v.id} variantLabel={`${v.sku || 'SKU Yok'} (${colors.find(c => c.id === v.color_id)?.name} - ${sizes.find(s => s.id === v.size_id)?.name})`} />
            ))}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between gap-4 mt-12 sticky bottom-0 bg-white/90 backdrop-blur-md pb-4">
        <button 
          type="button" 
          onClick={onClose}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          İptal
        </button>
        <button 
          type="submit" 
          disabled={loading || categories.length === 0}
          className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex justify-center items-center"
        >
          {loading ? (
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Kaydediliyor...
             </div>
          ) : (
            <div className="flex items-center gap-2">
              <Package size={18} /> {initialData ? 'Değişiklikleri Kaydet' : 'Tümünü Kaydet'}
            </div>
          )}
        </button>
      </div>
    </form>
  );
}

// Yardımcı Bileşen: Hareket Geçmişi Listesi
function MovementHistoryList({ variantId, variantLabel }: { variantId: string, variantLabel: string }) {
  const { stockService } = useServices();
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // UUID validasyonu: Sadece gerçek UUID formatındaki (36 karakter) ID'ler için istek atılır.
      // Geçici ID'ler (Date.now()) genellikle 13 karakterdir.
      if (!variantId || variantId.length < 20) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await stockService.getMovementHistory(variantId);
        setMovements(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [variantId]);

  if (loading) return <div className="text-[10px] text-slate-400 p-2 animate-pulse font-bold tracking-widest">VERİLER ÇEKİLİYOR...</div>;
  if (!movements.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
      <div className="px-5 py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] flex justify-between items-center">
        <span>{variantLabel}</span>
        <span className="bg-indigo-500 px-2 py-0.5 rounded text-[9px]">{movements.length} Kayıt</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-tighter">Tarih</th>
              <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-tighter">Yapan</th>
              <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-tighter text-center">İşlem</th>
              <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-tighter text-right">Önceki</th>
              <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-tighter text-right">Değim</th>
              <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-tighter text-right">Sonuç</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {movements.map((m: any) => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {new Date(m.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap">
                  {m.user_email || 'Sistem'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-md font-black text-[9px] ${m.type === 'IN' || m.type === 'RETURN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {m.type === 'IN' || m.type === 'RETURN' ? 'GİRİŞ' : 'ÇIKIŞ'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-400 font-mono">{m.previous_stock ?? '-'}</td>
                <td className={`px-4 py-3 text-right font-black ${m.type === 'IN' || m.type === 'RETURN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {m.type === 'IN' || m.type === 'RETURN' ? '+' : '-'}{m.quantity}
                </td>
                <td className="px-4 py-3 text-right font-black text-slate-900 bg-slate-50/30">{m.new_stock ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

