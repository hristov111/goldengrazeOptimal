import React from 'react';
import { Package, Clock, CreditCard, Truck, MapPin, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          label: 'Pending Payment',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        };
      case 'processing':
        return {
          label: 'Processing',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Package
        };
      case 'paid':
        return {
          label: 'Paid',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CreditCard
        };
      case 'packed':
        return {
          label: 'Packed',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Package
        };
      case 'shipped':
        return {
          label: 'Shipped',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: Truck
        };
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: MapPin
        };
      case 'delivered':
        return {
          label: 'Delivered',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'canceled':
        return {
          label: 'Canceled',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      case 'refunded':
        return {
          label: 'Refunded',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: RotateCcw
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Package
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;