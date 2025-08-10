import React, { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

type LightboxImage = { 
  id: string
  url?: string | null
  alt?: string | null 
}

interface LightboxProps {
  images: LightboxImage[]
  startIndex?: number
  onClose: () => void
  onChange?: (index: number) => void
}

const Lightbox: React.FC<LightboxProps> = ({
  images, 
  startIndex = 0, 
  onClose, 
  onChange
}) => {
  const [index, setIndex] = useState(startIndex)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0))
    }
    
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden' // Prevent background scroll
    
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = 'unset'
    }
  }, [images.length, onClose])

  useEffect(() => { 
    onChange?.(index) 
  }, [index, onChange])

  const goToPrevious = () => setIndex(i => Math.max(i - 1, 0))
  const goToNext = () => setIndex(i => Math.min(i + 1, images.length - 1))

  const currentImage = images[index]

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" 
      role="dialog" 
      aria-modal="true"
      onClick={onClose}
    >
      {/* Close button */}
      <button 
        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        onClick={onClose} 
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => { e.stopPropagation(); goToPrevious() }}
            disabled={index === 0}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => { e.stopPropagation(); goToNext() }}
            disabled={index === images.length - 1}
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Main content */}
      <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
        {currentImage?.url && (
          <img 
            src={currentImage.url} 
            className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl" 
            alt={currentImage.alt || `Image ${index + 1}`}
          />
        )}
        
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-md overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === index 
                  ? 'border-amber-400 opacity-100' 
                  : 'border-white/30 opacity-60 hover:opacity-80'
              }`}
              onClick={(e) => { e.stopPropagation(); setIndex(i) }}
              aria-label={`View image ${i + 1}`}
            >
              {img.url && (
                <img 
                  src={img.url} 
                  className="w-full h-full object-cover" 
                  alt={img.alt || `Thumbnail ${i + 1}`}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Lightbox