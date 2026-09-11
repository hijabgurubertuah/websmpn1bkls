import React, { useState, useEffect } from 'react';
import { SchoolConfig } from '../../types';
import {
  Home,
  Newspaper,
  Trophy,
  Activity,
  PhoneCall,
} from 'lucide-react';

interface MobileBottomNavProps {
  config: SchoolConfig;
  onOpenContact?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  config,
  onOpenContact,
}) => {
  const bottomNavConfig = config.mobileBottomNav || {
    enabled: true,
    showHome: true,
    showNews: true,
    showAchievements: true,
    showExtracurriculars: true,
    showContact: true,
    styleVariant: 'floating-dock',
    themeColor: 'dark-slate',
    accentColor: 'blue',
    showLabels: false,
    elevatedCenterButton: true,
    showActiveIndicator: true,
  };

  const [activeTab, setActiveTab] = useState<'home' | 'news' | 'achievements' | 'ekskul' | 'contact'>('home');

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Check if near bottom of page (Kontak / Footer)
      if (window.scrollY + windowHeight >= docHeight - 350) {
        setActiveTab('contact');
        return;
      }

      const ekskulEl = document.getElementById('fasilitas') || document.getElementById('ekskul');
      const newsEl = document.getElementById('berita');

      if (ekskulEl && scrollPos >= ekskulEl.offsetTop - 120 && scrollPos < (ekskulEl.offsetTop + ekskulEl.offsetHeight)) {
        setActiveTab('ekskul');
      } else if (newsEl && scrollPos >= newsEl.offsetTop - 120 && scrollPos < (newsEl.offsetTop + newsEl.offsetHeight)) {
        setActiveTab((prev) => (prev === 'achievements' ? 'achievements' : 'news'));
      } else if (window.scrollY < 400) {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (bottomNavConfig.enabled === false) {
    return null;
  }

  const scrollToElement = (elementId: string) => {
    const el = document.getElementById(elementId) || (elementId === 'kontak' ? document.getElementById('footer') : null);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (elementId === 'beranda') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (elementId === 'kontak') {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    setActiveTab('home');
    scrollToElement('beranda');
  };

  const handleNewsClick = () => {
    setActiveTab('news');
    window.dispatchEvent(new CustomEvent('select-news-category', { detail: 'Semua' }));
    scrollToElement('berita');
  };

  const handleAchievementsClick = () => {
    setActiveTab('achievements');
    window.dispatchEvent(new CustomEvent('select-news-category', { detail: 'Prestasi' }));
    scrollToElement('berita');
  };

  const handleEkskulClick = () => {
    setActiveTab('ekskul');
    window.dispatchEvent(new CustomEvent('select-facility-tab', { detail: 'ekskul' }));
    scrollToElement('fasilitas');
  };

  const handleContactClick = () => {
    setActiveTab('contact');
    if (onOpenContact) {
      onOpenContact();
    } else {
      scrollToElement('kontak');
    }
  };

  // Determine Dock Theme Classes & Styles
  const theme = bottomNavConfig.themeColor || 'dark-slate';
  const accent = bottomNavConfig.accentColor || 'blue';
  const variant = bottomNavConfig.styleVariant || 'floating-dock';
  const isLight = theme === 'light-modern';

  // Theme container classes
  let containerBgClass = 'bg-slate-900/94 backdrop-blur-xl border-slate-700/80 text-white shadow-slate-950/70';
  if (theme === 'deep-navy') {
    containerBgClass = 'bg-slate-950/94 backdrop-blur-xl border-blue-900/80 text-blue-50 shadow-blue-950/70';
  } else if (theme === 'royal-indigo') {
    containerBgClass = 'bg-indigo-950/94 backdrop-blur-xl border-indigo-800/80 text-indigo-50 shadow-indigo-950/70';
  } else if (theme === 'emerald-green') {
    containerBgClass = 'bg-emerald-950/94 backdrop-blur-xl border-emerald-800/80 text-emerald-50 shadow-emerald-950/70';
  } else if (theme === 'light-modern') {
    containerBgClass = 'bg-white/95 backdrop-blur-xl border-slate-200/90 text-slate-800 shadow-slate-300/80';
  }

  // Accent color active classes
  const getAccentTextClass = (isActive: boolean) => {
    if (!isActive) {
      return isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200';
    }
    switch (accent) {
      case 'indigo': return isLight ? 'text-indigo-600 font-bold' : 'text-indigo-400 font-bold';
      case 'emerald': return isLight ? 'text-emerald-600 font-bold' : 'text-emerald-400 font-bold';
      case 'amber': return isLight ? 'text-amber-600 font-bold' : 'text-amber-400 font-bold';
      case 'rose': return isLight ? 'text-rose-600 font-bold' : 'text-rose-400 font-bold';
      case 'purple': return isLight ? 'text-purple-600 font-bold' : 'text-purple-400 font-bold';
      case 'cyan': return isLight ? 'text-cyan-600 font-bold' : 'text-cyan-400 font-bold';
      default: return isLight ? 'text-blue-600 font-bold' : 'text-blue-400 font-bold';
    }
  };

  const getAccentBgClass = (isActive: boolean) => {
    if (!isActive) {
      return isLight ? 'group-hover:bg-slate-100' : 'group-hover:bg-slate-800/60';
    }
    switch (accent) {
      case 'indigo': return isLight ? 'bg-indigo-50 shadow-xs' : 'bg-indigo-500/20 shadow-inner';
      case 'emerald': return isLight ? 'bg-emerald-50 shadow-xs' : 'bg-emerald-500/20 shadow-inner';
      case 'amber': return isLight ? 'bg-amber-50 shadow-xs' : 'bg-amber-500/20 shadow-inner';
      case 'rose': return isLight ? 'bg-rose-50 shadow-xs' : 'bg-rose-500/20 shadow-inner';
      case 'purple': return isLight ? 'bg-purple-50 shadow-xs' : 'bg-purple-500/20 shadow-inner';
      case 'cyan': return isLight ? 'bg-cyan-50 shadow-xs' : 'bg-cyan-500/20 shadow-inner';
      default: return isLight ? 'bg-blue-50 shadow-xs' : 'bg-blue-600/20 shadow-inner';
    }
  };

  const getAccentDotClass = () => {
    switch (accent) {
      case 'indigo': return 'bg-indigo-500 shadow-indigo-400';
      case 'emerald': return 'bg-emerald-500 shadow-emerald-400';
      case 'amber': return 'bg-amber-500 shadow-amber-400';
      case 'rose': return 'bg-rose-500 shadow-rose-400';
      case 'purple': return 'bg-purple-500 shadow-purple-400';
      case 'cyan': return 'bg-cyan-500 shadow-cyan-400';
      default: return 'bg-blue-500 shadow-blue-400';
    }
  };

  const getHomeCenterBgClass = (isActive: boolean) => {
    if (!isActive) {
      return isLight
        ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-400/40'
        : 'bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-200 hover:text-white shadow-slate-950/60';
    }
    switch (accent) {
      case 'indigo': return 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-indigo-600/50 ring-2 ring-indigo-400/40';
      case 'emerald': return 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 text-white shadow-emerald-600/50 ring-2 ring-emerald-400/40';
      case 'amber': return 'bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 text-white shadow-amber-600/50 ring-2 ring-amber-400/40';
      case 'rose': return 'bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 text-white shadow-rose-600/50 ring-2 ring-rose-400/40';
      case 'purple': return 'bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-500 text-white shadow-purple-600/50 ring-2 ring-purple-400/40';
      case 'cyan': return 'bg-gradient-to-tr from-cyan-600 via-teal-500 to-cyan-500 text-white shadow-cyan-600/50 ring-2 ring-cyan-400/40';
      default: return 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-blue-600/50 ring-2 ring-blue-400/40';
    }
  };

  const isFloating = variant !== 'glass-bar' && variant !== 'solid-dock';
  const isPill = variant === 'minimal-pill';
  const showLabels = Boolean(bottomNavConfig.showLabels);
  const isElevatedCenter = bottomNavConfig.elevatedCenterButton !== false;
  const showIndicator = bottomNavConfig.showActiveIndicator !== false;

  const customStyle: React.CSSProperties = {};
  if (theme === 'custom' && bottomNavConfig.customBgColor) {
    customStyle.backgroundColor = bottomNavConfig.customBgColor;
  }

  return (
    <nav
      id="mobile-bottom-nav-dock"
      aria-label="Navigasi Bawah Mobile"
      className={`md:hidden fixed z-40 inset-x-0 ${
        isFloating
          ? 'bottom-3 px-3 flex justify-center pointer-events-none'
          : 'bottom-0 px-3 py-1 bg-slate-900/95 border-t border-slate-800 shadow-2xl'
      }`}
    >
      <div
        style={customStyle}
        className={`pointer-events-auto flex items-center justify-between w-full transition-all duration-200 border shadow-2xl ${
          isFloating
            ? `max-w-md ${isPill ? 'rounded-full px-2 py-1' : 'rounded-2xl p-1.5'} ${containerBgClass} ring-1 ring-white/10`
            : `max-w-md mx-auto ${containerBgClass}`
        }`}
      >
        {/* Item 1: Berita */}
        {bottomNavConfig.showNews !== false && (
          <button
            type="button"
            id="mobile-nav-btn-news"
            onClick={handleNewsClick}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer relative group ${getAccentTextClass(
              activeTab === 'news'
            )}`}
            title="Berita & Informasi"
            aria-label="Berita & Informasi"
          >
            <div
              className={`p-1.5 rounded-lg transition-all ${getAccentBgClass(
                activeTab === 'news'
              )}`}
            >
              <Newspaper className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            {showLabels && (
              <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                Berita
              </span>
            )}
            {showIndicator && activeTab === 'news' && (
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1 shadow-xs animate-pulse ${getAccentDotClass()}`}
              />
            )}
          </button>
        )}

        {/* Item 2: Prestasi */}
        {bottomNavConfig.showAchievements !== false && (
          <button
            type="button"
            id="mobile-nav-btn-achievements"
            onClick={handleAchievementsClick}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer relative group ${getAccentTextClass(
              activeTab === 'achievements'
            )}`}
            title="Prestasi Siswa"
            aria-label="Prestasi Siswa"
          >
            <div
              className={`p-1.5 rounded-lg transition-all ${getAccentBgClass(
                activeTab === 'achievements'
              )}`}
            >
              <Trophy className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            {showLabels && (
              <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                Prestasi
              </span>
            )}
            {showIndicator && activeTab === 'achievements' && (
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1 shadow-xs animate-pulse ${getAccentDotClass()}`}
              />
            )}
          </button>
        )}

        {/* CENTER ITEM: Home (Beranda) */}
        {bottomNavConfig.showHome !== false && (
          <div className="flex items-center justify-center px-1 shrink-0">
            {isElevatedCenter ? (
              <button
                type="button"
                id="mobile-nav-btn-home-center"
                onClick={handleHomeClick}
                className={`relative -top-3 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200 active:scale-90 cursor-pointer border-2 ${
                  isLight ? 'border-white' : 'border-slate-900'
                } group ${getHomeCenterBgClass(activeTab === 'home')} ${
                  activeTab === 'home' ? 'scale-105' : ''
                }`}
                title="Beranda (Home)"
                aria-label="Beranda"
              >
                <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
                {showIndicator && activeTab === 'home' && (
                  <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-white shadow-xs" />
                )}
              </button>
            ) : (
              <button
                type="button"
                id="mobile-nav-btn-home"
                onClick={handleHomeClick}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer relative group ${getAccentTextClass(
                  activeTab === 'home'
                )}`}
                title="Beranda"
                aria-label="Beranda"
              >
                <div
                  className={`p-1.5 rounded-lg transition-all ${getAccentBgClass(
                    activeTab === 'home'
                  )}`}
                >
                  <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                {showLabels && (
                  <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                    Beranda
                  </span>
                )}
                {showIndicator && activeTab === 'home' && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 shadow-xs animate-pulse ${getAccentDotClass()}`}
                  />
                )}
              </button>
            )}
          </div>
        )}

        {/* Item 3: Ekstrakurikuler */}
        {bottomNavConfig.showExtracurriculars !== false && (
          <button
            type="button"
            id="mobile-nav-btn-ekskul"
            onClick={handleEkskulClick}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer relative group ${getAccentTextClass(
              activeTab === 'ekskul'
            )}`}
            title="Ekstrakurikuler & Fasilitas"
            aria-label="Ekstrakurikuler & Fasilitas"
          >
            <div
              className={`p-1.5 rounded-lg transition-all ${getAccentBgClass(
                activeTab === 'ekskul'
              )}`}
            >
              <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            {showLabels && (
              <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                Ekskul
              </span>
            )}
            {showIndicator && activeTab === 'ekskul' && (
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1 shadow-xs animate-pulse ${getAccentDotClass()}`}
              />
            )}
          </button>
        )}

        {/* Item 4: Kontak (Langsung Mengarah ke Footer / Kontak) */}
        {bottomNavConfig.showContact !== false && (
          <button
            type="button"
            id="mobile-nav-btn-contact"
            onClick={handleContactClick}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer relative group ${getAccentTextClass(
              activeTab === 'contact'
            )}`}
            title="Kontak & Lokasi Sekolah"
            aria-label="Kontak & Lokasi Sekolah"
          >
            <div
              className={`p-1.5 rounded-lg transition-all ${getAccentBgClass(
                activeTab === 'contact'
              )}`}
            >
              <PhoneCall className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            {showLabels && (
              <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                Kontak
              </span>
            )}
            {showIndicator && activeTab === 'contact' && (
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1 shadow-xs animate-pulse ${getAccentDotClass()}`}
              />
            )}
          </button>
        )}
      </div>
    </nav>
  );
};
