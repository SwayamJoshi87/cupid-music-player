const USER_TOKEN_KEY = 'apple_media_user_token';
const APP_TOKEN_KEY = 'apple_app_token';

let cachedTokens = null;

async function getSecureAppleTokens() {
  if (cachedTokens) return cachedTokens;
  if (window.cupid?.appleLoadTokens) {
    cachedTokens = await window.cupid.appleLoadTokens();
    return cachedTokens;
  }
  return { userToken: '', appToken: '' };
}

function setCachedTokens(tokens) {
  cachedTokens = tokens;
}

export async function isLoggedIn() {
  const { userToken, appToken } = await getSecureAppleTokens();
  return !!(userToken && appToken);
}

export async function getTokens() {
  return getSecureAppleTokens();
}

export async function saveTokens(userToken, appToken) {
  const cleanUser = userToken?.trim() ?? '';
  const cleanApp = appToken?.trim() ?? '';
  setCachedTokens({ userToken: cleanUser, appToken: cleanApp });
  if (window.cupid?.appleSaveTokens) {
    await window.cupid.appleSaveTokens(cleanUser, cleanApp);
  } else {
    // Fallback for browser/preview environments without the Electron API
    localStorage.setItem(USER_TOKEN_KEY, cleanUser);
    localStorage.setItem(APP_TOKEN_KEY, cleanApp);
  }
  // Remove legacy MusicKit keys if present
  localStorage.removeItem('apple_user_token');
  localStorage.removeItem('apple_developer_token');
}

export async function logout() {
  setCachedTokens({ userToken: '', appToken: '' });
  if (window.cupid?.appleClearTokens) {
    await window.cupid.appleClearTokens();
  }
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(APP_TOKEN_KEY);
  localStorage.removeItem('apple_user_token');
  localStorage.removeItem('apple_developer_token');
}

// Migrate legacy localStorage tokens to secure storage on first run.
// This runs once per module load and is safe to call repeatedly.
(async function migrateLegacyTokens() {
  try {
    const existing = await getSecureAppleTokens();
    if (existing.userToken && existing.appToken) return;

    const legacyUser = localStorage.getItem(USER_TOKEN_KEY);
    const legacyApp = localStorage.getItem(APP_TOKEN_KEY);
    if (legacyUser && legacyApp) {
      await saveTokens(legacyUser, legacyApp);
    }
  } catch {
    // ignore migration errors
  }
})();
