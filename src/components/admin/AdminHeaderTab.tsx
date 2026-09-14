import React from 'react';
import { SchoolConfig } from '../../types';
import { Sparkles, Image as ImageIcon, Sliders, Globe, RefreshCw, Check } from 'lucide-react';
import { ImageUploadButton } from './ImageUploadButton';

const DEFAULT_FAVICON_FALLBACK = 'https://i.ibb.co.com/d44hK88L/logo-smpn-1-bengkalis-kecil.png';

interface AdminHeaderTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminHeaderTab: React.FC<AdminHeaderTabProps> = ({ config, onChange }) => {
  const { identity, header } = config;

  const updateIdentity = (key: keyof typeof identity, value: any) => {
    onChange({
      ...config,
      identity: {
        ...identity,
        [key]: value,
      },
    });
  };

  const updateHeader = (key: keyof typeof header, value: any) => {
    onChange({
      ...config,
      header: {
        ...header,
        [key]: value,
      },
    });
  };

  const updateHighlight = (id: string, field: 'label' | 'value', value: string) => {
    const updated = header.highlights.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateHeader('highlights', updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Identitas Instansi */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Identitas Instansi</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Instansi
            </label>
            <input
              type="text"
              value={identity.name}
              onChange={(e) => updateIdentity('name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Nama instansi / lembaga..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Singkat
            </label>
            <input
              type="text"
              value={identity.shortName || ''}
              onChange={(e) => updateIdentity('shortName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Singkatan nama..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tagline / Visi Singkat
            </label>
            <input
              type="text"
              value={identity.tagline}
              onChange={(e) => updateIdentity('tagline', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Motto instansi..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NPSN / Kode Registrasi
              </label>
              <input
                type="text"
                value={identity.npsn}
                onChange={(e) => updateIdentity('npsn', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="NPSN / Kode Registrasi..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Akreditasi / Status
              </label>
              <input
                type="text"
                value={identity.akreditasi}
                onChange={(e) => updateIdentity('akreditasi', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="Akreditasi A"
              />
            </div>
          </div>

          <div>
            <ImageUploadButton
              label="Logo Instansi (Header & Navbar)"
              value={identity.logoUrl}
              onChange={(url) => {
                onChange({
                  ...config,
                  identity: {
                    ...identity,
                    logoUrl: url,
                    faviconUrl:
                      !identity.faviconUrl || identity.faviconUrl === identity.logoUrl
                        ? url
                        : identity.faviconUrl,
                  },
                });
              }}
              preset="logo"
              aspectRatio="square"
              placeholder="URL Logo..."
            />
          </div>

          {/* Dedicated Custom Favicon Upload Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">
                  Favicon Kustom (Ikon Tab Browser & PWA)
                </span>
              </div>
              <span className="text-[10px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Multi-Format (PNG, ICO, SVG)
              </span>
            </div>

            {/* Live Browser Tab Preview Mockup */}
            <div className="bg-slate-200/70 p-2.5 rounded-lg border border-slate-300 flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Pratinjau Tab Browser:</span>
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-t-md border-t border-x border-slate-300 shadow-xs max-w-xs truncate">
                {identity.faviconUrl || identity.logoUrl ? (
                  <img
                    src={identity.faviconUrl || identity.logoUrl}
                    alt="Favicon"
                    className="w-4 h-4 object-contain shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {identity.shortName || identity.name || 'Portal Resmi'} - Portal Resmi
                </span>
              </div>
            </div>

            {/* Favicon Upload Component */}
            <ImageUploadButton
              label="Unggah Berkas Favicon Baru"
              value={identity.faviconUrl || ''}
              onChange={(url) => updateIdentity('faviconUrl', url)}
              preset="favicon"
              aspectRatio="square"
              placeholder="Tempel tautan gambar atau upload file favicon..."
            />

            {/* Quick Action Helpers */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80">
              {identity.logoUrl && identity.faviconUrl !== identity.logoUrl && (
                <button
                  type="button"
                  onClick={() => updateIdentity('faviconUrl', identity.logoUrl)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Gunakan Logo Sekolah Sebagai Favicon
                </button>
              )}
              {identity.faviconUrl && identity.faviconUrl !== DEFAULT_FAVICON_FALLBACK && (
                <button
                  type="button"
                  onClick={() => updateIdentity('faviconUrl', DEFAULT_FAVICON_FALLBACK)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  Kembalikan ke Favicon Default
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              * Favicon yang diunggah akan otomatis diperbarui di tab browser, pintasan bookmark, dan ikon aplikasi Web (PWA). Rekomendasi: format PNG persegi transparan atau ICO.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Banner Utama (Hero) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>Banner Utama (Hero)</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Banner
            </label>
            <input
              type="text"
              value={header.heroTitle}
              onChange={(e) => updateHeader('heroTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subjudul Banner
            </label>
            <textarea
              rows={2}
              value={header.heroSubtitle}
              onChange={(e) => updateHeader('heroSubtitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <ImageUploadButton
              label="Gambar Latar Banner"
              value={header.heroImageUrl}
              onChange={(url) => updateHeader('heroImageUrl', url)}
              preset="banner"
              aspectRatio="banner"
              layout="vertical"
              placeholder="URL Gambar Banner..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-blue-700 block">Tombol Utama</span>
              <input
                type="text"
                placeholder="Teks Tombol"
                value={header.heroCtaText}
                onChange={(e) => updateHeader('heroCtaText', e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Link Target"
                value={header.heroCtaLink}
                onChange={(e) => updateHeader('heroCtaLink', e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Tombol Sekunder</span>
              <input
                type="text"
                placeholder="Teks Tombol"
                value={header.secondaryCtaText}
                onChange={(e) => updateHeader('secondaryCtaText', e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Link Target"
                value={header.secondaryCtaLink}
                onChange={(e) => updateHeader('secondaryCtaLink', e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* 4 Kartu Statistik Ringkas */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Kartu Statistik Hero</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {header.highlights.map((item) => (
              <div key={item.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <input
                  type="text"
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => updateHighlight(item.id, 'label', e.target.value)}
                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Nilai"
                  value={item.value}
                  onChange={(e) => updateHighlight(item.id, 'value', e.target.value)}
                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white font-bold text-blue-700"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
