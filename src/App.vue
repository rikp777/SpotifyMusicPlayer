<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import NowPlaying from '@/components/NowPlaying.vue'
import { useMusicPlayer } from '@/composables/useMusicPlayer.ts'
import { useYouTubeAuth } from '@/composables/useYouTubeAuth.ts'
import { useSpotifyAuth } from '@/composables/useSpotifyAuth.ts'
import { useProviderManager } from '@/composables/useProvidermanager.ts'

const { spotifyAuth, isSpotifyAuthorized, initSpotifyAuth, refreshSpotifyToken } = useSpotifyAuth()

const { ytAuth, initYouTubeAuth } = useYouTubeAuth()

const { activeProvider, currentType, toggleProvider } = useProviderManager(
  spotifyAuth,
  ytAuth,
  refreshSpotifyToken,
)

const { playerState } = useMusicPlayer(activeProvider)

const isCurrentAuthorized = computed(() => {
  if (currentType.value === 'spotify') return isSpotifyAuthorized.value
  if (currentType.value === 'youtube') return ytAuth.status
  if (currentType.value === 'lastfm') return true
  return false
})

const handleLogin = () => {
  if (currentType.value === 'spotify') {
    initSpotifyAuth()
  } else if (currentType.value === 'youtube') {
    initYouTubeAuth()
  }
}

watch(
  () => playerState.value,
  async (newState) => {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    if (newState.playing && newState.trackTitle) {
      const artistName = newState.trackArtists.join(', ')

      document.title = `${newState.trackTitle} - ${artistName}`

      if (newState.trackAlbum.image) {
        link.href = newState.trackAlbum.image
        link.type = 'image/jpeg'
      }

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: newState.trackTitle,
          artist: artistName,
          album: newState.trackAlbum.title || '',
          artwork: [{ src: newState.trackAlbum.image || '', sizes: '512x512', type: 'image/jpeg' }],
        })
        navigator.mediaSession.playbackState = 'playing'
      }
      await nextTick()

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      })
    } else {
      document.title = 'Music Player'
      link.href = '/favicon.ico'

      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused'
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div id="app">
    <nav class="provider-nav">
      <button :class="{ active: currentType === 'spotify' }" @click="toggleProvider('spotify')">
        Spotify
      </button>
      <button :class="{ active: currentType === 'youtube' }" @click="toggleProvider('youtube')">
        YouTube Music
      </button>
      <button :class="{ active: currentType === 'lastfm' }" @click="toggleProvider('lastfm')">
        Last.fm
      </button>
    </nav>

    <main>
      <div v-if="isCurrentAuthorized">
        <now-playing :player="playerState" @requestRefreshToken="refreshSpotifyToken" />
      </div>

      <div v-else class="login-container">
        <h1>Connect to {{ currentType === 'spotify' ? 'Spotify' : 'YouTube' }}</h1>
        <p>Please authorize access to display your current music.</p>

        <button
          class="login-btn"
          :class="{ 'youtube-mode': currentType === 'youtube' }"
          @click="handleLogin"
        >
          Login with {{ currentType === 'spotify' ? 'Spotify' : 'Google' }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.provider-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.provider-nav button {
  background: transparent;
  border: 1px solid #444;
  color: #888;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;
}

.provider-nav button.active {
  color: #fff;
  border-color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.login-container {
  text-align: center;
  margin-top: 4rem;
}

.login-btn {
  margin-top: 1rem;
  padding: 10px 20px;
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-btn.youtube-mode {
  background-color: #ff0000;
}
</style>
