import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, ArrowRight, Sparkles, Clock } from 'lucide-react';

interface VideoShowcaseProps {
  // Remove setCurrentPage prop since we're using React Router
}

const VideoShowcase: React.FC<VideoShowcaseProps> = () => {
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [mutedVideos, setMutedVideos] = useState<boolean[]>([true, true, true]);
  const [pausedVideos, setPausedVideos] = useState<boolean[]>([false, false, false]);
  const [youtubeStarted, setYoutubeStarted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [videoErrors, setVideoErrors] = useState<boolean[]>([false, false, false]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const videos = [
    {
      src: 'https://storage.googleapis.com/video_bucketfgasf12/jealousyCutted.mp4',
      title: 'The Experience',
      description: 'A jealous office encounter unfolds when a woman catches her man admiring Jennifer\'s glowing skin — all thanks to Golden Graze.',
      poster: '/jealousy-poster.jpg',
      autoplay: true
    },
    {
      src: 'https://storage.googleapis.com/video_bucketfgasf12/fatCutted.mp4',
      title: 'The Process',
      description: 'After just 3 weeks of using Golden Graze, her skin tells the story — raw, real, and absolutely unbelievable.',
      poster: '/technique-poster.jpg',
      autoplay: true
    },
    {
      src: 'https://storage.googleapis.com/video_bucketfgasf12/secondBig.mp4',
      title: 'Warm & Personal',
      description: 'She can\'t stop smiling — her skin feels soft, happy, and deeply restored thanks to Golden Graze.',
      poster: '/evening-poster.jpg',
      autoplay: true
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        setIsInView(entry.isIntersecting);
        
        // Auto-mute all videos when section is not in view
        if (!entry.isIntersecting) {
          videoRefs.current.forEach((video, index) => {
            if (video) {
              video.muted = true;
            }
          });
          setMutedVideos([true, true, true]);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Auto-start all videos when component mounts and is visible
    if (isVisible) {
      videoRefs.current.forEach((video, index) => {
        if (video && !videoErrors[index]) {
          video.muted = true; // Ensure all videos start muted
          video.play().catch(console.error);
        }
      });
      setPlayingVideo(null);
    } else {
      // Pause all videos when not visible and mute them
      videoRefs.current.forEach((video, index) => {
        if (video && !videoErrors[index]) {
          video.pause();
          video.muted = true;
        }
      });
      setMutedVideos([true, true, true]);
      setPausedVideos([true, true, true]);
    }
  }, [isVisible]);

  // Add effect to handle when component unmounts or page changes
  useEffect(() => {
    return () => {
      // Cleanup: pause and mute all videos when component unmounts
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
          video.muted = true;
          video.currentTime = 0;
        }
      });
    };
  }, []);

  const handlePlayPause = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    const newPausedState = [...pausedVideos];
    
    if (pausedVideos[index]) {
      video.play();
      newPausedState[index] = false;
    } else {
      video.pause();
      newPausedState[index] = true;
    }
    
    setPausedVideos(newPausedState);
  };

  const toggleMute = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    
    // Only allow unmuting if section is visible
    if (!isInView && !mutedVideos[index]) {
      return; // Don't allow unmuting when not in view
    }

    const newMutedState = [...mutedVideos];
    newMutedState[index] = !newMutedState[index];
    video.muted = newMutedState[index];
    setMutedVideos(newMutedState);
  };

  const handleYoutubePlay = () => {
    // Open YouTube video in new tab
    window.open('https://www.youtube.com/watch?v=TEvw23cMkXg', '_blank');
  };

  const handleVideoEnd = (index: number) => {
    // Videos loop automatically, so this shouldn't be called
  };

  const handleVideoError = (index: number, error: any) => {
    setVideoErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
            The Golden Graze Experience
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Discover the transformative power of our tallow balm through these intimate ritual moments
          </p>
          <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <div
              key={index}
              className={`group transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Video Container */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-stone-100 to-amber-50 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500">
                {/* Render video elements for index 0, 1, and 2 */}
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="w-full h-full object-cover"
                  muted={mutedVideos[index]}
                  autoPlay={video.autoplay}
                  loop
                  controls={false}
                  disablePictureInPicture
                  controlsList="nodownload nofullscreen noremoteplayback"
                  onEnded={() => handleVideoEnd(index)}
                  onError={(e) => handleVideoError(index, e)}
                  onPlay={() => {
                    // Ensure video is muted when it starts playing
                    if (videoRefs.current[index]) {
                      videoRefs.current[index]!.muted = mutedVideos[index];
                    }
                  }}
                  playsInline
                  preload="metadata"
                >
                  <source src={video.src} type="video/mp4" />
                </video>
                
                {/* Error fallback for any video that fails to load */}
                {videoErrors[index] && (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-800 text-white">
                    <div className="text-center">
                      <p>Video not available</p>
                      <p className="text-sm text-gray-400 mt-2">{video.src}</p>
                    </div>
                  </div>
                )}

                {/* Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  {/* Play/Pause Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handlePlayPause(index)}
                      className="w-16 h-16 bg-amber-400/90 hover:bg-amber-400 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl"
                    >
                      {pausedVideos[index] ? (
                        <Play size={24} className="text-white ml-1" />
                      ) : (
                        <Pause size={24} className="text-white" />
                      )}
                    </button>
                  </div>

                  {/* Mute Button */}
                  <button
                    onClick={() => toggleMute(index)}
                    className={`absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                      !isInView ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    disabled={!isInView}
                  >
                    {mutedVideos[index] ? (
                      <VolumeX size={16} className="text-white" />
                    ) : (
                      <Volume2 size={16} className="text-white" />
                    )}
                  </button>
                </div>

                {/* Video Progress Indicator */}
                {!pausedVideos[index] && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div className="h-full bg-amber-400 transition-all duration-100"></div>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="mt-6 text-center">
                <h3 className="font-serif text-xl text-stone-900 mb-2">{video.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <p className="text-stone-600 mb-6">Ready to begin your own ritual?</p>
          <button 
            onClick={() => navigate('/order')}
            className="group px-8 py-4 bg-transparent border-2 border-amber-400 text-amber-700 hover:bg-amber-400 hover:text-white font-medium tracking-widest transition-all duration-300 rounded-lg"
          >
            <span className="flex items-center space-x-2">
              <span>BUY NOW</span>
              <div className="w-2 h-2 bg-current rounded-full group-hover:scale-150 transition-transform duration-300"></div>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;