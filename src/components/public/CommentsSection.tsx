import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Heart,
  Send,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import { CommentItem } from '../../types';
import {
  fetchComments,
  postComment,
  toggleLikeComment,
  loginWithGoogleForComments,
  logoutCommentUser,
  getCurrentCommentUser,
  subscribeToComments,
  checkProfanity,
  getProfanityFilterConfig,
} from '../../lib/comments';

interface CommentsSectionProps {
  targetId?: string; // 'general' or articleId
  targetTitle?: string;
  compact?: boolean;
  className?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  targetId = 'general',
  targetTitle = 'Halaman Utama Portal',
  compact = false,
  className = '',
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customName, setCustomName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [profanityWarning, setProfanityWarning] = useState<string[]>([]);
  const formCardRef = React.useRef<HTMLDivElement>(null);

  const handleInputFocus = () => {
    // Smoothly scroll the comment input box into middle of screen when mobile keyboard opens
    setTimeout(() => {
      if (formCardRef.current) {
        formCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  // Load comments for target
  const loadTargetComments = async () => {
    try {
      const data = await fetchComments(targetId);
      setComments(data);
    } catch (err) {
      console.warn('Failed to load comments for target:', err);
    }
  };

  useEffect(() => {
    loadTargetComments();

    // Check current auth user
    const initialUser = getCurrentCommentUser();
    setCurrentUser(initialUser);
    if (initialUser?.displayName) {
      setCustomName(initialUser.displayName);
    }

    // Subscribe to realtime comments
    const unsubscribe = subscribeToComments(targetId, (updatedList) => {
      setComments(updatedList);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [targetId]);

  // Realtime profanity check on typing
  useEffect(() => {
    if (!commentText.trim()) {
      setProfanityWarning([]);
      return;
    }
    const filterConfig = getProfanityFilterConfig();
    const { isProfane, matchedWords } = checkProfanity(
      commentText,
      filterConfig.badWords
    );
    if (isProfane && filterConfig.profanityFilterEnabled) {
      setProfanityWarning(matchedWords);
    } else {
      setProfanityWarning([]);
    }
  }, [commentText]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const user = await loginWithGoogleForComments();
      if (user) {
        setCurrentUser(user);
        setCustomName(user.displayName || 'Pengguna Google');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Gagal masuk dengan akun Google. Pastikan popup tidak diblokir oleh peramban.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logoutCommentUser();
    setCurrentUser(null);
    setCustomName('');
    setIsEditingName(false);
  };

  // Handle Submit Comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      setErrorMessage('Silakan masuk dengan akun Google terlebih dahulu untuk mengirim komentar.');
      return;
    }

    const trimmed = commentText.trim();
    if (!trimmed) {
      setErrorMessage('Isi komentar tidak boleh kosong.');
      return;
    }

    if (trimmed.length < 3) {
      setErrorMessage('Komentar terlalu pendek (minimal 3 karakter).');
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await postComment({
        targetId,
        targetTitle,
        userName: customName.trim() || currentUser.displayName || 'Pengguna Google',
        userEmail: currentUser.email,
        userAvatar: currentUser.photoURL,
        content: trimmed,
      });

      setCommentText('');

      if (saved.status === 'pending') {
        setSuccessNotice('Komentar Anda telah dikirim dan menunggu tinjauan admin.');
      } else {
        setSuccessNotice('Komentar Anda berhasil dipublikasikan!');
        // Refresh comments list
        await loadTargetComments();
      }

      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err) {
      setErrorMessage('Gagal mengirim komentar. Mohon periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Like Comment
  const handleLike = async (commentId: string) => {
    const userIdentifier = currentUser?.email || 'anon_' + (typeof window !== 'undefined' ? window.navigator.userAgent.slice(0, 30) : 'user');
    await toggleLikeComment(commentId, userIdentifier);
    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const liked = c.likedByEmails?.includes(userIdentifier);
          const newLikesCount = liked ? Math.max(0, (c.likesCount || 1) - 1) : (c.likesCount || 0) + 1;
          const newLikedBy = liked
            ? (c.likedByEmails || []).filter((e) => e !== userIdentifier)
            : [...(c.likedByEmails || []), userIdentifier];
          return {
            ...c,
            likesCount: newLikesCount,
            likedByEmails: newLikedBy,
          };
        }
        return c;
      })
    );
  };

  // Filter visible comments: show approved, or pending if posted by current user
  const visibleComments = useMemo(() => {
    const currentEmail = currentUser?.email?.toLowerCase();
    return comments.filter((c) => {
      if (c.status === 'approved') return true;
      if (c.status === 'pending' && currentEmail && c.userEmail.toLowerCase() === currentEmail) {
        return true;
      }
      return false;
    });
  }, [comments, currentUser]);

  const userIdentifier = currentUser?.email || 'anon_' + (typeof window !== 'undefined' ? window.navigator.userAgent.slice(0, 30) : 'user');

  return (
    <div className={`w-full ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Tanggapan & Komentar
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {visibleComments.length} tanggapan publik
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Moderasi Aktif</span>
        </div>
      </div>

      {/* Comment Form Card */}
      <div
        ref={formCardRef}
        className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 mb-6 shadow-2xs focus-within:ring-2 focus-within:ring-blue-400/40 focus-within:border-blue-400 transition-all scroll-mt-24"
      >
        {!currentUser ? (
          /* Google Login Prompt */
          <div className="text-center py-3.5 px-2 space-y-2.5">
            <div className="w-9 h-9 mx-auto rounded-full bg-blue-100/80 flex items-center justify-center text-blue-600">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Tuliskan Tanggapan atau Pertanyaan Anda
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                Masuk dengan akun Google untuk mengirim komentar langsung.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoggingIn ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
            </button>
          </div>
        ) : (
          /* Form Komentar Aktif */
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* User Info Bar: Profile Avatar + Name Beside it (No email displayed) */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={customName || currentUser.displayName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {(customName || currentUser.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Name beside profile */}
                <div className="flex items-center gap-2 min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Nama Anda"
                        className="text-xs px-2 py-0.5 bg-white border border-blue-400 rounded-md focus:outline-none"
                        maxLength={40}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Simpan Nama"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {customName || currentUser.displayName || 'Pengguna'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition-colors"
                        title="Ubah nama tampilan"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Logout/Switch Account */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 hover:text-rose-600 transition-colors px-2 py-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-200"
                title="Keluar akun Google"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>

            {/* Textarea with Send Icon Button placed on the right side */}
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={handleInputFocus}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ketik komentar santun Anda di sini..."
                  rows={compact ? 1 : 2}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed text-slate-800 placeholder-slate-400 resize-none transition-all shadow-2xs"
                  maxLength={800}
                />
              </div>

              {/* Send Button: Icon Only */}
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                title="Kirim Komentar"
                aria-label="Kirim Komentar"
                className="h-[38px] w-[38px] sm:h-[42px] sm:w-[42px] rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center shrink-0 transition-all shadow-xs active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Profanity Warning */}
            {profanityWarning.length > 0 && (
              <div className="flex items-start gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] leading-tight">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Perhatian:</span> Kata tidak pantas terdeteksi ({profanityWarning.join(', ')}). Komentar akan ditinjau terlebih dahulu oleh Admin.
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notice */}
            {successNotice && (
              <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* List of Comments */}
      <div className="space-y-2.5">
        {visibleComments.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <MessageSquare className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              Belum ada komentar
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Jadilah yang pertama memberikan apresiasi atau tanggapan santun!
            </p>
          </div>
        ) : (
          visibleComments.map((comment) => {
            const hasLiked = comment.likedByEmails?.includes(userIdentifier);
            const isAuthor = currentUser?.email && comment.userEmail.toLowerCase() === currentUser.email.toLowerCase();

            return (
              <div
                key={comment.id}
                className={`bg-white border rounded-2xl p-3 sm:p-3.5 shadow-2xs transition-all ${
                  comment.status === 'pending'
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Header Komentar: Avatar & Nama di kiri, Tombol Like di KANAN (tampilan HP & Desktop) */}
                <div className="flex items-start justify-between gap-2">
                  {/* Left: Avatar & Name beside it */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {comment.userAvatar ? (
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                          {comment.userName}
                        </span>
                        {isAuthor && (
                          <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-md font-semibold">
                            Anda
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Like Button on the RIGHT of the comment (Number count only, no text) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {comment.status === 'pending' && (
                      <span className="text-[9px] sm:text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                        Menunggu Tinjauan
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleLike(comment.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-90 ${
                        hasLiked
                          ? 'text-rose-600 bg-rose-50 border border-rose-200'
                          : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-slate-200/70'
                      }`}
                      title="Sukai komentar ini"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform ${
                          hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] font-bold">{comment.likesCount || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mt-2 pl-9 sm:pl-10.5">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
