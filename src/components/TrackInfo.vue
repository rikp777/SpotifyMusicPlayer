<template>
  <div
    class="track-info"
    :class="{
      'is-eink': isEinkMode,
      'is-vinyl': isVinylMode,
    }"
  >
    <h1 class="track-title">{{ title }}</h1>

    <h2 class="track-artists">{{ formattedArtists }}</h2>

    <div class="album-meta-group">
      <h3 v-if="showAlbum" class="album-name">
        {{ albumName }}
      </h3>

      <template v-if="showReleaseYear && releaseYear">
        <span class="separator" v-if="showAlbum">•</span>
        <span class="meta-text">{{ releaseYear }}</span>
      </template>
    </div>

    <div v-if="!isVinylMode && showPopularity && popularityText" class="popularity-text">
      {{ popularityText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getEnvBoolean } from '@/utils/general.ts'



const props = defineProps<{
  title: string
  artists: string[]
  albumName: string
  releaseDate?: string
  popularity?: number

  isEinkMode: boolean
  isVinylMode: boolean
}>()

const showAlbum = computed(() => {
  return getEnvBoolean('SHOW_ALBUM', props.isVinylMode)
})
const showReleaseYear = computed(() => {
  return getEnvBoolean('SHOW_TRACK_YEAR', props.isVinylMode)
})
const showPopularity = computed(() => {
  return getEnvBoolean('SHOW_TRACK_POPULARITY', props.isVinylMode)
})

const formattedArtists = computed(() => props.artists.join(', '))

const releaseYear = computed(() => {
  if (!props.releaseDate) return null
  return props.releaseDate.split('-')[0]
})

const popularityText = computed(() => {
  const p = props.popularity
  if (p === undefined) return null
  if (p >= 90) return 'Global Smash'
  if (p >= 75) return 'Certified Hit'
  if (p >= 50) return 'Fan Favorite'
  if (p >= 25) return 'Underground'
  return 'Obscure Gem'
})
</script>

<style scoped lang="scss">
.track-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  align-items: center;
}

.track-title {
  font-weight: var(--font-weight-heading, 700);
  font-size: clamp(1.5rem, 5vw, 3.5rem);
  margin: 0;
  line-height: 1.1;
}

.track-artists {
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
  flex-wrap: wrap;

  .album-name {
    margin: 0;
    font-weight: normal;
    font-style: italic;
    font-size: 1rem;
  }

  .separator {
    font-size: 0.6rem;
    opacity: 0.5;
  }
}

.popularity-text {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* --- DESKTOP OVERRIDES --- */
@media (min-width: 768px) {
  .track-info:not(.is-vinyl) {
    text-align: left;
    align-items: flex-start;
  }

  .track-info:not(.is-vinyl) .album-meta-group {
    justify-content: flex-start;
  }
}

/* --- VINYL MODE STYLES --- */
.track-info.is-vinyl {
  gap: 2px;
  width: 100%;
  text-align: center;
  align-items: center;

  .track-title {
    font-size: clamp(1.1rem, 3vmin, 1.5rem);
    margin-bottom: 4px;
    line-height: 1.0;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .track-artists {
    font-size: clamp(0.6rem, 1.8vmin, 0.9rem);
  }

  .album-meta-group {
    font-size: 0.6rem;
    .album-name { font-size: 0.6rem; }
  }
}

/* --- E-INK MODE --- */
.track-info.is-eink {
  .track-title,
  .track-artists,
  .album-meta-group,
  .meta-text,
  .album-name,
  .popularity-badge {
    color: #000000 !important;
    opacity: 1 !important;
    border-color: #000000 !important;
  }

  .separator {
    color: #000000;
    opacity: 1;
  }
}
</style>
