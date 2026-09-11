import React from 'react';
import { SchoolConfig, LayoutSections, MobileBottomNavConfig } from '../../types';
import {
  Layout,
  Smartphone,
  Home,
  Newspaper,
  Trophy,
  Activity,
  PhoneCall,
  Sparkles,
  Palette,
  Check,
  Eye,
  Sliders,
} from 'lucide-react';

interface AdminLayoutTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminLayoutTab: React.FC<AdminLayoutTabProps> = ({ config, onChange }) => {
  const { layoutSections } = config;

  const bottomNavConfig: MobileBottomNavConfig = config.mobileBottomNav || {
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

  const toggleSection = (key: keyof LayoutSections) => {
    onChange({
      ...config,
      layoutSections: {
        ...layoutSections,
        [key]: !layoutSections[key],
      },
    });
  };

  const updateBottomNav = (partial: Partial<MobileBottomNavConfig>) => {
    onChange({
      ...config,
      mobileBottomNav: {
        ...bottomNavConfig,
        ...partial,
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

  const themePresets = [
    { id: 'dark-slate', name: 'Dark Slate', desc: 'Kaca Gelap Elegan', bg: 'bg-slate-900', border: 'border-slate-700' },
    { id: 'deep-navy', name: 'Deep Navy', desc: 'Biru Navy Gelap', bg: 'bg-slate-950', border: 'border-blue-900' },
    { id: 'royal-indigo', name: 'Royal Indigo', desc: 'Ungu Indigo', bg: 'bg-indigo-950', border: 'border-indigo-800' },
    { id: 'emerald-green', name: 'Emerald Green', desc: 'Hijau Sekolah/Alam', bg: 'bg-emerald-950', border: 'border-emerald-800' },
    { id: 'light-modern', name: 'Light Modern', desc: 'Putih Kaca Bersih', bg: 'bg-white', border: 'border-slate-300' },
    { id: 'custom', name: 'Warna Kustom', desc: 'Pilih Hex Bebas', bg: 'bg-gradient-to-r from-blue-600 to-purple-600', border: 'border-slate-400' },
  ];

  const accentColors = [
    { id: 'blue', name: 'Biru Royal', hex: '#2563eb', class: 'bg-blue-600' },
    { id: 'indigo', name: 'Indigo', hex: '#4f46e5', class: 'bg-indigo-600' },
    { id: 'emerald', name: 'Hijau Zamrud', hex: '#059669', class: 'bg-emerald-600' },
    { id: 'amber', name: 'Emas / Amber', hex: '#d97706', class: 'bg-amber-500' },
    { id: 'rose', name: 'Merah Rose', hex: '#e11d48', class: 'bg-rose-600' },
    { id: 'purple', name: 'Ungu Purple', hex: '#9333ea', class: 'bg-purple-600' },
    { id: 'cyan', name: 'Cyan Toska', hex: '#0891b2', class: 'bg-cyan-600' },
  ];

  const styleVariants = [
    {
      id: 'floating-dock',
      name: 'Floating Dock',
      desc: 'Melayang modern berujung melengkung (rounded-2xl) dengan bayangan lembut',
    },
    {
      id: 'minimal-pill',
      name: 'Minimal Pill (Kapsul)',
      desc: 'Bentuk lonjong ramping (rounded-full) melayang sangat ringkas',
    },
    {
      id: 'glass-bar',
      name: 'Fixed Glass Bar',
      desc: 'Bilah rapat di bagian paling bawah layar dengan efek kaca blur',
    },
    {
      id: 'solid-dock',
      name: 'Solid Dock',
      desc: 'Bilah warna pekat kontras tinggi tanpa transparansi',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Mobile Bottom Navigation Bar Full Customizer Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Main Enable Header Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900">
                  Navigasi Bawah Khusus HP (Mobile Bottom Nav Dock)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wide">
                  Mobile Only
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Menu ikon melayang di bagian bawah layar smartphone untuk akses instan ke Berita, Prestasi, Beranda, Ekskul, dan Kontak (langsung menuju footer).
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 self-end sm:self-auto">
            <input
              type="checkbox"
              id="toggle-mobile-bottom-nav"
              checked={bottomNavConfig.enabled !== false}
              onChange={(e) => updateBottomNav({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
          </label>
        </div>

        {bottomNavConfig.enabled !== false && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Section 1: Menu Items Visibility */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Pilih Menu Ikon yang Ditampilkan</span>
                </label>
                <span className="text-[11px] text-slate-400">Klik untuk aktif / nonaktif</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                
                {/* 1. Berita */}
                <div
                  id="btn-toggle-nav-news"
                  onClick={() => updateBottomNav({ showNews: !bottomNavConfig.showNews })}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                    bottomNavConfig.showNews !== false
                      ? 'bg-blue-50/80 border-blue-300/80 text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Ikon Berita</div>
                      <div className="text-[10px] text-slate-500 truncate">Menuju seksi berita & artikel</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bottomNavConfig.showNews !== false}
                    readOnly
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer pointer-events-none shrink-0"
                  />
                </div>

                {/* 2. Prestasi */}
                <div
                  id="btn-toggle-nav-achievements"
                  onClick={() => updateBottomNav({ showAchievements: !bottomNavConfig.showAchievements })}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                    bottomNavConfig.showAchievements !== false
                      ? 'bg-amber-50/80 border-amber-300/80 text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Ikon Prestasi</div>
                      <div className="text-[10px] text-slate-500 truncate">Filter tab prestasi siswa</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bottomNavConfig.showAchievements !== false}
                    readOnly
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer pointer-events-none shrink-0"
                  />
                </div>

                {/* 3. Beranda (Home) */}
                <div
                  id="btn-toggle-nav-home"
                  onClick={() => updateBottomNav({ showHome: !bottomNavConfig.showHome })}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                    bottomNavConfig.showHome !== false
                      ? 'bg-indigo-50/80 border-indigo-300/80 text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Ikon Beranda (Home)</div>
                      <div className="text-[10px] text-slate-500 truncate">Kembali ke atas / banner hero</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bottomNavConfig.showHome !== false}
                    readOnly
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer pointer-events-none shrink-0"
                  />
                </div>

                {/* 4. Ekstrakurikuler */}
                <div
                  id="btn-toggle-nav-ekskul"
                  onClick={() => updateBottomNav({ showExtracurriculars: !bottomNavConfig.showExtracurriculars })}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                    bottomNavConfig.showExtracurriculars !== false
                      ? 'bg-emerald-50/80 border-emerald-300/80 text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Ikon Ekstrakurikuler</div>
                      <div className="text-[10px] text-slate-500 truncate">Buka ekskul & fasilitas</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bottomNavConfig.showExtracurriculars !== false}
                    readOnly
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer pointer-events-none shrink-0"
                  />
                </div>

                {/* 5. Kontak (Mengarah ke Footer / Kontak) */}
                <div
                  id="btn-toggle-nav-contact"
                  onClick={() => updateBottomNav({ showContact: !bottomNavConfig.showContact })}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none sm:col-span-2 lg:col-span-2 ${
                    bottomNavConfig.showContact !== false
                      ? 'bg-rose-50/80 border-rose-300/80 text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Ikon Kontak (Mengarah ke Footer)</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Otomatis scroll ke bagian footer (telepon, alamat, maps, &amp; sosmed)
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bottomNavConfig.showContact !== false}
                    readOnly
                    className="w-4 h-4 text-rose-600 rounded cursor-pointer pointer-events-none shrink-0"
                  />
                </div>

              </div>
            </div>

            {/* Section 2: Dock Style Variants */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Bentuk &amp; Gaya Tampilan Dock</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {styleVariants.map((st) => {
                  const isSelected = (bottomNavConfig.styleVariant || 'floating-dock') === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => updateBottomNav({ styleVariant: st.id as any })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-extrabold text-xs">{st.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{st.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Color Theme Presets & Custom Background */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>3. Tema Warna Latar Belakang Dock</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {themePresets.map((tp) => {
                  const isSelected = (bottomNavConfig.themeColor || 'dark-slate') === tp.id;
                  return (
                    <button
                      key={tp.id}
                      type="button"
                      onClick={() => updateBottomNav({ themeColor: tp.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-sm bg-blue-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-full h-5 rounded-md ${tp.bg} ${tp.border} border mb-2 shadow-2xs`} />
                      <div className="text-xs font-bold text-slate-800 truncate">{tp.name}</div>
                      <div className="text-[9px] text-slate-500 truncate">{tp.desc}</div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {bottomNavConfig.themeColor === 'custom' && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-sm animate-in fade-in">
                  <span className="text-xs font-bold text-slate-700">Warna Background Kustom:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bottomNavConfig.customBgColor || '#0f172a'}
                      onChange={(e) => updateBottomNav({ customBgColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                    />
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {bottomNavConfig.customBgColor || '#0f172a'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Active Accent Color */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>4. Warna Sorotan Aksen Aktif (Accent Tint)</span>
              </label>

              <div className="flex items-center gap-2.5 flex-wrap">
                {accentColors.map((ac) => {
                  const isSelected = (bottomNavConfig.accentColor || 'blue') === ac.id;
                  return (
                    <button
                      key={ac.id}
                      type="button"
                      onClick={() => updateBottomNav({ accentColor: ac.id as any })}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${ac.class} shadow-2xs`} />
                      <span>{ac.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Additional Visual Tweaks */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                5. Opsi Tambahan Tampilan
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Elevated Center Button */}
                <div
                  onClick={() =>
                    updateBottomNav({
                      elevatedCenterButton: bottomNavConfig.elevatedCenterButton === false ? true : false,
                    })
                  }
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                    bottomNavConfig.elevatedCenterButton !== false
                      ? 'bg-blue-50/70 border-blue-300/80 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Tombol Home Melayang</div>
                    <div className="text-[10px] text-slate-500">Elevasi tombol tengah bergradasi</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bottomNavConfig.elevatedCenterButton !== false}
                    readOnly
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer pointer-events-none shrink-0"
                  />
                </div>

                {/* Show Labels */}
                <div
                  onClick={() =>
                    updateBottomNav({
                      showLabels: !bottomNavConfig.showLabels,
                    })
                  }
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                    bottomNavConfig.showLabels
                      ? 'bg-blue-50/70 border-blue-300/80 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Tampilkan Label Teks</div>
                    <div className="text-[10px] text-slate-500">Nama menu kecil di bawah ikon</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(bottomNavConfig.showLabels)}
                    readOnly
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer pointer-events-none shrink-0"
                  />
                </div>

                {/* Show Active Indicator Dot */}
                <div
                  onClick={() =>
                    updateBottomNav({
                      showActiveIndicator: bottomNavConfig.showActiveIndicator === false ? true : false,
                    })
                  }
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                    bottomNavConfig.showActiveIndicator !== false
                      ? 'bg-blue-50/70 border-blue-300/80 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Indikator Titik Aktif</div>
                    <div className="text-[10px] text-slate-500">Titik cahaya di bawah ikon aktif</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bottomNavConfig.showActiveIndicator !== false}
                    readOnly
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer pointer-events-none shrink-0"
                  />
                </div>

              </div>
            </div>

            {/* Live Visual Dock Mockup */}
            <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Pratinjau Langsung di Layar HP
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Mode: {bottomNavConfig.styleVariant || 'floating-dock'} | {bottomNavConfig.themeColor || 'dark-slate'}
                </span>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-4 sm:p-6 border border-slate-800/80 flex items-center justify-center min-h-[110px]">
                
                {/* Dock Mockup Container */}
                <div
                  className={`w-full max-w-sm transition-all duration-200 flex items-center justify-between px-3 py-1.5 border shadow-2xl ${
                    bottomNavConfig.styleVariant === 'minimal-pill'
                      ? 'rounded-full'
                      : bottomNavConfig.styleVariant === 'glass-bar'
                      ? 'rounded-none border-x-0'
                      : 'rounded-2xl'
                  } ${
                    bottomNavConfig.themeColor === 'light-modern'
                      ? 'bg-white text-slate-800 border-slate-200 shadow-slate-300/80'
                      : bottomNavConfig.themeColor === 'deep-navy'
                      ? 'bg-slate-950/95 text-blue-50 border-blue-900'
                      : bottomNavConfig.themeColor === 'royal-indigo'
                      ? 'bg-indigo-950/95 text-indigo-50 border-indigo-800'
                      : bottomNavConfig.themeColor === 'emerald-green'
                      ? 'bg-emerald-950/95 text-emerald-50 border-emerald-800'
                      : 'bg-slate-900/95 text-white border-slate-700/80'
                  }`}
                  style={
                    bottomNavConfig.themeColor === 'custom' && bottomNavConfig.customBgColor
                      ? { backgroundColor: bottomNavConfig.customBgColor }
                      : undefined
                  }
                >
                  {/* News */}
                  {bottomNavConfig.showNews !== false && (
                    <div className="flex-1 flex flex-col items-center justify-center p-1.5 text-blue-400">
                      <Newspaper className="w-4 h-4" />
                      {bottomNavConfig.showLabels && (
                        <span className="text-[9px] font-semibold mt-0.5">Berita</span>
                      )}
                      {bottomNavConfig.showActiveIndicator !== false && (
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
                      )}
                    </div>
                  )}

                  {/* Achievements */}
                  {bottomNavConfig.showAchievements !== false && (
                    <div className="flex-1 flex flex-col items-center justify-center p-1.5 text-slate-400">
                      <Trophy className="w-4 h-4" />
                      {bottomNavConfig.showLabels && (
                        <span className="text-[9px] font-semibold mt-0.5">Prestasi</span>
                      )}
                    </div>
                  )}

                  {/* Home */}
                  {bottomNavConfig.showHome !== false && (
                    <div className="px-1 shrink-0 flex items-center justify-center">
                      {bottomNavConfig.elevatedCenterButton !== false ? (
                        <div className="-top-2 relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg border border-slate-900">
                          <Home className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1.5 text-slate-400">
                          <Home className="w-4 h-4" />
                          {bottomNavConfig.showLabels && (
                            <span className="text-[9px] font-semibold mt-0.5">Beranda</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ekskul */}
                  {bottomNavConfig.showExtracurriculars !== false && (
                    <div className="flex-1 flex flex-col items-center justify-center p-1.5 text-slate-400">
                      <Activity className="w-4 h-4" />
                      {bottomNavConfig.showLabels && (
                        <span className="text-[9px] font-semibold mt-0.5">Ekskul</span>
                      )}
                    </div>
                  )}

                  {/* Contact */}
                  {bottomNavConfig.showContact !== false && (
                    <div className="flex-1 flex flex-col items-center justify-center p-1.5 text-slate-400">
                      <PhoneCall className="w-4 h-4" />
                      {bottomNavConfig.showLabels && (
                        <span className="text-[9px] font-semibold mt-0.5">Kontak</span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Page Layout Sections Toggles */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Layout className="w-4 h-4 text-blue-600" />
          <span>Tampilkan / Sembunyikan Seksi Halaman Web</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sectionsList.map((sec) => {
            const isEnabled = layoutSections[sec.key];
            return (
              <div
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                  isEnabled
                    ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <span className="font-bold text-xs">{sec.title}</span>

                <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    readOnly
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
