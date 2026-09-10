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

  return (
    <div id="beranda" className="relative bg-slate-950 text-white">
      
      {/* Background Hero Image with Overlays - Slimmer height */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={header.heroImageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80'}
            alt={identity.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform scale-105 duration-1000 ease-out"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        {/* Hero Content Area */}
        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 ${hasQuickStats ? 'pb-20 sm:pb-24' : 'pb-10 sm:pb-14'}`}>
          <div className="max-w-3xl space-y-4">
            
            {/* Main Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {header.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
              {header.heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
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

      {/* Floating 4 Stat Cards */}
      {hasQuickStats && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {header.highlights.map((stat) => (
              <div
                key={stat.id}
                className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 sm:p-5 shadow-lg ring-1 ring-white/10 hover:border-blue-500/60 transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/50 group-hover:scale-105 transition-transform">
                    {getStatIcon(stat.icon)}
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 line-clamp-1">
                    {stat.label}
                  </span>
                </div>
                <div className="text-lg sm:text-2xl font-black text-white tracking-tight pl-0.5">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

