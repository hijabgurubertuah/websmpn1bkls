import React from 'react';
import { SchoolConfig } from '../../types';
import {
  Image,
  Sparkles,
  Sliders,
  Volume2,
  FastForward,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  Megaphone,
  Link as LinkIcon,
  Palette,
  Check,
} from 'lucide-react';
import { ImageUploadButton } from './ImageUploadButton';

interface AdminHeaderTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminHeaderTab: React.FC<AdminHeaderTabProps> = ({ config, onChange }) => {
  const { identity, header } = config;

  const ann = config.importantAnnouncement || {
    enabled: true,
    badge: 'INFO PENTING',
    title: 'Pemberitahuan Penyesuaian KBM & Surat Edaran Resmi',
    text: 'Menindaklanjuti Surat Edaran terkait kondisi cuaca dan kabut asap, seluruh kegiatan belajar tatap muka sementara dialihkan secara daring (PJJ) dari rumah.',
    theme: 'warning',
    buttonEnabled: true,
    buttonText: 'Baca Surat Edaran Lengkap',
    buttonUrl: '#berita',
    dismissible: true,
  };

  const updateImportantAnnouncement = (field: string, value: any) => {
    onChange({
      ...config,
      importantAnnouncement: {
        ...ann,
        [field]: value,
      },
    });
  };

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

