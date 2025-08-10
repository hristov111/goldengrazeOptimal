import React from 'react';
import { Instagram, PenTool, Leaf } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">

          {/* Left Column - Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/balm_images/Golder Graze.png" 
                alt="Golden Graze" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-stone-400 text-sm tracking-wide">Nature's Richest Ritual</p>
          </div>

          {/* Right Column - Connect */}
          <div>
            <h3 className="text-amber-400 font-medium text-sm tracking-widest mb-6">CONNECT</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-stone-300 hover:text-amber-400 transition-colors text-sm flex items-center space-x-2">
                  <Instagram size={16} />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-stone-300 hover:text-amber-400 transition-colors text-sm flex items-center space-x-2">
                  <PenTool size={16} />
                  <span>Pinterest</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-stone-300 hover:text-amber-400 transition-colors text-sm flex items-center space-x-2">
                  <Leaf size={16} />
                  <span>Journal</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-stone-700 pt-12 mb-12">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-serif text-xl text-amber-400 mb-4">Join The Herd</h3>
            <p className="text-stone-400 text-sm mb-6">
              Receive skincare guidance, ingredient wisdom, and early access to new products.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-stone-800 border border-stone-700 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black font-medium tracking-wider transition-colors">
                JOIN
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-stone-400 text-sm mb-4 md:mb-0">
            <span>🐄</span>
            <span>Powered by Earth, Crafted by Hand</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => {
                // Get the setCurrentPage function from the parent component
                const event = new CustomEvent('navigateToPrivacy');
                window.dispatchEvent(event);
              }}
              className="text-stone-400 hover:text-amber-400 text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => {
                // Get the setCurrentPage function from the parent component
                const event = new CustomEvent('navigateToTerms');
                window.dispatchEvent(event);
              }}
              className="text-stone-400 hover:text-amber-400 text-sm transition-colors"
            >
              Terms of Service
            </button>
            <span className="text-stone-500 text-sm">© 2024 Golden Graze</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;