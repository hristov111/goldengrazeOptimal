import React from 'react';
import { X, User, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignIn, onSignUp }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X size={16} className="text-stone-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/balm_images/Golder Graze.png" 
              alt="Golden Graze" 
              className="h-12 w-auto"
            />
          </div>
          <h2 className="font-serif text-2xl text-stone-900 mb-2">Join the Ritual</h2>
          <p className="text-stone-600 text-sm">
            Sign in or create an account to add items to your cart and complete your purchase.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-amber-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-stone-800 mb-2 text-sm">Account Benefits:</h3>
          <ul className="text-stone-600 text-xs space-y-1">
            <li>• Save items for later</li>
            <li>• Track your orders</li>
            <li>• Faster checkout</li>
            <li>• Exclusive member offers</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onSignIn}
            className="w-full bg-amber-400 hover:bg-amber-500 text-white py-4 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium relative overflow-hidden group"
          >
            <span className="flex items-center justify-center space-x-2">
              <User size={18} />
              <span>SIGN IN</span>
            </span>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            </div>
          </button>

          <button
            onClick={onSignUp}
            className="w-full border-2 border-amber-400 text-amber-700 hover:bg-amber-50 py-4 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium"
          >
            <span className="flex items-center justify-center space-x-2">
              <UserPlus size={18} />
              <span>CREATE ACCOUNT</span>
            </span>
          </button>
        </div>

        {/* Guest Option */}
        <div className="text-center mt-6 pt-4 border-t border-stone-200">
          <p className="text-stone-500 text-xs mb-2">Or continue as guest</p>
          <button
            onClick={onClose}
            className="group relative px-6 py-3 bg-gradient-to-r from-stone-100 to-stone-200 hover:from-amber-50 hover:to-amber-100 text-stone-700 hover:text-amber-700 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md border border-stone-300 hover:border-amber-300"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>Continue browsing</span>
              <div className="w-4 h-4 border border-current rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <div className="w-1.5 h-1.5 bg-current rounded-full transform group-hover:scale-150 transition-transform duration-300"></div>
              </div>
            </span>
            
            {/* Subtle shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;