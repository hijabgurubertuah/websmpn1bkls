import React from 'react';
import { SchoolConfig } from '../../types';
import { Sparkles, Image as ImageIcon, Sliders } from 'lucide-react';
import { ImageUploadButton } from './ImageUploadButton';

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
      {/* 1. Identitas Sekolah */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Identitas Sekolah</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Sekolah
            </label>
            <input
              type="text"
              value={identity.name}
              onChange={(e) => updateIdentity('name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="SMP Negeri 1 Bengkalis"
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
              placeholder="SMPN 1 Bengkalis"
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
              placeholder="Motto sekolah..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NPSN
              </label>
              <input
                type="text"
                value={identity.npsn}
                onChange={(e) => updateIdentity('npsn', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="10495146"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Akreditasi
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
              label="Logo Sekolah"
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

          <div>
            <ImageUploadButton
              label="Favicon (Ikon Tab)"
              value={identity.faviconUrl || identity.logoUrl}
              onChange={(url) => updateIdentity('faviconUrl', url)}
              preset="favicon"
              aspectRatio="square"
              placeholder="URL Favicon..."
            />
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
