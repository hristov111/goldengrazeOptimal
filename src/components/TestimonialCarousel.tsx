import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      quote: "The first product that made my skin feel alive again.",
      name: "Sarah Chen",
      location: "Portland, OR",
      rating: 5
    },
    {
      quote: "This isn't just skincare, it's a daily meditation. My skin has never been more radiant.",
      name: "Marcus Thompson",
      location: "Austin, TX",
      rating: 5
    },
    {
      quote: "I was skeptical about tallow, but this balm transformed my dry skin completely.",
      name: "Elena Rodriguez",
      location: "Santa Fe, NM",
      rating: 5
    },
    {
      quote: "The ritual aspect makes my morning routine sacred. Plus, my skin loves it.",
      name: "David Kim",
      location: "Seattle, WA",
      rating: 5
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
            Customer Reviews
          </h2>
          <p className="text-stone-600 text-lg">
            Stories from our community
          </p>
        </div>

        <div className="relative">
          {/* Main testimonial */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl min-h-[300px] flex flex-col justify-center">
            <div className="text-center">
              {/* Stars */}
              <div className="flex justify-center space-x-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-amber-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-serif text-2xl md:text-3xl text-stone-800 mb-8 leading-relaxed italic">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-stone-900">{testimonials[currentIndex].name}</div>
                  <div className="text-stone-600 text-sm">{testimonials[currentIndex].location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors group"
          >
            <ChevronLeft size={20} className="text-stone-600 group-hover:text-amber-600" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors group"
          >
            <ChevronRight size={20} className="text-stone-600 group-hover:text-amber-600" />
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-amber-400 scale-125'
                    : 'bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;