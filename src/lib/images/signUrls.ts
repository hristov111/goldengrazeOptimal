import { supabase } from '../supabase'
import type { ProductImage } from '../products/fetchProductWithImages'

export async function ensureImageUrls(bucket: string, images: ProductImage[], expiresIn = 3600) {
  const out: (ProductImage & { url?: string | null })[] = []
  
  for (const img of images) {
    // If we already have a public URL, use it
    if (img.public_url) {
      out.push({ ...img, url: img.public_url })
      continue
    }
    
    // If we have a storage path, create a signed URL
    if (img.storage_path) {
      try {
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .createSignedUrl(img.storage_path, expiresIn)
        
        if (error) {
          out.push({ ...img, url: null })
        } else {
          out.push({ ...img, url: data?.signedUrl ?? null })
        }
      } catch (error) {
        out.push({ ...img, url: null })
      }
      continue
    }
    
    // No URL available
    out.push({ ...img, url: null })
  }
  
  return out
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}