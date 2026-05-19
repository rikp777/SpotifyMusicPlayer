import type { MusicProvider } from '@/types/MusicProvider'
import type { PlayerState, SpotifyAuthState, TopTrack } from '@/types/Auth'

const API_BASE = 'https://api.spotify.com/v1'
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/'
const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY

interface SpotifyArtist {
  name: string
}

interface SpotifyImage {
  url?: string
}

interface SpotifyAlbum {
  name: string
  images: SpotifyImage[]
  release_date?: string
}

interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  popularity?: number
  external_urls?: {
    spotify?: string
  }
}

interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean
  item?: SpotifyTrack
  progress_ms?: number
}

interface SpotifyQueueResponse {
  queue?: SpotifyTrack[]
}

interface SpotifyRecentlyPlayedResponse {
  items?: Array<{
    track: SpotifyTrack
  }>
}

interface SpotifyTopTracksResponse {
  items?: SpotifyTrack[]
}

interface LastFmTag {
  name: string
}

interface LastFmTagsResponse {
  toptags?: {
    tag?: LastFmTag | LastFmTag[]
  }
}

export class SpotifyProvider implements MusicProvider {
  name = 'spotify' as const

  constructor(
    private auth: SpotifyAuthState,
    private refreshCallback: () => Promise<void>,
  ) {}

  async getNowPlaying(): Promise<PlayerState | null> {
    if (!this.auth.accessToken) return null

    try {
      const response = await fetch(`${API_BASE}/me/player/currently-playing`, {
        headers: { Authorization: `Bearer ${this.auth.accessToken}` },
      })

      if (response.status === 401) {
        void this.refreshCallback()
        return null
      }

      if (response.status === 204) return null

      const data = (await response.json()) as SpotifyCurrentlyPlayingResponse

      if (!data.item) return null

      const primaryArtist = data.item.artists[0]?.name ?? ''

      const [queueResult, recentResult, tagsResult] = await Promise.allSettled([
        this.getQueue(),
        this.getRecentlyPlayed(),
        primaryArtist ? this.getLastFmTags(primaryArtist, data.item.name) : Promise.resolve([]),
      ])

      const nextTrack = queueResult.status === 'fulfilled' ? queueResult.value : undefined
      const previousTrack = recentResult.status === 'fulfilled' ? recentResult.value : undefined
      const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : []

      return {
        playing: data.is_playing,
        trackId: data.item.id,
        trackTitle: data.item.name,
        trackArtists: data.item.artists.map((artist) => artist.name),
        trackAlbum: {
          title: data.item.album.name,
          image: data.item.album.images[0]?.url,
        },
        durationMs: data.item.duration_ms,
        progressMs: data.progress_ms ?? 0,

        release_date: data.item.album.release_date,
        popularity: data.item.popularity,

        tags: tags,
        nextTrack: nextTrack,
        previousTrack: previousTrack,

        provider: 'spotify',
        trackUrl: data.item.external_urls?.spotify,
      }
    } catch (e) {
      console.error('Spotify Provider Error', e)
      return null
    }
  }

  async getMonthFavorite(): Promise<TopTrack | null> {
    if (!this.auth.accessToken) return null

    try {
      const response = await fetch(`${API_BASE}/me/top/tracks?time_range=short_term&limit=1`, {
        headers: { Authorization: `Bearer ${this.auth.accessToken}` },
      })

      if (!response.ok) return null

      const data = (await response.json()) as SpotifyTopTracksResponse
      if (!data.items || data.items.length === 0) return null

      const track = data.items[0]
      if (!track) return null

      return {
        title: track.name,
        artist: track.artists.map((artist) => artist.name).join(', '),
        image: track.album.images[0]?.url,
        url: track.external_urls?.spotify,
      }
    } catch (e) {
      console.error('Spotify Top Track Error', e)
      return null
    }
  }

  private async getQueue() {
    try {
      const response = await fetch(`${API_BASE}/me/player/queue`, {
        headers: { Authorization: `Bearer ${this.auth.accessToken}` },
      })
      if (!response.ok) return undefined

      const data = (await response.json()) as SpotifyQueueResponse
      if (data.queue && data.queue.length > 0) {
        const nextItem = data.queue[0]
        if (!nextItem) return undefined

        return {
          title: nextItem.name,
          artist: nextItem.artists.map((artist) => artist.name).join(', '),
          image: nextItem.album.images[0]?.url,
          url: nextItem.external_urls?.spotify,
        }
      }
    } catch (e) {
      console.warn('Queue fetch failed', e)
    }
    return undefined
  }

  private async getRecentlyPlayed() {
    try {
      const response = await fetch(`${API_BASE}/me/player/recently-played?limit=1`, {
        headers: { Authorization: `Bearer ${this.auth.accessToken}` },
      })
      if (!response.ok) return undefined

      const data = (await response.json()) as SpotifyRecentlyPlayedResponse
      if (data.items && data.items.length > 0) {
        const track = data.items[0]?.track
        if (!track) return undefined

        return {
          title: track.name,
          artist: track.artists.map((artist) => artist.name).join(', '),
          image: track.album.images[0]?.url,
          url: track.external_urls?.spotify,
        }
      }
    } catch (e) {
      console.warn('History fetch failed', e)
    }
    return undefined
  }

  private async getLastFmTags(artist: string, track: string): Promise<string[]> {
    if (!LASTFM_API_KEY) return []

    try {
      const safeArtist = encodeURIComponent(artist).replace(/%20/g, '+')
      const safeTrack = encodeURIComponent(track).replace(/%20/g, '+')

      const url = `${LASTFM_BASE}?method=track.gettoptags&api_key=${LASTFM_API_KEY}&artist=${safeArtist}&track=${safeTrack}&autocorrect=1&format=json`

      const response = await fetch(url)
      const data = (await response.json()) as LastFmTagsResponse

      if (data.toptags && data.toptags.tag) {
        const tags = Array.isArray(data.toptags.tag) ? data.toptags.tag : [data.toptags.tag]
        return tags.slice(0, 3).map((tag) => tag.name)
      }
    } catch (e) {
      console.warn('Last.fm tags fetch failed', e)
    }
    return []
  }
}
