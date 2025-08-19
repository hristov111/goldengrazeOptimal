import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AddToCartButton from '../components/common/AddToCartButton';
import BuyNowButton from '../components/common/BuyNowButton';
import StockIndicator from '../components/common/StockIndicator';
import ProductGallery from '../components/product/ProductGallery';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  scent: string;
  size: string;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // If ID is provided, fetch that specific product
    // Otherwise, fetch the first available product
    fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      if (productId) {
        // Fetch specific product by ID
        query = query.eq('id', productId);
      } else {
        // Fetch first available product
        query = query.limit(1);
      }
      
      const { data, error } = await query.single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!user) {
      // Handle unauthenticated user
      return;
    }
    
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleReadReviews = () => {
    // Placeholder for reviews functionality
    alert('Reviews feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-spin" />
          <p className="text-amber-800">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 mb-2">Product Not Found</h1>
          <p className="text-amber-700 mb-4">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-amber-700 hover:text-amber-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <ProductGallery product={product} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-amber-800">
                  ${product.price.toFixed(2)}
                </span>
                <StockIndicator stock={product.stock_quantity} />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-amber-800">Category:</span>
                <span className="text-amber-700 capitalize">{product.category}</span>
              </div>
              {product.scent && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-amber-800">Scent:</span>
                  <span className="text-amber-700 capitalize">{product.scent}</span>
                </div>
              )}
              {product.size && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-amber-800">Size:</span>
                  <span className="text-amber-700">{product.size}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Description</h3>
                <p className="text-amber-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="font-medium text-amber-800">Quantity:</span>
              <div className="flex items-center border border-amber-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-amber-700 hover:bg-amber-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 text-amber-900 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3 py-2 text-amber-700 hover:bg-amber-100 transition-colors"
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <AddToCartButton
                  product={product}
                  quantity={quantity}
                  className="flex-1"
                />
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-lg border transition-colors ${
                    isInWishlist(product.id)
                      ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                      : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <BuyNowButton
                product={product}
                quantity={quantity}
                className="w-full"
              />

              <button
                onClick={handleReadReviews}
                className="w-full bg-amber-100 text-amber-800 py-3 px-6 rounded-lg hover:bg-amber-200 transition-colors font-medium"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Read reviews</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;