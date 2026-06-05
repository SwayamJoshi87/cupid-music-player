import { getTokens } from './auth.js';

const BASE = 'https://amp-api.music.apple.com';

async function appleGet(path, params = {}) {
  const { userToken, appToken } = getTokens();
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return window.cupid.appleFetch(url.toString(), userToken, appToken);
}

function artworkUrl(artwork, size = 300) {
  if (!artwork?.url) return null;
  return artwork.url.replace('{w}', String(size)).replace('{h}', String(size));
}

export async function fetchMyPlaylists() {
  const data = await appleGet('/v1/me/library/playlists', { limit: '100' });
  return (data.data || []).map((p) => ({
    id: p.id,
    name: p.attributes?.name || p.id,
    image: artworkUrl(p.attributes?.artwork),
    trackCount: p.attributes?.trackCount || 0,
  }));
}

export async function fetchPlaylistTracks(playlistId) {
  const data = await appleGet(`/v1/me/library/playlists/${playlistId}/tracks`, { limit: '100' });
  return (data.data || [])
    .filter((t) => t.attributes)
    .map((t) => ({
      title: t.attributes.name,
      artist: t.attributes.artistName || '',
      art: artworkUrl(t.attributes.artwork),
      uri: `apple:track:${t.id}`,
    }));
}
