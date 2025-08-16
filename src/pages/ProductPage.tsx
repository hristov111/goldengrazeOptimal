import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Heart, ShoppingBag, ChevronLeft, ChevronRight, Leaf, Droplets, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/supabase';
import { fetchProductWithImages, type ProductWithImages } from '../lib/products/fetchProductWithImages';
import ProductGallery from '../components/product/ProductGallery';
import AuthModal from '../components/AuthModal';
import BuyNowButton from '../components/common/BuyNowButton';
import AddToCartButton from '../components/common/AddToCartButton';
import StockIndicator from '../components/common/StockIndicator';
import QuantitySelector from '../components/common/QuantitySelector';

interface ProductPageProps {
  setCurrentPage: (page: string) => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ 
  setCurrentPage, 
  onSignIn = () => {}, 
  onSignUp = () => {} 
}) => {
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScent, setSelectedScent] = useState('Unscented');
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    loadProduct();
  }, []);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product?.id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the first available product since we don't have a specific product ID
      const { data: products, error: productsError } = await database.getProducts();
      
      if (productsError) {
        throw productsError;
      }
      
      if (!products || products.length === 0) {
        throw new Error('No products available');
      }
      
      // Use the first product
      const firstProduct = products[0];
      
      // Fetch images for this product
      const productData = await fetchProductWithImages(firstProduct.id);
      
      if (!productData) {
        // Fallback to product without images
        const productWithoutImages: ProductWithImages = {
          ...firstProduct,
          images: []
        };
        setProduct(productWithoutImages);
        return;
      }
      
      setProduct(productData);
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const scents = [
    { name: 'Unscented', price: 48, description: 'Pure tallow essence with no added fragrances' },
    { name: 'Lavender', price: 52, description: 'Calming Bulgarian lavender for evening rituals' },
    { name: 'Neroli', price: 52, description: 'Uplifting orange blossom for morning renewal' }
  ];

  const benefits = [
    { icon: Leaf, title: 'Deep Nourishment', description: 'Rich in fat-soluble vitamins A, D, E, and K' },
    { icon: Droplets, title: 'Intense Hydration', description: 'Biomimetic lipids that match skin composition' },
    { icon: Sparkles, title: 'Skin Renewal', description: 'Promotes cellular regeneration and healing' }
  ];

  const ingredients = [
    { name: 'Grass-fed Beef Tallow', percentage: '70%', description: 'The foundation of our formula' },
    { name: 'Organic Jojoba Oil', percentage: '15%', description: 'Mimics natural skin oils' },
    { name: 'Cold-pressed Rosehip Oil', percentage: '10%', description: 'Rich in vitamin C and antioxidants' },
    { name: 'Vitamin E (Tocopherol)', percentage: '3%', description: 'Natural preservative and antioxidant' },
    { name: 'Essential Oils', percentage: '2%', description: 'For scented varieties only' }
  ];

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
    } else {
      if (product) {
        addToCartAsync(product);
      }
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !product) return;
    
    try {
      const { data, error } = await database.isInWishlist(user.id, product.id);
      if (error) throw error;
      setIsInWishlist(data);
    } catch (error) {
    }
  };

  const addToCartAsync = async (product: ProductWithImages) => {
    if (!isLoggedIn) return;
    
    try {
      const { error } = await database.addToCart(user?.id || '', product.id, quantity);
      
      if (error) {
        throw error;
      }
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('cartChanged'));
      
    } catch (error: any) {
    }
  };

  const handleAddToWishlist = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
    } else {
      if (product) {
        if (isInWishlist) {
          removeFromWishlistAsync(product);
        } else {
          addToWishlistAsync(product);
        }
      }
    }
  };

  const addToWishlistAsync = async (product: ProductWithImages) => {
    if (!isLoggedIn) return;
    
    setIsUpdatingWishlist(true);
    
    try {
      const { error } = await database.addToWishlist(user?.id || '', product.id);
      
      if (error) {
        throw error;
      }
      
      setIsInWishlist(true);
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
      
    } catch (error: any) {
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  const removeFromWishlistAsync = async (product: ProductWithImages) => {
    if (!isLoggedIn) return;
    
    setIsUpdatingWishlist(true);
    
    try {
      // Find the wishlist item to remove
      const { data: wishlistData, error: fetchError } = await database.getWishlistItems(user?.id || '');
      if (fetchError) throw fetchError;
      
      const wishlistItem = wishlistData?.find(item => item.product.id === product.id);
      if (!wishlistItem) throw new Error('Wishlist item not found');
      
      const { error } = await database.removeFromWishlist(wishlistItem.id);
      
      if (error) {
        throw error;
      }
      
      setIsInWishlist(false);
      
      // Notify navigation to update counter
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
      
    } catch (error: any) {
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  const handleAuthModalSignIn = () => {
    setShowAuthModal(false);
    onSignIn();
    setCurrentPage('signin');
  };

  const handleAuthModalSignUp = () => {
    setShowAuthModal(false);
    onSignUp();
    setCurrentPage('signup');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-stone-600">Loading product details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <h3 className="font-serif text-xl text-stone-900 mb-2">Product Not Found</h3>
              <p className="text-stone-600 mb-6">{error || 'The requested product could not be found.'}</p>
              <button
                onClick={() => setCurrentPage('products')}
                className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-colors rounded-lg"
              >
                VIEW ALL PRODUCTS
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={() => setCurrentPage('products')}
          className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm tracking-wider">Back to Products</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Gallery */}
          <ProductGallery images={product.images} />

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-serif text-4xl text-stone-900 mb-4">{product.name}</h1>
              <p className="text-amber-600 text-lg tracking-wide mb-4">
                {product.scent && product.scent !== 'unscented' ? product.scent : 'Ancestrally inspired. Luxuriously crafted.'}
              </p>
              
              {/* Rating */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="text-amber-400 fill-current" />
                  ))}
                </div>
                <span className="text-stone-600">(127 rituals completed)</span>
                <button className="text-amber-600 hover:text-amber-700 text-sm underline">
                  Read reviews
                </button>
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-4xl font-serif text-stone-900">
                  ${product.price}
                </span>
                {product.size && (
                  <span className="text-stone-600">/ {product.size}</span>
                )}
                <span className="text-amber-600 text-sm">Free shipping over $75</span>
              </div>
              
              <StockIndicator productId={product.id} />
            </div>

            {/* Quantity Selector */}
            <QuantitySelector
              productId={product.id}
              quantity={quantity}
              onQuantityChange={setQuantity}
            />

            {/* Action Buttons */}
            <div className="space-y-4">
              <BuyNowButton
                productId={product.id}
                productName={product.name}
                onClick={() => setCurrentPage('checkout')}
                size="lg"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  onClick={handleAddToCart}
                  variant="secondary"
                />
                <button 
                  onClick={handleAddToWishlist}
                  disabled={isUpdatingWishlist}
                  className="flex items-center justify-center space-x-2 text-stone-600 hover:text-amber-600 py-3 px-6 border border-stone-300 hover:border-amber-300 transition-colors"
                >
                  {isUpdatingWishlist ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>...</span>
                    </>
                  ) : (
                    <>
                      <Heart 
                        size={16} 
                        className={isInWishlist ? 'fill-current text-red-500' : ''} 
                      />
                      <span>
                        {isInWishlist ? 'Saved' : 'Save'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-stone-50 p-6 rounded-lg">
              <h3 className="font-serif text-lg text-stone-900 mb-4">Why Tallow?</h3>
              {product.description && (
                <p className="text-stone-700 mb-4 leading-relaxed">{product.description}</p>
              )}
              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-stone-800">{benefit.title}</div>
                        <div className="text-stone-600 text-sm">{benefit.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Ritual Tips */}
        <div className="mt-20">
          <div>
            <h3 className="font-serif text-2xl text-stone-900 mb-6">Your Daily Ritual</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">1</div>
                <div>
                  <div className="font-medium text-stone-800">Morning Preparation</div>
                  <div className="text-stone-600 text-sm">Cleanse with warm water, pat dry gently</div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">2</div>
                <div>
                  <div className="font-medium text-stone-800">Sacred Application</div>
                  <div className="text-stone-600 text-sm">Use wooden spoon, warm between palms</div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">3</div>
                <div>
                  <div className="font-medium text-stone-800">Mindful Massage</div>
                  <div className="text-stone-600 text-sm">Gentle circular motions, breathe deeply</div>
                </div>
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
    </div>
  );
};

export default ProductPage;