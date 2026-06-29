import { resolvePlaybackUrl, resolvePlaybackUrlById } from './catalog.js';

/**
 * Resolve a playable audio URL from Apple Music catalog previews.
 *
 * @param {string} title
 * @param {string} [artist]
 * @param {string} [appleTrackId]
 * @returns {Promise<{ url: string, art: string|null, duration: number|null, appleTrackId: string|null }>}
 */
export async function resolveAppleStream(title, artist, appleTrackId) {
  if (appleTrackId) {
    try {
      return await resolvePlaybackUrlById(appleTrackId);
    } catch (err) {
      // Fall through to search by title/artist if direct lookup fails
      console.warn('[apple stream] direct lookup failed, falling back to search:', err.message);
    }
  }
  return resolvePlaybackUrl(title, artist);
}
