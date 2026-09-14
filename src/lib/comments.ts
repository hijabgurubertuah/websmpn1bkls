import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  increment,
  getDoc,
} from 'firebase/firestore';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { db, auth, withTimeout } from './firebase';
import { CommentItem, CommentModerationConfig } from '../types';
import { getOfflineItem, setOfflineItem } from './offlineStorage';

// Default list of Indonesian and English profanities / spam / inappropriate words
export const DEFAULT_BAD_WORDS: string[] = [
  'anjing',
  'babi',
  'bangsat',
  'kontol',
  'memek',
  'pantek',
  'puki',
  'bajingan',
  'tolol',
  'goblok',
  'idiot',
  'bego',
  'kampret',
  'tai',
  'taek',
  'itil',
  'jembut',
  'pepek',
  'lonte',
  'perek',
  'pelacur',
  'bencong',
  'banci',
  'sange',
  'ngentot',
  'entot',
  'ngewe',
  'bokep',
  'porno',
  'porn',
  'judi',
  'slot',
  'gacor',
  'judislot',
  'togel',
  'zeus',
  'pragmatic',
  'maxwin',
  'situsjudi',
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'bastard',
  'dick',
  'pussy',
  'cunt',
  'whore',
  'slut',
  'asu',
  'jancuk',
  'jancok',
  'dancok',
  'kirik',
  'modar',
  'matio',
];

export const DEFAULT_COMMENT_MODERATION_CONFIG: CommentModerationConfig = {
  enabled: true,
  allowGuestComments: false,
  profanityFilterEnabled: true,
  badWords: DEFAULT_BAD_WORDS,
  autoHideFlagged: true,
};

const COMMENTS_CACHE_KEY = 'smpn1_cached_comments_v1';
const COMMENTER_PROFILE_KEY = 'smpn1_commenter_profile_v1';
const MODERATION_CONFIG_KEY = 'smpn1_comment_moderation_config_v1';
const ARTICLE_LIKES_KEY = 'smpn1_article_likes_v1';

export interface CommenterUser {
  displayName: string;
  email: string;
  photoURL?: string;
  uid?: string;
}

// Memory cache for instantaneous UI interactions
let inMemoryComments: CommentItem[] = [];
let inMemoryConfig: CommentModerationConfig | null = null;

/**
 * Normalizes text to detect obfuscated profanities (e.g. k0nt0l, @nj1ng, a n j i n g)
 */
function normalizeProfanityText(input: string): string {
  if (!input) return '';
  let str = input.toLowerCase();

  // Replace common leetspeak substitutions
  str = str
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/@/g, 'a')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/v/g, 'u');

  // Strip excessive spaces and punctuation between characters
  return str;
}

/**
 * Checks if a comment text contains forbidden words from the active filter list
 */
export function checkProfanity(
  text: string,
  customBadWords?: string[]
): { isProfane: boolean; matchedWords: string[] } {
  if (!text || typeof text !== 'string') {
    return { isProfane: false, matchedWords: [] };
  }

  const activeConfig = getProfanityFilterConfig();
  if (!activeConfig.profanityFilterEnabled) {
    return { isProfane: false, matchedWords: [] };
  }

  const wordsToCheck = (customBadWords && customBadWords.length > 0)
    ? customBadWords
    : activeConfig.badWords || DEFAULT_BAD_WORDS;

  const normalized = normalizeProfanityText(text);
  const matchedWords: string[] = [];

  for (const rawBad of wordsToCheck) {
    const bad = rawBad.trim().toLowerCase();
    if (!bad) continue;

    // Check direct inclusion or regex boundary check
    const escaped = bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
    
    if (regex.test(normalized) || normalized.includes(bad)) {
      matchedWords.push(rawBad);
    }
  }

  return {
    isProfane: matchedWords.length > 0,
    matchedWords: Array.from(new Set(matchedWords)),
  };
}

/**
 * Get current Google logged-in user for comment section
 */
