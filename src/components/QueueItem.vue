<template>
  <div
    class="meta-track"
    :class="[`meta-track--${type}`, { 'is-vinyl': isVinylMode }]"
  >
    <div class="sleeve-wrapper">
      <img :src="track.image" class="meta-track__image" :alt="label" />
      <div class="vinyl-label-overlay">{{ label }}</div>
    </div>
    <div class="meta-track__details">
      <span class="label">{{ label }}</span>
      <span class="track">{{ track.title }}</span>
      <span class="artist">{{ track.artist }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SimpleTrack {
  title: string
  artist: string
  image: string
}

defineProps<{
  track: SimpleTrack
  type: 'previous' | 'next'
  label: string
  isVinylMode: boolean
}>()
</script>

<style scoped lang="scss">
.meta-track {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  opacity: 0.9;
  transition: all 0.3s ease;
  text-align: left;

  &:hover { opacity: 1; z-index: 20; }

  .sleeve-wrapper {
    position: relative;
    width: 48px; height: 48px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    &::after { display: none; }
  }
  .vinyl-label-overlay { display: none; }
  &__image { width: 100%; height: 100%; object-fit: cover; }

  &__details {
    display: flex; flex-direction: column; justify-content: center; min-width: 0;
    .label { text-transform: uppercase; font-size: 0.6rem; opacity: 0.6; letter-spacing: 1px; display: block; }
    .track { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
  }

  &.is-vinyl {
    flex-direction: column; align-items: center; gap: 0;
    &:hover { transform: scale(1.05); }

    .sleeve-wrapper {
      width: 18vmin; height: 18vmin;
      max-width: 150px; max-height: 150px;
      border-radius: 50%;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
      background: #111;

      &::after {
        display: block; content: '';
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 20%; height: 20%;
        background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 50%; z-index: 2;
      }
    }

    .vinyl-label-overlay {
      display: block; position: absolute; top: 80%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8); color: #fff;
      padding: 2px 6px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;
      border-radius: 4px; z-index: 3; white-space: nowrap;
    }

    .meta-track__details {
      margin-top: 8px; text-align: center;
      .label { display: none; }
      .track { color: white; }
      .artist { display: block; font-size: 0.7rem; color: #aaa; margin-top: 2px; }
    }
  }
}

:global(.eink-mode) .meta-track {
  .sleeve-wrapper { border: 2px solid black; box-shadow: none !important; }
  .vinyl-label-overlay { background: #fff; color: #000; border: 1px solid black; }
  .track, .artist { color: #000000 !important; }
}
</style>
