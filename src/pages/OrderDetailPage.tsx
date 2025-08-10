import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, ExternalLink, CreditCard, Loader2, AlertCircle, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/supabase';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import Timeline from '../components/orders/Timeline';
import Money from '../components/orders/Money';

interface OrderDetailPageProps {
  setCurrentPage: (page: string) => void;
  orderNumber: string;
}

const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ setCurrentPage, orderNumber }) => {
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !isLoggedIn) {
      setCurrentPage('signin');
      return;
    }

    if (isLoggedIn && user && orderNumber) {
      setIsVisible(true);
      loadOrderDetails();
      // Scroll to top when page loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isLoggedIn, user, authLoading, orderNumber, setCurrentPage]);

  const loadOrderDetails = async () => {
    if (!orderNumber) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Load order
      const { data: orderData, error: orderError } = await database.getOrderByNumber(orderNumber);
      
      if (orderError) {
        throw orderError;
      }
      
      if (!orderData) {
        throw new Error('Order not found');
      }
      
      setOrder(orderData);
      
      // Load items and events in parallel
      const [itemsRes, eventsRes] = await Promise.all([
        database.getOrderItems(orderData.id),
        database.getOrderEvents(orderData.id)
      ]);
      
      if (itemsRes.error) {
      } else {
        setItems(itemsRes.data || []);
      }
      
      if (eventsRes.error) {
      } else {
        setEvents(eventsRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!order) return;
    
    setIsPaymentLoading(true);
    try {
      // This would integrate with your Stripe checkout
      // For now, we'll show a placeholder
      alert('Stripe integration would be implemented here. This would redirect to Stripe Checkout.');
      
      // Example of what the Stripe integration would look like:
      /*
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: order.order_number })
      });
      
      const { url } = await response.json();
      window.location.href = url;
      */
    } catch (err: any) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={48} className="text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-stone-600">Loading order details...</p>
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
            onClick={() => setCurrentPage('orders')}
            className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider">Back to Orders</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 size={48} className="text-amber-400 animate-spin mx-auto mb-4" />
              <p className="text-stone-600">Loading order details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-stone-900 mb-2">Unable to Load Order</h3>
              <p className="text-stone-600 mb-6">{error}</p>
              <button
                onClick={loadOrderDetails}
                className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-colors rounded-lg"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* Order Details */}
        {!isLoading && !error && order && (
          <div className="space-y-8">
            {/* Order Header */}
            <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100 transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="font-serif text-3xl text-stone-900 mb-2">
                    Order #{order.order_number}
                  </h1>
                  <p className="text-stone-600">
                    Placed on {formatDate(order.placed_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <OrderStatusBadge status={order.status} />
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span className="text-sm font-medium">Track Package</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Pay Now Button */}
              {order.status === 'pending' && (
                <div className="mb-6">
                  <button
                    onClick={handlePayNow}
                    disabled={isPaymentLoading}
                    className="bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-white px-8 py-4 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center space-x-2 transform hover:scale-105"
                  >
                    <CreditCard size={20} />
                    <span>{isPaymentLoading ? 'Processing...' : 'PAY NOW'}</span>
                  </button>
                </div>
              )}

              {/* Order Total */}
              <div className="bg-stone-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-xl text-stone-900">Total</span>
                  <Money 
                    cents={order.total_cents} 
                    currency={order.currency}
                    className="font-serif text-2xl text-stone-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Timeline */}
              <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100 transition-all duration-1000 delay-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <h2 className="font-serif text-2xl text-stone-900 mb-6">Order Timeline</h2>
                <Timeline events={events} />
              </div>

              {/* Shipping Information */}
              <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100 transition-all duration-1000 delay-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <h2 className="font-serif text-2xl text-stone-900 mb-6">Shipping Information</h2>
                
                {order.shipping_name ? (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User size={16} className="text-stone-400 mt-1" />
                      <div>
                        <div className="font-medium text-stone-900">{order.shipping_name}</div>
                        {order.shipping_phone && (
                          <div className="text-stone-600 text-sm">{order.shipping_phone}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MapPin size={16} className="text-stone-400 mt-1" />
                      <div className="text-stone-700">
                        <div>{order.shipping_address1}</div>
                        {order.shipping_address2 && <div>{order.shipping_address2}</div>}
                        <div>
                          {order.shipping_city}, {order.shipping_state} {order.shipping_postal}
                        </div>
                        {order.shipping_country && <div>{order.shipping_country}</div>}
                      </div>
                    </div>
                    
                    {order.estimated_delivery && (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <div className="text-sm font-medium text-amber-800">Estimated Delivery</div>
                        <div className="text-amber-700">
                          {new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }).format(new Date(order.estimated_delivery))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-stone-500">
                    <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Shipping information will be available once your order is processed.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100 transition-all duration-1000 delay-900 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h2 className="font-serif text-2xl text-stone-900 mb-6">Order Items</h2>
              
              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-stone-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package size={24} className="text-amber-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-stone-900">{item.product_name}</h3>
                        {item.sku && (
                          <p className="text-sm text-stone-600">SKU: {item.sku}</p>
                        )}
                        <p className="text-sm text-stone-600">Quantity: {item.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <Money 
                          cents={item.unit_price_cents} 
                          currency={item.currency}
                          className="font-medium text-stone-900"
                        />
                        <div className="text-sm text-stone-600">each</div>
                      </div>
                      
                      <div className="text-right">
                        <Money 
                          cents={item.unit_price_cents * item.quantity} 
                          currency={item.currency}
                          className="font-medium text-stone-900"
                        />
                        <div className="text-sm text-stone-600">total</div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Totals */}
                  <div className="border-t border-stone-200 pt-4 space-y-2">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal</span>
                      <Money cents={order.subtotal_cents} currency={order.currency} />
                    </div>
                    {order.shipping_cents > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Shipping</span>
                        <Money cents={order.shipping_cents} currency={order.currency} />
                      </div>
                    )}
                    {order.tax_cents > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Tax</span>
                        <Money cents={order.tax_cents} currency={order.currency} />
                      </div>
                    )}
                    <div className="flex justify-between font-serif text-lg text-stone-900 border-t border-stone-200 pt-2">
                      <span>Total</span>
                      <Money cents={order.total_cents} currency={order.currency} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-stone-500">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No items found for this order.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;