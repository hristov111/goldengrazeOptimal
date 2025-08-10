import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useProductStock } from '../../lib/hooks/useProductStock';

interface QuantitySelectorProps {
  productId: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  className?: string;
  maxQuantity?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  productId,
  quantity,
  onQuantityChange,
  className = '',
  maxQuantity = 10
}) => {
  const { isLoading, stock, isOutOfStock } = useProductStock(productId);

  // Don't render if out of stock
  if (isOutOfStock) {
    return null;
  }

  const effectiveMaxQuantity = stock ? Math.min(maxQuantity, stock) : maxQuantity;

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < effectiveMaxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  if (isLoading) {
    return (
      <div className={`text-stone-500 text-sm ${className}`}>
        Loading...
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-stone-700 text-sm tracking-widest mb-3">QUANTITY</label>
      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
          <button
            onClick={handleDecrease}
            disabled={quantity <= 1}
            className="px-3 py-2 hover:bg-amber-50 disabled:bg-stone-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus size={16} className="text-stone-600" />
          </button>
          <span className="px-4 py-2 min-w-[3rem] text-center font-medium text-stone-900 bg-white">
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={quantity >= effectiveMaxQuantity}
            className="px-3 py-2 hover:bg-amber-50 disabled:bg-stone-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus size={16} className="text-stone-600" />
          </button>
        </div>
        
        {stock && stock > 0 && (
          <span className="text-stone-600 text-sm">
            {stock <= 5 ? `Only ${stock} available` : `${stock} in stock`}
          </span>
        )}
      </div>
    </div>
  );
};

export default QuantitySelector;