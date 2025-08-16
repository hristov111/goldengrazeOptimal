import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, X, Play } from 'lucide-react';

interface FixedVideoPlayerProps {
  isVisible: boolean;
  onClose: () => void;
}

const FixedVideoPlayer: React.FC<FixedVideoPlayerProps> = ({ isVisible, onClose }) => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      // Try to play the video when it becomes visible
      const video = videoRef.current;
      video.currentTime = 0;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay failed, user will need to click
            setIsPlaying(false);
          });
      }
    }
  }, [isVisible]);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setIsPlaying(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-50">
      <div className="relative w-64 sm:w-72 md:w-80 lg:w-96 bg-black rounded-lg overflow-hidden shadow-2xl border border-amber-400/30 group" style={{ height: '250px' }}>
        {hasError ? (
          /* Error Fallback */
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center text-white p-4">
              <div className="text-amber-400 mb-2">⚠️</div>
              <p className="text-sm">Video file not found</p>
              <p className="text-xs text-gray-400 mt-1">Please add secondBig.mp4 to public folder</p>
            </div>
          </div>
        ) : (
          /* Video Element */
          <video
            ref={videoRef}
            className="w-full h-full object-cover cursor-pointer"
            muted={isMuted}
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            onClick={handleVideoClick}
            playsInline
            loop
            preload="none"
            autoPlay
          >
            <source src="https://storage.googleapis.com/video_bucketfgasf12/secondBig.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Controls Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${hasError ? 'hidden' : ''}`}>
          {/* Top Right Controls */}
          <div className="absolute top-3 right-3 flex space-x-2">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="w-8 h-8 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors"
            >
              {isMuted ? (
                <VolumeX size={16} className="text-white" />
              ) : (
                <Volume2 size={16} className="text-white" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-black/70 hover:bg-red-600/90 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Play Button (when not playing) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handleVideoClick}
                className="w-16 h-16 bg-amber-400/90 hover:bg-amber-400 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <Play size={24} className="text-white ml-1" />
              </button>
            </div>
          )}

          {/* Buy Now Button (appears on hover) */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/checkout');
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-medium text-sm tracking-wider rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              BUY NOW
            </button>
          </div>
        </div>

        {/* Branding */}
        <div className="absolute bottom-3 left-3 opacity-80">
          <div className="flex items-center space-x-2">
            <img 
              src="/balm_images/Golder Graze.png" 
              alt="Golden Graze" 
              className="h-6 w-auto"
            />
            <span className="text-white text-xs font-medium">Golden Graze</span>
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
      </div>
    </div>
  );
};

export default FixedVideoPlayer;