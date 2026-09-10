import React, { useState } from 'react';
import { SchoolConfig, ThemeConfig, ThemePreset } from '../../types';
import {
  BUILTIN_THEME_PRESETS,
  DEFAULT_THEME_CONFIG,
  hexOrRgbToRgb,
  rgbToHex,
} from '../../lib/themePresets';
import {
  Palette,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Layout,
  MousePointerClick,
  RotateCcw,
  Sliders,
  Bookmark,
} from 'lucide-react';

interface AdminThemeTabProps {
  config: SchoolConfig;
  onChange: (newConfig: SchoolConfig) => void;
}

export const AdminThemeTab: React.FC<AdminThemeTabProps> = ({ config, onChange }) => {
  const theme: ThemeConfig = config.themeConfig || DEFAULT_THEME_CONFIG;

  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);

  const updateTheme = (updatedFields: Partial<ThemeConfig>) => {
    onChange({
      ...config,
      themeConfig: {
        ...theme,
        ...updatedFields,
      },
    });
  };

  const activePrimary = theme.primaryColor || '#2563eb';
  const activeHover = theme.primaryHoverColor || '#1d4ed8';
  const activeHeaderBg = theme.headerBgColor || '#0f172a';
  const activeNavbarBg = theme.navbarBgColor || '#ffffff';
  const activeNavbarText = theme.navbarTextColor || '#0f172a';
  const activeBtnBg = theme.buttonBgColor || '#2563eb';
  const activeBtnText = theme.buttonTextColor || '#ffffff';
  const activeFooterBg = theme.footerBgColor || '#0f172a';

  // Apply a preset
  const applyPreset = (preset: ThemePreset) => {
    updateTheme({
      presetId: preset.id,
      primaryColor: preset.primaryColor,
      primaryHoverColor: preset.primaryHoverColor || preset.primaryColor,
      headerBgColor: preset.headerBgColor || '#0f172a',
      navbarBgColor: preset.navbarBgColor || '#ffffff',
      navbarTextColor: preset.navbarTextColor || '#0f172a',
      buttonBgColor: preset.buttonBgColor || preset.primaryColor,
      buttonTextColor: preset.buttonTextColor || '#ffffff',
      accentColor: preset.accentColor || '#f59e0b',
      footerBgColor: preset.footerBgColor || '#0f172a',
    });
  };

  // Save current active colors as a new custom preset
  const handleSaveCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset: ThemePreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      primaryColor: activePrimary,
      primaryHoverColor: activeHover,
      headerBgColor: activeHeaderBg,
      navbarBgColor: activeNavbarBg,
      navbarTextColor: activeNavbarText,
      buttonBgColor: activeBtnBg,
      buttonTextColor: activeBtnText,
      footerBgColor: activeFooterBg,
      isCustom: true,
    };

    const existingCustoms = theme.customPresets || [];
    updateTheme({
      presetId: newPreset.id,
      customPresets: [...existingCustoms, newPreset],
    });

    setNewPresetName('');
    setShowSavePresetModal(false);
  };

  // Delete custom preset
  const handleDeleteCustomPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const existingCustoms = theme.customPresets || [];
    updateTheme({
      customPresets: existingCustoms.filter((p) => p.id !== presetId),
      presetId: theme.presetId === presetId ? 'blue_classic' : theme.presetId,
    });
  };

  // Helper component for single color picker item with RGB controls
  const ColorItemControl = ({
    label,
    description,
    colorValue,
    onColorChange,
    quickSwatches,
  }: {
    label: string;
    description: string;
    colorValue: string;
    onColorChange: (newHex: string) => void;
    quickSwatches?: string[];
  }) => {
    const rgb = hexOrRgbToRgb(colorValue);

    const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
      const clampedVal = Math.max(0, Math.min(255, val || 0));
      const newRgb = { ...rgb, [channel]: clampedVal };
      onColorChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    return (
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              {label}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {description}
            </span>
          </div>

          {/* Quick Swatches */}
          {quickSwatches && quickSwatches.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {quickSwatches.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => onColorChange(sw)}
                  className={`w-6 h-6 rounded-md border shadow-2xs transition-transform hover:scale-110 cursor-pointer ${
                    colorValue.toLowerCase() === sw.toLowerCase()
                      ? 'ring-2 ring-slate-900 ring-offset-1 border-slate-900'
                      : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: sw }}
                  title={`Ganti ke ${sw}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Color Picker & HEX Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-300 shadow-2xs">
            <input
              type="color"
              value={colorValue.startsWith('#') ? colorValue : rgbToHex(rgb.r, rgb.g, rgb.b)}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-8 h-8 rounded-md cursor-pointer border border-slate-300 p-0.5 shrink-0"
              title="Pilih warna secara visual"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Kode HEX</span>
              <input
                type="text"
                value={colorValue}
                onChange={(e) => onColorChange(e.target.value)}
                placeholder="#000000"
                className="w-full text-xs font-mono font-bold text-slate-800 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* RGB Sliders / Number Controls */}
          <div className="bg-white p-2 rounded-lg border border-slate-300 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-blue-600" />
                <span>Palet RGB</span>
              </span>
              <span className="font-mono text-slate-700">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              <div className="flex items-center gap-1">
                <span className="text-red-600 font-bold">R:</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value, 10))}
                  className="w-full px-1 py-0.5 border border-slate-200 rounded text-center font-bold text-slate-800"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">G:</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value, 10))}
                  className="w-full px-1 py-0.5 border border-slate-200 rounded text-center font-bold text-slate-800"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">B:</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value, 10))}
                  className="w-full px-1 py-0.5 border border-slate-200 rounded text-center font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header & Quick Presets Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-600" />
              <span>Tema & Kombinasi Warna Website</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Atur skema warna dasar header, bilah menu navigasi, tombol, dan elemen utama website dengan pilihan palet RGB & HEX.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSavePresetModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Bookmark className="w-4 h-4" />
            <span>Simpan Preset Kustom</span>
          </button>
        </div>

        {/* Built-In Presets Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Preset Tema Populer (Siap Pakai)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BUILTIN_THEME_PRESETS.map((preset) => {
              const isSelected = theme.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Swatches strip */}
                  <div className="flex h-3 rounded-md overflow-hidden mb-2.5 border border-slate-200/60">
                    <div className="flex-1" style={{ backgroundColor: preset.primaryColor }} />
                    <div className="flex-1" style={{ backgroundColor: preset.navbarBgColor || '#ffffff' }} />
                    <div className="flex-1" style={{ backgroundColor: preset.headerBgColor || '#0f172a' }} />
                  </div>

                  <span className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {preset.name}
                  </span>

                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 p-0.5 bg-blue-600 text-white rounded-full">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Saved Custom Presets List (if any) */}
        {theme.customPresets && theme.customPresets.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Preset Tema Tersimpan milik Anda</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {theme.customPresets.map((preset) => {
                const isSelected = theme.presetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-3 w-16 rounded-md overflow-hidden border border-slate-200/60">
                        <div className="flex-1" style={{ backgroundColor: preset.primaryColor }} />
                        <div className="flex-1" style={{ backgroundColor: preset.navbarBgColor || '#ffffff' }} />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="Hapus preset ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-900 leading-snug truncate">
                      {preset.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Rincian Pengaturan Warna Kustom */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="font-bold text-slate-900 text-base">Atur Warna Spesifik (RGB & HEX)</h3>
          </div>

          <button
            type="button"
            onClick={() => updateTheme(DEFAULT_THEME_CONFIG)}
            className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Kebawaan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Kolom Menu Navigasi Background */}
          <ColorItemControl
            label="1. Warna Bilah Menu Navigasi (Navbar)"
            description="Latar belakang kolom menu navigasi atas. Bebas diganti dari putih ke warna lain."
            colorValue={activeNavbarBg}
            onColorChange={(newHex) => updateTheme({ navbarBgColor: newHex, presetId: 'custom' })}
            quickSwatches={['#ffffff', '#f8fafc', '#f0fdf4', '#fff1f2', '#f0fdfa', '#faf5ff', '#0f172a', '#020617']}
          />

          {/* Warna Teks Bilah Menu */}
          <ColorItemControl
            label="2. Warna Teks & Menu Navigasi"
            description="Warna tulisan nama instansi dan menu navigasi agar kontras dengan warna bilah menu."
            colorValue={activeNavbarText}
            onColorChange={(newHex) => updateTheme({ navbarTextColor: newHex, presetId: 'custom' })}
            quickSwatches={['#0f172a', '#1e293b', '#064e3b', '#881337', '#134e4a', '#581c87', '#ffffff', '#f8fafc']}
          />

          {/* Warna Utama Website */}
          <ColorItemControl
            label="3. Warna Utama Website (Primary Brand)"
            description="Warna identitas utama yang mendominasi aksen, lencana, sorotan, dan ikon."
            colorValue={activePrimary}
            onColorChange={(newHex) => updateTheme({ primaryColor: newHex, presetId: 'custom' })}
            quickSwatches={['#2563eb', '#059669', '#be123c', '#3b82f6', '#0d9488', '#7e22ce', '#d97706', '#4f46e5']}
          />

          {/* Warna Tombol Utama */}
          <ColorItemControl
            label="4. Warna Tombol Utama (Button Color)"
            description="Warna tombol pendaftaran PPDB, tombol aksi hero, dan tombol utama lainnya."
            colorValue={activeBtnBg}
            onColorChange={(newHex) => updateTheme({ buttonBgColor: newHex, presetId: 'custom' })}
            quickSwatches={['#2563eb', '#059669', '#be123c', '#0d9488', '#7e22ce', '#0f172a', '#f59e0b', '#dc2626']}
          />

          {/* Warna Teks Tombol */}
          <ColorItemControl
            label="5. Warna Teks Didalam Tombol"
            description="Warna tulisan di dalam tombol utama agar tetap jelas dan mudah dibaca."
            colorValue={activeBtnText}
            onColorChange={(newHex) => updateTheme({ buttonTextColor: newHex, presetId: 'custom' })}
            quickSwatches={['#ffffff', '#0f172a', '#f8fafc', '#fef08a', '#d97706']}
          />

          {/* Warna Latar Dasar Header & Footer */}
          <ColorItemControl
            label="6. Warna Latar Header & Footer"
            description="Latar belakang dasar untuk bagian banner hero dan footer bawah website."
            colorValue={activeHeaderBg}
            onColorChange={(newHex) => updateTheme({ headerBgColor: newHex, footerBgColor: newHex, presetId: 'custom' })}
            quickSwatches={['#0f172a', '#020617', '#022c22', '#4c0519', '#042f2e', '#2e1065', '#1e293b', '#18181b']}
          />

        </div>
      </div>

      {/* 3. Live Mini Preview */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Simulasi Pratinjau Tampilan Tema Real-Time</span>
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            Preview Latar
          </span>
        </div>

        {/* Mini Mockup Window */}
        <div className="rounded-xl overflow-hidden border border-slate-300 shadow-md">
          
          {/* Mini Mockup Navbar */}
          <div
            className="p-3 border-b flex items-center justify-between transition-colors"
            style={{ backgroundColor: activeNavbarBg, color: activeNavbarText, borderColor: 'rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                style={{ backgroundColor: activePrimary }}
              >
                S
              </div>
              <span className="font-extrabold text-xs" style={{ color: activeNavbarText }}>
                {config.identity.name || 'SMP Negeri 1 Bengkalis'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold" style={{ color: activeNavbarText }}>
              <span className="opacity-90">Beranda</span>
              <span className="opacity-90">Profil</span>
              <span className="opacity-90">Berita</span>
              <button
                type="button"
                className="px-3 py-1 rounded-md text-[11px] font-bold shadow-2xs"
                style={{ backgroundColor: activeBtnBg, color: activeBtnText }}
              >
                PPDB 2026
              </button>
            </div>
          </div>

          {/* Mini Hero Mockup */}
          <div
            className="p-6 text-white text-center space-y-3 transition-colors"
            style={{ backgroundColor: activeHeaderBg }}
          >
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs"
              style={{ backgroundColor: activePrimary, color: '#ffffff' }}
            >
              Portal Resmi Instansi
            </span>
            <h4 className="font-extrabold text-base tracking-tight max-w-sm mx-auto leading-tight">
              {config.header.heroTitle || 'Selamat Datang di Portal Instansi'}
            </h4>
            <div className="pt-1 flex justify-center gap-2">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                style={{ backgroundColor: activeBtnBg, color: activeBtnText }}
              >
                Layanan
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Profil Instansi
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Simpan Preset Baru */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-600" />
                <span>Simpan Preset Warna Kustom</span>
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Beri nama kombinasi warna yang baru Anda atur agar dapat dipakai kembali dengan mudah di kemudian hari.
            </p>

            <form onSubmit={handleSaveCustomPreset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Preset Tema
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Misal: Tema Ramadhan / Tema Kemerdekaan 17 Agustus"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSavePresetModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newPresetName.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Simpan Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
