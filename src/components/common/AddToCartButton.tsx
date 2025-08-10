import React from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useProductStock } from '../../lib/hooks/useProductStock';

interface AddToCartButtonProps {
  productId: string;
  productName?: string;
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productName = 'product',
  onClick,
  className = '',
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false
}) => {
  const { isLoading: stockLoading, isOutOfStock } = useProductStock(productId);

  const isDisabled = disabled || loading || stockLoading || isOutOfStock;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-4 text-sm';
      case 'lg':
        return 'py-4 px-8 text-lg';
      default:
        return 'py-3 px-6';
    }
  };

  const getVariantClasses = () => {
    if (isOutOfStock) {
      return 'bg-stone-300 text-stone-600 cursor-not-allowed';
    }

    if (variant === 'secondary') {
      return 'border-2 border-amber-400 text-amber-700 hover:bg-amber-50 disabled:border-stone-300 disabled:text-stone-500 disabled:bg-stone-100';
    }

    return 'bg-amber-400 hover:bg-amber-500 text-white disabled:bg-stone-300 disabled:text-stone-600';
  };

  const buttonText = () => {
    if (stockLoading) return 'CHECKING...';
    if (loading) return 'ADDING...';
    if (isOutOfStock) return 'OUT OF STOCK';
    return 'ADD TO CART';
  };

  const buttonIcon = () => {
    if (stockLoading || loading) {
      return <Loader2 size={16} className="animate-spin" />;
    }
    if (isOutOfStock) {
      return null;
    }
    return <ShoppingBag size={16} className="group-hover:scale-110 transition-transform duration-300" />;
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full tracking-widest transition-all duration-300 rounded-lg font-medium 
        flex items-center justify-center space-x-2 group
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${isDisabled ? 'cursor-not-allowed' : 'transform hover:scale-105 shadow-lg hover:shadow-xl'}
        ${className}
      `}
      aria-label={`${buttonText()} - ${productName}`}
    >
      {buttonIcon()}
      <span>{buttonText()}</span>
    </button>
  );
};

export default AddToCartButton;