<template>
  <div id="app" :class="{ 'eink-mode': isEinkMode }">
    <div
      v-if="player.playing"
      class="now-playing"
      :class="[getNowPlayingClass(true), { 'now-playing--vinyl': isVinylMode }]"
    >
      <div class="controls" v-if="showControls">
        <button class="control-btn" @click="toggleVinylMode">
          Mode {{ isVinylMode ? 'Player' : 'LP' }}
        </button>
        <button class="control-btn" @click="toggleAlbum">
          Album {{ showAlbum ? 'On' : 'Off' }}
        </button>
      </div>

      <div class="now-playing__content-wrapper">
        <div class="now-playing__cover">
          <img :src="player.trackAlbum.image" :alt="player.trackTitle" class="now-playing__image" />
        </div>

        <div class="now-playing__side-panel">
          <div class="now-playing__details">
            <h1 class="now-playing__track">{{ player.trackTitle }}</h1>
            <h2 class="now-playing__artists">{{ getTrackArtists }}</h2>

            <div class="album-meta-group">
              <h3 v-if="showAlbum" class="now-playing__album">
                {{ player.trackAlbum.title }}
              </h3>
              <template v-if="showReleaseYear && releaseYear">
                <span class="separator" v-if="showAlbum">•</span>
                <span class="meta-text">{{ releaseYear }}</span>
              </template>
              <template v-if="showPopularity && popularityText">
                <span class="separator" v-if="showAlbum || (showReleaseYear && releaseYear)"
                  >•</span
                >
                <span class="meta-text">{{ popularityText }}</span>
              </template>
            </div>

            <div v-if="player.tags && player.tags.length > 0" class="vibe-tags-minimal">
              <span v-for="(tag, index) in player.tags" :key="tag" class="text-tag">
                #{{ tag }}<span v-if="index < player.tags.length - 1" class="tag-sep"> </span>
              </span>
            </div>

            <div class="now-playing__progress-container">
              <div class="now-playing__time">
                {{ formatTime(player.progressMs) }} / {{ formatTime(player.durationMs) }}
              </div>
              <div class="progress-bar">
                <div class="progress-bar__fill" :style="{ width: `${progressPercentage}%` }"></div>
              </div>
            </div>
          </div>

          <div class="meta-tracks-container" v-if="showPreviousTrack || showNextTrack">
            <div
              v-if="showPreviousTrack && player.previousTrack"
              class="meta-track meta-track--previous"
            >
              <div class="sleeve-wrapper">
                <img
                  v-if="player.previousTrack.image"
                  :src="player.previousTrack.image"
                  class="meta-track__image"
                  alt="Previous"
                />
                <div class="vinyl-label-overlay">Previous</div>
              </div>
              <div class="meta-track__details">
                <span class="label">Previous</span>
                <span class="track">{{ player.previousTrack.title }}</span>
                <span class="artist">{{ player.previousTrack.artist }}</span>
              </div>
            </div>

            <div v-if="showNextTrack && player.nextTrack" class="meta-track meta-track--next">
              <div class="sleeve-wrapper">
                <img
                  v-if="player.nextTrack.image"
                  :src="player.nextTrack.image"
                  class="meta-track__image"
                  alt="Next"
                />
                <div class="vinyl-label-overlay">Next</div>
              </div>
              <div class="meta-track__details">
                <span class="label">Next</span>
                <span class="track">{{ player.nextTrack.title }}</span>
                <span class="artist">{{ player.nextTrack.artist }}</span>
              </div>
            </div>
          </div>

          <div class="spotify-code" v-if="showSpotifyCode">
            <img :src="spotifyCodeUrl" alt="Scan to play" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="now-playing" :class="getNowPlayingClass(false)">
      <h1 class="now-playing__idle-heading">No music playing</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref } from 'vue'
import type { PlayerState, AuthState } from '@/types/Auth'
import { useAlbumColors } from '@/composables/useAlbumColors'

const isEinkMode = import.meta.env.VITE_DISPLAY_TYPE === 'eink'
const showControls = import.meta.env.VITE_SHOW_CONTROLS !== 'false'
const startVinyl = import.meta.env.VITE_START_IN_VINYL_MODE === 'true'

const startShowAlbum = import.meta.env.VITE_START_WITH_ALBUM_VISIBLE !== 'false'
const showReleaseYear = import.meta.env.VITE_SHOW_TRACK_YEAR !== 'false'
const showPopularity = import.meta.env.VITE_SHOW_TRACK_POPULARITY !== 'false'
const showPreviousTrack = import.meta.env.VITE_SHOW_PREVIOUS_TRACK !== 'false'
const showNextTrack = import.meta.env.VITE_SHOW_NEXT_TRACK !== 'false'
const showSpotifyCode = import.meta.env.VITE_SHOW_SPOTIFY_CODE !== 'false'

