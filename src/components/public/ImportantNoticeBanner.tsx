import React from 'react';
import { SchoolConfig, NewsArticle } from '../../types';
import { AlertTriangle, Megaphone, Bell, Sparkles } from 'lucide-react';

interface ImportantNoticeBannerProps {
  config: SchoolConfig;
  articles?: NewsArticle[];
}

export const ImportantNoticeBanner: React.FC<ImportantNoticeBannerProps> = ({ config }) => {
  const announcement = config.importantAnnouncement;

  if (!announcement || announcement.enabled === false) {
    return null;
  }

  const badgeText = announcement.badge || 'INFO PENTING';
  const textMessage = announcement.text?.trim() || '';

  if (!textMessage) {
    return null;
  }

  // Animation speed duration
  const getSpeedDuration = () => {
    switch (announcement.speed) {
      case 'slow':
        return '50s';
      case 'fast':
        return '18s';
      case 'normal':
      default:
        return '30s';
    }
  };

  // Color Theme classes
  const getThemeClasses = () => {
    const theme = announcement.theme || 'warning';

    // Custom background override if set
    if (announcement.customBgColor) {
      return {
        containerBg: '',
        customStyle: { backgroundColor: announcement.customBgColor },
        badgeBg: 'bg-white/20 text-white border-white/30 backdrop-blur-xs',
        badgeTextColor: 'text-white',
        tickerTextColor: 'text-white font-semibold',
        icon: <Megaphone className="w-3.5 h-3.5 text-white shrink-0" />,
      };
    }

    switch (theme) {
      case 'danger':
        return {
          containerBg: 'bg-gradient-to-r from-rose-800 via-rose-600 to-rose-800 text-white border-y border-rose-900/40 shadow-sm',
          badgeBg: 'bg-white text-rose-900 font-black border-rose-200 shadow-xs',
          badgeTextColor: 'text-rose-900',
          tickerTextColor: 'text-rose-50 font-semibold',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-800 shrink-0" />,
        };
      case 'emerald':
        return {
          containerBg: 'bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-800 text-white border-y border-emerald-900/40 shadow-sm',
          badgeBg: 'bg-amber-300 text-slate-950 font-black border-amber-200 shadow-xs',
          badgeTextColor: 'text-slate-950',
          tickerTextColor: 'text-emerald-50 font-semibold',
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-950 shrink-0" />,
        };
      case 'info':
        return {
          containerBg: 'bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 text-white border-y border-blue-900/40 shadow-sm',
          badgeBg: 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-xs',
          badgeTextColor: 'text-slate-950',
          tickerTextColor: 'text-blue-50 font-semibold',
          icon: <Bell className="w-3.5 h-3.5 text-slate-950 shrink-0" />,
        };
      case 'slate':
        return {
          containerBg: 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-amber-300 border-y border-slate-800 shadow-sm',
          badgeBg: 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-xs',
          badgeTextColor: 'text-slate-950',
          tickerTextColor: 'text-slate-100 font-semibold',
          icon: <Megaphone className="w-3.5 h-3.5 text-slate-950 shrink-0" />,
        };
      case 'purple':
        return {
          containerBg: 'bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 text-white border-y border-purple-950/40 shadow-sm',
          badgeBg: 'bg-amber-300 text-slate-950 font-black border-amber-200 shadow-xs',
          badgeTextColor: 'text-slate-950',
          tickerTextColor: 'text-purple-50 font-semibold',
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-950 shrink-0" />,
        };
      case 'orange':
        return {
          containerBg: 'bg-gradient-to-r from-orange-700 via-orange-500 to-orange-700 text-white border-y border-orange-800/40 shadow-sm',
          badgeBg: 'bg-slate-950 text-white font-black border-slate-800 shadow-xs',
          badgeTextColor: 'text-white',
          tickerTextColor: 'text-orange-50 font-semibold',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
        };
      case 'warning':
      default:
        return {
          containerBg: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 border-y border-amber-600/30 shadow-sm',
          badgeBg: 'bg-slate-950 text-white font-black border-slate-800 shadow-xs',
          badgeTextColor: 'text-white',
          tickerTextColor: 'text-slate-950 font-bold',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
        };
    }
  };

  const themeStyle = getThemeClasses();

  // Split text by bullets (•), pipes (|), or newlines into items if any
  const textItems = textMessage
    .split(/[•|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const isSticky = announcement.isSticky === true;

  return (
    <div
      id="info-penting-running-text"
      className={`overflow-hidden py-2.5 sm:py-3 px-3 sm:px-6 transition-all duration-300 ${
        isSticky ? 'sticky top-[56px] sm:top-[64px] z-30 shadow-md' : 'relative z-20'
      } ${themeStyle.containerBg}`}
      style={themeStyle.customStyle}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2.5 sm:gap-3">
        
        {/* Sticky Left Badge Label */}
        <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider shrink-0 shadow-xs border ${themeStyle.badgeBg}`}>
          {themeStyle.icon}
          <span className="font-black">{badgeText}</span>
        </div>

        {/* Marquee Running Text Track */}
        <div className="overflow-hidden whitespace-nowrap flex-1 relative">
          <div
            className="inline-flex items-center gap-8 animate-marquee hover:pause"
            style={{ animationDuration: getSpeedDuration() }}
          >
            {/* Repeat items twice for seamless infinite marquee loop */}
            {[...textItems, ...textItems].map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 shrink-0">
                <span className={`text-xs sm:text-sm tracking-wide ${themeStyle.tickerTextColor}`}>
                  {item}
                </span>
                <span className="opacity-60 mx-2 text-xs font-black">•</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
