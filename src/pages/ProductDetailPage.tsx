import React, { useState } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Heart, ShoppingBag, Loader2, AlertCircle, Package, Truck, Shield, Plus, Minus, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductBySlug } from "../api/products";
import SEO from "../components/SEO";
import { useSessionUser } from '../lib/hooks/useSessionUser';
import { database } from '../lib/supabase';
import { TTQ, identifyPII } from "../lib/tiktok";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const { user } = useSessionUser();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });

  // Track ViewContent when product loads
  useEffect(() => {
    if (!product) return;
    
    TTQ.viewContent({
      contents: [{
        content_id: product.id,
        content_type: "product",
        content_name: product.name,
      }],
      value: product.price_cents / 100,
      currency: "USD",
    });
  }, [product]);

  // Identify user if available
  useEffect(() => {
    if (user?.email) {
      identifyPII({
        email: user.email,
        external_id: user.id,
      });
    }
  }, [user]);

  const handleAddToCart = async () => {
    if (product.stock_quantity === 0 || (product.stock_quantity !== null && quantity > product.stock_quantity)) return;
    
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      const { error } = await database.addToCart(user.id, product.id, quantity);
      if (error) throw error;
      
      // Track AddToCart event
      TTQ.addToCart({
        contents: [{
          content_id: product.id,
          content_type: "product",
          content_name: product.name,
        }],
        value: (product.price_cents / 100) * quantity,
        currency: "USD",
      });
      
      // Show success feedback
      window.dispatchEvent(new CustomEvent('cartChanged'));
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!product) return;

    setIsAddingToWishlist(true);
    try {
      const { error } = await database.addToWishlist(user.id, product.id);
      if (error) throw error;
      
      // Track AddToWishlist event
      TTQ.addToWishlist({
        contents: [{
          content_id: product.id,
          content_type: "product",
          content_name: product.name,
        }],
        value: product.price_cents / 100,
        currency: "USD",
      });
      
      // Show success feedback
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleBuyNow = () => {
    if (product.stock_quantity === 0 || (product.stock_quantity !== null && quantity > product.stock_quantity)) return;
    
    // Track InitiateCheckout event
    if (product) {
      TTQ.initiateCheckout({
        contents: [{
          content_id: product.id,
          content_type: "product",
          content_name: product.name,
        }],
        value: (product.price_cents / 100) * quantity,
        currency: "USD",
      });
    }
    
    // Navigate to checkout with this product
    navigate('/checkout', { state: { productId: product?.id, quantity } });
  };

  const handleViewAllReviews = () => {
    // Switch to reviews tab and scroll to it
    setActiveTab('reviews');
    setTimeout(() => {
      const reviewsSection = document.getElementById('reviews-section');
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Lightbox component
  const Lightbox = () => {
    if (!showLightbox || !product) return null;

    const images = product.product_images || [];
    const currentImage = images[selectedImageIndex];

    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          onClick={() => setShowLightbox(false)}
        >
          <X size={24} />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
              disabled={selectedImageIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
              onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
              disabled={selectedImageIndex === images.length - 1}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Main image */}
        <div className="max-w-4xl w-full">
          {currentImage && (
            <img 
              src={currentImage.public_url || currentImage.storage_path || '/product_images/golden_graze1.png'} 
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl" 
              alt={currentImage.alt || product.name}
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
                  i === selectedImageIndex 
                    ? 'border-amber-400 opacity-100' 
                    : 'border-white/30 opacity-60 hover:opacity-80'
                }`}
                onClick={() => setSelectedImageIndex(i)}
              >
                <img 
                  src={img.public_url || img.storage_path || '/product_images/golden_graze1.png'} 
                  className="w-full h-full object-cover" 
                  alt={img.alt || `Thumbnail ${i + 1}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={48} className="text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-stone-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-stone-900 mb-2">Product Not Found</h3>
              <p className="text-stone-600 mb-6">
                The product you're looking for doesn't exist or may have been removed.
              </p>
              <Link
                to="/products"
                className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-colors rounded-lg inline-block"
              >
                BROWSE PRODUCTS
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const price = (product.price_cents / 100).toFixed(2);
  const images = product.product_images || [];
  const currentImage = images[selectedImageIndex] || { 
    public_url: '/product_images/golden_graze1.png', 
    alt: product.name 
  };

  const tabs = [
    { id: 'description', name: 'Description' },
    { id: 'ingredients', name: 'Ingredients' },
    { id: 'usage', name: 'How to Use' },
    { id: 'reviews', name: 'Reviews (127)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      <SEO
        title={product.name}
        description={product.short_description || product.description || `${product.name} - Premium tallow skincare from Golden Graze`}
        image={currentImage.public_url || currentImage.storage_path}
        url={`/products/${product.slug}`}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-stone-600 mb-8">
          <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-stone-900">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm tracking-wider">Back</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative group">
              <button
                onClick={() => setShowLightbox(true)}
                className="w-full aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl overflow-hidden shadow-xl border border-amber-200 hover:border-amber-400 transition-all duration-300 relative"
              >
                <img 
                  src={currentImage.public_url || currentImage.storage_path || '/product_images/golden_graze1.png'} 
                  alt={currentImage.alt || product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/product_images/golden_graze1.png';
                  }}
                />
                
                {/* Zoom overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ZoomIn size={20} className="text-stone-700" />
                  </div>
                </div>
                
                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index 
                        ? 'border-amber-400 ring-2 ring-amber-200' 
                        : 'border-stone-200 hover:border-amber-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={image.public_url || image.storage_path || '/product_images/golden_graze1.png'} 
                      alt={image.alt || `${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-2">{product.name}</h1>
              {product.category && (
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-current" />
                ))}
              </div>
              <span className="text-stone-600 text-sm">(4.9) • 127 reviews</span>
            </div>

            {/* Price */}
            <div className="text-3xl font-serif text-stone-900">${price}</div>

            {/* Stock Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-amber-100">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {product.stock_quantity === null ? (
                    <>
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-stone-600 font-medium">Stock status unknown</span>
                    </>
                  ) : product.stock_quantity === 0 ? (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium">Out of stock</span>
                    </>
                  ) : product.stock_quantity <= 5 ? (
                    <>
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-orange-600 font-medium">Only {product.stock_quantity} left in stock</span>
                    </>
                  ) : product.stock_quantity <= 20 ? (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-600 font-medium">{product.stock_quantity} in stock</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">{product.stock_quantity} in stock</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-lg text-stone-700 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-stone-700 text-sm tracking-wider">QUANTITY</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 hover:bg-stone-50 disabled:bg-stone-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      const maxQuantity = product.stock_quantity || 1;
                      setQuantity(Math.min(quantity + 1, maxQuantity));
                    }}
                    disabled={product.stock_quantity !== null && quantity >= product.stock_quantity}
                    className="px-4 py-2 hover:bg-stone-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {product.stock_quantity !== null && (
                  <span className="text-stone-600 text-sm">
                    {product.stock_quantity <= 5 
                      ? `Only ${product.stock_quantity} available` 
                      : `${product.stock_quantity} in stock`
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className={`w-full py-4 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2 shadow-lg ${
                  product.stock_quantity === 0
                    ? 'bg-stone-400 text-stone-600 cursor-not-allowed'
                    : 'bg-amber-400 hover:bg-amber-500 text-white transform hover:scale-105 hover:shadow-xl'
                }`}
              >
                <ShoppingBag size={20} />
                <span>{product.stock_quantity === 0 ? 'OUT OF STOCK' : 'BUY NOW'}</span>
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`w-full border-2 transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2 py-3 px-6 tracking-widest ${
                  product.stock_quantity === 0 
                    ? 'border-stone-300 text-stone-500 bg-stone-100 cursor-not-allowed' 
                    : 'border-amber-400 text-amber-700 hover:bg-amber-50 disabled:bg-stone-100 disabled:cursor-not-allowed'
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>ADDING...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    <span>{product.stock_quantity === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                  </>
                )}
              </button>

              {/* Add to Wishlist Button */}
              <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="w-full border-2 border-stone-300 text-stone-700 hover:bg-stone-50 disabled:bg-stone-100 disabled:cursor-not-allowed py-3 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                {isAddingToWishlist ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>ADDING TO WISHLIST...</span>
                  </>
                ) : (
                  <>
                    <Heart size={20} />
                    <span>ADD TO WISHLIST</span>
                  </>
                )}
              </button>
            </div>

            {/* Product Features */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100">
              <h3 className="font-serif text-lg text-stone-900 mb-4">Product Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Package size={16} className="text-amber-600" />
                  <span className="text-stone-700">Hand-crafted in small batches</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck size={16} className="text-amber-600" />
                  <span className="text-stone-700">Free shipping on orders over $75</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield size={16} className="text-amber-600" />
                  <span className="text-stone-700">30-day satisfaction guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Information */}
        <div className="mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-stone-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-sm font-medium tracking-wider transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-400'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'description' && (
                <div className="prose prose-stone max-w-none">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p className="text-stone-700 leading-relaxed">
                      Experience the transformative power of our ancestrally inspired tallow balm. 
                      Crafted with grass-fed beef tallow and organic botanicals, this luxurious 
                      skincare ritual connects you with nature's most nourishing ingredients.
                    </p>
                  )}
                </div>
              )}
              
              {activeTab === 'ingredients' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-stone-900 mb-2">Primary Ingredients</h4>
                      <ul className="space-y-2 text-stone-700">
                        <li>• Grass-fed beef tallow (rich in vitamins A, D, E, K)</li>
                        <li>• Organic jojoba oil</li>
                        <li>• Cold-pressed rosehip oil</li>
                        <li>• Organic coconut oil</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900 mb-2">Benefits</h4>
                      <ul className="space-y-2 text-stone-700">
                        <li>• Deep moisturization</li>
                        <li>• Skin barrier restoration</li>
                        <li>• Anti-aging properties</li>
                        <li>• Natural sun protection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'usage' && (
                <div>
                  <h4 className="font-medium text-stone-900 mb-4">How to Use</h4>
                  <ol className="space-y-3 text-stone-700">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
                      <span>Cleanse your skin with warm water and pat dry</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
                      <span>Take a small amount with the included wooden spoon</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
                      <span>Warm between your palms until it melts</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-white text-xs font-bold rounded-full flex items-center justify-center">4</span>
                      <span>Gently massage into skin using upward motions</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-white text-xs font-bold rounded-full flex items-center justify-center">5</span>
                      <span>Breathe deeply and embrace the ritual</span>
                    </li>
                  </ol>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div id="reviews-section" className="space-y-6">
                  {/* Reviews Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={20} className="text-amber-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-stone-700 font-medium">4.9 out of 5</span>
                    </div>
                    <p className="text-stone-600">Based on 127 verified reviews</p>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-4">
                    {[
                      {
                        name: "Sarah M.",
                        rating: 5,
                        date: "2 weeks ago",
                        review: "This tallow balm has completely transformed my skin! The texture is luxurious and it absorbs beautifully without any greasy residue. I've been using it for a month and my skin has never felt softer."
                      },
                      {
                        name: "Jennifer K.",
                        rating: 5,
                        date: "1 month ago", 
                        review: "I was skeptical about tallow-based skincare, but this product is incredible. It's helped with my dry patches and my skin looks so much more radiant. The quality is outstanding."
                      },
                      {
                        name: "Maria L.",
                        rating: 5,
                        date: "3 weeks ago",
                        review: "Love the natural ingredients and the ritual aspect of using this balm. It feels so nourishing and my skin drinks it up. Will definitely be reordering!"
                      }
                    ].map((review, index) => (
                      <div key={index} className="bg-stone-50 rounded-lg p-6 border border-stone-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium text-stone-900">{review.name}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex space-x-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} size={12} className="text-amber-400 fill-current" />
                                ))}
                              </div>
                              <span className="text-stone-500 text-sm">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-stone-700 leading-relaxed">{review.review}</p>
                      </div>
                    ))}
                  </div>

                  {/* Load More Reviews */}
                  <div className="text-center">
                    <button className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-3 tracking-widest transition-colors rounded-lg font-medium">
                      LOAD MORE REVIEWS
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox />
    </div>
  );
}