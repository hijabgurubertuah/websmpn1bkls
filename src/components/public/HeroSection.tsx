import React from 'react';
import { SchoolConfig } from '../../types';
import { Award, GraduationCap, Users, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';

interface HeroSectionProps {
  config: SchoolConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config }) => {
  const { header, identity, layoutSections, themeConfig } = config;
  const btnBg = themeConfig?.buttonBgColor || themeConfig?.primaryColor;
  const btnText = themeConfig?.buttonTextColor;

  // Icon mapping helper
  const getStatIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'award':
        return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />;
      case 'graduationcap':
        return <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />;
      case 'users':
        return <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />;
      case 'bookopen':
      default:
        return <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />;
    }
  };

  const handleScrollTo = (target: string) => {
    if (target?.startsWith('#')) {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasQuickStats = layoutSections.showQuickStats && header.highlights && header.highlights.length > 0;

  // Banner overlay color & opacity configuration from Admin Theme settings
  const bannerColor = themeConfig?.bannerOverlayColor || '#020617';
  const bannerOpacity = typeof themeConfig?.bannerOverlayOpacity === 'number' ? themeConfig.bannerOverlayOpacity : 45;
  const opacityRatio = Math.max(0, Math.min(100, bannerOpacity)) / 100;

  const hexToRgba = (hex: string, alpha: number) => {
    let c = (hex || '#020617').replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const r = parseInt(c.substring(0, 2), 16) || 0;
    const g = parseInt(c.substring(2, 4), 16) || 0;
    const b = parseInt(c.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
  };

  return (
    <div id="beranda" className="relative text-white">
      
      {/* Background Hero Image with Overlays - Batas bawah tepat di tengah kartu */}
      <div className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src={header.heroImageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80'}
            alt={identity.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform scale-105 duration-1000 ease-out"
          />
          {/* Pelindung Kontras Teks: Latar tetap gelap pekat di area teks agar selalu tajam & mudah dibaca */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-transparent max-w-4xl" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />

          {/* Configurable Gradients Overlay dari Pengaturan Tema Admin */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              background: `linear-gradient(to right, ${hexToRgba(bannerColor, Math.min(1, opacityRatio * 1.15))}, ${hexToRgba(bannerColor, Math.min(1, opacityRatio * 0.75))}, ${hexToRgba(bannerColor, Math.min(1, opacityRatio * 0.25))})`,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              background: `linear-gradient(to top, ${hexToRgba(bannerColor, Math.min(1, opacityRatio * 0.85))}, transparent 70%)`,
            }}
          />
        </div>

        {/* Hero Content Area: Di layar HP diberi pb-36 sm:pb-40 agar tombol Profil & Prestasi Sekolah tidak tertimpa oleh kartu */}
        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 ${hasQuickStats ? 'pb-36 sm:pb-40 md:pb-24 lg:pb-28' : 'pb-12 sm:pb-16'}`}>
          <div className="max-w-3xl space-y-4">
            
            {/* Main Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {header.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed max-w-2xl">
              {header.heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 mb-2 flex flex-wrap items-center gap-3 relative z-10">
              {header.heroCtaText && (
                <button
                  type="button"
                  onClick={() => handleScrollTo(header.heroCtaLink)}
                  style={btnBg ? { backgroundColor: btnBg, color: btnText || '#ffffff' } : undefined}
                  className={`inline-flex items-center gap-2 font-bold px-5 py-3 rounded-xl shadow-lg transition-all text-xs sm:text-sm cursor-pointer transform hover:-translate-y-0.5 ${
                    !btnBg ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30' : ''
                  }`}
                >
                  <span>{header.heroCtaText}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {header.secondaryCtaText && (
                <button
                  type="button"
                  onClick={() => handleScrollTo(header.secondaryCtaLink)}
                  className="inline-flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 font-semibold px-4 py-3 rounded-xl backdrop-blur-sm transition-all text-xs sm:text-sm cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-blue-400" />
                  <span>{header.secondaryCtaText}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Floating 4 Stat Cards: Batas bawah banner tepat di tengah kartu (separuh atas di dalam banner, separuh bawah di luar banner) */}
      {hasQuickStats && (
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -translate-y-1/2 -mb-14 sm:-mb-16 md:-mb-8 lg:-mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {header.highlights.map((stat) => (
              <div
                key={stat.id}
                className="group relative rounded-2xl p-[2.5px] sm:p-[3px] bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 shadow-[0_8px_14px_-2px_rgba(0,0,0,0.85),0_4px_6px_-1px_rgba(0,0,0,0.7)] transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-full w-full bg-slate-900/95 backdrop-blur-xl rounded-[13.5px] p-3 sm:p-4.5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-slate-800/95 border border-amber-400/40 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                      {getStatIcon(stat.icon)}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 line-clamp-1">
                      {stat.label}
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white tracking-tight pl-0.5">
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