  const defaultAccreditationText = `[BAN-S/M] Status ${identity.akreditasi || 'Akreditasi A (Unggul)'} — Sertifikasi Resmi BAN-S/M • [NPSN] Nomor Pokok Sekolah Nasional: ${identity.npsn || '10495146'} — Terverifikasi Kemendikbudristek RI • [PRESTASI] Peringkat Akreditasi Tertinggi Standar Mutu Pendidikan Nasional — Sekolah Ramah Anak • [KURIKULUM] ${identity.name || 'SMP Negeri 1 Bengkalis'} — Unggul, Berkarakter & Berprestasi`;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Identitas Sekolah & Logo */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Identitas Sekolah &amp; Logo</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Sekolah (Website &amp; Aplikasi PWA)
            </label>
            <input
              type="text"
              value={identity.name}
              onChange={(e) => updateIdentity('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Contoh: SMP Negeri 1 Bengkalis"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Singkat (Ikon Layar HP / Home Screen)
            </label>
            <input
              type="text"
              value={identity.shortName || ''}
              onChange={(e) => updateIdentity('shortName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Contoh: SMPN 1 Bengkalis"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tagline / Motto Sekolah
            </label>
            <input
              type="text"
              value={identity.tagline}
              onChange={(e) => updateIdentity('tagline', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Motto pendidikan..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nomor Pokok Sekolah Nasional (NPSN)
            </label>
            <input
              type="text"
              value={identity.npsn}
              onChange={(e) => updateIdentity('npsn', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="10495146"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status Akreditasi
            </label>
            <input
              type="text"
              value={identity.akreditasi}
              onChange={(e) => updateIdentity('akreditasi', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Akreditasi A (Unggul)"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload with Compression & Live Preview */}
            <ImageUploadButton
              label="Logo Sekolah & Ikon Aplikasi PWA"
              value={identity.logoUrl}
              onChange={(url) => {
                onChange({
                  ...config,
                  identity: {
                    ...identity,
                    logoUrl: url,
                    faviconUrl: (!identity.faviconUrl || identity.faviconUrl === identity.logoUrl) ? url : identity.faviconUrl,
                  },
                });
              }}
              preset="logo"
              aspectRatio="square"
              placeholder="https://..."
            />

            {/* Favicon Upload with Compression & Live Preview */}
            <ImageUploadButton
              label="Favicon Tab Browser (Ikon Tab)"
              value={identity.faviconUrl || identity.logoUrl}
              onChange={(url) => updateIdentity('faviconUrl', url)}
              preset="favicon"
              aspectRatio="square"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* 2. Pengaturan Teks Berjalan (Running Text / Marquee) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <span>Pengaturan Teks Berjalan (Running Text / Marquee)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kelola teks berjalan di bawah header (pita akreditasi) dan pengumuman berjalan paling atas.
          </p>
        </div>

        {/* Section A: Teks Berjalan Pita Bawah Header */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                1. Pita Teks Berjalan Bawah Header (Akreditasi &amp; Info Sekolah)
              </h4>
              <p className="text-xs text-slate-500">
                Pita biru tua elegan di bawah banner yang bergulir otomatis ke samping tanpa terpotong label.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={identity.accreditationTickerEnabled !== false}
                onChange={(e) => updateIdentity('accreditationTickerEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {identity.accreditationTickerEnabled !== false && (
            <div className="space-y-4 pt-2 border-t border-slate-200/80">
              {/* Speed selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FastForward className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kecepatan Teks Berjalan</span>
                </label>
                <div className="grid grid-cols-3 gap-2 max-w-md">
                  {(['slow', 'normal', 'fast'] as const).map((speed) => {
                    const currentSpeed = identity.accreditationTickerSpeed || 'normal';
                    const isSelected = currentSpeed === speed;
                    const labels = {
                      slow: 'Lambat (48s)',
                      normal: 'Normal (30s)',
                      fast: 'Cepat (18s)',
                    };
                    return (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => updateIdentity('accreditationTickerSpeed', speed)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {labels[speed]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Textarea Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Isi Teks Berjalan
                  </label>
                  <button
                    type="button"
                    onClick={() => updateIdentity('accreditationTickerText', defaultAccreditationText)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset ke Teks Standar Akreditasi</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={identity.accreditationTickerText ?? defaultAccreditationText}
                  onChange={(e) => updateIdentity('accreditationTickerText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-medium leading-relaxed"
                  placeholder="Masukkan kalimat yang ingin ditampilkan. Pisahkan poin dengan tanda titik tengah (•), pipa (|), atau baris baru..."
                />
                
                {/* Tips format */}
                <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-blue-50/60 border border-blue-200/60 p-2.5 rounded-xl mt-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-blue-900">Tips Format Teks:</p>
                    <p>• Gunakan tanda peluru <code className="bg-white px-1 py-0.5 rounded text-blue-800 font-bold">•</code> atau baris baru untuk memisahkan setiap segmen pengumuman.</p>
                    <p>• Tambahkan awalan kurung seperti <code className="bg-white px-1 py-0.5 rounded text-blue-800 font-bold">[BAN-S/M]</code> atau <code className="bg-white px-1 py-0.5 rounded text-blue-800 font-bold">[NPSN]</code> untuk otomatis membuat lencana kuning keemasan.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section B: Pengaturan Teks Berjalan (Pindah ke Tab Khusus) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Pengaturan Teks Berjalan (Running Text / Ticker)</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                  Tab Khusus
                </span>
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pengaturan 2 lokasi Teks Berjalan (Info Penting di Bawah Menu Header &amp; Pita Akreditasi di Bawah Hero) kini dipusatkan di <b>Tab Teks Berjalan (Ticker)</b>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hero Banner & Header Image */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-600" />
            <span>Header &amp; Gambar Banner Utama (Hero)</span>
          </h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Judul Utama Banner (H1)
            </label>
            <input
              type="text"
              value={header.heroTitle}
              onChange={(e) => updateHeader('heroTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Subjudul / Deskripsi Banner
            </label>
            <textarea
              rows={3}
              value={header.heroSubtitle}
              onChange={(e) => updateHeader('heroSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Header Image with Upload, Full Vertical Stack (controls underneath picture) */}
          <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <ImageUploadButton
              label="Gambar Header Background (Hero Banner)"
              value={header.heroImageUrl}
              onChange={(url) => updateHeader('heroImageUrl', url)}
              preset="banner"
              aspectRatio="banner"
              layout="vertical"
              placeholder="https://images.unsplash.com/... atau tautan Google Drive"
            />
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Tombol CTA Utama
              </span>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Teks Tombol</label>
                <input
                  type="text"
                  value={header.heroCtaText}
                  onChange={(e) => updateHeader('heroCtaText', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Link Target (# atau URL)</label>
                <input
                  type="text"
                  value={header.heroCtaLink}
                  onChange={(e) => updateHeader('heroCtaLink', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tombol CTA Sekunder
              </span>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Teks Tombol</label>
                <input
                  type="text"
                  value={header.secondaryCtaText}
                  onChange={(e) => updateHeader('secondaryCtaText', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Link Target (# atau URL)</label>
                <input
                  type="text"
                  value={header.secondaryCtaLink}
                  onChange={(e) => updateHeader('secondaryCtaLink', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Highlight Stats */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Kartu Sorotan Statistik di Bawah Banner</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {header.highlights.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Kartu #{item.id}
                </span>
                <div>
                  <label className="text-[11px] text-slate-500 block">Label</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateHighlight(item.id, 'label', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block">Nilai</label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => updateHighlight(item.id, 'value', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white font-bold text-blue-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
