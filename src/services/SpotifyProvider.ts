import type { MusicProvider } from '@/types/MusicProvider';
import type { PlayerState, AuthState, TopTrack } from '@/types/Auth'

const API_BASE = 'https://api.spotify.com/v1';
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

export class SpotifyProvider implements MusicProvider {
  name = 'spotify' as const;

  constructor(private auth: AuthState, private refreshCallback: () => void) {}

  async getNowPlaying(): Promise<PlayerState | null> {
    if (!this.auth.accessToken) return null;

    try {
      const response = await fetch(`${API_BASE}/me/player/currently-playing`, {
        headers: { Authorization: `Bearer ${this.auth.accessToken}` },
      });

      if (response.status === 401) {
        this.refreshCallback();
        return null;
      }

      if (response.status === 204) return null;

      const data = await response.json();

      if (!data.item) return null;

      const [queueResult, recentResult, tagsResult] = await Promise.allSettled([
        this.getQueue(),
        this.getRecentlyPlayed(),
        this.getLastFmTags(data.item.artists[0].name, data.item.name)
      ]);

      const nextTrack = queueResult.status === 'fulfilled' ? queueResult.value : undefined;
      const previousTrack = recentResult.status === 'fulfilled' ? recentResult.value : undefined;
      const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];

      return {
        playing: data.is_playing,
        trackId: data.item.id,
        trackTitle: data.item.name,
        trackArtists: data.item.artists.map((a: any) => a.name),
        trackAlbum: {
          title: data.item.album.name,
          image: data.item.album.images[0]?.url,
        },
        durationMs: data.item.duration_ms,
        progressMs: data.progress_ms,

        release_date: data.item.album.release_date,
        popularity: data.item.popularity,

        tags: tags,
        nextTrack: nextTrack,
        previousTrack: previousTrack,

        provider: 'spotify'
      };

    } catch (e) {
      console.error('Spotify Provider Error', e);
      return null;
    }
  }

  async getMonthFavorite(): Promise<TopTrack | null> {
    if (!this.auth.accessToken) return null;

    try {
      const response = await fetch(`${API_BASE}/me/top/tracks?time_range=short_term&limit=1`, {
        headers: { Authorization: `Bearer ${this.auth.accessToken}` },
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;

      const track = data.items[0];
      return {
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        image: track.album.images[0]?.url
      };
    } catch (e) {
      console.error('Spotify Top Track Error', e);
      return null;
    }
  }

  private async getQueue() {
    try {
      const response = await fetch(`${API_BASE}/me/player/queue`, {
        headers: { Authorization: `Bearer ${this.auth.accessToken}` },
      });
      if (!response.ok) return undefined;

      const data = await response.json();
      if (data.queue && data.queue.length > 0) {
        const nextItem = data.queue[0];
        return {
          title: nextItem.name,
          artist: nextItem.artists.map((a: any) => a.name).join(', '),
          image: nextItem.album.images[0]?.url
        };
      }
    } catch (e) {
      console.warn('Queue fetch failed', e);
    }
    return undefined;
  }

  private async getRecentlyPlayed() {
    try {
      const response = await fetch(`${API_BASE}/me/player/recently-played?limit=1`, {
        headers: { Authorization: `Bearer ${this.auth.accessToken}` },
      });
      if (!response.ok) return undefined;

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const track = data.items[0].track;
        return {
          title: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          image: track.album.images[0]?.url
        };
      }
    } catch (e) {
      console.warn('History fetch failed', e);
    }
    return undefined;
  }

  private async getLastFmTags(artist: string, track: string): Promise<string[]> {
    if (!LASTFM_API_KEY) return [];

    try {
      const safeArtist = encodeURIComponent(artist).replace(/%20/g, '+');
      const safeTrack = encodeURIComponent(track).replace(/%20/g, '+');

      const url = `${LASTFM_BASE}?method=track.gettoptags&api_key=${LASTFM_API_KEY}&artist=${safeArtist}&track=${safeTrack}&autocorrect=1&format=json`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.toptags && data.toptags.tag) {
        const tags = Array.isArray(data.toptags.tag) ? data.toptags.tag : [data.toptags.tag];
        return tags.slice(0, 3).map((t: any) => t.name);
      }
    } catch (e) {
      console.warn('Last.fm tags fetch failed', e);
    }
    return [];
  }
}
