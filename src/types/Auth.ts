export interface AuthState {
  status: boolean;
  clientId: string;
  clientSecret: string;
  authCode: string;
  accessToken: string;
  refreshToken: string;
}

export interface PlayerState {
  playing: boolean;
  trackArtists: string[];
  trackTitle: string;
  trackId?: string;
  trackAlbum: {
    title?: string;
    image?: string;
  };
  progressMs: number;
  durationMs: number;

  release_date?: string;
  tags?: string[];
  popularity?: number;

  nextTrack?: {
    title: string;
    artist: string;
    image?: string;
  };
  previousTrack?: {
    title: string;
    artist: string;
    image?: string
  };
}
