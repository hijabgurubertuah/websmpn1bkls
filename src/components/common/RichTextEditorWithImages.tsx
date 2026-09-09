import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading2,
  Heading3,
  Quote,
  ImageIcon,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Code,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { FormattedContentRenderer } from './FormattedContentRenderer';
import { ImageUploadButton } from '../admin/ImageUploadButton';
import { convertGoogleDriveUrl } from '../../lib/imageOptimizer';

interface RichTextEditorWithImagesProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
}

// Helper: Convert legacy BBCode / plain text into clean HTML for live WYSIWYG editing
function bbcodeToHtml(input: string): string {
  if (!input) return '';

  let html = input;

  // Strip duplicate/nested BBCode tags first
  html = html.replace(/\[align=(justify|center|right|left)\]\s*\[align=\1\]/gi, '[align=$1]');
  html = html.replace(/\[\/(align=(justify|center|right|left))\]\s*\[\/\1\]/gi, '[/$1]');

  // Convert BBCode to HTML tags
  html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<b>$1</b>');
  html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<i>$1</i>');
  html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>');

  html = html.replace(/\[align=justify\]([\s\S]*?)\[\/align\]/gi, '<p style="text-align: justify;">$1</p>');
  html = html.replace(/\[align=center\]([\s\S]*?)\[\/align\]/gi, '<p style="text-align: center;">$1</p>');
  html = html.replace(/\[align=right\]([\s\S]*?)\[\/align\]/gi, '<p style="text-align: right;">$1</p>');
  html = html.replace(/\[align=left\]([\s\S]*?)\[\/align\]/gi, '<p style="text-align: left;">$1</p>');

  html = html.replace(/\[justify\]([\s\S]*?)\[\/justify\]/gi, '<p style="text-align: justify;">$1</p>');
  html = html.replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<p style="text-align: center;">$1</p>');
  html = html.replace(/\[right\]([\s\S]*?)\[\/right\]/gi, '<p style="text-align: right;">$1</p>');
  html = html.replace(/\[left\]([\s\S]*?)\[\/left\]/gi, '<p style="text-align: left;">$1</p>');

  html = html.replace(/\[h2\]([\s\S]*?)\[\/h2\]/gi, '<h2>$1</h2>');
  html = html.replace(/\[h3\]([\s\S]*?)\[\/h3\]/gi, '<h3>$1</h3>');
  html = html.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote>$1</blockquote>');

  // If plain text with newlines and no paragraph/heading wrappers, wrap in paragraphs
  if (!html.includes('<p') && !html.includes('<div') && !html.includes('<h2') && !html.includes('<h3')) {
    const lines = html.split(/\n\n+/);
    html = lines
      .map((l) => (l.trim() ? `<p>${l.replace(/\n/g, '<br>')}</p>` : ''))
      .join('');
  }

  // Strip trailing empty paragraph noise
  html = html.replace(/<p[^>]*>\s*(<br\s*\/?>|&nbsp;|\s*)*<\/p>/gi, '');

  return html;
}

