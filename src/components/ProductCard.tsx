import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Star, Heart } from 'lucide-react';
import { supabase } from '../api/supabaseClient';
import type { Product } from "../api/products";

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (product: Product) => void;
  isInWishlist?: boolean;
}

export default function ProductCard({ 
  product, 
  onWishlistToggle, 
  isInWishlist = false 
}: ProductCardProps) {
  const [productImage, setProductImage] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const price = (product.price_cents / 100).toFixed(2);

  useEffect(() => {
    fetchProductImage();
  }, [product.id]);

  const fetchProductImage = async () => {
    try {
      setImageLoading(true);
      
      const { data, error } = await supabase
        .from('product_images')
        .select('public_url, storage_path')
        .eq('product_id', product.id)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching product image:', error);
        setProductImage('/product_images/golden_graze1.png');
        return;
      }
      
      if (data) {
        const imageUrl = data.public_url || data.storage_path;
        setProductImage(imageUrl || '/product_images/golden_graze1.png');
      } else {
        // Fallback to product.images array or default
        setProductImage(product.images?.[0] || '/product_images/golden_graze1.png');
      }
    } catch (err) {
      console.error('Failed to fetch product image:', err);
      setProductImage('/product_images/golden_graze1.png');
    } finally {
      setImageLoading(false);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle?.(product);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Product Image */}
        <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden relative">
          {imageLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : productImage ? (
            <img 
              src={productImage} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                if (e.currentTarget.src.includes('golden_graze1.png')) {
                  e.currentTarget.src = '/balm_images/firstPic.png';
                } else if (e.currentTarget.src.includes('firstPic.png')) {
                  e.currentTarget.src = '/balm_images/Golder Graze.png';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-amber-600 text-4xl">📦</div>
            </div>
          )}
          
          {/* Wishlist button */}
          {onWishlistToggle && (
            <button
              onClick={handleWishlistClick}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
            >
              <Heart 
                size={16} 
                className={`transition-colors ${
                  isInWishlist ? 'text-red-500 fill-current' : 'text-stone-600'
                }`} 
              />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-6">
          <div className="mb-2">
            <h3 className="font-serif text-lg text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            {product.category && (
              <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full mt-1">
                {product.category}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="text-stone-600 text-sm mb-3 line-clamp-2">
              {product.short_description}
            </p>
          )}

          {/* Rating (placeholder) */}
          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="text-amber-400 fill-current" />
            ))}
            <span className="text-stone-500 text-xs ml-1">(4.9)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-serif text-stone-900">${price}</span>
            <div className="text-amber-600 group-hover:text-amber-700 transition-colors">
              <span className="text-sm font-medium">View Details →</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}