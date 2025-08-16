import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="mb-8">
            <h1 className="font-serif text-6xl md:text-8xl text-amber-600 tracking-wider leading-tight mb-4">
              GOLDEN GRAZE
            </h1>
            <p className="text-amber-700 text-xl md:text-2xl tracking-wider font-light">
              Nature's Richest Ritual
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/checkout')}
            className="buy-now px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-medium text-lg tracking-widest transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            BUY NOW
          </button>
        </div>
      </section>

      {/* Product Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl text-stone-900 mb-6">
                Whipped Tallow Balm
              </h2>
              <p className="text-stone-700 text-lg leading-relaxed mb-8">
                Ancestrally inspired skincare crafted with grass-fed tallow and organic botanicals. 
                Experience deep nourishment and radiant skin through nature's most powerful ritual.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-stone-700">Rich in vitamins A, D, E, and K</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-stone-700">Hand-whipped in small batches</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-stone-700">Ethically sourced from regenerative farms</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-8">
                <span className="text-3xl font-serif text-stone-900">$48.00</span>
                <span className="text-stone-600">2oz jar</span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-medium tracking-widest transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                SHOP NOW
              </button>
            </div>

            <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center">
              <img 
                src="/product_images/golden_graze1.png" 
                alt="Golden Graze Whipped Tallow Balm" 
                className="w-full h-full object-cover rounded-2xl"
                onError={(e) => {
                  e.currentTarget.src = "/balm_images/firstPic.png";
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;