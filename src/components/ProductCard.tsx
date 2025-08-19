import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingBag, Loader2 } from 'lucide-react';
import type { Product } from "../api/products";
import { useSessionUser } from '../lib/hooks/useSessionUser';
import { database } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useSessionUser();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const primaryImage = product.images?.[0] || '/product_images/golden_graze1.png';
  const price = (product.price_cents / 100).toFixed(2);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity === 0) return;
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsAddingToCart(true);
    try {
      const { error } = await database.addToCart(user.id, product.id, 1);
      if (error) throw error;
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('cartChanged'));
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsAddingToWishlist(true);
    try {
      const { error } = await database.addToWishlist(user.id, product.id);
      if (error) throw error;
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity === 0) return;
    
    // Navigate to checkout with this product
    navigate('/checkout', { state: { productId: product.id, quantity: 1 } });
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Product Image */}
        <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden relative">
          <img 
            src={primaryImage} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = '/product_images/golden_graze1.png';
            }}
          />
          
          {/* Wishlist button */}
          <button
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg disabled:opacity-50"
          >
            {isAddingToWishlist ? (
              <Loader2 size={14} className="text-amber-600 animate-spin" />
            ) : (
              <Heart size={14} className="text-stone-600 hover:text-red-500 transition-colors" />
            )}
          </button>
          
          {/* Stock Status */}
          <div className="mt-2">
            {product.stock_quantity === null ? (
              <span className="text-xs text-stone-500">Stock: Unknown</span>
            ) : product.stock_quantity === 0 ? (
              <span className="text-xs text-red-600 font-medium">Out of Stock</span>
            ) : product.stock_quantity <= 5 ? (
              <span className="text-xs text-orange-600 font-medium">Only {product.stock_quantity} left</span>
            ) : (
              <span className="text-xs text-green-600 font-medium">{product.stock_quantity} in stock</span>
            )}
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-serif text-stone-900">${price}</span>
          </div>
        </div>
      </Link>

      {/* Action Buttons - Outside the Link */}
      <div className="px-6 pb-6 space-y-2">
        {/* Buy Now Button */}
        <button
          onClick={handleBuyNow}
          className={`w-full py-3 px-4 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2 shadow-lg ${
            product.stock_quantity === 0
              ? 'bg-stone-400 text-stone-600 cursor-not-allowed'
              : 'bg-amber-400 hover:bg-amber-500 text-white transform hover:scale-105 hover:shadow-xl'
          }`}
        >
          <ShoppingBag size={16} />
          <span>{product.stock_quantity === 0 ? 'OUT OF STOCK' : 'BUY NOW'}</span>
        </button>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`w-full border-2 transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2 py-2 px-4 tracking-widest ${
            product.stock_quantity === 0 
              ? 'border-stone-300 text-stone-500 bg-stone-100 cursor-not-allowed' 
              : 'border-amber-400 text-amber-700 hover:bg-amber-50 disabled:bg-stone-100 disabled:cursor-not-allowed'
          }`}
        >
          {isAddingToCart ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">ADDING...</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              <span className="text-sm">{product.stock_quantity === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
            </>
          )}
        </button>

        {/* Add to Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist}
          className="w-full border-2 border-stone-300 text-stone-700 hover:bg-stone-50 disabled:bg-stone-100 disabled:cursor-not-allowed py-2 px-4 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          {isAddingToWishlist ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">ADDING...</span>
            </>
          ) : (
            <>
              <Heart size={14} />
              <span className="text-sm">ADD TO WISHLIST</span>
            </>
          )}
        </button>
      </div>

      {/* Auth Modal would go here if needed */}
    </div>
  );
}