import { getTokens } from './auth.js';

const CATALOG_BASE = 'https://api.music.apple.com/v1/catalog';

function artworkUrl(artwork, size = 300) {
  if (!artwork?.url) return null;
  return artwork.url.replace('{w}', String(size)).replace('{h}', String(size));
}

async function catalogFetch(path, params = {}) {
  const { userToken, appToken } = await getTokens();
  if (!appToken) throw new Error('apple-token-expired');

  const url = new URL(`${CATALOG_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  return window.cupid.appleFetch(url.toString(), userToken, appToken);
}

/**
 * Search the Apple Music catalog.
 *
 * @param {object} options
 * @param {string} options.term
 * @param {string} [options.types='songs']
 * @param {string} [options.storefront='us']
 * @param {number} [options.limit=5]
 * @returns {Promise<object>} Raw Apple Music search response
 */
export async function searchCatalog({ term, types = 'songs', storefront = 'us', limit = 5 } = {}) {
  if (!term?.trim()) throw new Error('Missing search term');
  return catalogFetch(`/${storefront}/search`, {
    term: term.trim(),
    types,
    limit,
  });
}

/**
 * Fetch a single catalog song by Apple Music ID.
 *
 * @param {string} id
 * @param {string} [storefront='us']
 * @returns {Promise<object>} Raw catalog song response
 */
export async function getCatalogSong(id, storefront = 'us') {
  if (!id) throw new Error('Missing song id');
  return catalogFetch(`/${storefront}/songs/${id}`);
}

/**
 * Find the best preview URL for a track from the catalog search results.
 *
 * @param {object} searchResponse
 * @returns {{ url: string|null, duration: number|null, track: object|null }}
 */
export function pickPreviewFromSearch(searchResponse) {
  const results = searchResponse?.results;
  const songs = results?.songs;
  const data = songs?.data || results?.songs?.data;
  if (!Array.isArray(data) || data.length === 0) return { url: null, duration: null, track: null };

  const track = data[0];
  const previews = track.attributes?.previews;
  if (!Array.isArray(previews) || previews.length === 0) {
    return { url: null, duration: null, track };
  }

  const preview = previews.find((p) => p.url) || previews[0];
  const duration = track.attributes?.durationInMillis
    ? track.attributes.durationInMillis / 1000
    : null;

  return {
    url: preview.url,
    duration,
    track,
  };
}

/**
 * Resolve a playable preview URL for a given title and artist.
 *
 * @param {string} title
 * @param {string} [artist='']
 * @param {string} [storefront='us']
 * @returns {Promise<{ url: string, art: string|null, duration: number|null, appleTrackId: string|null }>}
 */
export async function resolvePlaybackUrl(title, artist = '', storefront = 'us') {
  const term = artist ? `${title} ${artist}` : title;
  const response = await searchCatalog({ term, storefront, limit: 5 });
  const { url, duration, track } = pickPreviewFromSearch(response);

  if (!url) throw new Error('No Apple Music preview available');

  return {
    url,
    art: artworkUrl(track?.attributes?.artwork),
    duration,
    appleTrackId: track?.id || null,
  };
}

/**
 * Resolve a preview URL from a known Apple Music catalog track ID.
 *
 * @param {string} trackId
 * @param {string} [storefront='us']
 * @returns {Promise<{ url: string, art: string|null, duration: number|null, appleTrackId: string }>}
 */
export async function resolvePlaybackUrlById(trackId, storefront = 'us') {
  const response = await getCatalogSong(trackId, storefront);
  const track = response?.data?.[0];
  if (!track) throw new Error('Apple Music track not found');

  const previews = track.attributes?.previews;
  if (!Array.isArray(previews) || previews.length === 0) {
    throw new Error('No Apple Music preview available for this track');
  }

  const preview = previews.find((p) => p.url) || previews[0];
  return {
    url: preview.url,
    art: artworkUrl(track.attributes?.artwork),
    duration: track.attributes?.durationInMillis
      ? track.attributes.durationInMillis / 1000
      : null,
    appleTrackId: track.id,
  };
}
