# Cupid Player

> **Fork notice:** This is **Sam's fork** at [`SwayamJoshi87/cupid-music-player`](https://github.com/SwayamJoshi87/cupid-music-player), forked from [cupidbity/cupid-music-player](https://github.com/cupidbity/cupid-music-player).

A whimsical pixel-art desktop music player built with Electron. Plays your music from local files, Spotify, Apple Music, and YouTube — all wrapped in a frameless, transparent window with a vinyl record player aesthetic.

![Cupid Player](assets/pink/favicon.png)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop Shell** | [Electron](https://www.electronjs.org/) (frameless, transparent, aspect-ratio-locked window) |
| **Build Tool** | [Vite](https://vitejs.dev/) 6 + React 18 |
| **UI Framework** | [React](https://reactjs.org/) 18 |
| **Styling** | CSS (pixel-art sprites via CSS custom properties) |
| **Local Playback** | HTML5 `<audio>` element |
| **Streaming Audio** | [yt-dlp](https://github.com/yt-dlp/yt-dlp) (standalone binary) — extracts audio streams from YouTube |
| **YouTube Music Search** | [youtubei.js](https://github.com/LuanRT/YouTube.js) (Innertube API — no API key needed for search) |
| **Spotify Integration** | [Spotify Web API](https://developer.spotify.com/documentation/web-api) (OAuth, playlist browsing, track metadata) |
| **Apple Music Integration** | Apple Music API via browser tokens (no paid developer account required) |
| **YouTube Integration** | [YouTube Data API v3](https://developers.google.com/youtube/v3) (OAuth) + yt-dlp (URL paste — no sign-in needed) |
| **Packaging** | [electron-builder](https://www.electron.build/) (macOS, Windows, Linux) |
| **Token Caching** | JSON Web Tokens + `jsonwebtoken`, localStorage |

### Dependencies
- **React** — UI
- **Vite** — dev server & bundler
- **Electron** — desktop shell
- **yt-dlp** — audio stream extraction from YouTube
- **youtubei.js** — YouTube Music search (Innertube API)
- **Music Metadata** — `music-metadata` & `music-metadata-browser`
- **jsonwebtoken** — Apple Music developer token generation
- **dotenv** — environment variable management

---

## Architecture Overview

### Pixel-Art Rendering

The entire UI is drawn from **pixel-art sprite sheets** — every button, frame, and record player element is a PNG sprite rendered in CSS-positioned `<img>` tags. There are no vector elements or HTML/CSS chrome.

The Electron window is:
- **Frameless** — no native title bar or borders
- **Transparent** — background is `#00000000`, so only the pixel art is visible
- **Aspect-ratio-locked** — resizable but always maintains a 306:497 aspect ratio (the canvas inside the frame)
- **Custom window controls** — minimize, maximize/restore, and close are pixel-art sprites wired via IPC

Two themes are bundled — **pink** and **blue** — each with its own complete set of sprites (frame, buttons, record player, album frame, needle animations). The theme can be toggled at runtime and the preference is persisted in localStorage.

### Record Player Animation

When a track plays, a **4-frame sprite loop** animates the vinyl record spinning. The animation is driven by a `setInterval` at 400ms per frame.

On track change, a multi-step sequence plays:
1. **Needle lifts** — 3-frame needle-change animation plays (sprite 0 → 1 → 2)
2. **Record swap** — the current record sprite slides out, the theme toggles (pink ↔ blue), and the new record appears
3. **Needle lowers** — the needle-change animation plays in reverse (2 → 1 → 0), returning to a 3-frame needle-playing loop

Each theme has dedicated needle animations for both the "playing" and "changing" states.

### Integration Layers

#### Local Audio
- Reads a user-editable `audio/playlist.json` file
- Audio files are served via a custom `cupid-local://` protocol in the main process (supports Range requests for seeking)
- Supported formats: MP3, M4A, AAC, FLAC, WAV, OGG, OPUS

#### Spotify
- OAuth 2.0 flow via Spotify Web API (opened in a modal BrowserWindow or system browser)
- Fetches user playlists and track metadata (title, artist, album art)
- Audio is **not** streamed from Spotify — instead, the app searches YouTube Music for each track via **youtubei.js** (Innertube API) and streams the matching YouTube audio through yt-dlp
- The app owner's Spotify account needs an active **Premium** subscription (Spotify requirement as of Feb 2026)

#### Apple Music
- Uses **browser tokens** extracted from `music.apple.com` — no paid Apple Developer account required
- Two-step token paste: `Authorization` (Bearer) + `media-user-token`
- Audio streams via YouTube (same yt-dlp path as Spotify)
- Tokens expire after a few hours and can be refreshed from the browser
- For developers: also supports official MusicKit JWT tokens via `APPLE_TEAM_ID` + `APPLE_KEY_ID` + `.p8` key file

#### YouTube
Two paths, usable independently:
1. **URL paste (no sign-in)** — paste any public/unlisted YouTube playlist link. Uses `yt-dlp --flat-playlist --dump-single-json` to extract video IDs and titles directly. No API key, no OAuth, no subscription required.
2. **OAuth sign-in** — Google OAuth via system browser (Google blocks embedded webviews). Uses YouTube Data API v3 to list your playlists. Free tier quota (10,000 units/day) — far more than personal use needs.

Track IDs are cached in a JSON file (`video-id-cache.json`) for fast repeat lookups.

---

## Features

- **Pixel-art interface** — frameless, transparent window with pink and blue themes
- **Record player animation** — spinning vinyl with needle lift/swap animations on track change
- **Local music playback** — drop MP3/FLAC/etc. into `audio/`, edit `playlist.json`
- **Spotify integration** — browse and play your Spotify playlists (audio via YouTube)
- **Apple Music integration** — paste browser tokens, play your Apple Music library
- **YouTube integration** — paste playlist URLs or sign in with Google
- **Shuffle & Repeat** — each with its own pixel-art control
- **Volume control** — vertical pixel-art volume bar with mute toggle
- **Draggable progress bar** — seek through tracks by dragging the star cursor
- **Resizable window** — drag corners while maintaining aspect ratio, with custom resize handles
- **Track title marquee** — scrolls long titles automatically
- **Playlist editing** — edit `audio/playlist.json` to add, remove, or reorder local tracks
- **Music metadata** — reads embedded tags from local audio files

---

## Getting Started

### Prerequisites
- **Node.js** 18+ (tested with 20+)
- **npm** 9+
- **Python 3** (for yt-dlp on some platforms — the standalone binary is preferred)

### Quick Start

```bash
# Clone Sam's fork
git clone https://github.com/SwayamJoshi87/cupid-music-player.git
cd cupid-music-player

# Install dependencies (postinstall downloads the yt-dlp binary automatically)
npm install

# Start in development mode
npm run dev
```

The app opens a frameless window with the player UI. By default it loads any local tracks found in `audio/playlist.json`.

### Setup Guides

- **[Spotify Setup](./SPOTIFY_SETUP.md)** — create a Spotify app, configure OAuth, add users
- **[Apple Music Setup](./APPLE_MUSIC_SETUP.md)** — extract browser tokens for free Apple Music access
- **[YouTube Setup](./YOUTUBE_SETUP.md)** — paste playlist URLs or set up Google OAuth

### Configuration

Copy `.env.example` to `.env` and fill in the values for the services you want:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
APPLE_TEAM_ID=your_team_id
APPLE_KEY_ID=your_key_id
VITE_YOUTUBE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_YOUTUBE_CLIENT_SECRET=your-client-secret
```

These are all optional — the app works for local playback without any of them.

---

## Roadmap / In Progress

This fork includes the following improvements over upstream:

| Feature | Status |
|---------|--------|
| Apple Music browser-token paste integration (no dev account) | ✅ Done |
| YouTube playlist support via URL paste (no sign-in) | ✅ Done |
| Standalone yt-dlp binary (removed Python zipapp dependency) | ✅ Done |
| User-editable local playlist via audio/playlist.json | ✅ Done |
| Music service selection persists across reloads | ✅ Done |
| YouTube streaming speed improvements | ✅ Done |
| Repeat, shuffle, and volume controls in main display | ✅ Done |
| Spotify Premium requirement documentation | ✅ Done |
| Apple Music setup guides with detailed troubleshooting | ✅ Done |
| Windows production build fixes | ✅ Done |

*Planned / aspirational:*
- Synchronised lyrics display
- Last.fm / ListenBrainz scrobbling
- Discord Rich Presence integration
- Equalizer / audio effects
- MPRIS integration (Linux media controls)

---

## Project Structure

```
cupid-music-player/
├── assets/                  # Pixel-art sprites (pink/blue themes, animations)
│   ├── pink/                # Pink theme sprites
│   ├── blue/                # Blue theme sprites
│   └── animations/          # Record spin & needle animations
├── audio/                   # Local music library (user-editable)
│   └── playlist.json        # Local track listing
├── electron/
│   ├── main.cjs             # Electron main process (window, IPC, streaming)
│   └── preload.cjs          # Preload script (contextBridge API)
├── scripts/
│   └── install-yt-dlp.cjs   # Downloads standalone yt-dlp binary
├── src/
│   ├── App.jsx              # Main player component & state
│   ├── App.css              # Player styles
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles & font
│   ├── useAudioPlayer.js    # Local audio playback hook
│   ├── useSpotifyPlayer.js  # Spotify/streaming playback hook
│   ├── useTheme.js          # Theme toggle & asset resolution
│   ├── apple/               # Apple Music API client
│   │   ├── api.js
│   │   └── auth.js
│   ├── spotify/             # Spotify API client
│   │   ├── api.js
│   │   └── auth.js
│   └── youtube/             # YouTube integration
│       ├── api.js
│       ├── auth.js
│       └── index.js
├── package.json
├── vite.config.js
├── .env.example             # Environment variable template
├── APPLE_MUSIC_SETUP.md     # Apple Music setup guide
├── SPOTIFY_SETUP.md         # Spotify setup guide
└── YOUTUBE_SETUP.md         # YouTube setup guide
```

---

## Building for Distribution

```bash
npm run package
```

Builds platform-specific packages into `out/`:
- **macOS**: `.app` directory (codesign yourself for distribution)
- **Windows**: NSIS installer
- **Linux**: `.AppImage` + `.deb`

---

## License

Original project by [Cupidity](https://codedbycupidity.com). Fork maintained by [SwayamJoshi87](https://github.com/SwayamJoshi87).

This project is for **personal use**. Apple Music browser tokens are tied to the user's subscription. Spotify API usage requires a free Spotify Developer account.
