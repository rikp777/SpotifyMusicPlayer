import type { MusicProvider } from '@/types/MusicProvider';
import type { PlayerState, TopTrack } from '@/types/Auth'
import type { YouTubeAuthState } from '@/types/Auth';

export class YouTubeProvider implements MusicProvider {
  name = 'youtube' as const;

  constructor(private auth: YouTubeAuthState) {}

  async getNowPlaying(): Promise<PlayerState | null> {
    if (!this.auth.accessToken) return null;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&mine=true&maxResults=2`,
        {
          headers: { Authorization: `Bearer ${this.auth.accessToken}` },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;

      const currentItem = data.items[0];
      const currentSnippet = currentItem.snippet;

      const prevItem = data.items[1];
      let previousTrack = undefined;

      if (prevItem) {
        previousTrack = {
          title: prevItem.snippet.title,
          artist: prevItem.snippet.channelTitle,
          image: prevItem.snippet.thumbnails.default?.url
        };
      }

      return {
        playing: true,
        trackTitle: currentSnippet.title,
        trackArtists: [currentSnippet.channelTitle],
        trackAlbum: {
          title: "YouTube History",
          image: currentSnippet.thumbnails.high?.url || currentSnippet.thumbnails.default?.url,
        },
        durationMs: 0,
        progressMs: 0,

        previousTrack: previousTrack,
        nextTrack: undefined,

        provider: 'youtube'
      };

    } catch (e) {
      console.error('YouTube Fetch Error', e);
      return null;
    }
  }

  async getMonthFavorite(): Promise<TopTrack | null> {
    return null;
  }
}
