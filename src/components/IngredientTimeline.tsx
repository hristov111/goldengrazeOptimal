import React, { useEffect, useState, useRef } from 'react';
import { Leaf, Droplets, Sparkles, Package } from 'lucide-react';

const IngredientTimeline: React.FC = () => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      icon: Leaf,
      title: 'Ethical Sourcing',
      description: 'Pasture-raised, regenerative farms.',
      detail: 'Our cattle graze freely on pristine grasslands, ensuring the highest quality tallow rich in nutrients.'
    },
    {
      icon: Droplets,
      title: 'Artisan Rendering',
      description: 'Low-temperature tallow extraction.',
      detail: 'Traditional wet rendering process preserves vital nutrients and creates the purest base for our balm.'
    },
    {
      icon: Sparkles,
      title: 'Infusion & Whipping',
      description: 'Blended with botanical oils in small batches.',
      detail: 'Hand-whipped with organic botanicals in our apothecary, creating a luxurious, cloud-like texture.'
    },
    {
      icon: Package,
      title: 'Packaging & Ritual',
      description: 'Poured into glass, sealed by hand.',
      detail: 'Each jar is carefully filled and sealed, ready to begin your daily ritual of nourishment.'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.getAttribute('data-step') || '0');
            setVisibleSteps(prev => [...prev, stepIndex].sort());
          }
        });
      },
      { threshold: 0.5 }
    );

    const stepElements = document.querySelectorAll('[data-step]');
    stepElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-gradient-to-b from-stone-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
            The Ritual Journey
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto leading-relaxed">
            From pasture to jar, every step is a sacred practice in creating nature's most nourishing skincare.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-200 hidden md:block"></div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isVisible = visibleSteps.includes(index);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  data-step={index}
                  className={`relative transition-all duration-1000 delay-${index * 200} ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <div className={`grid md:grid-cols-2 gap-8 items-center ${
                    isEven ? '' : 'md:direction-rtl'
                  }`}>
                    {/* Content */}
                    <div className={`${isEven ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'} ${isEven ? '' : 'md:order-2'}`}>
                      <div className="inline-flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
                          <Icon size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl text-stone-900">{step.title}</h3>
                          <p className="text-amber-600 text-sm tracking-wide">{step.description}</p>
                        </div>
                      </div>
                      <p className="text-stone-700 leading-relaxed max-w-md">
                        {step.detail}
                      </p>
                    </div>

                    {/* Visual */}
                    <div className={`${isEven ? '' : 'md:order-1'}`}>
                      <div className="aspect-video bg-gradient-to-br from-stone-100 to-amber-100 rounded-lg overflow-hidden shadow-xl">
                        {index === 0 ? (
                          <video
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          >
                            <source src="https://storage.googleapis.com/video_bucketfgasf12/WithLogo/cowsFixWithLogo.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : index === 1 ? (
                          <video
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          >
                            <source src="https://storage.googleapis.com/video_bucketfgasf12/WithLogo/tallowExtractionWithLogo.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : index === 2 ? (
                          <>
                            <video
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            >
                              <source src="https://storage.googleapis.com/video_bucketfgasf12/WithLogo/BalmDropWithLogo.mp4" type="video/mp4" />
                            </video>
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center" style={{display: 'none'}}>
                              <div className="text-center text-amber-600">
                                <div className="text-4xl mb-2">🎬</div>
                                <p className="text-sm">Video Loading...</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <video
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            >
                              <source src="https://storage.googleapis.com/video_bucketfgasf12/WithLogo/jarDropFix2.mp4" type="video/mp4" />
                            </video>
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center" style={{display: 'none'}}>
                              <div className="text-center text-amber-600">
                                <div className="text-4xl mb-2">📦</div>
                                <p className="text-sm">Video Loading...</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-4 h-4 bg-amber-400 rounded-full border-4 border-white shadow-lg hidden md:block"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IngredientTimeline;