const USER_TOKEN_KEY = 'apple_media_user_token';
const APP_TOKEN_KEY = 'apple_app_token';

export function isLoggedIn() {
  try {
    return !!(localStorage.getItem(USER_TOKEN_KEY) && localStorage.getItem(APP_TOKEN_KEY));
  } catch {
    return false;
  }
}

export function getTokens() {
  return {
    userToken: localStorage.getItem(USER_TOKEN_KEY) || '',
    appToken: localStorage.getItem(APP_TOKEN_KEY) || '',
  };
}

export function saveTokens(userToken, appToken) {
  localStorage.setItem(USER_TOKEN_KEY, userToken.trim());
  localStorage.setItem(APP_TOKEN_KEY, appToken.trim());
  // Remove legacy MusicKit keys if present
  localStorage.removeItem('apple_user_token');
  localStorage.removeItem('apple_developer_token');
}

export function logout() {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(APP_TOKEN_KEY);
  localStorage.removeItem('apple_user_token');
  localStorage.removeItem('apple_developer_token');
}
