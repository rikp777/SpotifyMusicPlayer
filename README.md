# Spotify Smart Visualizer 🎵

A Vue 3 + TypeScript application designed for smart mirrors and dedicated displays. It visualizes the current Spotify playback state with a focus on aesthetics, adaptive colors, and metadata.

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)
![Spotify API](https://img.shields.io/badge/Spotify-API-1DB954?style=flat&logo=spotify)

## ✨ Features

- **Real-time Now Playing:** Shows track, artist, album, and progress bar.
- **Queue & History:** Displays the **Previous** and **Upcoming** tracks with cover art.
- **Adaptive Theming:** Background color automatically extracts and adapts to the current album cover.
- **Vinyl Mode:** A dedicated "LP" view with a rotating record animation for a retro feel.
- **Spotify Codes:** Generates a scannable code on the fly to share/play the track on other devices.
- **Touch/Click Controls:** Toggle between List/Vinyl modes and show/hide album names.

![default_player.png](default_player.png)
![lp_player.png](lp_player.png)

## 🛠️ Prerequisites

- Node.js (v16+)
- A Spotify Developer Account
- A Spotify Premium account (recommended for real-time API updates)
- Optional: Last.fm API Key (for fetching genre/vibe tags)

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd your-project-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Spotify App Setup:**
    * Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
    * Create a new app.
    * Add `http://localhost:5173/callback` (or your production URL) to the **Redirect URIs**.

4.  **Environment Variables:**
    Create a `.env` file in the root directory. Configure the API keys and UI preferences as needed:

    ```env
    # --- API KEYS ---
    
    # Spotify Configuration
    VITE_SP_CLIENT_ID="your_spotify_client_id"
    VITE_SP_CLIENT_SECRET="your_spotify_client_secret"
    # Ensure this matches your Spotify Dashboard settings
    VITE_SPOTIFY_REDIRECT_URI="http://localhost:5173/callback"

    # Last.fm (Optional - required for genre/vibe tags)
    VITE_LASTFM_API_KEY="your_lastfm_api_key"


    # --- UI CONFIGURATION ---

    # Display Mode: 'standard' (Color) or 'eink' (High contrast B&W)
    VITE_DISPLAY_TYPE="standard"

    # Show the clickable control buttons on screen?
    VITE_SHOW_CONTROLS=true

    # --- STARTUP DEFAULTS ---
    
    # Show Album text on load?
    VITE_START_WITH_ALBUM_VISIBLE=true
    # Start directly in the rotating Vinyl view?
    VITE_START_IN_VINYL_MODE=true

    # --- VISUAL ELEMENTS ---

    # Show History and Queue (small records/covers)
    VITE_SHOW_PREVIOUS_TRACK=true
    VITE_SHOW_NEXT_TRACK=true
    
    # Metadata details
    VITE_SHOW_TRACK_YEAR=true
    VITE_SHOW_TRACK_POPULARITY=true

    # Show scannable Spotify Code
    VITE_SHOW_SPOTIFY_CODE=true
    ```

## 🔑 Scopes & Permissions

This app requires specific permissions to function correctly. Ensure your authentication logic includes these scopes:

* `user-read-currently-playing` (Main player)
* `user-read-playback-state` (Queue/Next track)
* `user-read-recently-played` (Previous track)

## 🏃‍♂️ Usage

**Development Server:**
```bash
npm run dev