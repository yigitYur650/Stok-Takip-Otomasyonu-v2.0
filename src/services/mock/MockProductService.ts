import { IProductService } from '../interfaces/IServices';
import { Database } from '../../types/database.types';
import { db } from '../../lib/dexie';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type VariantInsert = Database['public']['Tables']['product_variants']['Insert'];
type VariantUpdate = Database['public']['Tables']['product_variants']['Update'];

export class MockProductService implements IProductService {
  async getProductsWithVariants(): Promise<any[]> {
    const products = await db.products_sandbox.toArray();
    const variants = await db.variants_sandbox.toArray();
    const categories = await db.categories_sandbox.toArray();

    return products.map(prod => {
      const prodVariants = variants.filter(v => v.product_id === prod.id);
      const category = categories.find(c => c.id === prod.category_id);
      return {
        ...prod,
        product_variants: prodVariants,
        categories: category ? { id: category.id, name: category.name } : null
      };
    });
  }

  async getProducts(): Promise<ProductRow[]> {
    const products = await db.products_sandbox.toArray();
    return products as ProductRow[];
  }

  async createProduct(product: ProductInsert): Promise<ProductRow> {
    const id = window.crypto.randomUUID();
    const newProduct = { 
      ...product, 
      id, 
      created_at: new Date().toISOString() 
    } as ProductRow;
    
    await db.products_sandbox.add(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, product: ProductUpdate): Promise<ProductRow> {
    await db.products_sandbox.update(id, product);
    const updated = await db.products_sandbox.get(id);
    return updated as ProductRow;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.products_sandbox.delete(id);
    // Also delete variants
    const variants = await db.variants_sandbox.where({ product_id: id }).toArray();
    for (const v of variants) {
      await db.variants_sandbox.delete(v.id);
    }
  }

  async getProductVariants(productId: string): Promise<VariantRow[]> {
    const variants = await db.variants_sandbox.where({ product_id: productId }).toArray();
    return variants as VariantRow[];
  }

  async createVariant(variant: VariantInsert): Promise<VariantRow> {
    const id = window.crypto.randomUUID();
    const newVariant = { 
      ...variant, 
      id, 
      created_at: new Date().toISOString() 
    } as VariantRow;
    
    await db.variants_sandbox.add(newVariant);
    return newVariant;
  }

  async updateVariant(id: string, variant: VariantUpdate): Promise<VariantRow> {
    await db.variants_sandbox.update(id, variant);
    const updated = await db.variants_sandbox.get(id);
    return updated as VariantRow;
  }

  async deleteVariant(id: string): Promise<void> {
    await db.variants_sandbox.delete(id);
  }

  async smartSearch(query: string): Promise<any[]> {
    const products = await this.getProductsWithVariants();
    if (!query || query.trim() === '') return products;
    
    const lowerQuery = query.toLowerCase();
    
    return products.filter(p => {
      // Isim veya Kategori Uyusmasi
      const matchName = p.name?.toLowerCase().includes(lowerQuery);
      const matchCategory = p.categories?.name?.toLowerCase().includes(lowerQuery);
      
      if (matchName || matchCategory) return true;

      // Herhangi bir varyant uyuşuyor mu?
      if (p.product_variants) {
        return p.product_variants.some((v: any) => 
          v.color?.toLowerCase().includes(lowerQuery) ||
          v.size?.toLowerCase().includes(lowerQuery) ||
          v.sku?.toLowerCase().includes(lowerQuery)
        );
      }
      return false;
    });
  }
}
