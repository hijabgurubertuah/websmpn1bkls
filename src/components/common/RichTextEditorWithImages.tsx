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
  X,
  Smile,
  Link as LinkIcon,
  Unlink,
  Clipboard,
  Check,
  Search,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { FormattedContentRenderer } from './FormattedContentRenderer';
import { ImageUploadButton } from '../admin/ImageUploadButton';
import { convertGoogleDriveUrl } from '../../lib/imageOptimizer';

export interface InternalPostItem {
  id: string;
  title: string;
  category?: string;
}

interface RichTextEditorWithImagesProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
  articles?: InternalPostItem[];
}

// Popular curated emojis for school/organization posts
const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😋', '😜', '🤓', '😎', '🥳', '🥺', '🤔', '👍', '👎', '👏', '🙌', '🤝', '✍️', '🙏',
  '💪', '✨', '⭐', '🌟', '🚀', '🏆', '🥇', '🥈', '🥉', '🏅', '🎯', '💡', '📌', '📍', '🔔',
  '📢', '🎓', '🏫', '📚', '📖', '📝', '📊', '📈', '📅', '🗓️', '⏰', '💼', '🏢', '🇮🇩', '🌐',
  '💻', '📱', '✉️', '🎉', '🔥', '❤️', '💯', '✅', '⚠️', '❗', '❓'
];

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

  // Convert Markdown link [text](url) to <a>
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+|#[^\)]+)\)/gi, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

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

interface ImageSlot {
  url: string;
  caption: string;
}

