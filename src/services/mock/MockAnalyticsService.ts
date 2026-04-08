import { IAnalyticsService } from '../interfaces/IServices';
import { DashboardStats } from '../analyticsService';
import { db } from '../../lib/dexie';

export class MockAnalyticsService implements IAnalyticsService {
  async getDashboardStats(date: string = new Date().toISOString().split('T')[0]): Promise<DashboardStats> {
    const allSales = await db.sales_offline.toArray();
    const allProducts = await db.products_sandbox.toArray();
    
    // Yalnizca belirtilen tarihteki veya o gunun satislarini filtrele
    const todaySales = allSales.filter(s => s.created_at.startsWith(date) && s.status === 'completed');
    
    const todayRevenue = todaySales.reduce((acc, curr) => acc + curr.total_amount, 0);
    const todayProfit = todayRevenue * 0.3; // %30 farazi kar
    const totalSalesToday = todaySales.length;

    // Gerçek veya Sahte Chart Verisi
    let topSelling: any[] = [];
    
    if (allSales.length > 0) {
      // Satış var, dinamik data
      const salesMap: Record<string, {quantity: number, revenue: number}> = {};
      allSales.forEach(sale => {
        sale.items.forEach(item => {
          if(!salesMap[item.variant_id]) salesMap[item.variant_id] = { quantity: 0, revenue: 0 };
          salesMap[item.variant_id].quantity += item.quantity;
          salesMap[item.variant_id].revenue += item.total_price;
        });
      });
      
      topSelling = Object.entries(salesMap)
        .map(([variant_id, stats]) => {
           // Ürün adını bulmaya çalış (variant_id'i product_id farz edelim şimdilik mock olarak)
           const p = allProducts.find(prod => prod.id === variant_id);
           return {
             variant_id,
             product_name: p ? p.name : 'Ürün ' + variant_id.slice(0,4),
             sku: p?.id?.slice(0, 4) || 'SKU',
             total_quantity_sold: stats.quantity,
             total_revenue: stats.revenue
           };
        })
        .sort((a,b) => b.total_quantity_sold - a.total_quantity_sold)
        .slice(0, 5);
        
    } else {
      // Satış yok, mock/fallback data grafikte görünsün
      topSelling = [
        { variant_id: 'mock-var-1', product_name: 'Örnek Tişört', sku: 'TS-01', total_quantity_sold: 15, total_revenue: 1500 },
        { variant_id: 'mock-var-2', product_name: 'Örnek Kot Pantolon', sku: 'JN-01', total_quantity_sold: 8, total_revenue: 2400 }
      ];
    }

    // Kritik Stok (Bütün ürünlerin %20'si azami stok gibi mocklayalim)
    const lowStockItems = allProducts.slice(0, Math.max(1, Math.floor(allProducts.length * 0.2))).map(p => ({
      shop_id: 'sandbox-shop',
      variant_id: p.id as string,
      product_name: p.name,
      color: null,
      size: null,
      sku: 'N/A',
      stock_quantity: Math.floor(Math.random() * 4), 
      min_stock_level: 5
    })) as any[];

    return {
      todayRevenue,
      todayProfit,
      totalSalesToday,
      topSelling,
      lowStockItems
    };
  }
}
