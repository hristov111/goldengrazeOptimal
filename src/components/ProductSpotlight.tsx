import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { database } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { useSessionUser } from '../lib/hooks/useSessionUser';
import AuthModal from './AuthModal';
import BuyNowButton from './common/BuyNowButton';
import AddToCartButton from './common/AddToCartButton';
import StockIndicator from './common/StockIndicator';

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

interface ProductSpotlightProps {
  // Remove setCurrentPage prop since we're using React Router
}

const ProductSpotlight: React.FC<ProductSpotlightProps> = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('texture');
  const [isVisible, setIsVisible] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string>('');
  const sectionRef = useRef<HTMLDivElement>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const { user } = useSessionUser();

  const tabs = [
    { id: 'texture', name: 'Texture View' },
    { id: 'ingredients', name: 'Ingredients' },
    { id: 'howto', name: 'How to Use' }
  ];

  useEffect(() => {
    fetchProduct();
    if (user) {
      fetchWishlistItems();
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await database.getProducts();
      
      if (error) {
        throw error;
      }
      
      // Get the first product for spotlight
      const firstProduct = data && data.length > 0 ? data[0] : null;
      setProduct(firstProduct);
      
      // Fetch product image from product_images table
      if (firstProduct) {
        await fetchProductImage(firstProduct.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductImage = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('public_url, storage_path')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        setProductImage('/product_images/golden_graze1.png');
        return;
      }
      
      if (data) {
        const imageUrl = data.public_url || data.storage_path;
        setProductImage(imageUrl || '/product_images/golden_graze1.png');
      } else {
        setProductImage('/product_images/golden_graze1.png');
      }
    } catch (err: any) {
      setProductImage('/product_images/golden_graze1.png');
    }
  };

  const handleImageError = () => {
    if (productImage === '/product_images/golden_graze1.png') {
      setProductImage('/balm_images/firstPic.png');
    } else if (productImage !== '/balm_images/firstPic.png') {
      setProductImage('/product_images/golden_graze1.png');
    }
  };
  const handleAddToCart = () => {
    if (!product) return;
    
    if (!user) {
      setShowAuthModal(true);
    } else {
      addToCartAsync(product);
    }
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

  const handleAddToWishlist = () => {
    if (!product) return;
    
    if (!user) {
      setShowAuthModal(true);
    } else {
      if (wishlistItems.has(product.id)) {
        removeFromWishlistAsync(product);
      } else {
        addToWishlistAsync(product);
      }
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
      
      // Refresh wishlist items to ensure sync
      await fetchWishlistItems();
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
    } catch (error: any) {
      alert('Failed to add to wishlist. Please try again.');
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
      
      // Refresh wishlist items to ensure sync
      await fetchWishlistItems();
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
    } catch (error: any) {
      alert('Failed to remove from wishlist. Please try again.');
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

  const isInWishlist = (name: string, scent: string) => {
    return product ? wishlistItems.has(product.id) : false;
  };

  // Loading state
  if (isLoading) {
    return (
      <section ref={sectionRef} className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-stone-600">Loading product...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <section ref={sectionRef} className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <h3 className="font-serif text-xl text-stone-900 mb-2">Unable to Load Product</h3>
              <p className="text-stone-600 mb-6">{error || 'No products available'}</p>
              <button
                onClick={fetchProduct}
                className="bg-amber-400 hover:bg-amber-500 text-black py-2 px-6 rounded-lg transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="min-h-screen bg-white relative overflow-hidden flex items-center">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
          }}
        >
          <source src="https://storage.googleapis.com/video_bucketfgasf12/CowsDropJarFixed.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Video overlay for content readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Product Image */}
          <div className={`lg:col-span-2 transition-all duration-1000 ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
            <div className="aspect-square bg-gradient-to-br from-amber-100/20 to-amber-200/30 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl relative group border border-amber-400/20">
              <img 
                src={productImage || '/product_images/golden_graze1.png'} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={handleImageError}
              />
              
              {/* Hover overlay */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-amber-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 cursor-pointer"
                onClick={() => navigate('/product')}
              ></div>
              
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/30 to-amber-600/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </div>
          </div>

          {/* Product Info Panel */}
          <div className={`lg:col-span-3 transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}>
            <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 shadow-2xl max-w-lg">
              <h3 className="font-serif text-2xl md:text-3xl text-white mb-4 leading-tight">{product.name}</h3>
              <p className="text-amber-400 mb-4 tracking-wide">
                {product.scent && product.scent !== 'unscented' ? product.scent : 'Ancestrally inspired. Luxuriously crafted.'}
              </p>
              
              {/* Rating */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-current drop-shadow-sm" />
                  ))}
                </div>
                <span className="text-amber-200 text-sm">(127 rituals completed)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline space-x-3 mb-4">
                  <span className="text-3xl md:text-4xl font-serif text-white drop-shadow-lg">{formatPrice(product.price)}</span>
                  {product.size && (
                    <span className="text-amber-200 ml-2 text-lg">/ {product.size}</span>
                  )}
                </div>
                
                {/* Stock Status with custom styling for dark background */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <StockIndicator 
                    productId={product.id} 
                    className="[&_.text-stone-600]:text-amber-200 [&_.text-red-600]:text-red-300 [&_.text-green-600]:text-green-300 [&_.bg-stone-100]:bg-white/10 [&_.bg-red-50]:bg-red-400/10 [&_.border-red-200]:border-red-400/20"
                  />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 mb-6">
                <BuyNowButton
                  productId={product.id}
                  productName={product.name}
                  onClick={() => navigate('/checkout')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                />
                
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  onClick={handleAddToCart}
                  loading={updatingItems.has(product.id)}
                  className="text-black hover:text-white"
                />
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black py-3 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium backdrop-blur-sm hover:backdrop-blur-md shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  BUY NOW
                </button>
              </div>

              {/* Wishlist Button - Separate for better spacing */}
              <div className="border-t border-white/20 pt-4">
                <button 
                  onClick={handleAddToWishlist}
                  disabled={updatingItems.has(product.id)}
                  className="w-full flex items-center justify-center space-x-2 text-amber-200 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-4 border border-amber-400/30 hover:border-amber-400 hover:bg-amber-400/10 transition-all duration-300 rounded-lg backdrop-blur-sm"
                >
                  {updatingItems.has(product.id) ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-sm">...</span>
                    </>
                  ) : (
                    <>
                      <Heart size={14} className={wishlistItems.has(product.id) ? 'fill-current text-red-500' : ''} />
                      <span className="text-sm">
                        {wishlistItems.has(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tabbed Information */}
            <div className="mt-8">
              <div className="flex border-b border-white/20 backdrop-blur-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 text-sm tracking-wider transition-all duration-300 font-medium ${
                      activeTab === tab.id
                        ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-400/10'
                        : 'text-amber-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              <div className="py-6 bg-white/5 backdrop-blur-sm rounded-b-2xl px-6">
                {activeTab === 'texture' && (
                  <div>
                    <p className="text-amber-100 leading-relaxed font-light">
                      {product.description || 
                        `Our ${product.name.toLowerCase()} has a luxuriously smooth, butter-like consistency that melts 
                        instantly upon contact with your skin. The whipping process creates an airy, 
                        cloud-like texture that absorbs deeply without leaving any greasy residue.`
                      }
                    </p>
                  </div>
                )}
                
                {activeTab === 'ingredients' && (
                  <div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-white">Grass-fed Beef Tallow</span>
                        <p className="text-amber-200 text-sm">Rich in vitamins A, D, E, and K</p>
                      </div>
                      <div>
                        <span className="font-medium text-white">Organic Jojoba Oil</span>
                        <p className="text-amber-200 text-sm">Mimics skin's natural sebum</p>
                      </div>
                      <div>
                        <span className="font-medium text-white">Cold-pressed Rosehip Oil</span>
                        <p className="text-amber-200 text-sm">Regenerative and brightening</p>
                      </div>
                      {product.scent && product.scent !== 'unscented' && (
                        <div>
                          <span className="font-medium text-white">Essential Oils ({product.scent})</span>
                          <p className="text-amber-200 text-sm">Natural fragrance and aromatherapy benefits</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'howto' && (
                  <div>
                    <ol className="space-y-3 text-amber-100 font-light leading-relaxed">
                      <li>1. Cleanse your skin with warm water</li>
                      <li>2. Take a small amount with the included wooden spoon</li>
                      <li>3. Warm between your palms until it melts</li>
                      <li>4. Gently massage into damp skin</li>
                      <li>5. Breathe deeply and embrace the ritual</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleAuthModalSignIn}
        onSignUp={handleAuthModalSignUp}
      />
    </section>
  );
};

export default ProductSpotlight;