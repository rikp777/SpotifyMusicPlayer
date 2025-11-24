import type { PlayerState } from '@/types/Auth';

export interface MusicProvider {
  name: 'spotify' | 'youtube' | 'lastfm';
  getNowPlaying(): Promise<PlayerState | null>;
  getMonthFavorite(): Promise<TopTrack | null>;
  disconnect?(): void;
}
