import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useProductStock } from '../../lib/hooks/useProductStock';

interface StockIndicatorProps {
  productId: string;
  showPrice?: boolean;
  price?: number;
  className?: string;
}

const StockIndicator: React.FC<StockIndicatorProps> = ({
  productId,
  showPrice = false,
  price,
  className = ''
}) => {
  const { isLoading, stock, isOutOfStock, isLowStock } = useProductStock(productId);

  if (isLoading) {
    return (
      <div className={`text-stone-500 text-sm ${className}`}>
        Checking availability...
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Price */}
      {showPrice && price && (
        <div className="mb-2">
          <span className="text-2xl md:text-3xl font-serif text-stone-900">
            ${price.toFixed(2)}
          </span>
        </div>
      )}

      {/* Stock Status */}
      {isOutOfStock ? (
        <div className="flex items-center space-x-2 text-stone-600 bg-stone-100 px-3 py-2 rounded-lg">
          <AlertTriangle size={16} className="text-stone-500" />
          <span className="text-sm font-medium">This item is currently unavailable.</span>
        </div>
      ) : isLowStock ? (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <AlertTriangle size={16} className="text-red-500" />
          <span className="text-sm font-medium">Only {stock} left in stock!</span>
        </div>
      ) : (
        <div className="text-green-600 text-sm">
          ✓ In stock
        </div>
      )}
    </div>
  );
};

export default StockIndicator;