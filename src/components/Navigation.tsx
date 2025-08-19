import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { useSessionUser } from '../lib/hooks/useSessionUser';
import { database, supabase } from '../lib/supabase';

interface NavigationProps {
  isLoggedIn: boolean;
  user: { name: string; email: string; id: string } | null;
  onSignOut: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isLoggedIn, user, onSignOut }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsHovered, setIsProductsHovered] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user: sessionUser } = useSessionUser();

  // Fetch cart and wishlist counts when user changes
  useEffect(() => {
    if (sessionUser) {
      fetchCounts();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [sessionUser]);

  // Listen for cart/wishlist changes
  useEffect(() => {
    const handleCountChange = () => {
      if (sessionUser) fetchCounts();
    };

    window.addEventListener('wishlistChanged', handleCountChange);
    window.addEventListener('cartChanged', handleCountChange);
    
    return () => {
      window.removeEventListener('wishlistChanged', handleCountChange);
      window.removeEventListener('cartChanged', handleCountChange);
    };
  }, [sessionUser]);

  // Check admin status when user changes
  useEffect(() => {
    if (sessionUser) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [sessionUser]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAdminStatus = async () => {
    if (!sessionUser) return;
    
    try {
      const { data: profile, error } = await database.getUserProfile(sessionUser.id);
      
      if (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(profile?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchCounts = async () => {
    if (!sessionUser) return;

    try {
      const [cartRes, wishlistRes] = await Promise.all([
        database.getCartItems(sessionUser.id),
        database.getWishlistItems(sessionUser.id)
      ]);

      if (cartRes.data) {
        const totalItems = cartRes.data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      }

      if (wishlistRes.data) {
        setWishlistCount(wishlistRes.data.length);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const fetchProducts = async () => {
    if (products.length > 0) return; // Don't fetch if already loaded
    
    setIsLoadingProducts(true);
    setProductsError(null);
    
    try {
      const { data, error } = await database.getProducts();
      
      if (error) {
        setProductsError(error.message || 'Failed to load products');
        return;
      }
      
      setProducts(data || []);
    } catch (err: any) {
      setProductsError('Network error loading products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProductsHover = (isHovering: boolean) => {
    setIsProductsHovered(isHovering);
    if (isHovering) fetchProducts();
  };

  const menuItems = [
    ...(isAdmin ? [{ 
      name: 'Admin Dashboard', 
      icon: '⚙️', 
      action: () => navigate('/admin'),
      className: 'text-amber-300 font-medium border-b border-amber-400/20 pb-2 mb-2'
    }] : []),
    { name: 'My Orders', icon: '📦', action: () => navigate('/orders') },
    { name: 'Account Settings', icon: '⚙️', action: () => navigate('/account-settings') },
    { name: 'Wishlist', icon: '❤️', action: () => navigate('/wishlist') },
    { name: 'Help & Support', icon: '💬', action: () => navigate('/help') },
    { name: 'Support Tickets', icon: '🎫', action: () => navigate('/support-tickets') }
  ];

  const renderCountBadge = (count: number) => {
    if (count === 0) return null;
    return (
      <div className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
        {count > 99 ? '99+' : count}
      </div>
    );
  };

  const renderCartButton = (isMobile = false) => (
    <button 
      onClick={() => navigate('/cart')}
      className={`relative group text-amber-400 hover:text-amber-300 transition-all duration-300 hover:scale-110 ${
        isMobile ? 'flex items-center space-x-2' : ''
      }`}
      aria-label="View Cart"
    >
      <div className="flex items-center space-x-2 relative">
        <ShoppingBag size={20} />
        {renderCountBadge(cartCount)}
        {isMobile && <span>Cart</span>}
      </div>
      {!isMobile && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
      )}
    </button>
  );

  const renderWishlistButton = (isMobile = false) => (
    <button 
      onClick={() => navigate('/wishlist')}
      className={`relative group text-amber-400 hover:text-amber-300 transition-all duration-300 hover:scale-110 ${
        isMobile ? 'flex items-center space-x-2' : ''
      }`}
      aria-label="View Wishlist"
    >
      <div className="flex items-center space-x-2 relative">
        <Heart size={20} />
        {renderCountBadge(wishlistCount)}
        {isMobile && <span>Wishlist</span>}
      </div>
      {!isMobile && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
      )}
    </button>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-black/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center group transition-all duration-300"
          >
            <img 
              src="/balm_images/Golder Graze.png" 
              alt="Golden Graze" 
              className="h-12 w-auto filter brightness-100 group-hover:brightness-110 transition-all duration-300"
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Products Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => handleProductsHover(true)}
              onMouseLeave={() => handleProductsHover(false)}
            >
              <button
                onClick={() => navigate('/products')}
                className="flex items-center space-x-1 text-white hover:text-amber-400 transition-all duration-300 text-sm tracking-wider group-hover:scale-105"
              >
                <div className="w-4 h-4 bg-gradient-to-br from-amber-100 to-amber-200 rounded-sm flex items-center justify-center mr-1">
                  <img 
                    src="/product_images/golden_graze1.png" 
                    alt="" 
                    className="w-3 h-3 object-cover rounded-sm"
                    onError={(e) => {
                      e.currentTarget.src = "/balm_images/firstPic.png";
                    }}
                  />
                </div>
                <span>Products</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-300 ${
                    isProductsHovered ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              
              {/* Products Dropdown Menu */}
              <div className={`absolute top-full left-0 mt-1 w-72 bg-black/95 backdrop-blur-sm border border-amber-400/20 rounded-lg shadow-2xl transition-all duration-500 origin-top ${
                isProductsHovered 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
                <div className="p-4">
                  {isLoadingProducts && (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-amber-200 text-sm">Loading products...</span>
                    </div>
                  )}
                  
                  {productsError && !isLoadingProducts && (
                    <div className="text-center py-6">
                      <div className="text-red-400 text-sm mb-2">Failed to load products</div>
                      <button
                        onClick={() => {
                          setProducts([]);
                          fetchProducts();
                        }}
                        className="text-amber-400 hover:text-amber-300 text-xs underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                  
                  {!isLoadingProducts && !productsError && products.length > 0 && (
                    <>
                      {products.map((product, index) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            navigate('/product');
                            setIsProductsHovered(false);
                          }}
                          className={`w-full text-left px-6 py-4 text-white hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all duration-300 text-sm tracking-wide transform ${
                            isProductsHovered
                              ? 'translate-x-0 opacity-100' 
                              : 'translate-x-4 opacity-0'
                          }`}
                          style={{ 
                            transitionDelay: isProductsHovered ? `${index * 100}ms` : '0ms' 
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-amber-400 rounded-full opacity-60"></div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                {product.scent && product.scent !== 'unscented' && (
                                  <div className="text-amber-300 text-xs">{product.scent}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-amber-400 text-sm font-medium">
                              ${product.price}
                            </div>
                          </div>
                        </button>
                      ))}
                      
                      <div className="border-t border-amber-400/20 mt-3 pt-3">
                        <button
                          onClick={() => {
                            navigate('/products');
                            setIsProductsHovered(false);
                          }}
                          className="w-full text-center px-6 py-3 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-lg transition-all duration-300 text-sm tracking-wider font-medium"
                        >
                          VIEW ALL PRODUCTS
                        </button>
                      </div>
                    </>
                  )}
                  
                  {!isLoadingProducts && !productsError && products.length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-amber-200 text-sm mb-2">No products available</div>
                      <button
                        onClick={() => {
                          navigate('/products');
                          setIsProductsHovered(false);
                        }}
                        className="text-amber-400 hover:text-amber-300 text-xs underline"
                      >
                        View products page
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="absolute -top-1 left-6 w-8 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></div>
                <div className="absolute -top-2 left-0 right-0 h-4 bg-transparent"></div>
              </div>
            </div>
            
            {/* Auth Section */}
            {isLoggedIn ? (
              /* User Dropdown */
              <div 
                className="relative"
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <button className="flex items-center space-x-2 text-white hover:text-amber-400 transition-all duration-300 text-sm tracking-wider group">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    {user?.name.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-300 ${
                      isUserDropdownOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>
                
                {/* User Dropdown Menu */}
                <div className={`absolute top-full right-0 mt-1 w-56 bg-black/95 backdrop-blur-sm border border-amber-400/20 rounded-lg shadow-2xl transition-all duration-500 origin-top-right ${
                  isUserDropdownOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="p-4">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-amber-400/20 mb-2">
                      <div className="text-white font-medium">{user?.name || 'User'}</div>
                      <div className="text-amber-200 text-xs">{user?.email}</div>
                    </div>
                    
                    {/* Menu Items */}
                    {menuItems.map((item, index) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          item.action();
                          setIsUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-white hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all duration-300 text-sm tracking-wide transform ${
                          isUserDropdownOpen 
                            ? 'translate-x-0 opacity-100' 
                            : 'translate-x-4 opacity-0'
                        } ${item.className || ''}`}
                        style={{ 
                          transitionDelay: isUserDropdownOpen ? `${index * 50}ms` : '0ms' 
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-base">{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                      </button>
                    ))}
                    
                    {/* Sign Out */}
                    <div className="border-t border-amber-400/20 mt-2 pt-2">
                      <button
                        onClick={() => {
                          onSignOut();
                          setIsUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-300 text-sm tracking-wide transform ${
                          isUserDropdownOpen 
                            ? 'translate-x-0 opacity-100' 
                            : 'translate-x-4 opacity-0'
                        }`}
                        style={{ 
                          transitionDelay: isUserDropdownOpen ? `${menuItems.length * 50}ms` : '0ms' 
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-base">🚪</span>
                          <span>Sign Out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="absolute -top-1 right-6 w-8 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></div>
                  <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent"></div>
                </div>
              </div>
            ) : (
              /* Sign In/Up Buttons */
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/signin')}
                  className="text-amber-400 hover:text-amber-300 transition-all duration-300 text-sm tracking-wider hover:scale-105"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-medium text-sm tracking-wider rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            {renderWishlistButton()}
            {renderCartButton()}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-amber-400 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-amber-400/20">
            <div className="flex flex-col space-y-4 mt-4">
              <button
                onClick={() => {
                  navigate('/products');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-colors text-left tracking-wider font-medium"
              >
                <div className="w-4 h-4 bg-gradient-to-br from-amber-100 to-amber-200 rounded-sm flex items-center justify-center">
                  <img 
                    src="/product_images/golden_graze1.png" 
                    alt="" 
                    className="w-3 h-3 object-cover rounded-sm"
                    onError={(e) => {
                      e.currentTarget.src = "/balm_images/firstPic.png";
                    }}
                  />
                </div>
                <span>Products</span>
              </button>
              
              {renderCartButton(true)}
              {renderWishlistButton(true)}
              
              {/* Mobile Auth/User Menu */}
              {!isLoggedIn ? (
                <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-amber-400/20">
                  <button
                    onClick={() => {
                      navigate('/signin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-amber-400 hover:text-amber-300 transition-colors text-left"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-amber-400 hover:text-amber-300 transition-colors text-left"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-amber-400/20">
                  <div className="text-amber-400 font-medium mb-2">{user?.name || 'User'}</div>
                  <div className="flex flex-col space-y-2 text-sm">
                    {menuItems.map((item) => (
                      <button 
                        key={item.name}
                        onClick={() => {
                          item.action();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`text-amber-200 hover:text-amber-400 transition-colors text-left ${
                          item.className || ''
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                    <button 
                      onClick={() => {
                        onSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;