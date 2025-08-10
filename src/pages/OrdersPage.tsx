import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/supabase';
import OrderCard from '../components/orders/OrderCard';
import OrdersFilters from '../components/orders/OrdersFilters';

interface OrdersPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedOrder?: (orderNumber: string) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ setCurrentPage, setSelectedOrder }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !isLoggedIn) {
      setCurrentPage('signin');
      return;
    }

    if (isLoggedIn && user) {
      setIsVisible(true);
      loadOrders();
      // Scroll to top when page loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isLoggedIn, user, authLoading, setCurrentPage]);

  useEffect(() => {
    if (user) {
      loadOrders(true); // Reset and reload when filters change
    }
  }, [searchTerm, selectedStatus]);

  const loadOrders = async (reset = false) => {
    if (!user) return;

    try {
      if (reset) {
        setIsLoading(true);
        setOrders([]);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const offset = reset ? 0 : orders.length;
      const limit = 10;
      
      const filters: any = {};
      if (selectedStatus) filters.status = selectedStatus;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const { data, error } = await database.getOrders(user.id, offset, limit, filters);
      
      if (error) {
        throw error;
      }
      
      if (reset) {
        setOrders(data || []);
      } else {
        setOrders(prev => [...prev, ...(data || [])]);
      }
      
      setHasMore((data || []).length === limit);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const handleOrderClick = (orderNumber: string) => {
    if (setSelectedOrder) {
      setSelectedOrder(orderNumber);
    }
    setCurrentPage('order-detail');
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={48} className="text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-stone-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not logged in (will redirect)
  if (!isLoggedIn || !user) {
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

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className={`transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider">Back to Home</span>
          </button>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
                <Package size={24} className="text-white" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl text-stone-900">My Orders</h1>
            </div>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              Track your Golden Graze orders and view your purchase history
            </p>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <OrdersFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 size={48} className="text-amber-400 animate-spin mx-auto mb-4" />
              <p className="text-stone-600">Loading your orders...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <Package size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-stone-900 mb-2">Unable to Load Orders</h3>
              <p className="text-stone-600 mb-6">{error}</p>
              <button
                onClick={() => loadOrders(true)}
                className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-colors rounded-lg"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && (
          <>
            {orders.length === 0 ? (
              /* No Orders */
              <div className={`text-center py-20 transition-all duration-1000 delay-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto mb-8 flex items-center justify-center">
                  <Package size={48} className="text-amber-600" />
                </div>
                <h2 className="font-serif text-2xl text-stone-900 mb-4">No Orders Yet</h2>
                <p className="text-stone-600 mb-8 max-w-md mx-auto">
                  {searchTerm || selectedStatus 
                    ? 'No orders match your current filters. Try adjusting your search or filter criteria.'
                    : 'You haven\'t placed any orders yet. Start your skincare journey with our ancestrally inspired products.'
                  }
                </p>
                {!searchTerm && !selectedStatus && (
                  <button
                    onClick={() => setCurrentPage('products')}
                    className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-4 tracking-widest transition-all duration-300 rounded-lg font-medium transform hover:scale-105"
                  >
                    SHOP NOW
                  </button>
                )}
              </div>
            ) : (
              /* Orders Grid */
              <div className="space-y-6">
                {orders.map((order, index) => (
                  <div
                    key={order.order_number}
                    className={`transition-all duration-1000 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${500 + index * 100}ms` }}
                  >
                    <OrderCard
                      order={order}
                      onClick={() => handleOrderClick(order.order_number)}
                    />
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-8">
                    <button
                      onClick={() => loadOrders(false)}
                      disabled={loadingMore}
                      className="bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-white px-8 py-3 tracking-widest transition-colors rounded-lg font-medium"
                    >
                      {loadingMore ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        'LOAD MORE ORDERS'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;