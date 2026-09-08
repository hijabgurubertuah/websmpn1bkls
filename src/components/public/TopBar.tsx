import React from 'react';
import { SchoolConfig } from '../../types';
import { Volume2 } from 'lucide-react';

interface TopBarProps {
  config: SchoolConfig;
}

export const TopBar: React.FC<TopBarProps> = ({ config }) => {
  const { identity } = config;

  if (!identity.tickerEnabled || !identity.tickerText) {
    return null;
  }

  return (
    <div id="top-bar" className="bg-slate-900 text-slate-200 text-xs sm:text-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2 overflow-hidden w-full">
          <span className="inline-flex items-center gap-1 bg-blue-600/90 text-white font-semibold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider shrink-0 animate-pulse">
            <Volume2 className="w-3.5 h-3.5" /> Info
          </span>
          <div className="overflow-hidden whitespace-nowrap text-slate-300 font-medium w-full">
            <div className="inline-block animate-marquee hover:pause">
              {identity.tickerText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