const props = defineProps<{
  auth: AuthState
  player: PlayerState
}>()

const { player } = toRefs(props)
const isVinylMode = ref(startVinyl)
const showAlbum = ref(startShowAlbum)

if (!isEinkMode) {
  useAlbumColors(computed(() => player.value.trackAlbum.image))
}

const getTrackArtists = computed((): string => props.player.trackArtists.join(', '))
const progressPercentage = computed(() => {
  if (!props.player.durationMs || props.player.durationMs === 0) return 0
  return (props.player.progressMs / props.player.durationMs) * 100
})
const releaseYear = computed(() => {
  if (!props.player.release_date) return null
  return props.player.release_date.split('-')[0]
})
const popularityText = computed(() => {
  const p = props.player.popularity
  if (p === undefined) return null
  if (p >= 90) return 'Global Smash'
  if (p >= 75) return 'Certified Hit'
  if (p >= 50) return 'Fan Favorite'
  if (p >= 25) return 'Underground'
  return 'Obscure Gem'
})
const spotifyCodeUrl = computed(() => {
  if (!props.player.trackId) return ''
  const uri = `spotify:track:${props.player.trackId}`
  if (isEinkMode) {
    return `https://scannables.scdn.co/uri/plain/jpeg/FFFFFF/black/640/${uri}`
  }
  return `https://scannables.scdn.co/uri/plain/jpeg/000000/white/640/${uri}`
})

