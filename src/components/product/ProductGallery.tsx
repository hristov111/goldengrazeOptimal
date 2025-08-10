import React, { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import Lightbox from './Lightbox'
import VisuallyHidden from '../../lib/ui/VisuallyHidden'

type GalleryImage = { 
  id: string
  url?: string | null
  alt?: string | null
  is_primary?: boolean 
}

interface ProductGalleryProps {
  images: GalleryImage[]
  className?: string
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, className = '' }) => {
  const validImages = (images || []).filter(img => img.url)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Fallback if no images
  if (!validImages.length) {
    return (
      <div className={`aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-center text-amber-600">
          <div className="w-16 h-16 bg-amber-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📸</span>
          </div>
          <p className="text-sm">No images available</p>
        </div>
      </div>
    )
  }

  const activeImage = validImages[activeIndex]

  return (
    <div className={className}>
      {/* Main image */}
      <div className="relative group">
        <button
          className="w-full aspect-square overflow-hidden rounded-2xl border border-amber-200 hover:border-amber-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 relative"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open image gallery"
        >
          <img 
            src={activeImage.url!} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            alt={activeImage.alt || 'Product image'}
          />
          
          {/* Zoom overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
              <ZoomIn size={20} className="text-stone-700" />
            </div>
          </div>
          
          {/* Image counter */}
          {validImages.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {activeIndex + 1} / {validImages.length}
            </div>
          )}
        </button>
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {validImages.map((img, i) => (
            <button
              key={img.id}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                i === activeIndex 
                  ? 'border-amber-400 ring-2 ring-amber-200' 
                  : 'border-stone-200 hover:border-amber-300 opacity-80 hover:opacity-100'
              }`}
              onClick={() => setActiveIndex(i)}
              aria-current={i === activeIndex ? 'true' : 'false'}
              aria-label={`View image ${i + 1}`}
            >
              <img 
                src={img.url!} 
                className="w-full h-full object-cover" 
                alt={img.alt || `Product thumbnail ${i + 1}`}
              />
              <VisuallyHidden>
                {img.alt || `Image ${i + 1}`}
              </VisuallyHidden>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox 
          images={validImages} 
          startIndex={activeIndex} 
          onClose={() => setLightboxOpen(false)} 
          onChange={setActiveIndex} 
        />
      )}
    </div>
  )
}

export default ProductGallery