import React from 'react';
import HeroSection from '../components/HeroSection';
import BrandIntroduction from '../components/BrandIntroduction';
import ProductSpotlight from '../components/ProductSpotlight';
import VideoShowcase from '../components/VideoShowcase';
import IngredientTimeline from '../components/IngredientTimeline';
import TestimonialCarousel from '../components/TestimonialCarousel';
import FixedVideoPlayer from '../components/FixedVideoPlayer';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  // Remove setCurrentPage prop since we're using React Router
}

const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();
  const [showFixedVideo, setShowFixedVideo] = useState(false);

  useEffect(() => {
    // Show the fixed video when user enters the home page
    const timer = setTimeout(() => {
      setShowFixedVideo(true);
    }, 2000); // Show after 2 seconds

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Before & After Image Gallery */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-stone-900 via-black to-stone-800 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-amber-300/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-500/5 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
              The Transformation
            </h2>
            <p className="text-amber-200 text-lg max-w-2xl mx-auto leading-relaxed">
              Witness the remarkable journey from dull, tired skin to radiant, nourished beauty
            </p>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
          </div>

          {/* Three Image Rectangles */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Image Rectangle 1 */}
            <div className="group relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-amber-400/20 group-hover:border-amber-400/40 transition-all duration-700 relative">
                {/* Image placeholder - ready for your before/after image */}
                <img 
                  src="/before_after/before_after1.jpg" 
                  alt="Before and After Transformation - Week 1" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-amber-400/60 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 left-6 w-2 h-2 bg-amber-300/40 rounded-full animate-pulse delay-500"></div>
                
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
              </div>
              
              {/* Image caption */}
              <div className="mt-6 text-center">
                <h3 className="font-serif text-xl text-white mb-2">The Awakening</h3>
                <p className="text-amber-200 text-sm">When skin meets its ancient ally</p>
              </div>
            </div>

            {/* Image Rectangle 2 */}
            <div className="group relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-amber-400/20 group-hover:border-amber-400/40 transition-all duration-700 relative">
                {/* Image placeholder - ready for your before/after image */}
                <img 
                  src="/before_after/best.jpg" 
                  alt="Before and After Transformation - Week 2" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-amber-400/60 rounded-full animate-pulse delay-200"></div>
                <div className="absolute bottom-6 left-6 w-2 h-2 bg-amber-300/40 rounded-full animate-pulse delay-700"></div>
                
                {/* Enhanced glow effect for center image */}
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/30 to-amber-600/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
              </div>
              
              {/* Image caption */}
              <div className="mt-6 text-center">
                <h3 className="font-serif text-xl text-white mb-2">The Ritual Deepens</h3>
                <p className="text-amber-200 text-sm">Nature's wisdom reveals itself</p>
              </div>
            </div>

            {/* Image Rectangle 3 */}
            <div className="group relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-amber-400/20 group-hover:border-amber-400/40 transition-all duration-700 relative">
                {/* Image placeholder - ready for your before/after image */}
                <img 
                  src="/before_after/before_after3.jpg" 
                  alt="Before and After Transformation - Week 3" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-amber-400/60 rounded-full animate-pulse delay-400"></div>
                <div className="absolute bottom-6 left-6 w-2 h-2 bg-amber-300/40 rounded-full animate-pulse delay-900"></div>
                
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
              </div>
              
              {/* Image caption */}
              <div className="mt-6 text-center">
                <h3 className="font-serif text-xl text-white mb-2">The Golden Glow</h3>
                <p className="text-amber-200 text-sm">Radiance that speaks without words</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-amber-400/20 max-w-2xl mx-auto">
              <h3 className="font-serif text-2xl text-white mb-4">Ready for Your Transformation?</h3>
              <p className="text-amber-200 mb-6">
                Join thousands who have discovered the power of ancestral skincare
              </p>
              <button 
                onClick={() => navigate('/checkout')}
                className="group px-8 py-4 bg-amber-400 hover:bg-amber-500 text-black font-medium tracking-widest transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>START YOUR JOURNEY</span>
                  <div className="w-2 h-2 bg-black rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                </span>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <BrandIntroduction />
      <ProductSpotlight />
      <VideoShowcase />
      <IngredientTimeline />
      <TestimonialCarousel />
      
      {/* Fixed Video Player */}
      <FixedVideoPlayer 
        isVisible={showFixedVideo}
        onClose={() => setShowFixedVideo(false)}
      />
    </div>
  );
};

export default HomePage;