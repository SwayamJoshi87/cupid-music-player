import { getTokens } from './auth.js';

const BASE = 'https://amp-api.music.apple.com';

async function appleGet(path, params = {}) {
  const { userToken, appToken } = await getTokens();
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return window.cupid.appleFetch(url.toString(), userToken, appToken);
}

function artworkUrl(artwork, size = 300) {
  if (!artwork?.url) return null;
  return artwork.url.replace('{w}', String(size)).replace('{h}', String(size));
}

/**
 * Fetch every page of an Apple Music library endpoint.
 *
 * Responses include a `next` path while more pages remain; keep requesting
 * with an increasing offset until it's gone.
 *
 * @param {string} path API path, e.g. '/v1/me/library/playlists'
 * @param {object} params Extra query params to include on the first request
 * @returns {Promise<Array<object>>} concatenated `data` items from all pages
 */
async function fetchAllPages(path, params = {}) {
  const items = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await appleGet(path, { ...params, limit, offset });
    const page = response.data || [];
    items.push(...page);
    if (!response.next || page.length === 0) break;
    offset += page.length;
  }

  return items;
}

/**
 * Fetch the user's Apple Music library playlists.
 *
 * @returns {Promise<Array<{ id: string, name: string, image: string|null, trackCount: number }>>}
 */
export async function fetchMyPlaylists() {
  const playlists = await fetchAllPages('/v1/me/library/playlists');

  return playlists.map((p) => ({
    id: p.id,
    name: p.attributes?.name || p.id,
    image: artworkUrl(p.attributes?.artwork),
    trackCount: p.attributes?.trackCount || 0,
  }));
}

/**
 * Fetch all tracks from an Apple Music library playlist.
 *
 * @param {string} playlistId
 * @returns {Promise<Array<{ title: string, artist: string, art: string|null, uri: string }>>}
 */
export async function fetchPlaylistTracks(playlistId) {
  const tracks = await fetchAllPages(`/v1/me/library/playlists/${playlistId}/tracks`);

  return tracks
    .filter((t) => t.attributes)
    .map((t) => ({
      title: t.attributes.name,
      artist: t.attributes.artistName || '',
      art: artworkUrl(t.attributes.artwork),
      uri: `apple:track:${t.id}`,
      appleTrackId: t.id,
    }));
}
