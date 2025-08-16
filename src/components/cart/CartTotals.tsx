import React from 'react';
import { useNavigate } from 'react-router-dom';
import Money from '../common/Money';
import { useProductStock } from '../../lib/hooks/useProductStock';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    price: number;
  };
}

interface CartTotalsProps {
  items: CartItem[];
  className?: string;
}

const CartTotals: React.FC<CartTotalsProps> = ({ items, className = '' }) => {
  const navigate = useNavigate();
  
  // Check if any items are out of stock
  const hasOutOfStockItems = items.some(item => {
    const { isOutOfStock } = useProductStock(item.product.id);
    return isOutOfStock;
  });

  const subtotalCents = items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity * 100);
  }, 0);

  const shippingCents = subtotalCents >= 7500 ? 0 : 1200; // Free shipping over $75
  const taxCents = Math.round(subtotalCents * 0.08); // 8% tax
  const totalCents = subtotalCents + shippingCents + taxCents;

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border border-amber-100 ${className}`}>
      <h2 className="font-serif text-xl text-stone-900 mb-6">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-stone-600">Subtotal</span>
          <Money cents={subtotalCents} className="font-medium text-stone-900" />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-stone-600">Shipping</span>
          <span className={`font-medium ${shippingCents === 0 ? 'text-green-600' : 'text-stone-900'}`}>
            {shippingCents === 0 ? 'FREE' : <Money cents={shippingCents} />}
          </span>
        </div>
        
        {shippingCents === 0 && (
          <div className="text-xs text-green-600 text-right">
            🎉 Free shipping unlocked!
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-stone-600">Tax</span>
          <Money cents={taxCents} className="font-medium text-stone-900" />
        </div>
        
        <div className="border-t border-stone-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-serif text-stone-900">Total</span>
            <Money cents={totalCents} className="text-xl font-serif text-stone-900" />
          </div>
        </div>
      </div>
      
      {hasOutOfStockItems ? (
        <div className="mt-6">
          <div className="bg-stone-100 text-stone-600 py-4 px-6 tracking-widest rounded-lg font-medium text-center cursor-not-allowed">
            REMOVE OUT OF STOCK ITEMS TO CHECKOUT
          </div>
          <p className="text-stone-500 text-xs text-center mt-2">
            Some items in your cart are no longer available
          </p>
        </div>
      ) : (
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full mt-6 bg-amber-400 hover:bg-amber-500 text-white py-4 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium"
        >
          PROCEED TO CHECKOUT
        </button>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-xs text-stone-500">
          Secure checkout powered by Stripe
        </p>
      </div>
    </div>
  );
};

// Hook to check stock status for cart totals
const useCartStockStatus = (items: any[]) => {
  return items.some(item => {
    const { isOutOfStock } = useProductStock(item.product.id);
    return isOutOfStock;
  });
};

export default CartTotals;