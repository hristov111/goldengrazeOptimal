import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Loader2, Trash2 } from 'lucide-react';
import { database, supabase } from '../../lib/supabase';
import { useSessionUser } from '../../lib/hooks/useSessionUser';
import Money from '../common/Money';

interface WishlistItem {
  id: string;
  added_at: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    scent: string | null;
    size: string | null;
    stock_quantity: number | null;
    image_url: string | null;
    is_active: boolean | null;
  };
}

interface WishlistGridProps {
  onItemsChange?: (items: WishlistItem[]) => void;
}

const WishlistGrid: React.FC<WishlistGridProps> = ({ onItemsChange }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [productImages, setProductImages] = useState<{[key: string]: string}>({});
  const { user } = useSessionUser();

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);

  const fetchProductImages = async (items: WishlistItem[]) => {
    const imageMap: {[key: string]: string} = {};
    
    for (const item of items) {
      try {
        const { data, error } = await supabase
          .from('product_images')
          .select('public_url, storage_path')
          .eq('product_id', item.product.id)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          imageMap[item.product.id] = '/product_images/golden_graze1.png';
          continue;
        }
        
        if (data) {
          const imageUrl = data.public_url || data.storage_path;
          imageMap[item.product.id] = imageUrl || '/product_images/golden_graze1.png';
        } else {
          imageMap[item.product.id] = '/product_images/golden_graze1.png';
        }
      } catch (err: any) {
        imageMap[item.product.id] = '/product_images/golden_graze1.png';
      }
    }
    
    setProductImages(imageMap);
  };

  const fetchWishlistItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await database.getWishlistItems(user.id);
      
      if (error) {
        throw error;
      }
      
      setItems(data || []);
      
      // Fetch images for all wishlist products
      if (data && data.length > 0) {
        await fetchProductImages(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const { error } = await database.removeFromWishlist(itemId);
      
      if (error) {
        throw error;
      }
      
      // Update local state optimistically
      setItems(prev => prev.filter(item => item.id !== itemId));
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
    } catch (err: any) {
      // Revert on error
      await fetchWishlistItems();
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    if (!user) return;
    
    setUpdatingItems(prev => new Set(prev).add(item.id));
    
    try {
      const { error } = await database.moveToCartFromWishlist(
        user.id, 
        item.product.id, 
        item.id
      );
      
      if (error) {
        throw error;
      }
      
      // Update local state optimistically
      setItems(prev => prev.filter(i => i.id !== item.id));
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
      window.dispatchEvent(new CustomEvent('cartChanged'));
    } catch (err: any) {
      // Revert on error
      await fetchWishlistItems();
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchWishlistItems}
          className="bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto mb-8 flex items-center justify-center">
          <Heart size={48} className="text-amber-600" />
        </div>
        <h2 className="font-serif text-2xl text-stone-900 mb-4">Your wishlist awaits its first love</h2>
        <p className="text-stone-600 mb-8 max-w-md mx-auto">
          Save your favorite products and rituals to easily find them later.
        </p>
        <button
          onClick={() => {
            // Get the setCurrentPage function from parent components
            // Since we don't have direct access, we'll use a different approach
            const event = new CustomEvent('navigateToProducts');
            window.dispatchEvent(event);
          }}
          className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-4 tracking-widest transition-all duration-300 rounded-lg font-medium transform hover:scale-105"
        >
          EXPLORE PRODUCTS
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const isUpdating = updatingItems.has(item.id);
        const isOutOfStock = item.product.stock_quantity === 0;
        
        return (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-6 shadow-lg border border-amber-100 transition-all duration-300 ${
              isUpdating ? 'opacity-50' : 'hover:shadow-xl hover:scale-105'
            }`}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl mb-4 flex items-center justify-center relative group">
              <img 
                src={productImages[item.product.id] || '/product_images/golden_graze1.png'}
                alt={item.product.name}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  if (e.currentTarget.src.includes('golden_graze1.png')) {
                    e.currentTarget.src = "/balm_images/firstPic.png";
                  } else if (e.currentTarget.src.includes('firstPic.png')) {
                    e.currentTarget.src = "/balm_images/Golder Graze.png";
                  }
                }}
              />
              
              {/* Remove button - always visible on mobile, hover on desktop */}
              <button
                onClick={() => removeFromWishlist(item.id)}
                disabled={isUpdating}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <Loader2 size={14} className="text-red-500 animate-spin" />
                ) : (
                  <Trash2 size={14} className="text-red-500" />
                )}
              </button>
              
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <span className="text-white font-medium text-sm">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="text-center">
              <h3 className="font-serif text-lg text-stone-900 mb-1">{item.product.name}</h3>
              {item.product.scent && (
                <p className="text-amber-600 text-sm mb-2">{item.product.scent}</p>
              )}
              
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Money cents={item.product.price * 100} className="text-xl font-serif text-stone-900" />
                {item.product.size && (
                  <span className="text-stone-600 text-sm">/ {item.product.size}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => moveToCart(item)}
                  disabled={isUpdating || isOutOfStock}
                  className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white py-3 px-4 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>UPDATING...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>{isOutOfStock ? 'OUT OF STOCK' : 'MOVE TO CART'}</span>
                    </>
                  )}
                </button>
                
                {/* Alternative Remove Button (bottom) */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  disabled={isUpdating}
                  className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 disabled:bg-stone-100 disabled:cursor-not-allowed py-2 px-4 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2 text-sm"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>REMOVING...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>REMOVE FROM WISHLIST</span>
                    </>
                  )}
                </button>
              </div>

              {/* Added date */}
              <div className="mt-4 pt-4 border-t border-stone-200">
                <p className="text-xs text-stone-500">
                  Added {new Date(item.added_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WishlistGrid;