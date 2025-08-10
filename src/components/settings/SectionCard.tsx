import React, { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, description, children, footer }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">{title}</h3>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
      
      {footer && (
        <div className="mt-6 pt-4 border-t border-stone-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default SectionCard;