<template>
  <div id="app">
    <div
      v-if="player.playing"
      class="now-playing"
      :class="[getNowPlayingClass(true), { 'now-playing--vinyl': isVinylMode }]"
    >
      <div class="controls">
        <button class="control-btn" @click="toggleVinylMode">
          {{ isVinylMode ? 'List' : 'LP' }}
        </button>
        <button class="control-btn" @click="toggleAlbum">
          Album {{ showAlbum ? 'On' : 'Off' }}
        </button>
      </div>

      <div class="now-playing__content-wrapper">
        <div class="now-playing__cover">
          <img
            :src="player.trackAlbum.image"
            :alt="player.trackTitle"
            class="now-playing__image"
          />
        </div>

        <div class="now-playing__details">
          <h1 class="now-playing__track">{{ player.trackTitle }}</h1>
          <h2 class="now-playing__artists">{{ getTrackArtists }}</h2>
          <h3 v-if="showAlbum" class="now-playing__album">{{ player.trackAlbum.title }}</h3>

          <div class="now-playing__progress-container">
            <div class="now-playing__time">
              {{ formatTime(player.progressMs) }} / {{ formatTime(player.durationMs) }}
            </div>
            <div class="progress-bar">
              <div
                class="progress-bar__fill"
                :style="{ width: `${progressPercentage}%` }"
              ></div>
            </div>
          </div>

          <div class="meta-tracks-container">
            <div v-if="player.previousTrack" class="meta-track meta-track--previous">
              <img
                v-if="player.previousTrack.image"
                :src="player.previousTrack.image"
                class="meta-track__image"
                alt="Previous cover"
              />
              <div class="meta-track__details">
                <span class="label">Previous:</span>
                <span class="track">{{ player.previousTrack.title }}</span>
                <span class="artist">{{ player.previousTrack.artist }}</span>
              </div>
            </div>

            <div v-if="player.nextTrack" class="meta-track meta-track--next">
              <img
                v-if="player.nextTrack.image"
                :src="player.nextTrack.image"
                class="meta-track__image"
                alt="Next cover"
              />
              <div class="meta-track__details">
                <span class="label">Next:</span>
                <span class="track">{{ player.nextTrack.title }}</span>
                <span class="artist">{{ player.nextTrack.artist }}</span>
              </div>
            </div>
          </div>

          <div class="spotify-code">
            <img :src="spotifyCodeUrl" alt="Scan to play" />
          </div>

        </div>
      </div>
    </div>

    <div v-else class="now-playing" :class="getNowPlayingClass(false)">
      <h1 class="now-playing__idle-heading">No music playing 😔</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref } from 'vue';
import type { PlayerState, AuthState } from '@/types/Auth';
import { useAlbumColors } from '@/composables/useAlbumColors';

const props = defineProps<{
  auth: AuthState;
  player: PlayerState;
}>();

const { player } = toRefs(props);
const isVinylMode = ref(false);
const showAlbum = ref(true);

const albumImageUrl = computed(() => player.value.trackAlbum.image);

useAlbumColors(albumImageUrl);

const getTrackArtists = computed((): string => {
  return props.player.trackArtists.join(', ');
});

const progressPercentage = computed(() => {
  if (!props.player.durationMs || props.player.durationMs === 0) return 0;
  return (props.player.progressMs / props.player.durationMs) * 100;
});

function toggleVinylMode() {
  isVinylMode.value = !isVinylMode.value;
}

function toggleAlbum() {
  showAlbum.value = !showAlbum.value;
}

function getNowPlayingClass(isPlaying: boolean): string {
  return `now-playing--${isPlaying ? 'active' : 'idle'}`;
}

