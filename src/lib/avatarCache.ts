const FAILED_AVATAR_STORAGE_KEY = 'sp_failed_avatar_urls';

const readFailedAvatarUrls = () => {
  if (typeof window === 'undefined') return [] as string[];

  try {
    const raw = window.localStorage.getItem(FAILED_AVATAR_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
};

const writeFailedAvatarUrls = (urls: string[]) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(FAILED_AVATAR_STORAGE_KEY, JSON.stringify(urls));
  } catch {
    // Ignore storage write failures.
  }
};

export const isAvatarUrlBlocked = (url?: string | null) => {
  if (!url) return false;
  return readFailedAvatarUrls().includes(url);
};

export const markAvatarUrlBlocked = (url?: string | null) => {
  if (!url) return;

  const urls = readFailedAvatarUrls();
  if (urls.includes(url)) return;

  writeFailedAvatarUrls([...urls, url]);
};

export const clearBlockedAvatarUrl = (url?: string | null) => {
  if (!url) return;

  const nextUrls = readFailedAvatarUrls().filter((entry) => entry !== url);
  writeFailedAvatarUrls(nextUrls);
};