export const RichTextEditorWithImages: React.FC<RichTextEditorWithImagesProps> = ({
  value,
  onChange,
  label = 'Isi Teks Postingan',
  placeholder = 'Tuliskan teks postingan atau kata sambutan di sini...',
  minRows = 8,
  articles = [],
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'code'>('wysiwyg');

  // Active Formatting State (Bold, Italic, Alignments, Headings, Link)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    h2: false,
    h3: false,
    blockquote: false,
    link: false,
  });

  // Emoticon popover state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Link Tooltip / Dialog states
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showInternalPosts, setShowInternalPosts] = useState(false);
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const savedRangeRef = useRef<Range | null>(null);

  // Stored articles list for internal link selector
  const [internalList, setInternalList] = useState<InternalPostItem[]>(articles);

  useEffect(() => {
    if (articles && articles.length > 0) {
      setInternalList(articles);
    } else {
      try {
        const raw = localStorage.getItem('dapodik_cloud_articles') || localStorage.getItem('offline_draft_articles');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setInternalList(
              parsed.map((a: any) => ({
                id: a.id || String(Math.random()),
                title: a.title || 'Postingan',
                category: a.category,
              }))
            );
          }
        }
      } catch {
        // fallback
      }
    }
  }, [articles]);

  // Insert Image Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [layoutCount, setLayoutCount] = useState<1 | 2 | 3>(1);
  const [slots, setSlots] = useState<ImageSlot[]>([
    { url: '', caption: '' },
    { url: '', caption: '' },
    { url: '', caption: '' },
  ]);

  // Initial load / Sync external value to contentEditable div
  useEffect(() => {
    if (editorRef.current && editorMode === 'wysiwyg') {
      const formattedHtml = bbcodeToHtml(value);
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

  // Update active format state based on current cursor / selection
  const updateActiveFormats = () => {
    if (editorMode !== 'wysiwyg' || !editorRef.current) return;

    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !editorRef.current.contains(sel.anchorNode)) {
      return;
    }

    try {
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const justifyLeft = document.queryCommandState('justifyLeft');
      const justifyCenter = document.queryCommandState('justifyCenter');
      const justifyRight = document.queryCommandState('justifyRight');
      const justifyFull = document.queryCommandState('justifyFull');

      const blockTag = (document.queryCommandValue('formatBlock') || '').toLowerCase();
      let isH2 = blockTag === 'h2';
      let isH3 = blockTag === 'h3';
      let isBlockquote = blockTag === 'blockquote';

      let isInsideLink = false;
      let currNode: Node | null = sel.anchorNode;
      while (currNode && currNode !== editorRef.current) {
        if (currNode instanceof HTMLElement) {
          const tag = currNode.tagName.toLowerCase();
          if (tag === 'h2') isH2 = true;
          if (tag === 'h3') isH3 = true;
          if (tag === 'blockquote') isBlockquote = true;
          if (tag === 'a') isInsideLink = true;
        }
        currNode = currNode.parentNode;
      }

      setActiveFormats({
        bold,
        italic,
        underline,
        justifyLeft,
        justifyCenter,
        justifyRight,
        justifyFull,
        h2: isH2,
        h3: isH3,
        blockquote: isBlockquote,
        link: isInsideLink,
      });
    } catch {
      // Ignore queryCommandState errors
    }
  };

  // Listen to selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editorMode]);

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
    setTimeout(updateActiveFormats, 10);
  };

  // Block format toggler (h2, h3, blockquote)
  const handleBlockFormat = (tag: 'h2' | 'h3' | 'blockquote') => {
    if (editorMode === 'code') return;
    if (editorRef.current) {
      editorRef.current.focus();
    }

    if (activeFormats[tag]) {
      // Toggle off back to normal paragraph
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }

    handleEditorInput();
    setTimeout(updateActiveFormats, 10);
  };

  // Open Link Dialog
  const handleOpenLinkModal = () => {
    setShowEmojiPicker(false);
    setShowInternalPosts(false);

    if (editorMode !== 'wysiwyg' || !editorRef.current) {
      setShowLinkModal(true);
      return;
    }

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      savedRangeRef.current = range.cloneRange();
      const selectedString = range.toString();
      setLinkText(selectedString);

      // Check if cursor/selection is already inside an <a> tag
      let parentA: HTMLAnchorElement | null = null;
      let node: Node | null = range.commonAncestorContainer;
      while (node && node !== editorRef.current) {
        if (node instanceof HTMLAnchorElement) {
          parentA = node;
          break;
        }
        node = node.parentNode;
      }

      if (parentA) {
        setLinkUrl(parentA.getAttribute('href') || '');
        if (!selectedString) {
          setLinkText(parentA.innerText || '');
        }
      } else {
        setLinkUrl('');
      }
    } else {
      setLinkText('');
      setLinkUrl('');
    }

    setShowLinkModal(true);
  };

  // Paste from clipboard into URL input
  const handlePasteLinkUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLinkUrl(text.trim());
      }
    } catch (err) {
      console.warn('Gagal membaca clipboard:', err);
    }
  };

  // Select internal post as link destination
  const handleSelectInternalPost = (article: InternalPostItem) => {
    setLinkUrl(`#berita-${article.id}`);
    if (!linkText.trim()) {
      setLinkText(article.title);
    }
    setShowInternalPosts(false);
  };

  // Apply link to selected text
  const handleApplyLink = () => {
    if (!linkUrl.trim()) return;
    const finalUrl = linkUrl.trim();

    if (editorMode === 'wysiwyg' && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && savedRangeRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }

      const selectedStr = sel?.toString();
      if (selectedStr) {
        document.execCommand('createLink', false, finalUrl);
      } else {
        const label = linkText.trim() || finalUrl;
        const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline font-medium hover:text-blue-800">${label}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      }
      handleEditorInput();
      setTimeout(updateActiveFormats, 10);
    } else {
      const label = linkText.trim() || 'Link';
      const md = `[${label}](${finalUrl})`;
      onChange(value ? `${value} ${md}` : md);
    }

    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
    savedRangeRef.current = null;
  };

  // Unlink / Remove Link
  const handleUnlink = () => {
    if (editorMode === 'wysiwyg' && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && savedRangeRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
      document.execCommand('unlink', false);
      handleEditorInput();
      setTimeout(updateActiveFormats, 10);
    }
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
    savedRangeRef.current = null;
  };

  // Insert Emoji at cursor
  const handleInsertEmoji = (emoji: string) => {
    if (editorMode === 'wysiwyg' && editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, emoji);
      handleEditorInput();
    } else if (textareaRef.current) {
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const current = ta.value;
      const next = current.slice(0, start) + emoji + current.slice(end);
      onChange(next);
    }
    setShowEmojiPicker(false);
  };

  // Update specific image slot URL or caption
  const handleUpdateSlot = (index: number, url: string, caption: string) => {
    setSlots((prev) => {
      const next = [...prev];
      while (next.length <= index) {
        next.push({ url: '', caption: '' });
      }
      next[index] = { url, caption };
      return next;
    });
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSlots([
      { url: '', caption: '' },
      { url: '', caption: '' },
      { url: '', caption: '' },
    ]);
    setLayoutCount(1);
  };

  // Insert complete shortcode into editor at cursor
  const handleConfirmInsertImage = () => {
    const activeSlots = slots.slice(0, layoutCount);
    const filledSlots = activeSlots.filter((s) => s.url && s.url.trim().length > 5);

    if (filledSlots.length === 0) return;

    const cleanUrls = activeSlots
      .map((s) => (s.url ? convertGoogleDriveUrl(s.url.trim()) : ''))
      .filter((u) => u.length > 5);

    if (cleanUrls.length === 0) return;

    const captions = activeSlots.map((s) => s.caption.trim());
    const hasAnyCaption = captions.some((c) => c.length > 0);

    let shortcode = '';
    if (layoutCount === 1) {
      const singleCaption = captions[0] || '';
      shortcode = `[img layout="full" urls="${cleanUrls[0]}"${singleCaption ? ` caption="${singleCaption}"` : ''}]`;
    } else if (layoutCount === 2) {
      shortcode = `[img layout="grid-2" urls="${cleanUrls.join(' | ')}"${hasAnyCaption ? ` captions="${captions.join(' | ')}"` : ''}]`;
    } else if (layoutCount === 3) {
      shortcode = `[img layout="grid-3" urls="${cleanUrls.join(' | ')}"${hasAnyCaption ? ` captions="${captions.join(' | ')}"` : ''}]`;
    }

    if (editorMode === 'wysiwyg' && editorRef.current) {
      editorRef.current.focus();

      try {
        document.execCommand('insertText', false, `\n\n${shortcode}\n\n`);
      } catch {
        editorRef.current.innerHTML += `<p>${shortcode}</p>`;
      }
      handleEditorInput();
    } else {
      onChange(value ? `${value}\n\n${shortcode}\n` : `${shortcode}\n`);
    }

    handleCloseImageModal();
  };

  const filteredInternalPosts = internalList.filter((a) =>
    a.title.toLowerCase().includes(postSearchQuery.toLowerCase())
  );

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
            <span>Editor</span>
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
            <span>Pratinjau</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Live Editor */}
      {activeTab === 'editor' && (
        <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all relative">
          
          {/* Formatting Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1.5 relative">
            
            {/* Group 1: Text Style Buttons */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => execCommand('bold')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  activeFormats.bold
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Tebal (Bold)"
                aria-label="Tebal"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('italic')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  activeFormats.italic
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Miring (Italic)"
                aria-label="Miring"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('underline')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  activeFormats.underline
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Garis Bawah (Underline)"
                aria-label="Garis Bawah"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-300 mx-0.5 hidden sm:block" />

            {/* Group 2: Alignment Buttons */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => execCommand('justifyLeft')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  activeFormats.justifyLeft
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Rata Kiri"
                aria-label="Rata Kiri"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyCenter')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  activeFormats.justifyCenter
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Rata Tengah"
                aria-label="Rata Tengah"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyRight')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  activeFormats.justifyRight
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Rata Kanan"
                aria-label="Rata Kanan"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyFull')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  activeFormats.justifyFull
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Rata Kanan-Kiri (Justify)"
                aria-label="Rata Kanan-Kiri"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-300 mx-0.5 hidden sm:block" />

            {/* Group 3: Headings & Quote */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleBlockFormat('h2')}
                className={`p-1.5 rounded-md transition-all cursor-pointer text-xs font-extrabold flex items-center justify-center ${
                  activeFormats.h2
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Judul Sub-Bab (H2)"
                aria-label="Judul Sub-Bab"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleBlockFormat('h3')}
                className={`p-1.5 rounded-md transition-all cursor-pointer text-xs font-bold flex items-center justify-center ${
                  activeFormats.h3
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Judul Kecil (H3)"
                aria-label="Judul Kecil"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleBlockFormat('blockquote')}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  activeFormats.blockquote
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Kotak Kutipan (Quote)"
                aria-label="Kotak Kutipan"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-300 mx-0.5 hidden sm:block" />

            {/* Group 4: Insertions (Link, Emoji, Image) */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200">
              {/* Text Link Button */}
              <button
                type="button"
                onClick={handleOpenLinkModal}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  activeFormats.link || showLinkModal
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Sisipkan / Edit Teks Link"
                aria-label="Teks Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>

              {/* Emoticon Button */}
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowLinkModal(false);
                }}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  showEmojiPicker
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
                title="Sisipkan Emoticon"
                aria-label="Emoticon"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Image Inserter Button */}
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(true);
                  setShowEmojiPicker(false);
                  setShowLinkModal(false);
                }}
                className="p-1.5 rounded-md text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
                title="Sisipkan Gambar (Layout 1, 2, 3)"
                aria-label="Sisipkan Gambar"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Toggle (Visual vs Code) */}
            <button
              type="button"
              onClick={() => {
                if (editorMode === 'wysiwyg' && editorRef.current) {
                  onChange(editorRef.current.innerHTML);
                }
                setEditorMode(editorMode === 'wysiwyg' ? 'code' : 'wysiwyg');
                setShowEmojiPicker(false);
                setShowLinkModal(false);
              }}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 border border-slate-200 bg-white ml-auto"
              title="Beralih Mode Editor"
              aria-label="Beralih Mode"
            >
              <Code className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">{editorMode === 'wysiwyg' ? 'Kode Teks' : 'Visual Live'}</span>
            </button>

          </div>

          {/* Floating Minimalist Text Link Popover */}
          {showLinkModal && (
            <div className="absolute top-12 left-2 right-2 sm:left-auto sm:right-4 z-40 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150 sm:w-96">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://... atau #berita-id"
                    className="w-full pl-7 pr-8 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none font-mono"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyLink();
                      }
                      if (e.key === 'Escape') {
                        setShowLinkModal(false);
                      }
                    }}
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  <button
                    type="button"
                    onClick={handlePasteLinkUrl}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded absolute right-1 top-1 transition-colors cursor-pointer"
                    title="Tempel dari Clipboard"
                    aria-label="Tempel"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Internal Website Posts Dropdown Toggle */}
                {internalList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowInternalPosts(!showInternalPosts)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                      showInternalPosts
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-700 border-slate-300'
                    }`}
                    title="Arahkan ke Postingan Website Ini"
                    aria-label="Pilih Postingan"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                )}

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={handleApplyLink}
                  disabled={!linkUrl.trim()}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center shadow-2xs"
                  title="Terapkan Link"
                  aria-label="Terapkan"
                >
                  <Check className="w-4 h-4" />
                </button>

                {/* Unlink button if active */}
                {activeFormats.link && (
                  <button
                    type="button"
                    onClick={handleUnlink}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                    title="Hapus Link"
                    aria-label="Hapus Link"
                  >
                    <Unlink className="w-4 h-4" />
                  </button>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Tutup"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Internal Website Posts Search Dropdown */}
              {showInternalPosts && (
                <div className="border border-purple-200 rounded-lg p-2 bg-purple-50/40 space-y-1.5 max-h-48 overflow-y-auto">
                  <div className="relative">
                    <input
                      type="text"
                      value={postSearchQuery}
                      onChange={(e) => setPostSearchQuery(e.target.value)}
                      placeholder="Cari postingan..."
                      className="w-full pl-7 pr-2 py-1 text-[11px] bg-white rounded-md border border-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                    <Search className="w-3 h-3 text-purple-400 absolute left-2 top-1.5" />
                  </div>

                  <div className="space-y-1 pt-1">
                    {filteredInternalPosts.length > 0 ? (
                      filteredInternalPosts.map((art) => (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => handleSelectInternalPost(art)}
                          className="w-full text-left p-1.5 rounded-md hover:bg-purple-100/70 transition-colors text-xs text-slate-800 flex items-start gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 font-medium">{art.title}</span>
                        </button>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 text-center py-2">
                        Tidak ada postingan yang sesuai
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Emoticon Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute top-12 left-2 sm:left-48 z-40 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150 max-w-[280px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1 px-1">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-blue-600" />
                  <span>Emoticon</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto p-1">
                {EMOJI_LIST.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertEmoji(emoji)}
                    className="p-1.5 text-base hover:bg-slate-100 active:bg-blue-100 rounded-lg transition-transform hover:scale-125 cursor-pointer flex items-center justify-center select-none"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editor Body */}
          {editorMode === 'wysiwyg' ? (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onBlur={handleEditorInput}
              onKeyUp={updateActiveFormats}
              onMouseUp={updateActiveFormats}
              onClick={updateActiveFormats}
              className="w-full p-4 min-h-[220px] text-sm font-sans text-slate-800 leading-relaxed focus:outline-none bg-white font-normal [&_p]:my-2 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-3 [&_h3]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-600 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:bg-blue-50/60 [&_blockquote]:rounded-r-xl [&_blockquote]:text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a]:font-medium"
              style={{ minHeight: `${minRows * 24}px` }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              rows={minRows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 text-sm font-mono text-slate-100 leading-relaxed border-0 focus:outline-none focus:ring-0 bg-slate-900 resize-y"
            />
          )}

        </div>
      )}

      {/* Mode 2: Preview Mode */}
      {activeTab === 'preview' && (
        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-3">
          {value ? (
            <FormattedContentRenderer content={value} />
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              Teks masih kosong. Tuliskan teks di mode editor terlebih dahulu.
            </div>
          )}
        </div>
      )}

      {/* Modal Sisipkan Gambar & Susunan Layout (Minimalist without tips) */}
      {showImageModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Sisipkan Gambar ke Teks Postingan
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCloseImageModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Layout Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Layout
              </label>
              
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setLayoutCount(1)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    layoutCount === 1
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-6 border-2 border-dashed border-current rounded flex items-center justify-center">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <span className="text-xs">1 Kolom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutCount(2)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    layoutCount === 2
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-6 border-2 border-dashed border-current rounded flex items-center justify-center gap-1 px-1">
                    <div className="flex-1 h-3.5 bg-current opacity-30 rounded-xs" />
                    <div className="flex-1 h-3.5 bg-current opacity-30 rounded-xs" />
                  </div>
                  <span className="text-xs">2 Kolom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutCount(3)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    layoutCount === 3
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-6 border-2 border-dashed border-current rounded flex items-center justify-center gap-0.5 px-0.5">
                    <div className="flex-1 h-3.5 bg-current opacity-30 rounded-xs" />
                    <div className="flex-1 h-3.5 bg-current opacity-30 rounded-xs" />
                    <div className="flex-1 h-3.5 bg-current opacity-30 rounded-xs" />
                  </div>
                  <span className="text-xs">3 Kolom</span>
                </button>
              </div>
            </div>

            {/* 2. Image Upload Slots (1, 2, or 3 corresponding columns) */}
            <div className="space-y-4 pt-1">
              <div
                className={`grid gap-3.5 ${
                  layoutCount === 1
                    ? 'grid-cols-1'
                    : layoutCount === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-3'
                }`}
              >
                {Array.from({ length: layoutCount }).map((_, idx) => {
                  const slot = slots[idx] || { url: '', caption: '' };
                  const hasImage = !!(slot.url && slot.url.trim().length > 5);

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {hasImage ? (
                          <div className="relative group rounded-xl overflow-hidden border border-slate-300 bg-white aspect-4/3 flex items-center justify-center">
                            <img
                              src={convertGoogleDriveUrl(slot.url)}
                              alt={`Slot ${idx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateSlot(idx, '', slot.caption)}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Ganti Foto</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <ImageUploadButton
                            label={`Pilih / Unggah Foto ${idx + 1}`}
                            value=""
                            onChange={(newUrl) => {
                              if (newUrl) {
                                handleUpdateSlot(idx, newUrl, slot.caption);
                              }
                            }}
                            preset="post"
                            aspectRatio="wide"
                            placeholder="Tempel tautan foto..."
                          />
                        )}
                      </div>

                      {/* Individual Optional Caption */}
                      <div className="space-y-1 pt-2 border-t border-slate-200/80">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Keterangan Foto {idx + 1} (Opsional)
                        </label>
                        <input
                          type="text"
                          value={slot.caption}
                          onChange={(e) => handleUpdateSlot(idx, slot.url, e.target.value)}
                          placeholder={`Contoh: Dokumentasi foto ${idx + 1}...`}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
              <button
                type="button"
                onClick={handleCloseImageModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmInsertImage}
                disabled={!slots.slice(0, layoutCount).some((s) => s.url && s.url.trim().length > 5)}
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
