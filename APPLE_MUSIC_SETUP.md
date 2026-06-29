# Apple Music Setup

Cupid Player can stream audio through the **Apple Music catalog API** using preview URLs, and it can browse your personal Apple Music library playlists.

## What you need

- An Apple ID with an Apple Music subscription (required for library browsing)
- A few minutes to copy two tokens from the Apple Music web player

## In-app setup flow

1. Open Cupid Player and click the **settings** icon
2. Under **music**, switch the dropdown to **apple**
3. Click **open music.apple.com** — this opens the Apple Music web player in your default browser
4. Sign in with your Apple ID and play any song
5. Open **DevTools** (`F12` or right-click → Inspect) and go to the **Network** tab
6. Filter for `amp-api.music.apple.com`
7. Click any request to that domain and look at the **Request Headers**
8. Copy the two values below:

   | Header | What to Copy |
   |--------|-------------|
   | `Authorization` | The full value, including `Bearer ` |
   | `media-user-token` | The token value |

9. Return to Cupid Player and paste each value into the matching input field
10. Click **save tokens**
11. Toggle **use apple music for streaming** to **on** to enable catalog preview playback

Your tokens are encrypted and stored on your machine using your operating system's keychain (Electron `safeStorage`). They are never sent anywhere except directly to Apple's API.

## Enabling / disabling Apple Music streaming

- **On (default):** Spotify and Apple Music tracks stream via Apple Music catalog preview URLs. YouTube playlist support is hidden because it depends on yt-dlp.
- **Off:** The app falls back to the legacy path, which uses yt-dlp to fetch audio from YouTube. YouTube playlist browsing becomes available again.

Toggle this any time from the Apple Music settings tab.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Tokens expired" error | Tokens last a few hours. Re-extract fresh ones from music.apple.com |
| No requests to `amp-api.music.apple.com` | Play a track first, then check the Network tab. Filter by "apple.com" |
| Can't find the headers | Make sure you're looking at **Request Headers** (not Response Headers) |
| App says "invalid token" | Make sure you include `Bearer ` at the start of the Authorization field |
| "No Apple Music preview available" | The track wasn't found in the catalog, or it has no preview snippet. Try disabling Apple Music streaming to fall back to YouTube. |

## Limitations

- Catalog preview URLs are **30–90 second snippets**. Full-track playback requires MusicKit JS and is planned for a future release.
- This method is for **personal use only**. The tokens are tied to your Apple Music subscription.

## Developer setup (alternative)

If you have an Apple Developer account and want to generate a real MusicKit developer token instead of copying browser tokens:

1. Go to https://developer.apple.com
2. Create a MusicKit identifier
3. Generate a private key
4. Add `APPLE_TEAM_ID` and `APPLE_KEY_ID` to your `.env`
5. Place the downloaded `.p8` key file in the project root
6. The app can then generate a developer token automatically via `electron/main.cjs`

Note: the in-app UI still expects a `media-user-token` from music.apple.com for library browsing.
