import { supabase } from "./supabaseClient";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  short_description: string | null;
  description: string | null;
  images: string[];
  category: string | null;
  is_active: boolean;
  created_at: string;
};

export async function listProducts(params?: {
  page?: number; 
  pageSize?: number;
  category?: string; 
  q?: string; 
  sort?: "new" | "price-asc" | "price-desc";
}) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 24;
  
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  // Apply filters
  if (params?.category) {
    query = query.eq("category", params.category);
  }
  
  if (params?.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  // Apply sorting
  if (params?.sort === "price-asc") {
    query = query.order("price_cents", { ascending: true });
  } else if (params?.sort === "price-desc") {
    query = query.order("price_cents", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);
  
  if (error) throw error;
  
  return { 
    items: (data ?? []) as Product[], 
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize)
  };
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
    
  if (error) throw error;
  return data as Product;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true)
    .not("category", "is", null);
    
  if (error) throw error;
  
  // Get unique categories
  const categories = [...new Set(data.map(item => item.category))];
  return categories.filter(Boolean);
}