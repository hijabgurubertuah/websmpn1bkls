import React, { useState } from 'react';
import { SchoolConfig, NewsArticle } from '../../types';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  X,
  Megaphone,
  Sparkles,
} from 'lucide-react';

interface ImportantNoticeBannerProps {
  config: SchoolConfig;
  articles?: NewsArticle[];
}

export const ImportantNoticeBanner: React.FC<ImportantNoticeBannerProps> = ({ config }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const announcement = config.importantAnnouncement;

  if (!announcement || !announcement.enabled || isDismissed) {
    return null;
  }

  const theme = announcement.theme || 'warning';
  const badgeText = announcement.badge || 'INFO PENTING';
  const titleText = announcement.title || '';
  const messageText = announcement.text || '';
  const buttonEnabled = announcement.buttonEnabled !== false && Boolean(announcement.buttonUrl);
  const buttonText = announcement.buttonText || 'Baca Selengkapnya';
  const buttonUrl = announcement.buttonUrl || '#berita';

  // Theme-specific styles and icons
  const getThemeStyles = () => {
    switch (theme) {
      case 'danger':
        return {
          wrapperBg: 'bg-gradient-to-r from-rose-950 via-slate-950 to-rose-950 border-rose-500/40 text-rose-50',
          badgeBg: 'bg-rose-600 text-white border-rose-400/40 shadow-xs',
          icon: <AlertOctagon className="w-4 h-4 text-rose-300 animate-pulse shrink-0" />,
          titleColor: 'text-white',
          textColor: 'text-rose-100/90',
          buttonStyle: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 border-rose-400/40',
          pulseDot: 'bg-rose-400',
        };
      case 'info':
        return {
          wrapperBg: 'bg-gradient-to-r from-blue-950 via-slate-950 to-blue-950 border-blue-500/40 text-blue-50',
          badgeBg: 'bg-blue-600 text-white border-blue-400/40 shadow-xs',
          icon: <Info className="w-4 h-4 text-blue-300 shrink-0" />,
          titleColor: 'text-white',
          textColor: 'text-blue-100/90',
          buttonStyle: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 border-blue-400/40',
          pulseDot: 'bg-blue-400',
        };
      case 'emerald':
        return {
          wrapperBg: 'bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 border-emerald-500/40 text-emerald-50',
          badgeBg: 'bg-emerald-600 text-white border-emerald-400/40 shadow-xs',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />,
          titleColor: 'text-white',
          textColor: 'text-emerald-100/90',
          buttonStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 border-emerald-400/40',
          pulseDot: 'bg-emerald-400',
        };
      case 'warning':
      default:
        return {
          wrapperBg: 'bg-gradient-to-r from-amber-950 via-slate-950 to-amber-950 border-amber-500/40 text-amber-50',
          badgeBg: 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-xs',
          icon: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />,
          titleColor: 'text-amber-100',
          textColor: 'text-amber-200/90',
          buttonStyle: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md shadow-amber-500/20 border-amber-300',
          pulseDot: 'bg-amber-400',
        };
    }
  };

  const currentTheme = getThemeStyles();
  const isExternalLink = buttonUrl.startsWith('http://') || buttonUrl.startsWith('https://');

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (buttonUrl.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.querySelector(buttonUrl);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      id="info-penting-banner"
      className={`relative z-20 border-y shadow-md transition-all duration-300 ${currentTheme.wrapperBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        
        {/* Prominent Banner Card Layout */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Left / Main Content */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            
            {/* Pulsing Alert Icon */}
            <div className="mt-0.5 sm:mt-0 p-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0 flex items-center justify-center">
              {currentTheme.icon}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              
              {/* Badge & Optional Title */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider border ${currentTheme.badgeBg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-ping ${currentTheme.pulseDot}`} />
                  {badgeText}
                </span>

                {titleText && (
                  <h4 className={`text-xs sm:text-sm font-black tracking-tight ${currentTheme.titleColor}`}>
                    {titleText}
                  </h4>
                )}
              </div>

              {/* Message Description */}
              {messageText && (
                <p className={`text-xs sm:text-sm leading-relaxed ${currentTheme.textColor}`}>
                  {messageText}
                </p>
              )}
            </div>
          </div>

          {/* Right Action Controls: CTA Button & Dismiss */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0 pt-1 sm:pt-0">
            {buttonEnabled && (
              <a
                href={buttonUrl}
                target={isExternalLink ? '_blank' : undefined}
                rel={isExternalLink ? 'noopener noreferrer' : undefined}
                onClick={handleLinkClick}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${currentTheme.buttonStyle}`}
              >
                <span>{buttonText}</span>
                {isExternalLink ? (
                  <ExternalLink className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </a>
            )}

            {announcement.dismissible !== false && (
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Sembunyikan Pengumuman"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
