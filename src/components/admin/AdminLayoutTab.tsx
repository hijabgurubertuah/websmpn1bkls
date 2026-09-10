import React from 'react';
import { SchoolConfig, LayoutSections } from '../../types';
import { Layout } from 'lucide-react';

interface AdminLayoutTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminLayoutTab: React.FC<AdminLayoutTabProps> = ({ config, onChange }) => {
  const { layoutSections } = config;

  const toggleSection = (key: keyof LayoutSections) => {
    onChange({
      ...config,
      layoutSections: {
        ...layoutSections,
        [key]: !layoutSections[key],
      },
    });
  };

  const sectionsList: Array<{
    key: keyof LayoutSections;
    title: string;
  }> = [
    { key: 'showHero', title: 'Banner Utama (Hero)' },
    { key: 'showAccreditation', title: 'Pita Akreditasi & NPSN' },
    { key: 'showQuickStats', title: 'Kartu Statistik Hero' },
    { key: 'showPrincipalSpeech', title: 'Sambutan Pimpinan / Kepala' },
    { key: 'showNews', title: 'Berita & Pengumuman' },
    { key: 'showAgenda', title: 'Agenda & Kegiatan' },
    { key: 'showFacilities', title: 'Fasilitas Instansi' },
    { key: 'showExtracurriculars', title: 'Ekstrakurikuler' },
    { key: 'showVideoEmbed', title: 'Video Profil (YouTube)' },
    { key: 'showMapEmbed', title: 'Peta Lokasi (Google Maps)' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layout className="w-4 h-4 text-blue-600" />
          <span>Tampilkan / Sembunyikan Seksi Halaman</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sectionsList.map((sec) => {
            const isEnabled = layoutSections[sec.key];
            return (
              <div
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                  isEnabled
                    ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <span className="font-semibold text-xs text-slate-900">{sec.title}</span>

                <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    readOnly
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
