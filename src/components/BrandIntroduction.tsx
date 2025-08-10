import React, { useEffect, useState, useRef } from 'react';
import { Leaf, Droplets, Sparkles } from 'lucide-react';

interface BrandIntroductionProps {
  setCurrentPage?: (page: string) => void;
}

const BrandIntroduction: React.FC<BrandIntroductionProps> = ({ setCurrentPage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const features = [
    {
      icon: Leaf,
      title: 'Grass-Fed',
      description: 'Ethically sourced from regenerative farms'
    },
    {
      icon: Droplets,
      title: 'Pure Tallow',
      description: 'Rich in fat-soluble vitamins A, D, E, K'
    },
    {
      icon: Sparkles,
      title: 'Hand-Whipped',
      description: 'Small batch artisan craftsmanship'
    }
  ];
  return (
    <section ref={sectionRef} className="min-h-screen relative overflow-hidden flex items-center">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
          }}
        >
          <source src="https://storage.googleapis.com/video_bucketfgasf12/WithLogo/applicationWithLogo.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback background if video fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-black to-stone-800 -z-10">
          <div className="absolute inset-0 bg-gradient-radial from-amber-400/10 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-amber-300/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Video overlay for content readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-amber-300/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-amber-400/5 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left side - Content */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-6 leading-tight">
              Skincare, Reimagined Through Ancestral Wisdom
            </h2>
            
            <div className="w-16 h-0.5 bg-amber-400 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-pulse"></div>
            </div>
            
            <p className="text-amber-100 text-lg leading-relaxed font-light mb-8">
              Golden Graze revives the ancient tradition of tallow-based skincare — harnessing the 
              nutrient density of grass-fed animal oils, paired with botanicals, to deliver deep, 
              natural nourishment. It's not just skincare. It's a ritual of reconnection.
            </p>
            
            {/* Interactive feature highlights */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                      hoveredFeature === index 
                        ? 'bg-amber-400/20 transform translate-x-2 shadow-md' 
                        : 'hover:bg-white/10'
                    }`}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      hoveredFeature === index 
                        ? 'bg-amber-400 scale-110' 
                        : 'bg-amber-400/80'
                    }`}>
                      <Icon 
                        size={18} 
                        className={`transition-colors duration-300 ${
                          hoveredFeature === index ? 'text-white' : 'text-amber-700'
                        }`} 
                      />
                    </div>
                    <div>
                      <div className="font-medium text-white">{feature.title}</div>
                      <div className="text-amber-200 text-sm">{feature.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-amber-200 text-sm tracking-widest">ANCESTRALLY INSPIRED</span>
            </div>
          </div>

          {/* Right side - Image */}
          <div className={`transition-all duration-1000 delay-300 md:items-start ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
            <div 
              className="aspect-square bg-gradient-to-br from-amber-100 via-stone-200 to-emerald-100 rounded-lg overflow-hidden shadow-2xl relative group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-3xl md:mt-0"
              onMouseMove={handleMouseMove}
            >
              <img 
                src="/balm_images/firstPic.png" 
                alt="Golden Graze Product" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Interactive light effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, rgba(212, 175, 55, 0.3), transparent)`
                }}
              ></div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/60 rounded-full animate-ping"></div>
                <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-amber-300/80 rounded-full animate-ping delay-300"></div>
                <div className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-amber-500/50 rounded-full animate-ping delay-700"></div>
              </div>
            </div>

            {/* Shop Now Button under image */}
            <div className="mt-6 text-center max-w-md mx-auto">
              <button 
                onClick={() => setCurrentPage && setCurrentPage('products')}
                className="group relative px-8 py-4 bg-amber-400 hover:bg-amber-500 text-white font-medium tracking-widest transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>SHOP NOW</span>
                  <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                    <div className="w-2 h-2 bg-white rounded-full transform group-hover:scale-150 transition-transform duration-300"></div>
                  </div>
                </span>
                
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandIntroduction;