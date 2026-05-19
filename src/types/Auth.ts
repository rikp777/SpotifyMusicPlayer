export interface AuthState {
  status: boolean
  accessToken: string
  refreshToken: string
}

export interface SpotifyAuthState extends AuthState {
  clientId: string
  authCode: string
}

export interface YouTubeAuthState extends AuthState {
  expiresIn?: number
}

export interface TrackSummary {
  title: string
  artist: string
  image?: string
  url?: string
}

export interface TopTrack extends TrackSummary {
  playCount?: number
}

export interface PlayerState {
  playing: boolean
  trackArtists: string[]
  trackTitle: string
  trackId?: string

  trackAlbum: {
    title?: string
    image?: string
  }
  progressMs: number
  durationMs: number

  release_date?: string
  tags?: string[]
  popularity?: number

  nextTrack?: TrackSummary
  previousTrack?: TrackSummary
  topTrack?: TopTrack

  provider?: 'spotify' | 'youtube' | 'lastfm'
  trackUrl?: string
}
