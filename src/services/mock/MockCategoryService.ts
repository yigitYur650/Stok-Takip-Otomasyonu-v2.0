import { ICategoryService } from '../interfaces/IServices';
import { Database } from '../../types/database.types';
import { db } from '../../lib/dexie';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export class MockCategoryService implements ICategoryService {
  async getAllCategories(): Promise<CategoryRow[]> {
    const categories = await db.categories_sandbox
      .filter(cat => !cat.deleted_at)
      .toArray();
    return categories as CategoryRow[];
  }

  async getDeletedCategories(): Promise<CategoryRow[]> {
    const categories = await db.categories_sandbox
      .filter(cat => !!cat.deleted_at)
      .toArray();
    return categories as CategoryRow[];
  }

  async createCategory(category: CategoryInsert): Promise<CategoryRow> {
    const id = window.crypto.randomUUID();
    const newCat: CategoryRow = { 
      id,
      name: category.name,
      shop_id: category.shop_id,
      parent_id: category.parent_id || null,
      deleted_at: null
    };
    
    await db.categories_sandbox.add(newCat);
    return newCat;
  }

  async updateCategory(id: string, category: CategoryUpdate): Promise<CategoryRow> {
    await db.categories_sandbox.update(id, category);
    const updated = await db.categories_sandbox.get(id);
    return updated as CategoryRow;
  }

  async softDeleteCategory(id: string): Promise<void> {
    await db.categories_sandbox.update(id, { 
      deleted_at: new Date().toISOString() 
    });
  }

  async restoreCategory(id: string): Promise<void> {
    await db.categories_sandbox.update(id, { 
      deleted_at: null 
    });
  }

  async forceDeleteCategory(id: string): Promise<void> {
    await db.categories_sandbox.delete(id);
  }
}
