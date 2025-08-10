import React from 'react';

interface MoneyProps {
  cents?: number;
  currency?: string;
  className?: string;
}

const Money: React.FC<MoneyProps> = ({ cents = 0, currency = 'USD', className = '' }) => {
  const amount = cents / 100;
  
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);

  return <span className={className}>{formatted}</span>;
};

export default Money;