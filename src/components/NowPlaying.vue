<template>
  <div id="app" :class="{ 'eink-mode': isEinkMode }">
    <div class="controls" v-if="showControls">
      <button class="control-btn" @click="toggleVinylMode" v-if="player.playing">
        Mode {{ isVinylMode ? 'Player' : 'LP' }}
      </button>

      <button class="control-btn" @click="toggleEinkMode">
        Mode {{ isEinkMode ? 'LCD' : 'EInk' }}
      </button>
    </div>
    <div
      v-if="player.playing"
      class="now-playing"
      :class="[getNowPlayingClass(true), { 'now-playing--vinyl': isVinylMode }]"
    >


      <div class="now-playing__content-wrapper">
        <div class="now-playing__cover">
          <img :src="player.trackAlbum.image" :alt="player.trackTitle" class="now-playing__image" />
        </div>

        <div class="now-playing__side-panel">
          <div class="now-playing__details">
            <track-info
              :title="player.trackTitle"
              :artists="player.trackArtists"
              :album-name="player.trackAlbum.title"
              :release-date="player.release_date"
              :popularity="player.popularity"

              :is-vinyl-mode="isVinylMode"
              :is-eink-mode="isEinkMode"
            />

            <vibe-tags
              :tags="player.tags"
              :is-vinyl-mode="isVinylMode"
              :is-eink-mode="isEinkMode"
            />

            <progress-bar
              :currentMs="player.progressMs"
              :durationMs="player.durationMs"
              :is-vinyl-mode="isVinylMode"
              :is-eink-mode="isEinkMode"
            />
          </div>

          <div class="meta-tracks-container" v-if="showPreviousTrack || showNextTrack">
            <queue-item
              v-if="showPreviousTrack && player.previousTrack"
              :track="player.previousTrack"
              type="previous"
              label="Previous"
              :is-vinyl-mode="isVinylMode"
            />

            <queue-item
              v-if="showNextTrack && player.nextTrack"
              :track="player.nextTrack"
              type="next"
              label="Next"
              :is-vinyl-mode="isVinylMode"
            />
          </div>

          <spotify-code
            v-if="showSpotifyCode"
            :track-id="player.trackId"
            :is-eink-mode="isEinkMode"
          />
        </div>
      </div>
    </div>

    <no-music-playing
      v-else
      :is-eink-mode="isEinkMode"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref } from 'vue'
import type { PlayerState, AuthState } from '@/types/Auth'
import { useAlbumColors } from '@/composables/useAlbumColors'
import QueueItem from '@/components/QueueItem.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import VibeTags from '@/components/VibeTags.vue'
import TrackInfo from '@/components/TrackInfo.vue'
import SpotifyCode from '@/components/SpotifyCode.vue'
import NoMusicPlaying from '@/components/NoMusicPlaying.vue'

const startEink = import.meta.env.VITE_DISPLAY_TYPE === 'eink'
const showControls = import.meta.env.VITE_SHOW_CONTROLS !== 'false'
const startVinyl = import.meta.env.VITE_START_IN_VINYL_MODE === 'true'


const showPreviousTrack = import.meta.env.VITE_SHOW_PREVIOUS_TRACK !== 'false'
const showNextTrack = import.meta.env.VITE_SHOW_NEXT_TRACK !== 'false'
const showSpotifyCode = import.meta.env.VITE_SHOW_SPOTIFY_CODE !== 'false'

const props = defineProps<{
  auth: AuthState
  player: PlayerState
}>()

const { player } = toRefs(props)
const isVinylMode = ref(startVinyl)
const isEinkMode = ref(startEink)

if (!isEinkMode) {
  useAlbumColors(computed(() => player.value.trackAlbum.image))
}

function toggleVinylMode() {
  isVinylMode.value = !isVinylMode.value
}
function toggleEinkMode() {
  isEinkMode.value = !isEinkMode.value
}

function getNowPlayingClass(isPlaying: boolean): string {
  return `now-playing--${isPlaying ? 'active' : 'idle'}`
}
</script>

