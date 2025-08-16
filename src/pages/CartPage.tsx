import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionUser } from '../lib/hooks/useSessionUser';
import CartList from '../components/cart/CartList';
import CartTotals from '../components/cart/CartTotals';

const CartPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { user, loading } = useSessionUser();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    // Scroll to top when cart page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Redirect to sign in if not authenticated
  if (!loading && !user) {
    navigate('/signin');
    return null;
  }

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
            <span className="text-sm tracking-wider">Continue Shopping</span>
          </button>

          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">Your Sacred Cart</h1>
            <p className="text-stone-600 text-lg">
              {cartItems.length} {cartItems.length === 1 ? 'ritual' : 'rituals'} awaiting your embrace
            </p>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-stone-600">Loading your cart...</p>
            </div>
          </div>
        )}

        {/* Cart Content */}
        {!loading && user && (
          <div className={`${cartItems.length > 0 ? 'grid lg:grid-cols-3 gap-12' : ''}`}>
            {/* Cart Items */}
            <div className={cartItems.length > 0 ? "lg:col-span-2" : ""}>
              <div className={`transition-all duration-1000 delay-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <CartList onItemsChange={setCartItems} />
              </div>
              
              {/* Continue Shopping - only show if we have items */}
              {cartItems.length > 0 && (
                <div className={`mt-8 transition-all duration-1000 delay-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                  <button
                    onClick={() => navigate('/products')}
                    className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors group"
                  >
                    <span className="tracking-wider">← Continue Shopping</span>
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary - only show if we have items */}
            {cartItems.length > 0 && (
              <div className={`sticky top-24 transition-all duration-1000 delay-600 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <CartTotals items={cartItems} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;