import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, Loader2, ShoppingBag } from 'lucide-react';
import { database, supabase } from '../../lib/supabase';
import { useSessionUser } from '../../lib/hooks/useSessionUser';
import Money from '../common/Money';
import { useProductStock } from '../../lib/hooks/useProductStock';

interface CartItem {
  id: string;
  quantity: number;
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

interface CartListProps {
  onItemsChange?: (items: CartItem[]) => void;
}

const CartList: React.FC<CartListProps> = ({ onItemsChange }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [productImages, setProductImages] = useState<{[key: string]: string}>({});
  const { user } = useSessionUser();

  useEffect(() => {
    if (user) {
      fetchCartItems();
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

  const fetchProductImages = async (items: CartItem[]) => {
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
  const fetchCartItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await database.getCartItems(user.id);
      
      if (error) {
        throw error;
      }
      
      setItems(data || []);
      
      // Fetch images for all cart products
      if (data && data.length > 0) {
        await fetchProductImages(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const { error } = await database.updateCartItemQuantity(itemId, newQuantity);
      
      if (error) {
        throw error;
      }
      
      // Update local state optimistically
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('cartChanged'));
    } catch (err: any) {
      // Revert on error
      await fetchCartItems();
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const { error } = await database.removeFromCart(itemId);
      
      if (error) {
        throw error;
      }
      
      // Update local state optimistically
      setItems(prev => prev.filter(item => item.id !== itemId));
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('cartChanged'));
    } catch (err: any) {
      // Revert on error
      await fetchCartItems();
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
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
          onClick={fetchCartItems}
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
          <ShoppingBag size={48} className="text-amber-600" />
        </div>
        <h2 className="font-serif text-2xl text-stone-900 mb-4">Your cart awaits its first ritual</h2>
        <p className="text-stone-600 mb-8 max-w-md mx-auto">
          Discover our ancestrally inspired tallow balms and begin your journey to radiant skin.
        </p>
        <button
          onClick={() => {
            // Get the setCurrentPage function from parent components
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
    <div className="space-y-4">
      {items.map((item) => {
        const isUpdating = updatingItems.has(item.id);
        const isOutOfStock = item.product.stock_quantity === 0;
        
        return (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-6 shadow-lg border border-amber-100 transition-all duration-300 ${
              isUpdating ? 'opacity-50' : 'hover:shadow-xl'
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Product Image */}
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
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
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <h3 className="font-serif text-lg text-stone-900 mb-1">{item.product.name}</h3>
                {item.product.scent && (
                  <p className="text-amber-600 text-sm mb-1">{item.product.scent}</p>
                )}
                {item.product.size && (
                  <p className="text-stone-600 text-sm">{item.product.size}</p>
                )}
                <StockStatus productId={item.product.id} />
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="w-8 h-8 bg-stone-100 hover:bg-amber-100 disabled:bg-stone-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                >
                  <Minus size={14} className="text-stone-600" />
                </button>
                
                <span className="w-8 text-center font-medium text-stone-900">
                  {isUpdating ? '...' : item.quantity}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isUpdating || isOutOfStock}
                  className="w-8 h-8 bg-stone-100 hover:bg-amber-100 disabled:bg-stone-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                >
                  <Plus size={14} className="text-stone-600" />
                </button>
              </div>

              {/* Price & Remove */}
              <div className="text-right">
                <div className="text-lg font-serif text-stone-900 mb-2">
                  <Money cents={item.product.price * item.quantity * 100} />
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={isUpdating}
                  className="text-stone-400 hover:text-red-500 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Stock status component for cart items
const StockStatus: React.FC<{ productId: string }> = ({ productId }) => {
  const { isOutOfStock, isLowStock, stock } = useProductStock(productId);
  
  if (isOutOfStock) {
    return <p className="text-red-500 text-sm font-medium">Out of Stock</p>;
  }
  
  if (isLowStock && stock) {
    return <p className="text-amber-600 text-sm font-medium">Only {stock} left</p>;
  }
  
  return null;
};

export default CartList;