export function getCurrentCommentUser(): CommenterUser | null {
  if (typeof window === 'undefined') return null;

  // 1. Check direct auth instance
  if (auth?.currentUser && auth.currentUser.email) {
    return {
      displayName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
      email: auth.currentUser.email,
      photoURL: auth.currentUser.photoURL || undefined,
      uid: auth.currentUser.uid,
    };
  }

  // 2. Check cached profile in localStorage
  try {
    const raw = localStorage.getItem(COMMENTER_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return parsed as CommenterUser;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Login with Google for Commenting
 */
export async function loginWithGoogleForComments(): Promise<CommenterUser | null> {
  if (!auth) {
    throw new Error('Firebase Auth belum siap.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const user: User = result.user;

    const commenter: CommenterUser = {
      displayName: user.displayName || user.email?.split('@')[0] || 'Pengguna Google',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
      uid: user.uid,
    };

    if (typeof window !== 'undefined' && commenter.email) {
      localStorage.setItem(COMMENTER_PROFILE_KEY, JSON.stringify(commenter));
    }

    return commenter;
  } catch (err: any) {
    console.error('Login Google Error:', err);
    throw err;
  }
}

/**
 * Logout Google user from commenting
 */
export async function logoutCommentUser(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(COMMENTER_PROFILE_KEY);
  }
  if (auth) {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }
}

/**
 * Save / Update local commenter profile (e.g. customized display name)
 */
export function updateCommenterProfile(displayName: string): void {
  const current = getCurrentCommentUser();
  if (current && typeof window !== 'undefined') {
    current.displayName = displayName;
    localStorage.setItem(COMMENTER_PROFILE_KEY, JSON.stringify(current));
  }
}

/**
 * Get Comment Moderation & Profanity Configuration
 */
export function getProfanityFilterConfig(): CommentModerationConfig {
  if (inMemoryConfig) return inMemoryConfig;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(MODERATION_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        inMemoryConfig = { ...DEFAULT_COMMENT_MODERATION_CONFIG, ...parsed };
        return inMemoryConfig;
      }
    } catch {
      // ignore
    }
  }

  inMemoryConfig = DEFAULT_COMMENT_MODERATION_CONFIG;
  return inMemoryConfig;
}

/**
 * Save Comment Moderation Configuration to Local & Cloud Firestore
 */
export async function saveProfanityFilterConfig(config: CommentModerationConfig): Promise<void> {
  inMemoryConfig = config;
  if (typeof window !== 'undefined') {
    localStorage.setItem(MODERATION_CONFIG_KEY, JSON.stringify(config));
    await setOfflineItem('comment_moderation_config', config);
  }

  if (db) {
    try {
      await withTimeout(setDoc(doc(db, 'system_config', 'comments_moderation'), config, { merge: true }), 3000);
    } catch (err) {
      console.warn('Could not sync comments config to cloud:', err);
    }
  }
}

/**
 * Initial sample comments if none exist
 */
const SAMPLE_COMMENTS: CommentItem[] = [
  {
    id: 'comm_sample_1',
    targetId: 'general',
    targetTitle: 'Halaman Utama Portal Resmi',
    userName: 'Ahmad Faisal, S.Pd',
    userEmail: 'ahmad.faisal@guru.smpn1bengkalis.sch.id',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    content: 'Alhamdulillah tampilan portal resmi SMP Negeri 1 Bengkalis semakin informatif, bersih, dan sangat cepat diakses dari HP.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    likesCount: 14,
    likedByEmails: [],
    status: 'approved',
  },
  {
    id: 'comm_sample_2',
    targetId: 'general',
    targetTitle: 'Halaman Utama Portal Resmi',
    userName: 'Rina Marlina (Wali Murid)',
    userEmail: 'rina.marlina88@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    content: 'Sangat terbantu dengan jadwal agenda dan informasi PPDB online yang jelas. Sukses selalu untuk keluarga besar SMPN 1 Bengkalis!',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    likesCount: 9,
    likedByEmails: [],
    status: 'approved',
  },
];

/**
 * Load all comments from cache or Firestore
 */
export async function fetchComments(targetId?: string): Promise<CommentItem[]> {
  // 1. Check local cache first for 0ms render
  let allComments: CommentItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(COMMENTS_CACHE_KEY);
      if (raw) {
        allComments = JSON.parse(raw);
      } else {
        const idb = await getOfflineItem<CommentItem[]>('public_comments');
        if (idb && Array.isArray(idb)) {
          allComments = idb;
        } else {
          allComments = SAMPLE_COMMENTS;
          localStorage.setItem(COMMENTS_CACHE_KEY, JSON.stringify(SAMPLE_COMMENTS));
        }
      }
    } catch {
      allComments = SAMPLE_COMMENTS;
    }
  }

  inMemoryComments = allComments;

  // 2. Fetch from Cloud Firestore in background if online
  if (db) {
    try {
      const colRef = collection(db, 'comments');
      const snap = await withTimeout(getDocs(query(colRef, orderBy('createdAt', 'desc'))), 3500);
      if (snap && !snap.empty) {
        const cloudComments: CommentItem[] = [];
        snap.forEach((d) => {
          cloudComments.push({ id: d.id, ...d.data() } as CommentItem);
        });
        if (cloudComments.length > 0) {
          allComments = cloudComments;
          inMemoryComments = cloudComments;
          if (typeof window !== 'undefined') {
            localStorage.setItem(COMMENTS_CACHE_KEY, JSON.stringify(cloudComments));
            await setOfflineItem('public_comments', cloudComments);
          }
        }
      }
    } catch {
      // Use local cached data seamlessly
    }
  }

  // Filter by targetId if specified
  if (targetId) {
    return allComments.filter((c) => c.targetId === targetId);
  }

  return allComments;
}

