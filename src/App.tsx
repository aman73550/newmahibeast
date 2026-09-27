import React, { useState, useEffect } from 'react';
import { DEFAULT_SITE_CONFIG } from './data/defaultContent';
import { Navbar } from './components/Navbar';
import { HeroCarouselSection } from './components/HeroCarouselSection';
import { QuoteSection } from './components/QuoteSection';
import { AutoVideoSection } from './components/AutoVideoSection';
import { FounderSection } from './components/FounderSection';
import { FooterSection } from './components/FooterSection';
import { BossPage } from './components/BossPage';
import { analytics } from './utils/analyticsTracker';

function checkIsBossRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  const search = window.location.search.toLowerCase();
  const params = new URLSearchParams(search);

  // Path check (exact or endsWith, e.g. /bosspage, /boasspage, /boss, /boss-page)
  if (
    path === '/bosspage' ||
    path === '/boasspage' ||
    path === '/boss' ||
    path === '/boss-page' ||
    path.endsWith('/bosspage') ||
    path.endsWith('/boasspage') ||
    path.endsWith('/boss') ||
    path.endsWith('/boss-page')
  ) {
    return true;
  }

  // Hash check (e.g. #bosspage, #/bosspage, #boasspage, #/boasspage, #boss)
  if (
    hash === 'bosspage' ||
    hash === 'boasspage' ||
    hash === 'boss' ||
    hash.startsWith('bosspage') ||
    hash.startsWith('boasspage') ||
    hash.startsWith('boss')
  ) {
    return true;
  }

  // Query parameter check (e.g. ?bosspage, ?boasspage, ?page=bosspage, ?page=boasspage, ?boss)
  if (
    params.has('bosspage') ||
    params.has('boasspage') ||
    params.has('boss') ||
    params.get('page') === 'bosspage' ||
    params.get('page') === 'boasspage' ||
    params.get('page') === 'boss'
  ) {
    return true;
  }

  return false;
}

export default function App() {
  const [isBossRoute, setIsBossRoute] = useState<boolean>(() => checkIsBossRoute());
  const [remainingSlots, setRemainingSlots] = useState<number>(() => {
    return Math.floor(Math.random() * 10) + 34; // Initial random between 34 and 43 (< 50)
  });

  // Random live fluctuation of slots (kam/jyada), strictly kept under 50 (between 8 and 48)
  useEffect(() => {
    const updateInterval = () => {
      setRemainingSlots((prev) => {
        const deltas = [-1, -2, 1, -1, 2, -1, -3, 1, -2, 1];
        const delta = deltas[Math.floor(Math.random() * deltas.length)];
        let next = prev + delta;

        // Keep strictly under 50 and above 6
        if (next >= 49) {
          next = 44;
        } else if (next <= 7) {
          next = Math.floor(Math.random() * 8) + 21; // simulate fresh slots batch
        }
        return next;
      });
    };

    const timer = setInterval(updateInterval, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsBossRoute(checkIsBossRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Keyboard shortcut (Ctrl+Shift+B or Cmd+Shift+B) to toggle Boss Page
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (checkIsBossRoute()) {
          window.history.pushState({}, '', '/');
        } else {
          window.history.pushState({}, '', '/bosspage');
        }
        handleLocationChange();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    analytics.init();
  }, [isBossRoute]);

  // If visiting the personal analytics route /bosspage or /boasspage, render the dashboard
  if (isBossRoute) {
    return <BossPage />;
  }

  const config = DEFAULT_SITE_CONFIG;

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* 3-zone Top Bar Navigation */}
      <Navbar telegramLink={config.telegramLink} />

      {/* Main Content Sections strictly in customer-facing order */}
      <main className="flex-1">
        {/* 1. Hero 5-Image Carousel (9:16 Aspect Ratio) */}
        <HeroCarouselSection
          telegramLink={config.telegramLink}
        />

        {/* 2. Auto-play Video Clip on Scroll (lazy progressive MP4 buffering via IntersectionObserver) */}
        <AutoVideoSection
          videoUrl={config.videoUrl}
          videoPoster={config.videoPoster}
          videoTitle={config.videoTitle}
          videoDescription={config.videoDescription}
        />

        {/* 3. Founders Page / Spotlight */}
        <FounderSection founder={config.founder} />

        {/* 4. Bill Gates Quote in Hindi (Positioned right above bottom/footer) */}
        <QuoteSection />
      </main>

      {/* 10. Bottom Section & Footer */}
      <FooterSection telegramLink={config.telegramLink} />
    </div>
  );
}
