import { ref, computed } from 'vue';
import { SpotifyProvider } from '@/services/SpotifyProvider';
import { YouTubeProvider } from '@/services/YouTubeProvider';
import type { AuthState, YouTubeAuthState } from '@/types/Auth'
import { LastfmProvider } from '@/services/LastfmProvider.ts'

const currentType = ref<'spotify' | 'youtube' | 'lastfm'>('spotify');

export function useProviderManager(
  spotifyAuth: AuthState,
  ytAuth: YouTubeAuthState,
  refreshSpotify: () => void
) {

  const spotify = new SpotifyProvider(spotifyAuth, refreshSpotify);
  const youtube = new YouTubeProvider(ytAuth);
  const lastfm = new LastfmProvider();

  const activeProvider = computed(() => {
    switch (currentType.value) {
      case 'spotify': return spotify;
      case 'youtube': return youtube;
      case 'lastfm': return lastfm;
    }
  });

  function toggleProvider(type: 'spotify' | 'youtube' | 'lastfm') {
    currentType.value = type;
  }

  return {
    activeProvider,
    currentType,
    toggleProvider
  };
}