export const RichTextEditorWithImages: React.FC<RichTextEditorWithImagesProps> = ({
  value,
  onChange,
  label = 'Isi Teks Postingan',
  placeholder = 'Tuliskan teks postingan atau kata sambutan di sini...',
  minRows = 8,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'code'>('wysiwyg');

  // Insert Image Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newTempUrl, setNewTempUrl] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<'full' | 'left' | 'right' | 'grid-2' | 'grid-3' | 'grid-4'>('full');
  const [imageCaption, setImageCaption] = useState('');

  // Initial load / Sync external value to contentEditable div
  useEffect(() => {
    if (editorRef.current && editorMode === 'wysiwyg') {
      const formattedHtml = bbcodeToHtml(value);
      // Only update innerHTML if structurally changed to avoid resetting cursor while typing
      if (editorRef.current.innerHTML !== formattedHtml && !editorRef.current.contains(document.activeElement)) {
        editorRef.current.innerHTML = formattedHtml || `<p><br></p>`;
      }
    }
  }, [value, editorMode]);

  // Handle live content changes from contentEditable
  const handleEditorInput = () => {
    if (editorRef.current) {
      let currentHtml = editorRef.current.innerHTML;
      // Strip trailing empty <p><br></p> noise when saving
      currentHtml = currentHtml.replace(/<p[^>]*>\s*(<br\s*\/?>|&nbsp;|\s*)*<\/p>/gi, '');
      onChange(currentHtml);
    }
  };

  // Execute formatting command directly on live document
  const execCommand = (command: string, valueArg: string | undefined = undefined) => {
    if (editorMode === 'code') return;

    if (editorRef.current) {
      editorRef.current.focus();
    }

    try {
      document.execCommand(command, false, valueArg);
    } catch {
      // Fallback
    }

    handleEditorInput();
  };

  // Add temp image URL to array
  const handleAddTempImage = (url: string) => {
    if (!url || !url.trim()) return;
    const cleanUrl = convertGoogleDriveUrl(url.trim());
    if (cleanUrl.length > 5 && !imageUrls.includes(cleanUrl)) {
      setImageUrls((prev) => [...prev, cleanUrl]);
      setNewTempUrl('');
    }
  };

  // Insert complete shortcode into editor at cursor
  const handleConfirmInsertImage = () => {
    const cleanUrls = imageUrls
      .map((u) => convertGoogleDriveUrl(u.trim()))
      .filter((u) => u.length > 5);

    if (cleanUrls.length === 0) return;

    const shortcode = `[img layout="${selectedLayout}" urls="${cleanUrls.join(' | ')}"${imageCaption.trim() ? ` caption="${imageCaption.trim()}"` : ''}]`;

    if (editorMode === 'wysiwyg' && editorRef.current) {
      editorRef.current.focus();

      // Insert shortcode as clean text block in contentEditable
      try {
        document.execCommand('insertText', false, `\n\n${shortcode}\n\n`);
      } catch {
        editorRef.current.innerHTML += `<p>${shortcode}</p>`;
      }
      handleEditorInput();
    } else {
      onChange(value ? `${value}\n\n${shortcode}\n` : `${shortcode}\n`);
    }

    // Reset image modal
    setImageUrls([]);
    setNewTempUrl('');
    setImageCaption('');
    setSelectedLayout('full');
    setShowImageModal(false);
  };

  return (
    <div className="space-y-2">
      {/* Top Header Label & Editor / Preview Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Mode Editor Live</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau Hasil Format</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Live Editor */}
      {activeTab === 'editor' && (
        <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all">
          
          {/* Formatting Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1.5">
            
            {/* Text Style Buttons */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => execCommand('bold')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                title="Tebal (Bold)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('italic')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                title="Miring (Italic)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('underline')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                title="Garis Bawah (Underline)"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-300 mx-0.5" />

            {/* Alignment Buttons - Live Paragraph Alignments */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => execCommand('justifyLeft')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                title="Rata Kiri"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyCenter')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                title="Rata Tengah"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyRight')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                title="Rata Kanan"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyFull')}
                className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors cursor-pointer font-bold"
                title="Rata Kanan-Kiri (Justify) - Langsung Tampil Visual"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-300 mx-0.5" />

            {/* Headings & Quote */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => execCommand('formatBlock', '<h2>')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-xs font-extrabold flex items-center gap-0.5"
                title="Judul Sub-Bab (Sub-heading H2)"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('formatBlock', '<h3>')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-blue-600 transition-colors cursor-pointer text-xs font-bold flex items-center gap-0.5"
                title="Judul Kecil (H3)"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('formatBlock', '<blockquote>')}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                title="Kotak Kutipan (Quote)"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-300 mx-0.5" />

            {/* Mode Switcher Toggle (Visual Live vs Code) */}
            <button
              type="button"
              onClick={() => {
                if (editorMode === 'wysiwyg' && editorRef.current) {
                  onChange(editorRef.current.innerHTML);
                }
                setEditorMode(editorMode === 'wysiwyg' ? 'code' : 'wysiwyg');
              }}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 border border-slate-200 bg-white"
              title="Beralih antara Mode Visual Live & Kode HTML/Text"
            >
              <Code className="w-3.5 h-3.5 text-slate-600" />
              <span>{editorMode === 'wysiwyg' ? 'Kode Teks' : 'Visual Live'}</span>
            </button>

            {/* Main Action Button: Sisipkan Gambar ke Teks */}
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs hover:shadow transition-all cursor-pointer ml-auto"
              title="Sisipkan Gambar dari Google Drive / WebApp dengan Susunan Layout Fleksibel"
            >
              <ImageIcon className="w-4 h-4 text-amber-300" />
              <span>Sisipkan Gambar (Drive/Layout)</span>
            </button>

          </div>

          {/* Editor Body */}
          {editorMode === 'wysiwyg' ? (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onBlur={handleEditorInput}
              className="w-full p-4 min-h-[220px] text-sm font-sans text-slate-800 leading-relaxed focus:outline-none bg-white font-normal [&_p]:my-2 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-3 [&_h3]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-600 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:bg-blue-50/60 [&_blockquote]:rounded-r-xl [&_blockquote]:text-slate-700"
              style={{ minHeight: `${minRows * 24}px` }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              rows={minRows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 text-sm font-mono text-slate-800 leading-relaxed border-0 focus:outline-none focus:ring-0 bg-slate-900 text-slate-100 resize-y"
            />
          )}

          {/* Footer Helper Legend */}
          <div className="bg-slate-50 border-t border-slate-200 px-3 py-2 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1 font-medium">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>
                <strong>Mode Visual Live:</strong> Blok teks &amp; klik tombol format (Rata Kanan-Kiri, Tebal, Miring) untuk melihat hasilnya secara langsung.
              </span>
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Cek Pratinjau Tampilan</span>
            </button>
          </div>

        </div>
      )}

      {/* Mode 2: Preview Mode */}
      {activeTab === 'preview' && (
        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pratinjau Hasil Format Teks &amp; Susunan Gambar</span>
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Kembali Edit Teks</span>
            </button>
          </div>

          {value ? (
            <FormattedContentRenderer content={value} />
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              Teks masih kosong. Tuliskan teks di mode editor terlebih dahulu.
            </div>
          )}
        </div>
      )}

      {/* Modal Sisipkan Gambar & Susunan Layout */}
      {showImageModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Sisipkan Gambar ke Teks Postingan
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Upload / Pilih Gambar */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Unggah Gambar ke Google Drive / WebApp atau Tempel Tautan
              </label>

              {/* Direct Paste URL Input with + Add Button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTempUrl}
                  onChange={(e) => setNewTempUrl(e.target.value)}
                  placeholder="Tempel link Google Drive atau URL gambar (https://...)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTempImage(newTempUrl);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddTempImage(newTempUrl)}
                  disabled={!newTempUrl.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Foto</span>
                </button>
              </div>

              {/* Upload File Button */}
              <div className="pt-1">
                <ImageUploadButton
                  label="Atau Unggah File Gambar Baru"
                  value=""
                  onChange={(uploadedUrl) => {
                    if (uploadedUrl) {
                      handleAddTempImage(uploadedUrl);
                    }
                  }}
                  preset="post"
                  aspectRatio="wide"
                  placeholder="Pilih file dari perangkat..."
                />
              </div>
            </div>

            {/* List of Uploaded Images for Insertion */}
            {imageUrls.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Daftar Gambar Siap Disisipkan ({imageUrls.length} Gambar):
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-300 bg-white aspect-4/3">
                      <img src={url} alt={`Gambar ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md shadow-xs opacity-90 hover:opacity-100"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-slate-900/80 px-1 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Choose Arrangement Layout */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Pilih Susunan Layout Gambar dalam Paragraf
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                
                {/* Full Width */}
                <button
                  type="button"
                  onClick={() => setSelectedLayout('full')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLayout === 'full'
                      ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/60 font-bold text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-8 bg-blue-200 rounded mb-2 border border-blue-300 flex items-center justify-center text-[10px] font-bold text-blue-800">
                    Gambar Penuh
                  </div>
                  <span className="text-xs block">1 Gambar Penuh</span>
                  <span className="text-[10px] text-slate-500 font-normal block">Lebar penuh paragraf</span>
                </button>

                {/* Float Left */}
                <button
                  type="button"
                  onClick={() => setSelectedLayout('left')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLayout === 'left'
                      ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/60 font-bold text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-1.5 h-8 mb-2">
                    <div className="w-1/3 bg-blue-200 rounded border border-blue-300" />
                    <div className="w-2/3 bg-slate-100 rounded border border-slate-200" />
                  </div>
                  <span className="text-xs block">Samping Kiri</span>
                  <span className="text-[10px] text-slate-500 font-normal block">Teks di kanan gambar</span>
                </button>

                {/* Float Right */}
                <button
                  type="button"
                  onClick={() => setSelectedLayout('right')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLayout === 'right'
                      ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/60 font-bold text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-1.5 h-8 mb-2">
                    <div className="w-2/3 bg-slate-100 rounded border border-slate-200" />
                    <div className="w-1/3 bg-blue-200 rounded border border-blue-300" />
                  </div>
                  <span className="text-xs block">Samping Kanan</span>
                  <span className="text-[10px] text-slate-500 font-normal block">Teks di kiri gambar</span>
                </button>

                {/* Grid 2 */}
                <button
                  type="button"
                  onClick={() => setSelectedLayout('grid-2')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLayout === 'grid-2'
                      ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/60 font-bold text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-1 h-8 mb-2">
                    <div className="bg-blue-200 rounded border border-blue-300" />
                    <div className="bg-blue-200 rounded border border-blue-300" />
                  </div>
                  <span className="text-xs block">2 Foto Berjajar</span>
                  <span className="text-[10px] text-slate-500 font-normal block">Grid 2 Kolom Sejajar</span>
                </button>

                {/* Grid 3 */}
                <button
                  type="button"
                  onClick={() => setSelectedLayout('grid-3')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLayout === 'grid-3'
                      ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/60 font-bold text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="grid grid-cols-3 gap-1 h-8 mb-2">
                    <div className="bg-blue-200 rounded border border-blue-300" />
                    <div className="bg-blue-200 rounded border border-blue-300" />
                    <div className="bg-blue-200 rounded border border-blue-300" />
                  </div>
                  <span className="text-xs block">3 Foto Berjajar</span>
                  <span className="text-[10px] text-slate-500 font-normal block">Grid 3 Kolom Sejajar</span>
                </button>

                {/* Grid 4 */}
                <button
                  type="button"
                  onClick={() => setSelectedLayout('grid-4')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLayout === 'grid-4'
                      ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/60 font-bold text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-1 h-8 mb-2">
                    <div className="bg-blue-200 rounded border border-blue-300" />
                    <div className="bg-blue-200 rounded border border-blue-300" />
                  </div>
                  <span className="text-xs block">4 Foto Grid</span>
                  <span className="text-[10px] text-slate-500 font-normal block">Grid 4 Foto Simetris</span>
                </button>

              </div>
            </div>

            {/* Step 3: Optional Caption */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Keterangan Foto / Caption (Opsional)
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Contoh: Dokumentasi Kegiatan Upacara Bendera Hari Senin..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmInsertImage}
                disabled={imageUrls.length === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Sisipkan Foto ke Dalam Teks</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
