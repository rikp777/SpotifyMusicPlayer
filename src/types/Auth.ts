export interface AuthState {
  status: boolean;
  accessToken: string;
  refreshToken: string;
  code?: string;
  clientId?: string;
}

export interface YouTubeAuthState extends AuthState {
  expiresIn?: number;
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
  topTrack?: {
    title: string;
    artist: string;
    image?: string;
    playCount?: number;
  };

  provider?: 'spotify' | 'youtube' | 'lastfm';
}

export interface TopTrack {
  title: string;
  artist: string;
  image?: string;
  playCount?: number;
}

