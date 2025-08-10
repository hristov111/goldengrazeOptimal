import { supabase } from '../supabase'

export type ProductImage = {
  id: string
  storage_path?: string | null
  public_url?: string | null
  alt?: string | null
  sort_order: number
  is_primary: boolean
  url?: string | null // Resolved URL for display
}

export type ProductWithImages = {
  id: string
  name: string
  description?: string | null
  price: number
  category: string
  scent?: string | null
  size?: string | null
  stock_quantity?: number | null
  image_url?: string | null
  is_active?: boolean | null
  images: ProductImage[]
}

export async function fetchProductWithImages(productId?: string): Promise<ProductWithImages | null> {
  try {
    let query = supabase
      .from('products')
      .select(`
        id, name, description, price, category, scent, size, stock_quantity, image_url, is_active,
        images:product_images(id, storage_path, public_url, alt, sort_order, is_primary)
      `)

    // If productId is provided, filter by it, otherwise get the first product
    if (productId) {
      query = query.eq('id', productId)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return null
    }

    // Sort images: primary first, then by sort_order
    if (data.images) {
      data.images.sort((a: ProductImage, b: ProductImage) => {
        if (a.is_primary && !b.is_primary) return -1
        if (!a.is_primary && b.is_primary) return 1
        return a.sort_order - b.sort_order
      })

      // Resolve URLs for display
      data.images = data.images.map((img: ProductImage) => ({
        ...img,
        url: img.public_url || img.storage_path || null
      }))
    }

    return data as ProductWithImages
  } catch (error) {
    return null
  }
}

export async function fetchAllProductsWithImages(): Promise<ProductWithImages[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, description, price, category, scent, size, stock_quantity, image_url, is_active,
        images:product_images(id, storage_path, public_url, alt, sort_order, is_primary)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error || !data) {
      return []
    }

    // Process each product's images
    return data.map(product => ({
      ...product,
      images: (product.images || [])
        .sort((a: ProductImage, b: ProductImage) => {
          if (a.is_primary && !b.is_primary) return -1
          if (!a.is_primary && b.is_primary) return 1
          return a.sort_order - b.sort_order
        })
        .map((img: ProductImage) => ({
          ...img,
          url: img.public_url || img.storage_path || null
        }))
    })) as ProductWithImages[]
  } catch (error) {
    return []
  }
}