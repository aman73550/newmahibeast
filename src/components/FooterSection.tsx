import React, { useState, useEffect } from 'react';
import { Send, ArrowUp } from 'lucide-react';
import { analytics } from '../utils/analyticsTracker';

interface FooterSectionProps {
  telegramLink: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ telegramLink }) => {
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hide while user is at the top/hero section; show when scrolled down
      const threshold = Math.max(window.innerHeight * 0.6, 450);
      setShowFloatingButton(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJoin = () => {
    analytics.trackTelegramClick('mobile_bar', telegramLink);
  };

  return (
    <>
      <footer className="border-t border-white/[0.08] bg-[#040609] py-12 md:py-14 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <a
                href="#"
                className="text-2xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors font-display"
              >
                Mahi Beast
              </a>
              <p className="text-slate-400 text-xs mt-2 max-w-md">
                Official private community for genuine online earning strategies, digital arbitrage setups, and verified giveaways.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium text-xs">
              <a href="#" className="hover:text-white transition-colors">Overview</a>
              <a href="#video" className="hover:text-white transition-colors">The Journey</a>
              <a href="#founder" className="hover:text-white transition-colors">Founder</a>
              <a href="#quote" className="hover:text-white transition-colors">Mindset</a>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs transition-colors self-start md:self-auto border border-white/[0.06]"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Quick Bar (Hidden in Hero Section, smoothly appears when scrolled down) */}
      <div 
        className={`fixed bottom-3 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 transition-all duration-500 ease-out ${
          showFloatingButton 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <a
          href={telegramLink}
          onClick={handleJoin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 px-5 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold rounded-2xl shadow-[0_8px_30px_rgba(251,191,36,0.45)] hover:shadow-[0_12px_40px_rgba(251,191,36,0.6)] active:scale-95 transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-2.5">
            <Send className="w-4 h-4 fill-slate-950" />
            <span className="text-sm tracking-tight font-display">Join Telegram VIP</span>
          </div>
          <span className="text-xs bg-black/15 px-2.5 py-0.5 rounded-full font-semibold">
            Free Pass
          </span>
        </a>
      </div>
    </>
  );
};
