import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  // Remove setCurrentPage prop since we're using React Router
}

const HeroSection: React.FC<HeroSectionProps> = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const videos = [
    'https://storage.googleapis.com/video_bucketfgasf12/WithLogo/homeFirst.mp4.mp4',
    'https://storage.googleapis.com/video_bucketfgasf12/WithLogo/homeSecond.mp4'
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleVideoEnd = () => {
    // Clear any existing timeout to prevent multiple transitions
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Start transition
    setIsTransitioning(true);
    
    // Start the next video immediately
    if (nextVideoRef.current) {
      nextVideoRef.current.currentTime = 0;
      nextVideoRef.current.play();
    }
    
    // Set transition timeout - switch videos after crossfade
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
      setIsTransitioning(false);
      transitionTimeoutRef.current = null;
    }, 1000);
  };

  useEffect(() => {
    // Reset videos when index changes
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
    if (nextVideoRef.current) {
      nextVideoRef.current.currentTime = 0;
      nextVideoRef.current.load();
    }
    
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [currentVideoIndex]);
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Cinematic Background - Simulated Video */}
      <div className="absolute inset-0">
        {/* Current Video */}
        <video 
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          key={`current-${currentVideoIndex}`}
        >
          <source src={videos[currentVideoIndex]} type="video/mp4" />
          {/* Fallback background if video fails to load */}
          Your browser does not support the video tag.
        </video>
        
        {/* Next Video (for smooth transitions) */}
        <video 
          ref={nextVideoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          playsInline
          key={`next-${(currentVideoIndex + 1) % videos.length}`}
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
          }}
        >
          <source src={videos[(currentVideoIndex + 1) % videos.length]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Fallback background if video fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-800 to-black -z-10">
          <div className="absolute inset-0 bg-gradient-radial from-amber-400/10 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-amber-300/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className={`text-center px-6 transition-all duration-2000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        } max-w-4xl mx-auto`}>
          <div className="flex justify-center mb-4 animate-fade-in">
            <div className="text-center">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-amber-400 tracking-wider leading-tight">
                GOLDEN
              </h1>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-amber-300 tracking-wider leading-tight -mt-1 sm:-mt-2">
                GRAZE
              </h1>
            </div>
          </div>
          <p className="text-amber-200 text-base sm:text-lg md:text-xl lg:text-2xl tracking-wider mb-6 sm:mb-8 font-light">
            Nature's Richest Ritual
          </p>
          
          <button 
            onClick={() => navigate('/checkout')}
            className="group relative px-6 sm:px-8 py-3 sm:py-4 border border-amber-400/50 text-amber-400 text-sm sm:text-base tracking-widest hover:border-amber-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            <span className="group-hover:text-amber-300 transition-colors">BUY NOW</span>
            <div className="absolute inset-0 bg-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-1 h-12 bg-gradient-to-b from-transparent via-amber-400 to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSection;