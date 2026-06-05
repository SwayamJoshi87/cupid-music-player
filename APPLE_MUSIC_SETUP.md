# Apple Music Setup

This app supports Apple Music playback using **browser tokens** — no paid Apple Developer account required.

## How to Get Your Tokens

1. Open **music.apple.com** in Chrome/Edge/Brave
2. Sign in with your Apple Music subscription
3. Open **DevTools** → `F12` or right-click → Inspect
4. Go to the **Network** tab
5. Play any song or album
6. In the Network tab, find any request to **`amp-api.music.apple.com`**
7. Click on that request and look at the **Request Headers**
8. Copy two header values:

   | Header | What to Copy |
   |--------|-------------|
   | `Authorization` | Copy the value (starts with `Bearer ...`). Paste the **entire thing** including "Bearer " |
   | `media-user-token` | Copy this value too |

9. Open the app → Settings → Apple Music
10. Paste both tokens into the fields and click **Save**

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Tokens expired" error | Tokens last a few hours. Re-extract fresh ones from music.apple.com |
| No requests to `amp-api.music.apple.com` | Play a track first, then check the Network tab. Filter by "apple.com" |
| Can't find the headers | Make sure you're looking at **Request Headers** (not Response Headers) |
| App says "invalid token" | Make sure you include "Bearer " at the start of the Authorization field |

## Notes

- These tokens are **session-based** and expire periodically. You may need to refresh them.
- All token data stays in your browser's localStorage — nothing is sent anywhere except directly to Apple's API.
- This method is for **personal use only**. The tokens are tied to your Apple Music subscription.

## Developer Setup (Alternative)

If you have an Apple Developer account and want to use the official MusicKit API:
1. Go to https://developer.apple.com
2. Create a MusicKit identifier
3. Generate a private key
4. Use the official `MusicKit` JS library instead of browser tokens
