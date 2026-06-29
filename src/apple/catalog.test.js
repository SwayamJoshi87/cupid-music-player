/**
 * Tests for Apple Music catalog search and preview URL resolution.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchCatalog,
  getCatalogSong,
  pickPreviewFromSearch,
  resolvePlaybackUrl,
  resolvePlaybackUrlById,
} from './catalog.js';

const appleFetchMock = vi.fn();

vi.mock('./auth.js', () => ({
  getTokens: vi.fn(async () => ({ userToken: 'user-token', appToken: 'app-token' })),
}));

beforeEach(() => {
  appleFetchMock.mockReset();
  vi.stubGlobal('window', {
    cupid: { appleFetch: appleFetchMock },
  });
});

function makeSearchResponse(items) {
  return {
    results: {
      songs: {
        data: items,
      },
    },
  };
}

function makeSong(id, { withPreview = true } = {}) {
  return {
    id,
    attributes: {
      name: `Song ${id}`,
      artistName: `Artist ${id}`,
      artwork: { url: `https://img.example/${id}/{w}x{h}.jpg` },
      durationInMillis: 180000,
      previews: withPreview ? [{ url: `https://audio.example/${id}.m4a` }] : [],
    },
  };
}

describe('searchCatalog', () => {
  it('calls the catalog search endpoint with title and artist', async () => {
    appleFetchMock.mockResolvedValue(makeSearchResponse([makeSong('123')]));

    await searchCatalog({ term: 'hello world', storefront: 'us', limit: 5 });

    expect(appleFetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = appleFetchMock.mock.calls[0][0];
    const url = new URL(calledUrl);
    expect(url.pathname).toBe('/v1/catalog/us/search');
    expect(url.searchParams.get('term')).toBe('hello world');
    expect(url.searchParams.get('types')).toBe('songs');
    expect(url.searchParams.get('limit')).toBe('5');
  });

  it('throws when the term is empty', async () => {
    await expect(searchCatalog({ term: '' })).rejects.toThrow('Missing search term');
  });
});

describe('getCatalogSong', () => {
  it('fetches a single song by id', async () => {
    appleFetchMock.mockResolvedValue({ data: [makeSong('abc')] });

    await getCatalogSong('abc', 'gb');

    const calledUrl = appleFetchMock.mock.calls[0][0];
    expect(calledUrl).toContain('/v1/catalog/gb/songs/abc');
  });
});

describe('pickPreviewFromSearch', () => {
  it('returns the first preview URL', () => {
    const result = pickPreviewFromSearch(makeSearchResponse([makeSong('1')]));
    expect(result.url).toBe('https://audio.example/1.m4a');
    expect(result.duration).toBe(180);
    expect(result.track.id).toBe('1');
  });

  it('returns null when no songs match', () => {
    const result = pickPreviewFromSearch(makeSearchResponse([]));
    expect(result.url).toBeNull();
  });

  it('returns null when the song has no previews', () => {
    const result = pickPreviewFromSearch(makeSearchResponse([makeSong('2', { withPreview: false })]));
    expect(result.url).toBeNull();
  });
});

describe('resolvePlaybackUrl', () => {
  it('returns preview URL, artwork and track id', async () => {
    appleFetchMock.mockResolvedValue(makeSearchResponse([makeSong('99')]));

    const result = await resolvePlaybackUrl('Hello', 'World');

    expect(result.url).toBe('https://audio.example/99.m4a');
    expect(result.art).toBe('https://img.example/99/300x300.jpg');
    expect(result.duration).toBe(180);
    expect(result.appleTrackId).toBe('99');
  });

  it('throws when no preview is available', async () => {
    appleFetchMock.mockResolvedValue(makeSearchResponse([makeSong('3', { withPreview: false })]));

    await expect(resolvePlaybackUrl('Hello')).rejects.toThrow('No Apple Music preview available');
  });
});

describe('resolvePlaybackUrlById', () => {
  it('looks up the track directly and returns the preview URL', async () => {
    appleFetchMock.mockResolvedValue({ data: [makeSong('direct')] });

    const result = await resolvePlaybackUrlById('direct');

    expect(result.url).toBe('https://audio.example/direct.m4a');
    expect(result.appleTrackId).toBe('direct');
  });
});
