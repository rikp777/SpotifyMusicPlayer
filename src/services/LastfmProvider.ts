import type { MusicProvider } from '@/types/MusicProvider'
import type { PlayerState, TopTrack } from '@/types/Auth'

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const USER = import.meta.env.VITE_LASTFM_USERNAME
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/'

interface LastFmImage {
  '#text'?: string
  size?: string
}

interface LastFmArtist {
  name: string
}

interface LastFmAlbum {
  '#text'?: string
}

interface LastFmRecentTrack {
  name: string
  artist: LastFmArtist
  album: LastFmAlbum
  image?: LastFmImage[]
  url?: string
  '@attr'?: {
    nowplaying?: string
  }
}

interface LastFmRecentTracksResponse {
  recenttracks?: {
    track?: LastFmRecentTrack[]
  }
}

interface LastFmTopTrack {
  name: string
  artist: LastFmArtist
  image?: LastFmImage[]
  playcount?: string
  url?: string
}

interface LastFmTopTracksResponse {
  toptracks?: {
    track?: LastFmTopTrack[]
  }
}

interface LastFmTag {
  name: string
}

interface LastFmTagsResponse {
  toptags?: {
    tag?: LastFmTag | LastFmTag[]
  }
}

export class LastfmProvider implements MusicProvider {
  name = 'lastfm' as const

  async getNowPlaying(): Promise<PlayerState | null> {
    if (!API_KEY || !USER) {
      console.error('Last.fm credentials missing in .env')
      return null
    }

    try {
      const url = `${BASE_URL}?method=user.getrecenttracks&user=${USER}&api_key=${API_KEY}&format=json&limit=2&extended=1`
      const response = await fetch(url)
      const data = (await response.json()) as LastFmRecentTracksResponse

      if (!data.recenttracks || !data.recenttracks.track || data.recenttracks.track.length === 0) {
        return null
      }

      const tracks = data.recenttracks.track
      const current = tracks[0]
      if (!current) return null

      const isNowPlaying = current['@attr']?.nowplaying === 'true'

      const tags = await this.getTags(current.artist.name, current.name)

      const previous = tracks[1]
      let previousTrackData = undefined

      if (previous) {
        previousTrackData = {
          title: previous.name,
          artist: previous.artist.name,
          image: this.getImage(previous.image),
          url: previous.url,
        }
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

        provider: 'lastfm',
        trackUrl: current.url,
      }
    } catch (e) {
      console.error('Last.fm polling error', e)
      return null
    }
  }

  async getMonthFavorite(): Promise<TopTrack | null> {
    if (!API_KEY || !USER) return null

    try {
      // period=1month
      const url = `${BASE_URL}?method=user.gettoptracks&user=${USER}&api_key=${API_KEY}&format=json&period=1month&limit=1`
      const response = await fetch(url)
      const data = (await response.json()) as LastFmTopTracksResponse

      if (!data.toptracks || !data.toptracks.track || data.toptracks.track.length === 0) {
        return null
      }

      const track = data.toptracks.track[0]
      if (!track) return null

      return {
        title: track.name,
        artist: track.artist.name,
        image: this.getImage(track.image),
        playCount: Number.parseInt(track.playcount ?? '0', 10),
        url: track.url,
      }
    } catch (e) {
      console.error('Last.fm Top Track Error', e)
      return null
    }
  }

  private async getTags(artist: string, track: string): Promise<string[]> {
    try {
      const safeArtist = encodeURIComponent(artist)
      const safeTrack = encodeURIComponent(track)

      const url = `${BASE_URL}?method=track.gettoptags&api_key=${API_KEY}&artist=${safeArtist}&track=${safeTrack}&autocorrect=1&format=json`

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

  private getImage(images?: LastFmImage[]): string | undefined {
    if (!images || !Array.isArray(images)) return undefined
    const img =
      images.find((image) => image.size === 'extralarge') ||
      images.find((image) => image.size === 'large') ||
      images[images.length - 1]

    return img ? img['#text'] : undefined
  }
}
