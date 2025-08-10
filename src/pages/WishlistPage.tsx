import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { useSessionUser } from '../lib/hooks/useSessionUser';
import WishlistGrid from '../components/wishlist/WishlistGrid';

interface WishlistPageProps {
  setCurrentPage: (page: string) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ setCurrentPage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const { user, loading } = useSessionUser();

  useEffect(() => {
    const handleNavigateToProducts = () => {
      setCurrentPage('products');
    };

    window.addEventListener('navigateToProducts', handleNavigateToProducts);
    return () => window.removeEventListener('navigateToProducts', handleNavigateToProducts);
  }, [setCurrentPage]);

  useEffect(() => {
    setIsVisible(true);
    // Scroll to top when wishlist page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Redirect to sign in if not authenticated
  if (!loading && !user) {
    setCurrentPage('signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-32 right-16 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-amber-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className={`transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider">Continue Shopping</span>
          </button>

          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">Your Sacred Wishlist</h1>
            <p className="text-stone-600 text-lg">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'ritual' : 'rituals'} saved for later
            </p>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-stone-600">Loading your wishlist...</p>
            </div>
          </div>
        )}

        {/* Wishlist Content */}
        {!loading && user && (
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <WishlistGrid onItemsChange={setWishlistItems} />
            
            {/* Continue Shopping - only show if we have items */}
            {wishlistItems.length > 0 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setCurrentPage('products')}
                  className="group relative px-8 py-4 bg-transparent border-2 border-amber-400 text-amber-700 hover:bg-amber-400 hover:text-white font-medium tracking-widest transition-all duration-300 rounded-lg"
                >
                  <span className="flex items-center space-x-2">
                    <span>DISCOVER MORE RITUALS</span>
                    <div className="w-2 h-2 bg-current rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;