import React from 'react';
import { Quote } from 'lucide-react';

export const QuoteSection: React.FC = () => {
  return (
    <section id="quote" className="py-20 relative overflow-hidden">
      {/* Subtle accent backglow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative glass-panel rounded-3xl p-8 sm:p-12 md:p-16 border border-white/[0.1] bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Quotation icon badge */}
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-8 mx-auto sm:mx-0">
            <Quote className="w-7 h-7 text-amber-400" />
          </div>

          <blockquote className="space-y-6">
            {/* The exact Hindi quote requested by the user */}
            <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-wide leading-relaxed font-sans text-center sm:text-left">
              “अगर आप गरीब पैदा हुए है तो यह आपकी गलती नहीं है पर अगर आप गरीब ही मर जाते है तो यह आपकी गलती है...”
            </p>

            <p className="text-sm sm:text-base text-slate-400 italic font-normal text-center sm:text-left">
              "If you are born poor it's not your mistake, but if you die poor it's your mistake."
            </p>

            {/* Author attribution */}
            <div className="pt-6 border-t border-white/[0.08] text-center sm:text-left">
              <cite className="text-lg sm:text-xl font-bold text-amber-300 not-italic block font-display">
                ~ बिल गेट्स (Bill Gates)
              </cite>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  );
};
