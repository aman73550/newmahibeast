// Browser-side analytics store and tracking engine (Highest precision calculation)

export interface ClickRecord {
  id: string;
  url: string;
  label: string;
  timestamp: number;
}

export interface VisitRecord {
  id: string;
  timestamp: number;
  referrer: string;
  device: string;
  path: string;
}

export interface LinkStats {
  url: string;
  label: string;
  clickCount: number;
  lastClickedAt: number;
}

export interface BrowserAnalyticsData {
  pageViews: number;
  visits: VisitRecord[];
  clicks: ClickRecord[];
  linkStats: Record<string, LinkStats>;
}

const STORAGE_KEY = 'bosspage_analytics_data_v1';

function getInitialData(): BrowserAnalyticsData {
  return {
    pageViews: 0,
    visits: [],
    clicks: [],
    linkStats: {},
  };
}

function detectDevice(): string {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

export function getStoredAnalytics(): BrowserAnalyticsData {
  if (typeof window === 'undefined') return getInitialData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialData();
    const parsed = JSON.parse(raw);
    return {
      pageViews: Number(parsed.pageViews) || 0,
      visits: Array.isArray(parsed.visits) ? parsed.visits : [],
      clicks: Array.isArray(parsed.clicks) ? parsed.clicks : [],
      linkStats: typeof parsed.linkStats === 'object' && parsed.linkStats ? parsed.linkStats : {},
    };
  } catch {
    return getInitialData();
  }
}

export function saveStoredAnalytics(data: BrowserAnalyticsData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save analytics to localStorage:', e);
  }
}

export function clearAnalyticsData() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

let lastPageViewTime = 0;
let lastPageViewPath = '';

export function recordPageView(path: string = '/') {
  if (typeof window === 'undefined') return;
  // Never track the admin dashboard itself as visitor views
  const lowerPath = path.toLowerCase();
  if (lowerPath.includes('bosspage') || lowerPath.includes('boasspage') || lowerPath.includes('/boss')) return;

  const now = Date.now();
  // Prevent duplicate pageview triggers on quick re-renders / React StrictMode (minimum 3 seconds gap for same path)
  if (now - lastPageViewTime < 3000 && lastPageViewPath === lowerPath) {
    return;
  }
  lastPageViewTime = now;
  lastPageViewPath = lowerPath;

  const data = getStoredAnalytics();
  data.pageViews += 1;

  const newVisit: VisitRecord = {
    id: `v_${now}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now,
    referrer: document.referrer || 'Direct / Bookmark',
    device: detectDevice(),
    path,
  };

  data.visits.unshift(newVisit);
  // Keep the latest 100 visit logs
  if (data.visits.length > 100) {
    data.visits = data.visits.slice(0, 100);
  }

  saveStoredAnalytics(data);
}

// Global debouncing registers to guarantee strictly 1 click counted per physical user interaction
let lastClickTimestamp = 0;
let lastClickTargetUrl = '';

export function recordLinkClick(url: string, label: string = 'Link') {
  if (typeof window === 'undefined') return;
  if (!url || url.startsWith('javascript:')) return;

  const now = Date.now();
  const cleanUrl = url.trim();
  const cleanLabel = (label || 'Link').trim().slice(0, 60);

  // HIGHEST ACCURACY DEDUPLICATION:
  // 1. If same URL clicked within 1200ms -> ignore as duplicate (React synthetic + native click + touch emulation)
  if (cleanUrl === lastClickTargetUrl && now - lastClickTimestamp < 1200) {
    return;
  }
  // 2. Minimum 400ms physical human click debounce threshold across any clicks
  if (now - lastClickTimestamp < 400) {
    return;
  }

  lastClickTimestamp = now;
  lastClickTargetUrl = cleanUrl;

  const data = getStoredAnalytics();

  // 1. Add click event record
  const newClick: ClickRecord = {
    id: `c_${now}_${Math.random().toString(36).substring(2, 7)}`,
    url: cleanUrl,
    label: cleanLabel,
    timestamp: now,
  };

  data.clicks.unshift(newClick);
  // Keep the latest 150 click logs
  if (data.clicks.length > 150) {
    data.clicks = data.clicks.slice(0, 150);
  }

  // 2. Aggregate link stats precisely
  if (!data.linkStats[cleanUrl]) {
    data.linkStats[cleanUrl] = {
      url: cleanUrl,
      label: cleanLabel,
      clickCount: 1,
      lastClickedAt: now,
    };
  } else {
    data.linkStats[cleanUrl].clickCount += 1;
    data.linkStats[cleanUrl].lastClickedAt = now;
    if (cleanLabel && cleanLabel !== 'Link') {
      data.linkStats[cleanUrl].label = cleanLabel;
    }
  }

  saveStoredAnalytics(data);
}

// Global click listener for general non-component links
let isListenerAttached = false;
export function initBrowserAnalytics() {
  if (typeof window === 'undefined' || isListenerAttached) return;

  // Track the initial page visit
  recordPageView(window.location.pathname);

  // Capture link clicks on the page (with multi-trigger prevention)
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('javascript:') || href.startsWith('#')) return;

      // EXCLUSIVE DEDUPLICATION:
      // Our Telegram CTA buttons are already handled explicitly by `analytics.trackTelegramClick`
      // with their respective exact section identifiers. Do NOT double-count via this global listener!
      if (href.includes('t.me') || anchor.hasAttribute('data-tracked')) {
        return;
      }

      const text = (
        anchor.innerText ||
        anchor.getAttribute('aria-label') ||
        anchor.getAttribute('title') ||
        'Link'
      ).trim();

      recordLinkClick(href, text);
    },
    { capture: true }
  );

  isListenerAttached = true;
}
