import React, { useState } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Heart, ShoppingBag, Loader2, AlertCircle, Package, Truck, Shield } from 'lucide-react';
import { getProductBySlug } from "../api/products";
import SEO from "../components/SEO";
import { useSessionUser } from '../lib/hooks/useSessionUser';
import { database } from '../lib/supabase';
import AuthModal from '../components/AuthModal';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { user } = useSessionUser();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      const { error } = await database.addToCart(user.id, product.id, quantity);
      if (error) throw error;
      
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
      setShowAuthModal(true);
      return;
    }

    if (!product) return;

    setIsAddingToWishlist(true);
    try {
      const { error } = await database.addToWishlist(user.id, product.id);
      if (error) throw error;
      
      // Show success feedback
      window.dispatchEvent(new CustomEvent('wishlistChanged'));
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
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
  const primaryImage = product.images?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      <SEO
        title={product.name}
        description={product.short_description || product.description || `${product.name} - Premium tallow skincare from Golden Graze`}
        image={primaryImage}
        url={`/products/${product.slug}`}
        type="product"
        price={price}
        availability="in_stock"
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
            <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl overflow-hidden shadow-xl">
              {primaryImage ? (
                <img 
                  src={product.images[selectedImageIndex] || primaryImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/product_images/golden_graze1.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={64} className="text-amber-600" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-amber-400 ring-2 ring-amber-200' 
                        : 'border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} view ${index + 1}`}
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
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-stone-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-white py-4 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>ADDING TO CART...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="w-full border-2 border-amber-400 text-amber-700 hover:bg-amber-50 disabled:bg-stone-100 py-3 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2"
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

            {/* Full Description */}
            {product.description && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Description</h3>
                <div 
                  className="prose prose-stone max-w-none text-stone-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={() => {
          setShowAuthModal(false);
          navigate('/signin');
        }}
        onSignUp={() => {
          setShowAuthModal(false);
          navigate('/signup');
        }}
      />
    </div>
  );
}