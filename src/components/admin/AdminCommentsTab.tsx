import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Heart,
  Mail,
  User,
  Clock,
  Plus,
  X,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { CommentItem, CommentModerationConfig, NewsArticle } from '../../types';
import {
  fetchComments,
  deleteComment,
  moderateComment,
  getProfanityFilterConfig,
  saveProfanityFilterConfig,
  DEFAULT_BAD_WORDS,
  checkProfanity,
} from '../../lib/comments';

interface AdminCommentsTabProps {
  articles: NewsArticle[];
}

export const AdminCommentsTab: React.FC<AdminCommentsTabProps> = ({ articles }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  
  // Filter Bad Words state
  const [filterConfig, setFilterConfig] = useState<CommentModerationConfig>(() => getProfanityFilterConfig());
  const [newBadWordInput, setNewBadWordInput] = useState<string>('');
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configSuccessNotice, setConfigSuccessNotice] = useState<string | null>(null);

  // Active view tab in this screen: 'comments_list' or 'profanity_settings'
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'settings'>('list');

  // Load comments
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchComments();
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setFilterConfig(getProfanityFilterConfig());
  }, []);

  // Action: Delete Comment
  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus komentar ini secara permanen?')) {
      return;
    }
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  // Action: Approve Comment
  const handleApprove = async (commentId: string) => {
    await moderateComment(commentId, 'approved');
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: 'approved' } : c))
    );
  };

  // Action: Reject / Hide Comment
  const handleReject = async (commentId: string) => {
    await moderateComment(commentId, 'rejected');
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: 'rejected' } : c))
    );
  };

  // Bad words management
  const handleAddBadWord = () => {
    const trimmed = newBadWordInput.trim().toLowerCase();
    if (!trimmed) return;

    const words = trimmed.split(/[\s,]+/).filter(Boolean);
    const updated = Array.from(new Set([...(filterConfig.badWords || []), ...words]));
    
    setFilterConfig((prev) => ({ ...prev, badWords: updated }));
    setNewBadWordInput('');
  };

  const handleRemoveBadWord = (wordToRemove: string) => {
    const updated = (filterConfig.badWords || []).filter(
      (w) => w.toLowerCase() !== wordToRemove.toLowerCase()
    );
    setFilterConfig((prev) => ({ ...prev, badWords: updated }));
  };

  const handleResetDefaultBadWords = () => {
    if (window.confirm('Kembalikan daftar kata terlarang ke setelan bawaan standar?')) {
      setFilterConfig((prev) => ({
        ...prev,
        badWords: DEFAULT_BAD_WORDS,
      }));
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      await saveProfanityFilterConfig(filterConfig);
      setConfigSuccessNotice('Setelan filter kata tidak pantas berhasil disimpan!');
      setTimeout(() => setConfigSuccessNotice(null), 3000);
    } catch (err) {
      alert('Gagal menyimpan setelan');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Filtered comments
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.userName?.toLowerCase().includes(q);
        const matchesEmail = c.userEmail?.toLowerCase().includes(q);
        const matchesContent = c.content?.toLowerCase().includes(q);
        const matchesTitle = c.targetTitle?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesContent && !matchesTitle) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }

      // Target filter
      if (targetFilter !== 'all') {
        if (targetFilter === 'general' && c.targetId !== 'general') return false;
        if (targetFilter !== 'general' && c.targetId !== targetFilter) return false;
      }

      return true;
    });
  }, [comments, searchQuery, statusFilter, targetFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = comments.length;
    const approved = comments.filter((c) => c.status === 'approved').length;
    const pendingOrFlagged = comments.filter(
      (c) => c.status === 'pending' || c.isFlaggedProfanity
    ).length;
    const totalLikes = comments.reduce((acc, c) => acc + (c.likesCount || 0), 0);

    return { total, approved, pendingOrFlagged, totalLikes };
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Pengelola Komentar & Moderasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Kelola tanggapan, pantau akun email pengirim, dan konfigurasikan filter kata tidak pantas.
              </p>
            </div>
          </div>

          {/* Sub Navigation Buttons */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'list'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Komentar ({comments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('settings')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'settings'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Filter Kata Kotor ({filterConfig.badWords?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <p className="text-[11px] font-medium text-slate-500">Total Komentar</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
            <p className="text-[11px] font-medium text-emerald-700">Disetujui / Tayang</p>
            <p className="text-lg sm:text-xl font-bold text-emerald-800 mt-0.5">{stats.approved}</p>
          </div>
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
            <p className="text-[11px] font-medium text-amber-700">Ditandai / Perlu Tinjauan</p>
            <p className="text-lg sm:text-xl font-bold text-amber-800 mt-0.5">{stats.pendingOrFlagged}</p>
          </div>
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3">
            <p className="text-[11px] font-medium text-rose-700">Total Suka (❤️)</p>
            <p className="text-lg sm:text-xl font-bold text-rose-800 mt-0.5">{stats.totalLikes}</p>
          </div>
        </div>
      </div>

      {activeSubTab === 'list' ? (
        /* TAB 1: LIST & MODERATION */
        <div className="space-y-4">
          {/* Controls Bar: Search & Filter */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama, email pengirim, atau kata..."
                className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="approved">Disetujui (Tayang)</option>
                <option value="pending">Tertahan (Pending)</option>
                <option value="rejected">Ditolak / Sembunyi</option>
              </select>

              {/* Filter Target */}
              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 max-w-[200px] truncate"
              >
                <option value="all">Semua Lokasi</option>
                <option value="general">Halaman Utama Portal</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    Berita: {a.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={loadData}
                className="p-2 text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Muat Ulang"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Comments List */}
          {filteredComments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Tidak ada komentar yang cocok</p>
              <p className="text-xs text-slate-400 mt-1">
                Komentar pengunjung akan tercantum di sini secara realtime.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComments.map((item) => {
                const { isProfane, matchedWords } = checkProfanity(
                  item.content,
                  filterConfig.badWords
                );

                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                      item.status === 'pending' || isProfane
                        ? 'border-amber-300 bg-amber-50/20'
                        : item.status === 'rejected'
                        ? 'border-rose-200 bg-rose-50/20 opacity-75'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Left: User Profile & Meta */}
                      <div className="flex items-start gap-3 min-w-0">
                        {item.userAvatar ? (
                          <img
                            src={item.userAvatar}
                            alt={item.userName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {item.userName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">
                              {item.userName}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                              <Mail className="w-3 h-3 text-blue-500" />
                              {item.userEmail}
                            </span>

                            {/* Status Badge */}
                            {item.status === 'approved' && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Tayang Publik
                              </span>
                            )}
                            {item.status === 'pending' && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                Menunggu Persetujuan
                              </span>
                            )}
                            {item.status === 'rejected' && (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                Disembunyikan
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span>•</span>
                            <span className="text-slate-600 font-medium truncate">
                              Target: {item.targetTitle || 'Halaman Utama'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Moderation Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {item.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            title="Setujui dan tampilkan di publik"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                        )}

                        {item.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleReject(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Sembunyikan dari publik"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Sembunyikan</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus komentar permanen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="mt-3 pt-3 border-t border-slate-100 pl-0 sm:pl-13">
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                        {item.content}
                      </p>

                      {/* Bad words warning tag if detected */}
                      {isProfane && (
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg w-fit">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>
                            Terdeteksi kata tidak pantas:{' '}
                            <span className="underline">{matchedWords.join(', ')}</span>
                          </span>
                        </div>
                      )}

                      {/* Likes count */}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                          <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          {item.likesCount || 0} orang menyukai
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: PROFANITY FILTER CONFIGURATION */
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pengaturan Filter Kata Tidak Pantas & Kotor
                </h3>
                <p className="text-xs text-slate-500">
                  Komentar yang memuat kata-kata dalam daftar ini akan otomatis disaring dan tidak langsung muncul ke publik.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetDefaultBadWords}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Kata Standar</span>
            </button>
          </div>

          {/* Configuration Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Aktifkan Sensor Kata Otomatis
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Mendeteksi kata kotor, judi, spam, dan variasi leetspeak.
                </span>
              </div>
              <input
                type="checkbox"
                checked={filterConfig.profanityFilterEnabled}
                onChange={(e) =>
                  setFilterConfig((prev) => ({
                    ...prev,
                    profanityFilterEnabled: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Otomatis Sembunyikan dari Publik
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Komentar yang terdeteksi kata kotor tidak akan tayang sampai disetujui admin.
                </span>
              </div>
              <input
                type="checkbox"
                checked={filterConfig.autoHideFlagged}
                onChange={(e) =>
                  setFilterConfig((prev) => ({
                    ...prev,
                    autoHideFlagged: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Add Bad Words Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Tambah Kata Terlarang Baru:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBadWordInput}
                onChange={(e) => setNewBadWordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBadWord();
                  }
                }}
                placeholder="Ketik kata yang ingin diblokir (pisahkan dengan spasi atau koma)..."
                className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddBadWord}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Active Bad Words Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Daftar Kata yang Diblokir ({filterConfig.badWords?.length || 0} kata):
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
              {(filterConfig.badWords || []).map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-lg font-medium shadow-2xs group hover:border-rose-300"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBadWord(word)}
                    className="text-slate-400 group-hover:text-rose-600 hover:bg-rose-50 rounded p-0.5"
                    title="Hapus kata ini"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Success Notice */}
          {configSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{configSuccessNotice}</span>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSavingConfig ? 'Menyimpan...' : 'Simpan Pengaturan Filter'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
