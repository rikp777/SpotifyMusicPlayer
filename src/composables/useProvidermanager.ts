import { ref, computed } from 'vue'
import { SpotifyProvider } from '@/services/SpotifyProvider'
import { YouTubeProvider } from '@/services/YouTubeProvider'
import type { SpotifyAuthState, YouTubeAuthState } from '@/types/Auth'
import { LastfmProvider } from '@/services/LastfmProvider.ts'

const currentType = ref<'spotify' | 'youtube' | 'lastfm'>('spotify')

export function useProviderManager(
  spotifyAuth: SpotifyAuthState,
  ytAuth: YouTubeAuthState,
  refreshSpotify: () => Promise<void>,
) {
  const spotify = new SpotifyProvider(spotifyAuth, refreshSpotify)
  const youtube = new YouTubeProvider(ytAuth)
  const lastfm = new LastfmProvider()

  const providers = {
    spotify,
    youtube,
    lastfm,
  }

  const activeProvider = computed(() => providers[currentType.value])

  function toggleProvider(type: 'spotify' | 'youtube' | 'lastfm') {
    currentType.value = type
  }

  return {
    activeProvider,
    currentType,
    toggleProvider,
  }
}
