import React, { useState, useEffect } from 'react';
import { FacilityItem, ExtracurricularItem } from '../../types';
import {
  Building2,
  Trophy,
  Clock,
  UserCheck,
  Sparkles,
  Cpu,
  Flag,
  Music,
  HeartHandshake,
  MessageSquare,
  Award,
  BookOpen,
  Users,
  Target,
} from 'lucide-react';

interface FacilitiesAndEkskulProps {
  facilities: FacilityItem[];
  extracurriculars: ExtracurricularItem[];
  facilitiesTabTitle?: string;
  ekskulTabTitle?: string;
  facilitiesSectionTitle?: string;
  facilitiesSectionSubtitle?: string;
}

export const FacilitiesAndEkskul: React.FC<FacilitiesAndEkskulProps> = ({
  facilities,
  extracurriculars,
  facilitiesTabTitle = 'Fasilitas Sekolah',
  ekskulTabTitle = 'Ekstrakurikuler',
  facilitiesSectionTitle = 'Fasilitas Modern & Ekstrakurikuler',
  facilitiesSectionSubtitle = 'Dukungan penuh sarana fisik berstandar tinggi serta wadah pengembangan talenta generasi muda.',
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'ekskul'>('facilities');

  useEffect(() => {
    const handleSelectTab = (e: Event) => {
      const customEvent = e as CustomEvent<'facilities' | 'ekskul'>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };

    window.addEventListener('select-facility-tab', handleSelectTab);
    return () => window.removeEventListener('select-facility-tab', handleSelectTab);
  }, []);

  const getEkskulIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'cpu':
        return <Cpu className="w-5 h-5 sm:w-6 h-6 text-blue-600" />;
      case 'flag':
        return <Flag className="w-5 h-5 sm:w-6 h-6 text-red-600" />;
      case 'music':
        return <Music className="w-5 h-5 sm:w-6 h-6 text-purple-600" />;
      case 'hearthandshake':
        return <HeartHandshake className="w-5 h-5 sm:w-6 h-6 text-emerald-600" />;
      case 'messagesquare':
        return <MessageSquare className="w-5 h-5 sm:w-6 h-6 text-indigo-600" />;
      case 'bookopen':
        return <BookOpen className="w-5 h-5 sm:w-6 h-6 text-teal-600" />;
      case 'users':
        return <Users className="w-5 h-5 sm:w-6 h-6 text-cyan-600" />;
      case 'target':
        return <Target className="w-5 h-5 sm:w-6 h-6 text-rose-600" />;
      case 'award':
        return <Award className="w-5 h-5 sm:w-6 h-6 text-yellow-600" />;
      case 'trophy':
      default:
        return <Trophy className="w-5 h-5 sm:w-6 h-6 text-amber-600" />;
    }
  };

  return (
    <section id="fasilitas" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/60 relative">
      <span id="ekskul" className="absolute -top-16 left-0 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Switcher Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sarana &amp; Potensi Siswa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {facilitiesSectionTitle}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base mt-1">
              {facilitiesSectionSubtitle}
            </p>
          </div>

          {/* Interactive Tab Switcher - Stretched full width and balanced on Mobile HP, centered on larger screens */}
          <div className="w-full lg:w-auto inline-flex p-1 bg-slate-200/80 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('facilities')}
              className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'facilities'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 h-4" />
              <span>{facilitiesTabTitle}</span>
            </button>
            <button
              onClick={() => setActiveTab('ekskul')}
              className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ekskul'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 h-4" />
              <span>{ekskulTabTitle}</span>
            </button>
          </div>
        </div>

        {/* Facilities Tab Content - 2 columns on Mobile grid-cols-2 */}
        {activeTab === 'facilities' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-300">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={fac.imageUrl}
                    alt={fac.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-slate-900/85 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                    {fac.category}
                  </span>
                </div>
                <div className="p-3 sm:p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm md:text-base leading-tight mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {fac.title}
                  </h3>
                  <p className="text-slate-600 text-[10px] sm:text-xs md:text-sm leading-relaxed flex-1 line-clamp-2 sm:line-clamp-none">
                    {fac.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Extracurriculars Tab Content - 2 columns on Mobile grid-cols-2 */}
        {activeTab === 'ekskul' && (
          <div id="ekskul" className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-300">
            {extracurriculars.map((ekskul) => (
              <div
                key={ekskul.id}
                className="bg-white rounded-2xl p-3 sm:p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 self-start">
                      {getEkskulIcon(ekskul.icon)}
                    </div>
                    <span className="text-[9px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full w-fit">
                      {ekskul.category}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 mb-1 sm:mb-2 line-clamp-1">
                    {ekskul.name}
                  </h3>
                  <p className="text-slate-600 text-[10px] sm:text-xs md:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                    {ekskul.description}
                  </p>
                </div>

                <div className="pt-2 sm:pt-4 border-t border-slate-100 space-y-1 sm:space-y-1.5 text-[9px] sm:text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Pembina: {ekskul.coach}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Jadwal: {ekskul.schedule}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
