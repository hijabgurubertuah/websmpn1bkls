import React from 'react';
import { SchoolConfig, NewsArticle } from '../../types';
import {
  AlertTriangle,
  Award,
  FastForward,
  Palette,
  RotateCcw,
  Link,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { ImageUploadButton } from './ImageUploadButton';
import { RichTextEditorWithImages } from '../common/RichTextEditorWithImages';

interface AdminTickerTabProps {
  config: SchoolConfig;
  articles?: NewsArticle[];
  onChange: (newConfig: SchoolConfig) => void;
}

export const AdminTickerTab: React.FC<AdminTickerTabProps> = ({ config, articles = [], onChange }) => {
  const { identity } = config;

  const ann = config.importantAnnouncement || {
    enabled: true,
    badge: 'INFO PENTING',
    text: '📢 PEMBERITAHUAN KABUT ASAP: Kegiatan belajar tatap muka dialihkan secara Daring (PJJ) dari rumah.',
    theme: 'warning',
    speed: 'normal',
    customBgColor: '',
    isMarquee: true,
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

  const defaultAccreditationText = `[AKREDITASI] Status ${identity.akreditasi || 'Terakreditasi A (Unggul)'} — Sertifikasi Resmi • [LEGALITAS] Nomor Pokok / Registrasi: ${identity.npsn || '10495146'} — Terverifikasi Resmi • [KOMITMEN] ${identity.name || 'Portal Instansi'} — Unggul, Profesional & Berintegritas`;

  // Quick preset colors for Running Text 1
  const quickColorsAnn = [
    { label: 'Kuning', color: '#f59e0b' },
    { label: 'Merah', color: '#dc2626' },
    { label: 'Hijau', color: '#059669' },
    { label: 'Biru', color: '#2563eb' },
    { label: 'Hitam', color: '#0f172a' },
    { label: 'Ungu', color: '#9333ea' },
  ];

  // Quick preset colors for Running Text 2 (Akreditasi)
  const quickColorsAccred = [
    { label: 'Gelap', color: '#0f172a' },
    { label: 'Biru Tua', color: '#1e3a8a' },
    { label: 'Merah', color: '#991b1b' },
    { label: 'Hijau', color: '#065f46' },
    { label: 'Hitam', color: '#000000' },
    { label: 'Ungu', color: '#581c87' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================================================================================= */}
        {/* KOLOM 1: RUNNING TEKS 1 (INFO PENTING) */}
        {/* ================================================================================= */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-slate-200 shadow-xs space-y-4 sm:space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* Header & Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">Running Text 1 (Info Penting)</h3>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={ann.enabled}
                  onChange={(e) => updateImportantAnnouncement('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {ann.enabled ? (
              <div className="space-y-4">
                
                {/* Custom Color Background */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-blue-600" />
                    <span>Warna Latar</span>
                  </label>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {quickColorsAnn.map((qc) => {
                      const activeColor = ann.customBgColor || '#f59e0b';
                      const isSelected = activeColor.toLowerCase() === qc.color.toLowerCase();
                      return (
                        <button
                          key={qc.color}
                          type="button"
                          onClick={() => updateImportantAnnouncement('customBgColor', qc.color)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-offset-1 ring-slate-900 border-slate-900 text-white shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                          style={{ backgroundColor: qc.color, color: qc.color === '#f59e0b' ? '#0f172a' : '#ffffff' }}
                        >
                          <span>{qc.label}</span>
                        </button>
                      );
                    })}

                    {/* Color Picker & Custom HEX */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="color"
                        value={ann.customBgColor || '#f59e0b'}
                        onChange={(e) => updateImportantAnnouncement('customBgColor', e.target.value)}
                        className="w-7 h-7 rounded-md cursor-pointer border border-slate-300 p-0.5"
                        title="Pilih Warna Kustom"
                      />
                      <input
                        type="text"
                        value={ann.customBgColor || ''}
                        onChange={(e) => updateImportantAnnouncement('customBgColor', e.target.value)}
                        placeholder="#HEX"
                        className="w-20 px-2 py-1 text-xs font-mono border border-slate-300 rounded-md bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Badge & Speed Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Teks Lencana (Badge)
                    </label>
                    <input
                      type="text"
                      value={ann.badge || 'INFO PENTING'}
                      onChange={(e) => updateImportantAnnouncement('badge', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                      placeholder="INFO PENTING"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <FastForward className="w-3 h-3 text-blue-600" />
                      <span>Kecepatan</span>
                    </label>
                    <select
                      value={ann.speed || 'normal'}
                      onChange={(e) => updateImportantAnnouncement('speed', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    >
                      <option value="slow">Lambat</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Cepat</option>
                    </select>
                  </div>
                </div>

                {/* Sticky Pinned Toggle Checkbox */}
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Disematkan Saat Scroll (Sticky)</span>
                    <span className="text-[11px] text-slate-600 font-medium">Tetap menempel di bawah bilah menu saat layar di-scroll</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={ann.isSticky === true}
                      onChange={(e) => updateImportantAnnouncement('isSticky', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Text Content - Taller & Spacious for easy mobile typing */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Isi Teks Running Text
                  </label>
                  <textarea
                    rows={4}
                    value={ann.text || ''}
                    onChange={(e) => updateImportantAnnouncement('text', e.target.value)}
                    className="w-full min-h-[100px] px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white leading-relaxed text-slate-900 shadow-inner"
                    placeholder="Masukkan pesan pengumuman running text..."
                  />
                </div>

                {/* Tautan Berita & Popup Detail Setting Box */}
                <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Popup Berita
                      </span>
                    </div>

                    {/* Compact 3-Option Pills Header */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
                      <label
                        onClick={() => updateImportantAnnouncement('popupMode', 'article')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 rounded-lg cursor-pointer transition-all ${
                          (ann.popupMode === 'article' || (!ann.popupMode && Boolean(ann.targetArticleId)))
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tickerPopupMode"
                          checked={ann.popupMode === 'article' || (!ann.popupMode && Boolean(ann.targetArticleId))}
                          onChange={() => updateImportantAnnouncement('popupMode', 'article')}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Pilih Postingan</span>
                      </label>

                      <label
                        onClick={() => updateImportantAnnouncement('popupMode', 'custom')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 rounded-lg cursor-pointer transition-all ${
                          ann.popupMode === 'custom'
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tickerPopupMode"
                          checked={ann.popupMode === 'custom'}
                          onChange={() => updateImportantAnnouncement('popupMode', 'custom')}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Buat Teks</span>
                      </label>

                      <label
                        onClick={() => updateImportantAnnouncement('popupMode', 'none')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 rounded-lg cursor-pointer transition-all ${
                          ann.popupMode === 'none'
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tickerPopupMode"
                          checked={ann.popupMode === 'none'}
                          onChange={() => updateImportantAnnouncement('popupMode', 'none')}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Tanpa Popup</span>
                      </label>
                    </div>
                  </div>

                  {/* Body Content based on selected option - Full Width for Maximum Editor Freedom */}
                  <div>
                    {/* OPSI 1: Pilih Postingan */}
                    {(ann.popupMode === 'article' || (!ann.popupMode && Boolean(ann.targetArticleId))) && (
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Pilih Berita Yang Dibuka Saat Teks Diklik
                        </label>
                        <select
                          value={ann.targetArticleId || ''}
                          onChange={(e) => updateImportantAnnouncement('targetArticleId', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-800"
                        >
                          <option value="">-- Pilih Berita Dari Daftar --</option>
                          {articles.map((art) => (
                            <option key={art.id} value={art.id}>
                              [Berita] {art.title} ({art.date})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* OPSI 2: Buat Teks */}
                    {ann.popupMode === 'custom' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Judul
                          </label>
                          <input
                            type="text"
                            value={ann.detailTitle || ''}
                            onChange={(e) => updateImportantAnnouncement('detailTitle', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                            placeholder="Judul Pengumuman Lengkap..."
                          />
                        </div>

                        <div>
                          <RichTextEditorWithImages
                            label="Isi Teks"
                            value={ann.detailContent || ''}
                            onChange={(newVal) => updateImportantAnnouncement('detailContent', newVal)}
                            placeholder="Tuliskan isi pengumuman lengkap..."
                            minRows={6}
                            articles={articles.map((a) => ({ id: a.id, title: a.title, category: a.category }))}
                          />
                        </div>

                        <div className="pt-1">
                          <ImageUploadButton
                            label="Gambar Sampul / Lampiran Popup"
                            value={ann.detailImageUrl || ''}
                            onChange={(newUrl) => updateImportantAnnouncement('detailImageUrl', newUrl)}
                            preset="post"
                            placeholder="Unggah dari Google Drive, WebP lokal, atau tempel URL..."
                          />
                        </div>
                      </div>
                    )}

                    {/* OPSI 3: Tanpa Popup */}
                    {ann.popupMode === 'none' && (
                      <div className="p-3 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-500 text-center">
                        Hanya running text berjalan tanpa aksi popup saat diklik.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Running text 1 sedang dinonaktifkan.
              </p>
            )}

          </div>

          {/* Mini Preview */}
          {ann.enabled && (
            <div className="pt-3 border-t border-slate-100">
              <div
                className="py-2 px-3 rounded-lg flex items-center gap-2 overflow-hidden text-xs font-semibold text-white shadow-xs"
                style={{ backgroundColor: ann.customBgColor || '#f59e0b', color: (ann.customBgColor || '#f59e0b') === '#f59e0b' ? '#0f172a' : '#ffffff' }}
              >
                <span className="px-1.5 py-0.5 rounded bg-slate-950 text-white text-[9px] font-black uppercase shrink-0">
                  {ann.badge || 'INFO'}
                </span>
                <div className="overflow-hidden whitespace-nowrap text-xs flex-1">
                  <div className="inline-block animate-marquee">
                    {ann.text || 'Isi teks pengumuman...'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================================= */}
        {/* KOLOM 2: RUNNING TEKS 2 (AKREDITASI) */}
        {/* ================================================================================= */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-slate-200 shadow-xs space-y-4 sm:space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* Header & Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">Running Text 2 (Akreditasi)</h3>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={identity.accreditationTickerEnabled !== false}
                  onChange={(e) => updateIdentity('accreditationTickerEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {identity.accreditationTickerEnabled !== false ? (
              <div className="space-y-4">
                
                {/* Custom Color Background */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-blue-600" />
                    <span>Warna Latar</span>
                  </label>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {quickColorsAccred.map((qc) => {
                      const activeColor = identity.accreditationTickerBgColor || '#0f172a';
                      const isSelected = activeColor.toLowerCase() === qc.color.toLowerCase();
                      return (
                        <button
                          key={qc.color}
                          type="button"
                          onClick={() => updateIdentity('accreditationTickerBgColor', qc.color)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-offset-1 ring-slate-900 border-slate-900 text-white shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                          style={{ backgroundColor: qc.color, color: '#ffffff' }}
                        >
                          <span>{qc.label}</span>
                        </button>
                      );
                    })}

                    {/* Color Picker & Custom HEX */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="color"
                        value={identity.accreditationTickerBgColor || '#0f172a'}
                        onChange={(e) => updateIdentity('accreditationTickerBgColor', e.target.value)}
                        className="w-7 h-7 rounded-md cursor-pointer border border-slate-300 p-0.5"
                        title="Pilih Warna Kustom"
                      />
                      <input
                        type="text"
                        value={identity.accreditationTickerBgColor || ''}
                        onChange={(e) => updateIdentity('accreditationTickerBgColor', e.target.value)}
                        placeholder="#HEX"
                        className="w-20 px-2 py-1 text-xs font-mono border border-slate-300 rounded-md bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Speed Row */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FastForward className="w-3 h-3 text-blue-600" />
                    <span>Kecepatan</span>
                  </label>
                  <select
                    value={identity.accreditationTickerSpeed || 'normal'}
                    onChange={(e) => updateIdentity('accreditationTickerSpeed', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    <option value="slow">Lambat</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Cepat</option>
                  </select>
                </div>

                {/* Text Content - Taller & Spacious for easy mobile typing */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Isi Teks
                    </label>
                    <button
                      type="button"
                      onClick={() => updateIdentity('accreditationTickerText', defaultAccreditationText)}
                      className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={identity.accreditationTickerText ?? defaultAccreditationText}
                    onChange={(e) => updateIdentity('accreditationTickerText', e.target.value)}
                    className="w-full min-h-[140px] px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white leading-relaxed text-slate-900 shadow-inner"
                    placeholder="Masukkan teks akreditasi..."
                  />
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Running text 2 sedang dinonaktifkan.
              </p>
            )}

          </div>

          {/* Mini Preview */}
          {identity.accreditationTickerEnabled !== false && (
            <div className="pt-3 border-t border-slate-100">
              <div
                className="py-2 px-3 rounded-lg text-white flex items-center gap-2 overflow-hidden text-xs font-medium shadow-xs"
                style={{ backgroundColor: identity.accreditationTickerBgColor || '#0f172a' }}
              >
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase shrink-0">
                  BAN-S/M
                </span>
                <div className="overflow-hidden whitespace-nowrap text-xs flex-1 text-slate-200">
                  <div className="inline-block animate-marquee">
                    {identity.accreditationTickerText || defaultAccreditationText}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
