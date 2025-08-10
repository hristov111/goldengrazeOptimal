import React from 'react';

interface MoneyProps {
  cents: number;
  currency?: string;
  className?: string;
}

const Money: React.FC<MoneyProps> = ({ cents, currency = 'USD', className = '' }) => {
  const formatMoney = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  return (
    <span className={className}>
      {formatMoney(cents, currency)}
    </span>
  );
};

export default Money;