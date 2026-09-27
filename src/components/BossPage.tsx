import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  MousePointerClick,
  Eye,
  TrendingUp,
  Clock,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Trash2,
  Lock,
  Globe,
  Smartphone,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

// Self-contained types & storage to guarantee 100% Vercel compatibility
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

export function getStoredAnalytics(): BrowserAnalyticsData {
  const fallback: BrowserAnalyticsData = {
    pageViews: 0,
    visits: [],
    clicks: [],
    linkStats: {},
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      pageViews: Number(parsed.pageViews) || 0,
      visits: Array.isArray(parsed.visits) ? parsed.visits : [],
      clicks: Array.isArray(parsed.clicks) ? parsed.clicks : [],
      linkStats: typeof parsed.linkStats === 'object' && parsed.linkStats ? parsed.linkStats : {},
    };
  } catch {
    return fallback;
  }
}

export function clearAnalyticsData() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export const BossPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('bosspage_session') === 'active';
    } catch {
      return false;
    }
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState<BrowserAnalyticsData>(getStoredAnalytics);
  const [activeTab, setActiveTab] = useState<'links' | 'recent' | 'visits'>('links');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const refreshData = () => {
    setData(getStoredAnalytics());
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend-only credentials check
    const validUser = username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'boss';
    const validPass = password.trim() === 'boss123' || password.trim() === 'admin123';

    if (validUser && validPass) {
      try {
        sessionStorage.setItem('bosspage_session', 'active');
      } catch {}
      setIsAuthenticated(true);
    } else {
      setErrorMsg('Invalid credentials. Default: admin / boss123');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('bosspage_session');
    } catch {}
    setIsAuthenticated(false);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to reset all tracked analytics data?')) {
      clearAnalyticsData();
      refreshData();
    }
  };

  const formatTimestamp = (ts: number): string => {
    if (!ts) return 'Never';
    const date = new Date(ts);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatRelativeTime = (ts: number): string => {
    if (!ts) return 'Never';
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Convert link stats object to sorted array
  const linkStatsList = Object.values(data.linkStats).sort((a, b) => b.clickCount - a.clickCount);
  const totalClicks = data.clicks.length;
  const ctr = data.pageViews > 0 ? ((totalClicks / data.pageViews) * 100).toFixed(1) : '0.0';
  const topLink = linkStatsList[0];

  const navigateToLanding = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  // 1. Render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05070B] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back link */}
          <div className="mb-6">
            <a
              href="/"
              onClick={navigateToLanding}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Landing Page</span>
            </a>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-white/[0.1] bg-gradient-to-b from-white/[0.04] to-black/90 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 mb-6 mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-center text-white font-display mb-1">
              Analytics Dashboard
            </h1>
            <p className="text-xs text-center text-slate-400 mb-6">
              Sign in to view landing page traffic and link metrics
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-sm hover:from-amber-300 hover:to-yellow-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-[0.98]"
              >
                Sign In to Dashboard
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center space-y-2">
              <div className="text-[11px] text-slate-400">
                Default Access: <span className="font-mono text-amber-300">admin</span> / <span className="font-mono text-amber-300">boss123</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3 h-3 text-slate-500 shrink-0" />
                <span>Frontend-only personal dashboard using browser storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Main Analytics Dashboard
  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 selection:bg-amber-400 selection:text-black">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0D14]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={navigateToLanding}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
              title="Return to public landing page"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white font-display">
                  Mahi Beast Analytics
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Browser-side tracking for page views & link conversion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-slate-200 transition-all active:scale-95"
              title="Refresh data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium text-rose-300 transition-all active:scale-95"
              title="Reset tracked data"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-slate-300 hover:text-white transition-all active:scale-95"
              title="Sign out of dashboard"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Page Views */}
          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] bg-[#0A0D14]/70">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Page Views</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tabular-nums font-display">
              {data.pageViews.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Visits recorded by browser</span>
            </div>
          </div>

          {/* Card 2: Total Link Clicks */}
          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] bg-[#0A0D14]/70">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Link Clicks</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <MousePointerClick className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tabular-nums font-display">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <ExternalLink className="w-3 h-3 text-amber-400" />
              <span>All clicked links & buttons</span>
            </div>
          </div>

          {/* Card 3: Click-Through Rate */}
          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] bg-[#0A0D14]/70">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Click Through (CTR)</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tabular-nums font-display">
              {ctr}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Clicks per page visit ratio</span>
            </div>
          </div>

          {/* Card 4: Top Destination Link */}
          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] bg-[#0A0D14]/70">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Top Link</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-white truncate" title={topLink ? topLink.url : 'None'}>
              {topLink ? topLink.label || topLink.url : 'No Clicks Yet'}
            </div>
            <div className="text-[11px] text-amber-300 mt-1 font-semibold">
              {topLink ? `${topLink.clickCount} clicks recorded` : 'Awaiting user interactions'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Data Views */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'links'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08]'
            }`}
          >
            Link Breakdown ({linkStatsList.length})
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'recent'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08]'
            }`}
          >
            Click Activity Log ({data.clicks.length})
          </button>

          <button
            onClick={() => setActiveTab('visits')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'visits'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08]'
            }`}
          >
            Recent Visits ({data.visits.length})
          </button>
        </div>

        {/* Tab 1: Link Breakdown Table */}
        {activeTab === 'links' && (
          <div className="glass-panel rounded-2xl border border-white/[0.08] bg-[#0A0D14]/70 overflow-hidden">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Clicked Links & URLs
                </h3>
                <p className="text-xs text-slate-400">
                  Count of clicks aggregated by destination URL
                </p>
              </div>
            </div>

            {linkStatsList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <MousePointerClick className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No link clicks recorded yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  When visitors click Join Telegram buttons or navigation links, their counts and timestamps will show up here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Link Label / Source</th>
                      <th className="py-3 px-4">Destination URL</th>
                      <th className="py-3 px-4 text-center">Click Count</th>
                      <th className="py-3 px-4 text-right">Last Clicked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {linkStatsList.map((stat, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {stat.label || 'Link'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 max-w-md truncate">
                            <span className="font-mono text-slate-300 truncate" title={stat.url}>
                              {stat.url}
                            </span>
                            <button
                              onClick={() => copyToClipboard(stat.url)}
                              className="text-slate-500 hover:text-amber-400 p-1 rounded"
                              title="Copy URL"
                            >
                              {copiedUrl === stat.url ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <ExternalLink className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-bold tabular-nums">
                            {stat.clickCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400 tabular-nums">
                          <div>{formatRelativeTime(stat.lastClickedAt)}</div>
                          <div className="text-[10px] text-slate-500">
                            {formatTimestamp(stat.lastClickedAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Click Activity Stream */}
        {activeTab === 'recent' && (
          <div className="glass-panel rounded-2xl border border-white/[0.08] bg-[#0A0D14]/70 overflow-hidden">
            <div className="p-5 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white font-display">
                Click Event History
              </h3>
              <p className="text-xs text-slate-400">
                Detailed timeline of each individual link click event
              </p>
            </div>

            {data.clicks.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <MousePointerClick className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No clicks logged yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Clicked URL</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {data.clicks.slice(0, 50).map((click) => (
                      <tr key={click.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 text-[11px] font-semibold border border-amber-400/20">
                            <MousePointerClick className="w-3 h-3" />
                            {click.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 max-w-sm truncate" title={click.url}>
                          {click.url}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 tabular-nums">
                          {formatTimestamp(click.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recent Visits */}
        {activeTab === 'visits' && (
          <div className="glass-panel rounded-2xl border border-white/[0.08] bg-[#0A0D14]/70 overflow-hidden">
            <div className="p-5 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white font-display">
                Page Visit History
              </h3>
              <p className="text-xs text-slate-400">
                Timestamps, referrers, and device types from landing page visits
              </p>
            </div>

            {data.visits.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Globe className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No visits recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4">Page Path</th>
                      <th className="py-3 px-4">Referrer</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {data.visits.slice(0, 50).map((visit) => (
                      <tr key={visit.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[11px] font-semibold border border-blue-500/20">
                            {visit.device === 'Mobile' ? (
                              <Smartphone className="w-3 h-3" />
                            ) : (
                              <Globe className="w-3 h-3" />
                            )}
                            {visit.device}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {visit.path || '/'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-xs" title={visit.referrer}>
                          {visit.referrer}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 tabular-nums">
                          {formatTimestamp(visit.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
