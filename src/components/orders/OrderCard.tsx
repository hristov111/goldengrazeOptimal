import React from 'react';
import { ExternalLink, Package } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import Money from './Money';

interface Order {
  order_number: string;
  status: string;
  total_cents: number;
  currency: string;
  placed_at: string;
  tracking_number?: string;
  estimated_delivery?: string;
}

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  className?: string;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, className = '' }) => {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-all duration-300 cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif text-lg text-stone-900 group-hover:text-amber-600 transition-colors">
            Order #{order.order_number}
          </h3>
          <p className="text-sm text-stone-600">
            Placed on {formatDate(order.placed_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Package size={16} className="text-stone-400" />
            <Money 
              cents={order.total_cents} 
              currency={order.currency}
              className="font-medium text-stone-900"
            />
          </div>
          
          {order.tracking_number && (
            <div className="flex items-center space-x-1 text-xs text-amber-600">
              <ExternalLink size={12} />
              <span>Tracking Available</span>
            </div>
          )}
        </div>

        {order.estimated_delivery && (
          <div className="text-right">
            <p className="text-xs text-stone-500">Estimated Delivery</p>
            <p className="text-sm font-medium text-stone-700">
              {formatDate(order.estimated_delivery)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;