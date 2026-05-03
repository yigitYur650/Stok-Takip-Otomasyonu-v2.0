import Dexie, { Table } from 'dexie';

export interface LocalCategory {
  id: string;
  shop_id: string;
  name: string;
  deleted_at: string | null;
  updated_at: string;
}

export interface LocalColor {
  id: string;
  shop_id: string;
  name: string;
  updated_at: string;
}

export interface LocalSize {
  id: string;
  shop_id: string;
  name: string;
  updated_at: string;
}

export interface LocalProduct {
  id: string;
  shop_id: string;
  category_id: string;
  name: string;
  description?: string;
  updated_at: string;
  version: number;
  request_id?: string;
}

export interface LocalSale {
  id: string;
  shop_id: string;
  total_amount: number;
  sale_date: string;
  updated_at: string;
  version: number;
  request_id?: string;
}

export interface SyncQueueItem {
  id?: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  payload: any;
  request_id: string;
  status: 'PENDING' | 'SYNCING' | 'ERROR';
  created_at: string;
}

export class AppDatabase extends Dexie {
  products!: Table<LocalProduct>;
  categories!: Table<LocalCategory>;
  colors!: Table<LocalColor>;
  sizes!: Table<LocalSize>;
  sales!: Table<LocalSale>;
  sync_queue!: Table<SyncQueueItem>;

  constructor() {
    super('saas_erp_db');
    this.version(1).stores({
      products: 'id, shop_id, category_id',
      categories: 'id, shop_id',
      colors: 'id, shop_id',
      sizes: 'id, shop_id',
      sales: 'id, shop_id, sale_date',
      sync_queue: '++id, status, table'
    });
  }
}

export const db = new AppDatabase();
