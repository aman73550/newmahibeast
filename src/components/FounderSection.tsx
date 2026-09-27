import React from 'react';
import { FounderData } from '../types';
import { BadgeCheck, MapPin, Sparkles, Send } from 'lucide-react';

interface FounderSectionProps {
  founder: FounderData;
}

export const FounderSection: React.FC<FounderSectionProps> = ({ founder }) => {
  return (
    <section id="founder" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 md:p-16 border border-white/[0.1] bg-gradient-to-b from-white/[0.04] to-black/80 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Founder Portrait Column */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group w-64 h-80 sm:w-72 sm:h-96 rounded-3xl overflow-hidden glass-panel border border-amber-400/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <img
                  src="/Images/founder-section-portrait.webp"
                  alt={founder.name}
                  loading="eager"
                  onError={(e) => {
                    // Try alternative case / founder.webp fallback if not found yet
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = '1';
                      target.src = '/founder.webp';
                    }
                  }}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Bottom Card Label */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{founder.name}</span>
                    <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-400/20" />
                  </div>
                  <div className="text-xs text-slate-300 font-medium">{founder.role}</div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-300 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{founder.location}</span>
                  </div>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-5">
                {(founder.achievements || []).map((item: { stat: string; label: string }, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center"
                  >
                    <div className="text-lg font-extrabold text-white tabular-nums">
                      {item.stat}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Founder Story & Philosophy Column */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Architect Behind Mahi Beast</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
                  Meet {founder.name}
                </h2>
                <div className="text-sm font-semibold text-sky-400 mt-1">
                  <a
                    href="https://t.me/mahibeast1M"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-amber-300 inline-flex items-center gap-1"
                  >
                    {founder.handle}
                  </a>{' '}
                  · {founder.role}
                </div>
              </div>

              {founder.bio ? (
                <p className="text-slate-300 text-base leading-relaxed">
                  {founder.bio}
                </p>
              ) : null}

              <div className="pt-2">
                <a
                  href="https://t.me/mahibeast1M"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all active:scale-95"
                >
                  <Send className="w-4 h-4 fill-slate-950" />
                  <span>Join Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
