import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CheckoutForm from '../components/CheckoutForm';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-32 left-16 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className={`max-w-4xl mx-auto px-6 py-8 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider">Back to Home</span>
          </button>
        </div>

        {/* Checkout Form */}
        <div className={`transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <CheckoutForm />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;