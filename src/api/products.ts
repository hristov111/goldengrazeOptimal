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
  stock_quantity: number | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string | null;
  public_url: string | null;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductWithImages = Product & {
  product_images: ProductImage[];
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
    .select(`
      id, slug, name, price_cents, short_description, description, images, category, is_active, created_at, stock_quantity,
      product_images!inner(
        id, storage_path, public_url, alt, sort_order, is_primary
      )
    `, { count: "exact" })
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
  
  // Transform data to include primary image
  const products = (data ?? []).map((product: any) => {
    // Sort images by sort_order and get the first one
    const sortedImages = (product.product_images || [])
      .sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order);
    
    const primaryImage = sortedImages[0];
    const imageUrl = primaryImage?.public_url || primaryImage?.storage_path || '/product_images/golden_graze1.png';
    
    return {
      ...product,
      images: [imageUrl], // For compatibility with existing code
      product_images: sortedImages
    };
  });
  
  return { 
    items: products as Product[], 
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize)
  };
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, slug, name, price_cents, short_description, description, images, category, is_active, created_at, stock_quantity,
      product_images(
        id, storage_path, public_url, alt, sort_order, is_primary, created_at
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
    
  if (error) throw error;
  
  // Sort images by sort_order
  const sortedImages = (data.product_images || [])
    .sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order);
  
  // Create images array for compatibility
  const imageUrls = sortedImages.map((img: ProductImage) => 
    img.public_url || img.storage_path || '/product_images/golden_graze1.png'
  );
  
  return {
    ...data,
    images: imageUrls.length > 0 ? imageUrls : ['/product_images/golden_graze1.png'],
    product_images: sortedImages
  } as ProductWithImages;
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