<style scoped lang="scss">
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Controls */
.controls { position: absolute; top: 20px; right: 20px; z-index: 20; display: flex; gap: 10px; }
.control-btn { background: rgba(255, 255, 255, 0.2); border: 1px solid white; color: white; padding: 8px 12px; cursor: pointer; border-radius: 20px; font-size: 0.8rem; text-transform: uppercase; &:hover { background: rgba(255, 255, 255, 0.4); } }

.now-playing {
  background-color: var(--colour-background-now-playing);
  color: var(--color-text-primary);
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.5s ease;

  &__content-wrapper { display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; padding: var(--spacing-l); box-sizing: border-box; }
  &__cover { width: 100%; display: flex; justify-content: center; padding: var(--spacing-m); z-index: 1; }
  &__side-panel { width: 100%; display: flex; flex-direction: column; gap: 20px; }

  /* Grote Afbeelding (Cover / LP) */
  &__image { width: 100%; height: auto; max-width: 80vh; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); border-radius: 4px; transition: all 0.5s ease; }

  /* Container voor TrackInfo, Tags en Progress */
  &__details { text-align: center; width: 100%; display: flex; flex-direction: column; gap: 10px; }

  /* Container voor de Vorige/Volgende items */
  .meta-tracks-container {
    display: flex; flex-direction: column; gap: 12px;
    width: 100%; max-width: 400px; margin: 0 auto;
  }

  /* --- VINYL MODE --- */
  &--vinyl {
    background-color: #000000;

    .now-playing__content-wrapper { position: relative; justify-content: center; width: 100%; height: 100%; }
    .now-playing__side-panel { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
    .now-playing__cover { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); width: auto; padding: 0; pointer-events: auto; }

    /* Grote draaiende plaat */
    .now-playing__image {
      border-radius: 50%;
      width: 80vmin; height: 80vmin; max-width: none;
      animation: spin 10s linear infinite;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
      border: 2px solid rgba(20, 20, 20, 1);
    }

    .now-playing__details {
      position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%);
      width: 22vmin; height: 22vmin;
      border-radius: 50%;
      background-color: var(--colour-background-now-playing);
      color: var(--color-text-primary);
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      padding: 1rem; box-sizing: border-box;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6);
      background-image: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
      z-index: 10; pointer-events: auto;
    }

    .vibe-tags-minimal { display: none; }

    /* Queue items positionering in Vinyl Mode */
    .meta-tracks-container {
      position: absolute; bottom: 40px; left: 0;
      width: 100%; max-width: none;
      display: flex; flex-direction: row; justify-content: space-evenly;
      padding: 0 5vw; box-sizing: border-box; margin: 0;
      z-index: 5; pointer-events: none;
    }
  }

  /* --- RESPONSIVE (Desktop Standard) --- */
  @media only screen and (min-width: 768px) {
    &:not(.now-playing--vinyl) {
      .now-playing__content-wrapper { flex-direction: row; padding: 5%; }
      .now-playing__cover { justify-content: flex-end; padding-right: var(--spacing-xl); width: 50%; }
      .now-playing__side-panel { width: 50%; padding-left: var(--spacing-xl); justify-content: center; align-items: flex-start; }
      .now-playing__details { text-align: left; align-items: flex-start; width: 100%; }
      .now-playing__progress-container, .meta-tracks-container { margin-left: 0; margin-right: 0; }
      .now-playing__image { max-width: 600px; }
    }
  }
}

/* --- E-INK / SPECTRA 6 MODE --- */
.eink-mode {
  filter: contrast(110%) saturate(140%);

  .now-playing { background-color: #ffffff !important; color: #000000 !important; }
  .now-playing__image { border: 4px solid #000000; box-shadow: none !important; }

  .now-playing--vinyl {
    background-color: #ffffff !important;
    .now-playing__image { animation: none !important; border: 4px solid black; transform: rotate(0deg) !important; }
    .now-playing__details { background-color: #fff; border: 2px solid black; color: black; }
  }
}
</style>