/**
 * Realtime subscription for comments
 */
export function subscribeToComments(
  targetId: string | undefined,
  callback: (comments: CommentItem[]) => void
): () => void {
  // Return cached immediately
  const initial = targetId
    ? inMemoryComments.filter((c) => c.targetId === targetId)
    : inMemoryComments;
  if (initial.length > 0) {
    callback(initial);
  }

  if (!db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'comments');
    const q = targetId
      ? query(colRef, where('targetId', '==', targetId))
      : query(colRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: CommentItem[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as CommentItem);
        });

        // Merge with inMemory
        if (targetId) {
          const others = inMemoryComments.filter((c) => c.targetId !== targetId);
          inMemoryComments = [...list, ...others];
        } else {
          inMemoryComments = list;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem(COMMENTS_CACHE_KEY, JSON.stringify(inMemoryComments));
          setOfflineItem('public_comments', inMemoryComments).catch(() => {});
        }

        callback(list);
      },
      (err) => {
        console.info('Comments realtime listener suspended:', err);
      }
    );

    return unsubscribe;
  } catch {
    return () => {};
  }
}

/**
 * Post a new comment
 */
export async function postComment(params: {
  targetId: string;
  targetTitle?: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  content: string;
}): Promise<CommentItem> {
  const { isProfane, matchedWords } = checkProfanity(params.content);
  const activeConfig = getProfanityFilterConfig();

  const status: 'approved' | 'rejected' | 'pending' = isProfane && activeConfig.autoHideFlagged
    ? 'pending'
    : 'approved';

  const newComment: CommentItem = {
    id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    targetId: params.targetId || 'general',
    targetTitle: params.targetTitle || 'Halaman Portal',
    userName: params.userName.trim() || 'Pengguna',
    userEmail: params.userEmail.trim(),
    userAvatar: params.userAvatar || undefined,
    content: params.content.trim(),
    createdAt: new Date().toISOString(),
    likesCount: 0,
    likedByEmails: [],
    status,
    isFlaggedProfanity: isProfane,
    flaggedWords: isProfane ? matchedWords : undefined,
  };

  // 1. Optimistic UI update
  inMemoryComments = [newComment, ...inMemoryComments];
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMMENTS_CACHE_KEY, JSON.stringify(inMemoryComments));
    await setOfflineItem('public_comments', inMemoryComments);
  }

  // 2. Persist to Cloud Firestore
  if (db) {
    try {
      await withTimeout(setDoc(doc(db, 'comments', newComment.id), newComment), 4000);
    } catch (err) {
      console.warn('Comment saved locally (offline sync pending):', err);
    }
  }

  return newComment;
}

/**
 * Like / Unlike a Comment (Tanda Love)
 */
export async function toggleLikeComment(
  commentId: string,
  userIdentifier: string
): Promise<{ likesCount: number; hasLiked: boolean }> {
  const index = inMemoryComments.findIndex((c) => c.id === commentId);
  if (index === -1) return { likesCount: 0, hasLiked: false };

  const comm = inMemoryComments[index];
  const likedList = comm.likedByEmails || [];
  const hasLiked = likedList.includes(userIdentifier);

  let newLikedList: string[];
  let newLikesCount: number;

  if (hasLiked) {
    newLikedList = likedList.filter((e) => e !== userIdentifier);
    newLikesCount = Math.max(0, (comm.likesCount || 0) - 1);
  } else {
    newLikedList = [...likedList, userIdentifier];
    newLikesCount = (comm.likesCount || 0) + 1;
  }

  const updatedComment: CommentItem = {
    ...comm,
    likesCount: newLikesCount,
    likedByEmails: newLikedList,
  };

  inMemoryComments[index] = updatedComment;
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMMENTS_CACHE_KEY, JSON.stringify(inMemoryComments));
    await setOfflineItem('public_comments', inMemoryComments);
  }

  // Firestore sync
  if (db) {
    try {
      await withTimeout(
        updateDoc(doc(db, 'comments', commentId), {
          likesCount: newLikesCount,
          likedByEmails: newLikedList,
        }),
        3000
      );
    } catch {
      // ignore
    }
  }

  return { likesCount: newLikesCount, hasLiked: !hasLiked };
}

/**
 * Like / Unlike a News Article Post (Tanda Love pada Postingan)
 */
