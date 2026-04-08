export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          shop_id: string
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          shop_id: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          sale_id: string
          type: "CASH" | "CARD" | "DEBT"
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          sale_id: string
          type: "CASH" | "CARD" | "DEBT"
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          sale_id?: string
          type?: "CASH" | "CARD" | "DEBT"
        }
        Relationships: [
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          }
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          id: string
          product_id: string
          retail_price: number
          size: string | null
          sku: string | null
          stock_quantity: number
          wholesale_price: number
        }
        Insert: {
          color?: string | null
          id?: string
          product_id: string
          retail_price?: number
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          wholesale_price?: number
        }
        Update: {
          color?: string | null
          id?: string
          product_id?: string
          retail_price?: number
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          wholesale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          shop_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          shop_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: number
          shop_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role: number
          shop_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: number
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      sale_items: {
        Row: {
          id: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
          variant_id: string
        }
        Insert: {
          id?: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
          variant_id: string
        }
        Update: {
          id?: string
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          discount_amount: number
          id: string
          shop_id: string
          status: "completed" | "cancelled"
          total_amount: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number
          id?: string
          shop_id: string
          status?: "completed" | "cancelled"
          total_amount?: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number
          id?: string
          shop_id?: string
          status?: "completed" | "cancelled"
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      shops: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          quantity: number
          reason: string | null
          shop_id: string
          type: "IN" | "OUT" | "WASTE" | "RETURN"
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity: number
          reason?: string | null
          shop_id: string
          type: "IN" | "OUT" | "WASTE" | "RETURN"
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          reason?: string | null
          shop_id?: string
          type?: "IN" | "OUT" | "WASTE" | "RETURN"
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      daily_sales_summary: {
        Row: {
          shop_id: string
          sale_date: string
          total_revenue: number
          net_profit: number
          total_sales: number
        }
      }
      low_stock_alerts: {
        Row: {
          shop_id: string
          variant_id: string
          product_name: string
          color: string | null
          size: string | null
          stock_quantity: number
        }
      }
      top_selling_variants: {
        Row: {
          shop_id: string
          variant_id: string
          product_name: string
          color: string | null
          size: string | null
          total_quantity_sold: number
          total_profit: number
        }
      }
    }
    Functions: {
      get_current_shop_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_sale: {
        Args: {
          payload: Json
        }
        Returns: string
      }
    }
    Enums: {
      movement_type: "IN" | "OUT" | "WASTE" | "RETURN"
      payment_type: "CASH" | "CARD" | "DEBT"
      sale_status: "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
