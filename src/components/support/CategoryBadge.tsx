import React from 'react';
import { Package, CreditCard, Truck, Leaf, Settings, HelpCircle } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const getCategoryConfig = (category: string) => {
    switch (category.toLowerCase()) {
      case 'order':
        return {
          label: 'Order',
          color: 'bg-purple-100 text-purple-800',
          icon: Package
        };
      case 'billing':
        return {
          label: 'Billing',
          color: 'bg-green-100 text-green-800',
          icon: CreditCard
        };
      case 'shipping':
        return {
          label: 'Shipping',
          color: 'bg-blue-100 text-blue-800',
          icon: Truck
        };
      case 'product':
        return {
          label: 'Product',
          color: 'bg-amber-100 text-amber-800',
          icon: Leaf
        };
      case 'technical':
        return {
          label: 'Technical',
          color: 'bg-red-100 text-red-800',
          icon: Settings
        };
      case 'other':
      default:
        return {
          label: 'Other',
          color: 'bg-gray-100 text-gray-800',
          icon: HelpCircle
        };
    }
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${config.color} ${className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </span>
  );
};

export default CategoryBadge;