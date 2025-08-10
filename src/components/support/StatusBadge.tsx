import React from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return {
          label: 'Open',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock
        };
      case 'pending_customer':
        return {
          label: 'Pending Response',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertCircle
        };
      case 'resolved':
        return {
          label: 'Resolved',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'closed':
        return {
          label: 'Closed',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock
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

export default StatusBadge;