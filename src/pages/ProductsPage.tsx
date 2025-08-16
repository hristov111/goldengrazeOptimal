import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { database } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { useSessionUser } from '../lib/hooks/useSessionUser';
import AuthModal from '../components/AuthModal';
import AddToCartButton from '../components/common/AddToCartButton';
import StockIndicator from '../components/common/StockIndicator';

interface Product {
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
  created_at: string | null;
  updated_at: string | null;
}

interface ProductsPageProps {
}

const ProductsPage: React.FC<ProductsPageProps> = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [productImages, setProductImages] = useState<{[key: string]: string}>({});
  const { user, loading: authLoading } = useSessionUser();

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchWishlistItems();
    }
    setIsVisible(true);
    // Scroll to top when products page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user]);

  const fetchProductImages = async (products: Product[]) => {
    const imageMap: {[key: string]: string} = {};
    
    for (const product of products) {
      try {
        const { data, error } = await supabase
          .from('product_images')
          .select('public_url, storage_path')
          .eq('product_id', product.id)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          imageMap[product.id] = '/product_images/golden_graze1.png';
          continue;
        }
        
        if (data) {
          const imageUrl = data.public_url || data.storage_path;
          imageMap[product.id] = imageUrl || '/product_images/golden_graze1.png';
        } else {
          imageMap[product.id] = '/product_images/golden_graze1.png';
        }
      } catch (err: any) {
        imageMap[product.id] = '/product_images/golden_graze1.png';
      }
    }
    
    setProductImages(imageMap);
  };
  const fetchWishlistItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await database.getWishlistItems(user.id);
      if (error) throw error;
      
      const wishlistSet = new Set(data?.map(item => item.product.id) || []);
      setWishlistItems(wishlistSet);
    } catch (error) {
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await database.getProducts();
      
      if (error) {
        throw error;
      }
      
      setProducts(data || []);
      
      // Fetch images for all products
      if (data && data.length > 0) {
        await fetchProductImages(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    addToCartAsync(product);
  };

  const addToCartAsync = async (product: Product) => {
    if (!user) return;
    
    setUpdatingItems(prev => new Set(prev).add(product.id));
    
    try {
      const { error } = await database.addToCart(user.id, product.id, 1);
      
      if (error) {
        throw error;
      }
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('cartChanged'));
    } catch (error: any) {
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleAddToWishlist = (product: Product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (wishlistItems.has(product.id)) {
      removeFromWishlistAsync(product);
    } else {
      addToWishlistAsync(product);
    }
  };

  const addToWishlistAsync = async (product: Product) => {
    if (!user) return;
    
    setUpdatingItems(prev => new Set(prev).add(product.id));
    
    try {
      const { error } = await database.addToWishlist(user.id, product.id);
      
      if (error) {
        throw error;
      }
      
      setWishlistItems(prev => new Set(prev).add(product.id));
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
    } catch (error: any) {
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const removeFromWishlistAsync = async (product: Product) => {
    if (!user) return;
    
    setUpdatingItems(prev => new Set(prev).add(product.id));
    
    try {
      // Find the wishlist item to remove
      const { data: wishlistData, error: fetchError } = await database.getWishlistItems(user.id);
      if (fetchError) throw fetchError;
      
      const wishlistItem = wishlistData?.find(item => item.product.id === product.id);
      if (!wishlistItem) throw new Error('Wishlist item not found');
      
      const { error } = await database.removeFromWishlist(wishlistItem.id);
      
      if (error) {
        throw error;
      }
      
      setWishlistItems(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
    } catch (error: any) {
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleAuthModalSignIn = () => {
    setShowAuthModal(false);
    navigate('/signin');
  };

  const handleAuthModalSignUp = () => {
    setShowAuthModal(false);
    navigate('/signup');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'balm':
        return 'bg-amber-100 text-amber-800';
      case 'oil':
        return 'bg-green-100 text-green-800';
      case 'serum':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-32 left-16 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className={`transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider">Back to Home</span>
          </button>

          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">Our Sacred Collection</h1>
            <p className="text-stone-600 text-lg">
              Ancestrally inspired skincare rituals crafted with nature's finest ingredients
            </p>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 size={48} className="text-amber-400 animate-spin mx-auto mb-4" />
              <p className="text-stone-600">Loading our sacred collection...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-stone-900 mb-2">Unable to Load Products</h3>
              <p className="text-stone-600 mb-6">{error}</p>
              <button
                onClick={fetchProducts}
                className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-colors rounded-lg"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <>
            {products.length === 0 ? (
              /* No Products */
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto mb-8 flex items-center justify-center">
                  <ShoppingBag size={48} className="text-amber-600" />
                </div>
                <h2 className="font-serif text-2xl text-stone-900 mb-4">No Products Available</h2>
                <p className="text-stone-600 mb-8 max-w-md mx-auto">
                  Our sacred collection is being prepared. Please check back soon for our ancestrally inspired skincare rituals.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-4 tracking-widest transition-all duration-300 rounded-lg font-medium transform hover:scale-105"
                >
                  RETURN HOME
                </button>
              </div>
            ) : (
              /* Products Grid */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100 transition-all duration-1000 hover:shadow-2xl hover:scale-105 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    } cursor-pointer`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                    onClick={() => navigate('/product')}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl mb-6 flex items-center justify-center shadow-lg relative group overflow-hidden">
                      <img 
                        src={productImages[product.id] || '/product_images/golden_graze1.png'}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          if (e.currentTarget.src.includes('golden_graze1.png')) {
                            e.currentTarget.src = "/balm_images/firstPic.png";
                          } else if (e.currentTarget.src.includes('firstPic.png')) {
                            e.currentTarget.src = "/balm_images/Golder Graze.png";
                          }
                        }}
                      />
                      
                      {/* Stock indicator */}
                      {product.stock_quantity !== null && product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Only {product.stock_quantity} left
                        </div>
                      )}
                      
                      {/* Out of stock */}
                      {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                          <span className="text-white font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <h3 className="font-serif text-xl text-stone-900">{product.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      </div>
                      
                      {product.scent && (
                        <p className="text-amber-600 text-sm mb-2">{product.scent}</p>
                      )}
                      
                      {product.description && (
                        <p className="text-stone-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      )}
                      
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <span className="text-2xl font-serif text-stone-900">{formatPrice(product.price)}</span>
                        {product.size && (
                          <span className="text-stone-600 text-sm">/ {product.size}</span>
                        )}
                      </div>
                      
                      {/* Stock Status */}
                      <div className="mb-4">
                        <StockIndicator productId={product.id} />
                      </div>

                      {/* Rating (placeholder) */}
                      <div className="flex items-center justify-center space-x-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="text-amber-400 fill-current" />
                        ))}
                        <span className="text-stone-600 text-xs ml-2">(4.9)</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <AddToCartButton
                          productId={product.id}
                          productName={product.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          loading={updatingItems.has(product.id)}
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToWishlist(product);
                            }}
                            disabled={updatingItems.has(product.id)}
                            className="flex items-center justify-center space-x-1 text-stone-600 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-4 border border-stone-300 hover:border-amber-300 transition-colors text-sm rounded-lg col-span-2"
                          >
                            {updatingItems.has(product.id) ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-xs">...</span>
                              </>
                            ) : (
                              <>
                                <Heart 
                                  size={14} 
                                  className={wishlistItems.has(product.id) ? 'fill-current text-red-500' : ''} 
                                />
                                <span className="text-xs">
                                  {wishlistItems.has(product.id) ? 'Saved' : 'Save'}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        {!isLoading && !error && products.length > 0 && (
          <div className={`text-center mt-16 transition-all duration-1000 delay-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="bg-stone-900 p-8 rounded-2xl max-w-2xl mx-auto">
              <h3 className="font-serif text-2xl text-amber-400 mb-4">Begin Your Ritual Journey</h3>
              <p className="text-amber-200 mb-6">
                Each product is crafted with ancestral wisdom and modern luxury. Start your transformation today.
              </p>
              <button
                onClick={() => navigate('/')}
                className="group relative px-8 py-4 bg-amber-400 hover:bg-amber-500 text-white font-medium tracking-widest transition-all duration-300 rounded-lg"
              >
                <span className="flex items-center space-x-2">
                  <span>LEARN MORE ABOUT OUR STORY</span>
                  <div className="w-2 h-2 bg-white rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleAuthModalSignIn}
        onSignUp={handleAuthModalSignUp}
      />
    </div>
  );
};

export default ProductsPage;