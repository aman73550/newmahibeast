import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { analytics } from '../utils/analyticsTracker';

interface NavbarProps {
  telegramLink: string;
}

export const Navbar: React.FC<NavbarProps> = ({ telegramLink }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJoinTelegram = () => {
    analytics.trackTelegramClick('navbar', telegramLink);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#05070B]/85 backdrop-blur-xl border-b border-white/[0.08] py-3.5 shadow-2xl'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-xl md:text-2xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors font-display"
        >
          Mahi Beast
        </a>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#" className="hover:text-white transition-colors">
            Overview
          </a>
          <a href="#video" className="hover:text-white transition-colors">
            The Journey
          </a>
          <a href="#founder" className="hover:text-white transition-colors">
            Founder
          </a>
          <a href="#quote" className="hover:text-white transition-colors">
            Mindset
          </a>
        </nav>

        {/* Zone 3: Primary conversion action */}
        <div className="flex items-center gap-2.5">
          <a
            href={telegramLink}
            onClick={handleJoinTelegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 rounded-xl hover:from-amber-200 hover:to-yellow-300 transition-all shadow-[0_0_24px_rgba(251,191,36,0.35)] hover:shadow-[0_0_32px_rgba(251,191,36,0.5)] active:scale-95 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span>Join Telegram</span>
          </a>
        </div>
      </div>
    </header>
  );
};
