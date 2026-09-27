import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  ArrowUpRight, 
  Image as ImageIcon 
} from 'lucide-react';
import { analytics } from '../utils/analyticsTracker';

export interface CarouselSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    imageUrl: '/images/hero-slide-01.webp',
    title: 'Dubai Lifestyle & Drive',
    subtitle: 'From zero capital to keys in hand',
  },
  {
    id: 2,
    imageUrl: '/images/hero-slide-02.webp',
    title: 'Luxury Shopping Days',
    subtitle: 'Louis Vuitton & Chanel in Dubai Mall',
  },
  {
    id: 3,
    imageUrl: '/images/hero-slide-03.webp',
    title: 'Sheikh Zayed Grand Mosque',
    subtitle: 'Peace, culture & timeless elegance',
  },
  {
    id: 4,
    imageUrl: '/images/hero-slide-04.webp',
    title: 'Dubai Marina Waterfront',
    subtitle: 'Living life on my own terms',
  },
  {
    id: 5,
    imageUrl: '/images/hero-slide-05.webp',
    title: 'Downtown Dubai Nights',
    subtitle: 'Skyline view of Burj Khalifa',
  },
];

interface HeroCarouselSectionProps {
  telegramLink: string;
}

export const HeroCarouselSection: React.FC<HeroCarouselSectionProps> = ({
  telegramLink,
}) => {
  const [currentIndex, setCurrentIndex] = useState(2); // Start at middle slide (index 2 of 0..4)
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const totalSlides = DEFAULT_SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play timer (advances every 4.5 seconds, pauses on hover/touch)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide(); // Swiped left -> next
    } else if (distance < -50) {
      prevSlide(); // Swiped right -> prev
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleCtaClick = () => {
    analytics.trackTelegramClick('hero_carousel', telegramLink);
  };

  return (
    <section 
      className="relative pt-20 sm:pt-24 md:pt-24 pb-6 sm:pb-8 overflow-hidden min-h-[calc(100vh-10px)] flex flex-col justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient radial gradients */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      {/* Grid pattern hairline backdrop */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center w-full">
        {/* Dynamic Section Headline - Single line compact format with side padding */}
        <div className="px-3 sm:px-6 inline-block max-w-full text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-tight font-display inline-flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Welcome to
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]">
              Mahi World
            </span>
          </h1>
        </div>

        {/* ======================================================== */}
        {/* 5-IMAGE CAROUSEL CONTAINER (9:16 ASPECT RATIO) */}
        {/* ======================================================== */}
        <div 
          className="relative max-w-5xl mx-auto my-2 sm:my-3 select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrow Left */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white hover:text-amber-300 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md active:scale-95 group"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Navigation Arrow Right */}
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white hover:text-amber-300 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md active:scale-95 group"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Carousel Stage */}
          <div className="relative h-[430px] sm:h-[480px] md:h-[510px] flex items-center justify-center overflow-visible">
            {DEFAULT_SLIDES.map((slide, index) => {
              // Calculate relative offset from currentIndex: -2, -1, 0, 1, 2
              let offset = index - currentIndex;
              if (offset > 2) offset -= totalSlides;
              if (offset < -2) offset += totalSlides;

              const isActive = offset === 0;
              const isPrev = offset === -1;
              const isNext = offset === 1;
              const isFarLeft = offset === -2;
              const isFarRight = offset === 2;

              // Hide if outside visible window
              const isVisible = Math.abs(offset) <= 2;

              // Transform calculations for 3D depth and scale
              let translateX = 0;
              let scale = 0.72;
              let opacity = 0;
              let zIndex = 10;
              let rotateY = 0;

              if (isActive) {
                translateX = 0;
                scale = 1.08; // Highlight and enlarged main center frame
                opacity = 1;
                zIndex = 25;
                rotateY = 0;
              } else if (isPrev) {
                translateX = -68; // percentage shift on mobile
                scale = 0.82;
                opacity = 0.7;
                zIndex = 20;
                rotateY = 12;
              } else if (isNext) {
                translateX = 68;
                scale = 0.82;
                opacity = 0.7;
                zIndex = 20;
                rotateY = -12;
              } else if (isFarLeft) {
                translateX = -125;
                scale = 0.68;
                opacity = 0.35;
                zIndex = 15;
                rotateY = 22;
              } else if (isFarRight) {
                translateX = 125;
                scale = 0.68;
                opacity = 0.35;
                zIndex = 15;
                rotateY = -22;
              }

              if (!isVisible) {
                return null;
              }

              const hasImageError = imageErrors[slide.id];

              return (
                <div
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  style={{
                    transform: `translateX(${translateX}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
                    zIndex,
                    opacity,
                  }}
                  className={`absolute transition-all duration-500 ease-out cursor-pointer ${
                    isActive ? 'cursor-default pointer-events-auto' : 'hover:opacity-90'
                  }`}
                >
                  {/* Card wrapper: strictly 9:16 Aspect Ratio calibrated for full screen visibility */}
                  <div
                    className={`relative w-[210px] sm:w-[245px] md:w-[270px] aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-500 shadow-2xl bg-[#0B0F17] ${
                      isActive
                        ? 'border-amber-400/90 shadow-[0_0_50px_rgba(251,191,36,0.38)] ring-2 ring-amber-400/50'
                        : 'border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.8)] filter brightness-75'
                    }`}
                  >
                    {/* Background image OR Clean Placeholder if image not added yet */}
                    {!hasImageError ? (
                      <img
                        src={slide.imageUrl}
                        alt={`Slide ${slide.id}`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedAlt) {
                            target.dataset.triedAlt = '1';
                            if (slide.imageUrl.startsWith('/images/')) {
                              target.src = slide.imageUrl.replace('/images/', '/Images/');
                              return;
                            } else if (slide.imageUrl.startsWith('/Images/')) {
                              target.src = slide.imageUrl.replace('/Images/', '/images/');
                              return;
                            }
                          }
                          setImageErrors((prev) => ({ ...prev, [slide.id]: true }));
                        }}
                        className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                      />
                    ) : (
                      /* Minimal clean placeholder view */
                      <div className="absolute inset-0 bg-gradient-to-b from-[#131926] via-[#0C101A] to-[#06090F] flex flex-col items-center justify-center p-6 text-center border-dashed border border-white/10 m-2 rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mb-3 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono bg-white/[0.05] px-2.5 py-1 rounded border border-white/10">
                          {slide.imageUrl}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3 sm:mt-4">
            {DEFAULT_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === index
                    ? 'w-7 h-2 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Primary High-Impact CTA Block */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm sm:max-w-md mx-auto mt-4 sm:mt-5">
          <a
            href={telegramLink}
            onClick={handleCtaClick}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-slate-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 rounded-2xl transition-all duration-300 shadow-[0_0_35px_rgba(251,191,36,0.3)] hover:shadow-[0_0_55px_rgba(251,191,36,0.55)] hover:scale-[1.02] active:scale-98"
          >
            <Send className="w-4 h-4 text-slate-950 fill-slate-950 group-hover:translate-x-0.5 transition-transform" />
            <span className="tracking-tight">Join Telegram Channel</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

