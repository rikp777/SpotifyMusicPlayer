import type { MusicProvider } from '@/types/MusicProvider';
import type { PlayerState, TopTrack } from '@/types/Auth'

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const USER = import.meta.env.VITE_LASTFM_USERNAME;
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export class LastfmProvider implements MusicProvider {
  name = 'lastfm' as const;

  async getNowPlaying(): Promise<PlayerState | null> {
    if (!API_KEY || !USER) {
      console.error('Last.fm credentials missing in .env');
      return null;
    }

    try {
      const url = `${BASE_URL}?method=user.getrecenttracks&user=${USER}&api_key=${API_KEY}&format=json&limit=2&extended=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.recenttracks || !data.recenttracks.track || data.recenttracks.track.length === 0) {
        return null;
      }

      const tracks = data.recenttracks.track;
      const current = tracks[0];

      const isNowPlaying = current['@attr']?.nowplaying === 'true';

      const tags = await this.getTags(current.artist.name, current.name);

      const previous = tracks[1];
      let previousTrackData = undefined;

      if (previous) {
        previousTrackData = {
          title: previous.name,
          artist: previous.artist.name,
          image: this.getImage(previous.image)
        };
      }

      return {
        playing: isNowPlaying,
        trackTitle: current.name,
        trackArtists: [current.artist.name],
        trackAlbum: {
          title: current.album['#text'],
          image: this.getImage(current.image),
        },

        durationMs: 0,
        progressMs: 0,

        tags: tags,
        previousTrack: previousTrackData,
        nextTrack: undefined,

        provider: 'lastfm'
      };

    } catch (e) {
      console.error('Last.fm polling error', e);
      return null;
    }
  }

  async getMonthFavorite(): Promise<TopTrack | null> {
    if (!API_KEY || !USER) return null;

    try {
      // period=1month
      const url = `${BASE_URL}?method=user.gettoptracks&user=${USER}&api_key=${API_KEY}&format=json&period=1month&limit=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.toptracks || !data.toptracks.track || data.toptracks.track.length === 0) {
        return null;
      }

      const track = data.toptracks.track[0];
      return {
        title: track.name,
        artist: track.artist.name,
        image: this.getImage(track.image),
        playCount: parseInt(track.playcount)
      };
    } catch (e) {
      console.error('Last.fm Top Track Error', e);
      return null;
    }
  }

  private async getTags(artist: string, track: string): Promise<string[]> {
    try {
      const safeArtist = encodeURIComponent(artist);
      const safeTrack = encodeURIComponent(track);

      const url = `${BASE_URL}?method=track.gettoptags&api_key=${API_KEY}&artist=${safeArtist}&track=${safeTrack}&autocorrect=1&format=json`;

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

  private getImage(images: any[]): string | undefined {
    if (!images || !Array.isArray(images)) return undefined;
    const img = images.find((i: any) => i.size === 'extralarge')
      || images.find((i: any) => i.size === 'large')
      || images[images.length - 1];

    return img ? img['#text'] : undefined;
  }
}