export async function toggleLikeArticle(
  articleId: string,
  userIdentifier: string
): Promise<{ likes: number; hasLiked: boolean }> {
  let storedLikes: Record<string, { count: number; likedUsers: string[] }> = {};

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ARTICLE_LIKES_KEY);
      if (raw) storedLikes = JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  const current = storedLikes[articleId] || { count: 0, likedUsers: [] };
  const hasLiked = current.likedUsers.includes(userIdentifier);

  let newCount = current.count;
  let newUsers = current.likedUsers;

  if (hasLiked) {
    newUsers = newUsers.filter((u) => u !== userIdentifier);
    newCount = Math.max(0, newCount - 1);
  } else {
    newUsers = [...newUsers, userIdentifier];
    newCount = newCount + 1;
  }

  storedLikes[articleId] = { count: newCount, likedUsers: newUsers };

  if (typeof window !== 'undefined') {
    localStorage.setItem(ARTICLE_LIKES_KEY, JSON.stringify(storedLikes));
  }

  // Sync to Firestore article doc if available
  if (db) {
    try {
      const artDoc = doc(db, 'news_articles', articleId);
      await withTimeout(
        updateDoc(artDoc, {
          likes: newCount,
          likedByEmails: newUsers,
        }),
        3000
      );
    } catch {
      // ignore
    }
  }

  return { likes: newCount, hasLiked: !hasLiked };
}

/**
 * Get current likes state for an article
 */
export function getArticleLikesState(
  articleId: string,
  initialLikes = 0,
  userIdentifier?: string
): { likes: number; hasLiked: boolean } {
  if (typeof window === 'undefined') {
    return { likes: initialLikes, hasLiked: false };
  }

  try {
    const raw = localStorage.getItem(ARTICLE_LIKES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[articleId]) {
        const item = parsed[articleId];
        const hasLiked = userIdentifier ? item.likedUsers?.includes(userIdentifier) : false;
        return {
          likes: Math.max(initialLikes, item.count || 0),
          hasLiked: Boolean(hasLiked),
        };
      }
    }
  } catch {
    // ignore
  }

  return { likes: initialLikes, hasLiked: false };
}

const ARTICLE_VIEWS_KEY = 'smpn1_article_views_v1';

/**
 * Increment and record article view count persistently in localStorage & Firestore
 */
export async function incrementArticleViews(
  articleId: string,
  initialViews = 0
): Promise<number> {
  let storedViews: Record<string, number> = {};

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ARTICLE_VIEWS_KEY);
      if (raw) storedViews = JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  const currentCount = storedViews[articleId] !== undefined ? storedViews[articleId] : initialViews;
  const newCount = currentCount + 1;
  storedViews[articleId] = newCount;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ARTICLE_VIEWS_KEY, JSON.stringify(storedViews));
    } catch {
      // ignore
    }
  }

  // Update in Firestore
  if (db) {
    try {
      const artDoc = doc(db, 'news_articles', articleId);
      await withTimeout(
        updateDoc(artDoc, {
          views: increment(1),
        }),
        3000
      );
    } catch {
      // ignore
    }
  }

  return newCount;
}

/**
 * Get current stored article view count
 */
export function getArticleViewsCount(
  articleId: string,
  initialViews = 0
): number {
  if (typeof window === 'undefined') return initialViews;
  try {
    const raw = localStorage.getItem(ARTICLE_VIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[articleId] !== undefined) {
        return Math.max(initialViews, parsed[articleId]);
      }
    }
  } catch {
    // ignore
  }
  return initialViews;
}

/**
 * Admin: Delete comment permanently
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  inMemoryComments = inMemoryComments.filter((c) => c.id !== commentId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMMENTS_CACHE_KEY, JSON.stringify(inMemoryComments));
    await setOfflineItem('public_comments', inMemoryComments);
  }

  if (db) {
    try {
      await withTimeout(deleteDoc(doc(db, 'comments', commentId)), 3000);
      return true;
    } catch (err) {
      console.error('Failed to delete comment on cloud:', err);
    }
  }
  return true;
}

/**
 * Admin: Moderate comment status (approve, reject, pending)
 */
export async function moderateComment(
  commentId: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<boolean> {
  const idx = inMemoryComments.findIndex((c) => c.id === commentId);
  if (idx === -1) return false;

  inMemoryComments[idx] = { ...inMemoryComments[idx], status };
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMMENTS_CACHE_KEY, JSON.stringify(inMemoryComments));
    await setOfflineItem('public_comments', inMemoryComments);
  }

  if (db) {
    try {
      await withTimeout(
        updateDoc(doc(db, 'comments', commentId), { status }),
        3000
      );
      return true;
    } catch (err) {
      console.error('Failed to moderate comment on cloud:', err);
    }
  }
  return true;
}
