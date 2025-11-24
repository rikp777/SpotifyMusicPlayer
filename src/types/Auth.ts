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
    url?: string;
  };
  previousTrack?: {
    title: string;
    artist: string;
    image?: string
    url?: string;
  };
  topTrack?: {
    title: string;
    artist: string;
    image?: string;
    playCount?: number;
    url?: string;
  };

  provider?: 'spotify' | 'youtube' | 'lastfm';
  trackUrl?: string;
}

export interface TopTrack {
  title: string;
  artist: string;
  image?: string;
  playCount?: number;
}

