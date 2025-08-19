import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Grid, List, Loader2, AlertCircle, ShoppingBag, Heart, Star } from 'lucide-react';
import { database } from '../lib/supabase';
import { useSessionUser } from '../lib/hooks/useSessionUser';
import AuthModal from '../components/AuthModal';

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

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [productImages, setProductImages] = useState<{[key: string]: string}>({});
  const { user } = useSessionUser();

  useEffect(() => {
    setIsVisible(true);
    fetchProducts();
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await database.getProducts();
      
      if (error) {
        throw error;
      }
      
      let filteredProducts = data || [];
      
      // Apply search filter
      if (searchTerm.trim()) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply category filter
      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default: // newest
          filteredProducts.sort((a, b) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
      }
      
      setProducts(filteredProducts);
      
      // Fetch images for all products
      if (filteredProducts.length > 0) {
        await fetchProductImages(filteredProducts);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductImages = async (products: Product[]) => {
    const imageMap: {[key: string]: string} = {};
    
    for (const product of products) {
      try {
        const { data, error } = await database.supabase
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

  const handleProductClick = (product: Product) => {
    navigate('/product');
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Add to cart logic would go here
    console.log('Adding to cart:', product);
  };

  const handleAddToWishlist = (product: Product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Add to wishlist logic would go here
    console.log('Adding to wishlist:', product);
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

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
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              Ancestrally inspired skincare rituals crafted with nature's finest ingredients
            </p>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100 mb-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <select
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <select
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-stone-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-amber-400 text-white' 
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-amber-400 text-white' 
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <List size={16} />
              </button>
            </div>
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
        {error && !isLoading && (
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

        {/* Products Grid/List */}
        {!isLoading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto mb-8 flex items-center justify-center">
                  <Search size={48} className="text-amber-600" />
                </div>
                <h2 className="font-serif text-2xl text-stone-900 mb-4">No Products Found</h2>
                <p className="text-stone-600 mb-8 max-w-md mx-auto">
                  {searchTerm || selectedCategory 
                    ? 'No products match your current search or filter criteria. Try adjusting your search terms.'
                    : 'Our sacred collection is being prepared. Please check back soon.'
                  }
                </p>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                    }}
                    className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-colors rounded-lg"
                  >
                    CLEAR FILTERS
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className={`flex items-center justify-between mb-6 transition-all duration-1000 delay-500 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                  <p className="text-stone-600">
                    Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                    {searchTerm && ` for "${searchTerm}"`}
                    {selectedCategory && ` in ${selectedCategory}`}
                  </p>
                </div>

                {/* Products Grid */}
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-4'
                }`}>
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className={`transition-all duration-1000 ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                      style={{ transitionDelay: `${600 + index * 100}ms` }}
                    >
                      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                        {/* Product Image */}
                        <div 
                          className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden relative cursor-pointer"
                          onClick={() => handleProductClick(product)}
                        >
                          <img 
                            src={productImages[product.id] || '/product_images/golden_graze1.png'}
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
                          
                          {/* Quick Actions Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="w-10 h-10 bg-amber-400 hover:bg-amber-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                              >
                                <ShoppingBag size={16} className="text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToWishlist(product);
                                }}
                                className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                              >
                                <Heart size={16} className="text-stone-600" />
                              </button>
                            </div>
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

                          {product.description && (
                            <p className="text-stone-600 text-sm mb-3 line-clamp-2">
                              {product.description}
                            </p>
                          )}

                          {/* Rating (placeholder) */}
                          <div className="flex items-center space-x-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className="text-amber-400 fill-current" />
                            ))}
                            <span className="text-stone-500 text-xs ml-1">(4.9)</span>
                          </div>

                          {/* Price and Details */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-serif text-stone-900">${product.price.toFixed(2)}</span>
                              {product.size && (
                                <span className="text-stone-600 text-sm ml-1">/ {product.size}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleProductClick(product)}
                              className="text-amber-600 group-hover:text-amber-700 transition-colors"
                            >
                              <span className="text-sm font-medium">View Details →</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
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
};

export default ProductsPage;