import React from 'react';
import { Package, CreditCard, Truck, MapPin, CheckCircle, XCircle, RotateCcw, Clock, StickyNote } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: string;
  message?: string;
  created_at: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  const getEventConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case 'created':
        return {
          icon: Clock,
          color: 'bg-blue-500',
          label: 'Order Created'
        };
      case 'paid':
        return {
          icon: CreditCard,
          color: 'bg-green-500',
          label: 'Payment Received'
        };
      case 'packed':
        return {
          icon: Package,
          color: 'bg-purple-500',
          label: 'Order Packed'
        };
      case 'shipped':
        return {
          icon: Truck,
          color: 'bg-indigo-500',
          label: 'Order Shipped'
        };
      case 'out_for_delivery':
        return {
          icon: MapPin,
          color: 'bg-orange-500',
          label: 'Out for Delivery'
        };
      case 'delivered':
        return {
          icon: CheckCircle,
          color: 'bg-green-600',
          label: 'Delivered'
        };
      case 'canceled':
        return {
          icon: XCircle,
          color: 'bg-red-500',
          label: 'Order Canceled'
        };
      case 'refunded':
        return {
          icon: RotateCcw,
          color: 'bg-gray-500',
          label: 'Order Refunded'
        };
      case 'note':
        return {
          icon: StickyNote,
          color: 'bg-yellow-500',
          label: 'Note Added'
        };
      default:
        return {
          icon: Package,
          color: 'bg-gray-500',
          label: type.charAt(0).toUpperCase() + type.slice(1)
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (!events.length) {
    return (
      <div className={`text-center py-8 text-stone-500 ${className}`}>
        <Package size={48} className="mx-auto mb-4 opacity-50" />
        <p>No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {events.map((event, index) => {
        const config = getEventConfig(event.type);
        const Icon = config.icon;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex items-start space-x-4">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 w-0.5 h-full bg-stone-200"></div>
            )}
            
            {/* Icon */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.color} flex items-center justify-center relative z-10`}>
              <Icon size={16} className="text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-stone-900">
                  {config.label}
                </h4>
                <time className="text-xs text-stone-500">
                  {formatDate(event.created_at)}
                </time>
              </div>
              {event.message && (
                <p className="mt-1 text-sm text-stone-600">
                  {event.message}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;