function formatTime(ms: number): string {
  if (!ms) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const spotifyCodeUrl = computed(() => {
  if (!props.player.trackId) return '';
  const uri = `spotify:track:${props.player.trackId}`;
  return `https://scannables.scdn.co/uri/plain/jpeg/000000/white/640/${uri}`;
});
</script>

<style scoped lang="scss">
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
    padding-bottom: var(--spacing-xl);
    z-index: 2;
    transition: all 0.5s ease;
    width: 100%;
  }

  &__track {
    font-weight: var(--font-weight-heading);
    font-size: clamp(1.5rem, 5vw, 3rem);
    margin: var(--spacing-m) 0;
    line-height: 1.1;
  }

  &__artists {
    opacity: 0.8;
    margin-bottom: var(--spacing-m);
    font-size: 1.2rem;
  }

  &__album {
    opacity: 0.6;
    font-weight: normal;
    font-size: 1rem;
    margin-bottom: var(--spacing-m);
    font-style: italic;
  }

  &__progress-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  &__time {
    font-variant-numeric: tabular-nums;
    opacity: 0.8;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    overflow: hidden;

    &__fill {
      height: 100%;
      background-color: var(--color-brand-spotify);
      transition: width 1s linear;
    }
  }

  /* Meta Tracks (Prev/Next) */
  .meta-tracks-container {
    margin-top: var(--spacing-xl);
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .meta-track {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    opacity: 0.6;
    transition: opacity 0.3s ease;
    text-align: left;

    &:hover {
      opacity: 1;
    }

    &__image {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    &__details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }

    .label {
      text-transform: uppercase;
      font-size: 0.65rem;
      opacity: 0.6;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }

    .track {
      font-weight: 600;
      font-size: 0.9rem;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist {
      font-size: 0.8rem;
      opacity: 0.7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  /* Spotify Code Styling */
  .spotify-code {
    margin-top: var(--spacing-xl);
    width: 100%;
    display: flex;
    justify-content: center;
    opacity: 0.8;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }

    img {
      height: 50px;
      width: auto;
      border-radius: 2px;
    }
  }

  /* Vinyl Mode Styling */
  &--vinyl {
    background-color: #000000;

    .now-playing__content-wrapper {
      position: relative;
      justify-content: center;
    }

    .now-playing__cover {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 0;
      width: auto;
    }

    .now-playing__image {
      border-radius: 50%;
      width: 95vmin;
      height: 95vmin;
      max-width: none;
      object-fit: cover;
      animation: spin 10s linear infinite;
      box-shadow: 0 0 50px rgba(0,0,0,0.5);
    }

    .now-playing__details {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 32vmin;
      height: 32vmin;
      border-radius: 50%;
      background-color: var(--colour-background-now-playing);
      color: var(--color-text-primary);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      box-sizing: border-box;
      background-image: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%);
      box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
    }

    .progress-bar__fill {
      background-color: var(--color-text-primary);
    }

    .now-playing__track {
      font-size: clamp(0.8rem, 2.2vmin, 1.2rem);
      margin: 0 0 2px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .now-playing__artists {
      font-size: clamp(0.6rem, 2vmin, 1rem);
      margin: 0 0 4px 0;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .now-playing__album {
      font-size: clamp(0.5rem, 1.8vmin, 0.8rem);
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .now-playing__progress-container {
      max-width: 80%;
    }

    .now-playing__time {
      font-size: 0.6rem;
      margin-bottom: 4px;
    }

    .progress-bar {
      height: 4px;
    }

    .meta-tracks-container,
    .spotify-code {
      display: none;
    }
  }

  /* Desktop Layout */
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

      .now-playing__details {
        text-align: left;
        width: 50%;
        padding-left: var(--spacing-xl);
        align-items: flex-start;
      }

      .now-playing__progress-container,
      .meta-tracks-container {
        margin-left: 0;
        margin-right: 0;
      }

      .meta-track {
        justify-content: flex-start;
      }

      .spotify-code {
        justify-content: flex-start;
      }

      .now-playing__image {
        max-width: 500px;
      }
    }
  }
}
</style>
