export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ARCollectible: {
        Row: {
          created_at: string;
          id: number;
          image: string | null;
          name: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          image?: string | null;
          name?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          image?: string | null;
          name?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          id: number;
          text: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          text?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          text?: string | null;
        };
        Relationships: [];
      };
      order_products: {
        Row: {
          created_at: string | null;
          id: number;
          order_id: number | null;
          price_at_time: number | null;
          product_id: number | null;
          quantity: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: never;
          order_id?: number | null;
          price_at_time?: number | null;
          product_id?: number | null;
          quantity: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: never;
          order_id?: number | null;
          price_at_time?: number | null;
          product_id?: number | null;
          quantity?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_products_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          billing_address: Json | null;
          created_at: string;
          customer_email: string | null;
          customer_phone: string | null;
          id: number;
          shipping_address: Json | null;
          status: Json[] | null;
          stripe_session_id: string | null;
          total_amount: number | null;
          tracking_id: string | null;
          user_id: string | null;
        };
        Insert: {
          billing_address?: Json | null;
          created_at?: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          id?: number;
          shipping_address?: Json | null;
          status?: Json[] | null;
          stripe_session_id?: string | null;
          total_amount?: number | null;
          tracking_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          billing_address?: Json | null;
          created_at?: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          id?: number;
          shipping_address?: Json | null;
          status?: Json[] | null;
          stripe_session_id?: string | null;
          total_amount?: number | null;
          tracking_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category: number;
          created_at: string | null;
          description: string;
          embedding: string | null;
          id: number;
          images: string | null;
          name: string;
          price: number;
          rating: number | null;
          visible: boolean | null;
        };
        Insert: {
          category: number;
          created_at?: string | null;
          description: string;
          embedding?: string | null;
          id?: never;
          images?: string | null;
          name: string;
          price: number;
          rating?: number | null;
          visible?: boolean | null;
        };
        Update: {
          category?: number;
          created_at?: string | null;
          description?: string;
          embedding?: string | null;
          id?: never;
          images?: string | null;
          name?: string;
          price?: number;
          rating?: number | null;
          visible?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_fkey";
            columns: ["category"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: number;
          order_id: number;
          product_id: number | null;
          rating: number | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: number;
          order_id: number;
          product_id?: number | null;
          rating?: number | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: number;
          order_id?: number;
          product_id?: number | null;
          rating?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      role_permissions: {
        Row: {
          id: number;
          permission: Database["public"]["Enums"]["app_permission"];
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          id?: number;
          permission: Database["public"]["Enums"]["app_permission"];
          role: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          id?: number;
          permission?: Database["public"]["Enums"]["app_permission"];
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: number;
          role: Database["public"]["Enums"]["app_role"] | null;
          user_id: string;
        };
        Insert: {
          id?: number;
          role?: Database["public"]["Enums"]["app_role"] | null;
          user_id: string;
        };
        Update: {
          id?: number;
          role?: Database["public"]["Enums"]["app_role"] | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      profiles_with_roles: {
        Row: {
          avatar_url: string | null;
          first_name: string | null;
          id: string | null;
          last_name: string | null;
          role: Database["public"]["Enums"]["app_role"] | null;
          role_id: number | null;
          username: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      authorize: {
        Args: { permission: Database["public"]["Enums"]["app_permission"] };
        Returns: boolean;
      };
      create_order_from_stripe: {
        Args: {
          p_user_id: string;
          p_stripe_session_id: string;
          p_total_amount: number;
          p_items: Json;
          p_customer_email?: string;
          p_customer_phone?: string;
          p_billing_address?: Json;
          p_shipping_address?: Json;
        };
        Returns: Json;
      };
      custom_access_token_hook: {
        Args: { event: Json };
        Returns: Json;
      };
      query_products_embedding: {
        Args: { embeddingparam: string; match_threshold: number };
        Returns: {
          category: number;
          created_at: string | null;
          description: string;
          embedding: string | null;
          id: number;
          images: string | null;
          name: string;
          price: number;
          rating: number | null;
          visible: boolean | null;
        }[];
      };
    };
    Enums: {
      app_permission:
        | "products.delete"
        | "orders.delete"
        | "products.create"
        | "products.read"
        | "products.update"
        | "AR.create"
        | "AR.read"
        | "AR.update"
        | "AR.delete"
        | "orders.create"
        | "orders.update"
        | "orders.read"
        | "category.create"
        | "category.read"
        | "category.update"
        | "category.delete"
        | "review.create"
        | "review.read"
        | "review.update"
        | "review.delete"
        | "profiles.read"
        | "profiles.update";
      app_role: "admin" | "moderator" | "customer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      app_permission: [
        "products.delete",
        "orders.delete",
        "products.create",
        "products.read",
        "products.update",
        "AR.create",
        "AR.read",
        "AR.update",
        "AR.delete",
        "orders.create",
        "orders.update",
        "orders.read",
        "category.create",
        "category.read",
        "category.update",
        "category.delete",
        "review.create",
        "review.read",
        "review.update",
        "review.delete",
        "profiles.read",
        "profiles.update",
      ],
      app_role: ["admin", "moderator", "customer"],
    },
  },
} as const;