function toggleVinylMode() {
  isVinylMode.value = !isVinylMode.value
}
function toggleAlbum() {
  showAlbum.value = !showAlbum.value
}
function getNowPlayingClass(isPlaying: boolean): string {
  return `now-playing--${isPlaying ? 'active' : 'idle'}`
}
function formatTime(ms: number): string {
  if (!ms) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
</script>

<style scoped lang="scss">
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  display: flex;
  gap: 10px;
}
.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid white;
  color: white;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 20px;
  font-size: 0.8rem;
  text-transform: uppercase;
  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
}

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

  &__content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: var(--spacing-l);
    box-sizing: border-box;
  }

  &__cover {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: var(--spacing-m);
    z-index: 1;
  }

  &__side-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__image {
    width: 100%;
    height: auto;
    max-width: 80vh;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    transition: all 0.5s ease;
  }

  &__details {
    text-align: center;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Standard styles */
  &__track {
    font-weight: var(--font-weight-heading);
    font-size: clamp(1.5rem, 5vw, 3.5rem);
    margin: 0;
    line-height: 1.1;
  }
  &__artists {
    opacity: 0.9;
    margin: 0;
    font-size: 1.4rem;
    font-weight: 300;
  }
  .album-meta-group {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    opacity: 0.7;
    font-size: 1rem;
    margin-bottom: 8px;
    .now-playing__album {
      margin: 0;
      font-weight: normal;
      font-style: italic;
    }
    .separator {
      font-size: 0.6rem;
      opacity: 0.5;
    }
  }
  .vibe-tags-minimal {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 12px;
    opacity: 0.6;
    .text-tag {
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: lowercase;
    }
    .tag-sep {
      margin: 0 6px;
    }
  }
  &__progress-container {
    width: 100%;
    max-width: 400px;
    margin: 10px auto;
  }
  &__time {
    font-variant-numeric: tabular-nums;
    opacity: 0.8;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
  .progress-bar {
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
    &__fill {
      height: 100%;
      background-color: #ffffff;
      transition: width 1s linear;
    }
  }

  .meta-tracks-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    .meta-track {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      opacity: 0.8;
      transition: opacity 0.3s ease;
      text-align: left;
      &:hover {
        opacity: 1;
      }
      .sleeve-wrapper {
        position: relative;
      }
      .vinyl-label-overlay {
        display: none;
      }
      &__image {
        width: 36px;
        height: 36px;
        border-radius: 3px;
        object-fit: cover;
      }
      &__details {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 0;
        .label {
          text-transform: uppercase;
          font-size: 0.6rem;
          opacity: 0.6;
          letter-spacing: 1px;
          display: block;
        }
        .track {
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .artist {
          display: none;
        }
      }
    }
  }

  .spotify-code {
    margin-top: 10px;
    width: 100%;
    display: flex;
    justify-content: center;
    opacity: 0.9;
    img {
      height: 40px;
      width: auto;
      border-radius: 2px;
      mix-blend-mode: screen;
    }
  }

  /* --- VINYL MODE --- */
  &--vinyl {
    background-color: #000000;

    .now-playing__content-wrapper {
      position: relative;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .now-playing__side-panel {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .now-playing__cover {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: auto;
      padding: 0;
      pointer-events: auto;
    }
    .now-playing__image {
      border-radius: 50%;
      width: 80vmin;
      height: 80vmin;
      max-width: none;
      animation: spin 10s linear infinite;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
      border: 2px solid rgba(20, 20, 20, 1);
    }

    .now-playing__details {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 22vmin;
      height: 22vmin;
      border-radius: 50%;
      background-color: var(--colour-background-now-playing);
      color: var(--color-text-primary);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      box-sizing: border-box;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6);
      background-image: radial-gradient(
        circle at center,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(0, 0, 0, 0.2) 100%
      );
      z-index: 10;
      pointer-events: auto;
    }

    .spotify-code,
    .vibe-tags-minimal,
    .album-meta-group {
      display: none;
    }

    .now-playing__progress-container {
      width: 70%;
      margin: 4px auto 0;
    }
    .now-playing__time {
      font-size: 0.5rem;
      margin-bottom: 2px;
      opacity: 0.7;
    }
    .progress-bar {
      height: 3px; /* Dunner */
      background-color: rgba(255, 255, 255, 0.3);
    }

    .now-playing__track {
      font-size: clamp(0.6rem, 1.8vmin, 1rem);
      margin-bottom: 2px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .now-playing__artists {
      font-size: clamp(0.5rem, 1.5vmin, 0.8rem);
    }

    .meta-tracks-container {
      position: absolute;
      bottom: 40px;
      left: 0;
      width: 100%;
      max-width: none;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      padding: 0 5vw;
      box-sizing: border-box;
      margin: 0;
      z-index: 5;
      pointer-events: none;
    }

    .meta-track {
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 1;
      transition: all 0.4s ease;
      max-width: 180px;

      &:hover {
        opacity: 1;
        z-index: 20;
      }

      .sleeve-wrapper {
        position: relative;
        width: 18vmin;
        height: 18vmin;
        max-width: 150px;
        max-height: 150px;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        background: #111;

        /* Het gat in het midden */
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20%;
          height: 20%;
          background-color: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          z-index: 2;
        }
      }

      &__image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover;
        z-index: 1;
        border-radius: 0;
      }

      .vinyl-label-overlay {
        display: block;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 2px 6px;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: bold;
        border-radius: 4px;
        z-index: 3;
        white-space: nowrap;
      }

      &__details {
        margin-top: 12px;
        text-align: center;
        opacity: 1;
        transition: opacity 0.3s;
        .label {
          display: none;
        }
        .track {
          font-size: 0.8rem;
          font-weight: bold;
          color: white;
          display: block;
          line-height: 1.2;
        }
        .artist {
          display: block;
          font-size: 0.7rem;
          color: #aaa;
          margin-top: 2px;
        }
      }

      &:hover .meta-track__details {
        opacity: 1;
      }
    }
  }

  @media only screen and (min-width: 768px) {
    &:not(.now-playing--vinyl) {
      .now-playing__content-wrapper {
        flex-direction: row;
        padding: 5%;
      }
      .now-playing__cover {
        justify-content: flex-end;
        padding-right: var(--spacing-xl);
        width: 50%;
      }
      .now-playing__side-panel {
        width: 50%;
        padding-left: var(--spacing-xl);
        justify-content: center;
        align-items: flex-start;
      }
      .now-playing__details {
        text-align: left;
        align-items: flex-start;
        width: 100%;
      }
      .now-playing__progress-container,
      .meta-tracks-container {
        margin-left: 0;
        margin-right: 0;
      }
      .album-meta-group,
      .vibe-tags-minimal,
      .meta-track,
      .spotify-code {
        justify-content: flex-start;
      }
      .now-playing__image {
        max-width: 600px;
      }
      .meta-track__image {
        width: 40px;
        height: 40px;
      }
    }
  }
}

.eink-mode {
  filter: grayscale(100%) contrast(120%);

  .now-playing {
    background-color: #ffffff !important;
    color: #000000 !important;
  }

  .now-playing__image {
    border: 4px solid #000000;
    box-shadow: none !important;
  }

  .progress-bar {
    background-color: #ccc !important;
    border: 1px solid black;
  }

  .progress-bar__fill {
    background-color: black !important;
    transition: none !important;
  }

  .spotify-code img {
    mix-blend-mode: normal !important;
  }

  .now-playing--vinyl {
    background-color: #ffffff !important;

    .now-playing__image {
      animation: none;
      border: 4px solid black;
    }

    .now-playing__details {
      background-color: #fff;
      border: 2px solid black;
      color: black;

      .now-playing__track,
      .now-playing__artists {
        color: #000000 !important;
      }
    }

    .meta-track {
      .vinyl-label-overlay {
        background: #fff;
        color: #000;
        border: 1px solid black;
      }

      &__image {
        border: 2px solid black;
      }

      .track {
        color: #000000 !important;
      }
      .artist {
        color: #000000 !important;
      }
    }
  }
}
</style>
