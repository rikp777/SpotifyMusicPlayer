<template>
  <div
    class="meta-track"
    :class="[`meta-track--${type}`, { 'is-vinyl': isVinylMode }]"
  >
    <div class="sleeve-wrapper">
      <img :src="track.image" class="meta-track__image" :alt="label" />
      <div v-if="type !== 'top' && isVinylMode" class="vinyl-hole"></div>
    </div>

    <div class="meta-track__details">
      <span class="label">{{ label }}</span>
      <span class="track">{{ track.title }}</span>
      <span class="artist">{{ track.artist }}</span>
      <span v-if="type === 'top' && track.playCount" class="play-count">
        {{ track.playCount }} plays
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SimpleTrack {
  title: string
  artist: string
  image: string
  playCount?: number
}

defineProps<{
  track: SimpleTrack
  type: 'previous' | 'next' | 'top'
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

  &__image { width: 100%; height: 100%; object-fit: cover; }

  .sleeve-wrapper {
    position: relative;
    width: 48px; height: 48px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
  }

  &__details {
    display: flex; flex-direction: column; justify-content: center; min-width: 0;
    .label { text-transform: uppercase; font-size: 0.6rem; opacity: 0.6; letter-spacing: 1px; display: block; }
    .track { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    .play-count { font-size: 0.7rem; opacity: 0.8; margin-top: 2px; font-style: italic; }
  }

  &:hover { opacity: 1; transform: translateX(5px); }

  &.is-vinyl {
    &:hover { transform: scale(1.05) rotate(-2deg); }

    &.meta-track--previous,
    &.meta-track--next {
      flex-direction: column; align-items: center; gap: 0;

      .sleeve-wrapper {
        width: 18vmin; height: 18vmin;
        max-width: 150px; max-height: 150px;
        border-radius: 50%; /* Rond */
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        background: #111;
        border: 1px solid rgba(255,255,255,0.1);
      }

      .vinyl-hole {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 20%; height: 20%;
        background-color: #1a1a1a;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 50%; z-index: 2;
      }

      .meta-track__details {
        margin-top: 10px; text-align: center;
        .label {
          background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;
          display: inline-block; font-size: 0.7rem; margin-bottom: 4px;
        }
        .track { color: white; white-space: normal; }
        .artist { display: block; font-size: 0.75rem; color: #aaa; }
      }
    }

    &.meta-track--top {
      background: #ffcc00; /* Hype Sticker Geel */
      background: linear-gradient(135deg, #ffcc00 0%, #ffdb4d 100%);
      color: #000;
      padding: 10px 15px;
      border-radius: 4px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
      flex-direction: row;
      min-width: 220px;
      transform: rotate(-3deg);

      .sleeve-wrapper {
        width: 50px; height: 50px;
        border-radius: 2px;
        border: 1px solid rgba(0,0,0,0.2);
        box-shadow: none;
      }

      .meta-track__details {
        align-items: flex-start;
        .label { color: #000; opacity: 0.6; font-weight: 900; letter-spacing: 0; font-size: 0.55rem; border: 1px solid #000; padding: 1px 3px; border-radius: 2px; }
        .track { color: #000; font-size: 0.95rem; font-weight: 800; white-space: normal; line-height: 1.1; margin-top: 2px;}
        .artist { color: #333; font-weight: 600; font-size: 0.8rem; }
        .play-count { color: #444; }
      }
    }
  }
}

/* ===========================
   E-INK MODE OVERRIDES
   =========================== */
:global(.eink-mode) .meta-track {
  opacity: 1;
  .track, .artist, .label, .play-count { color: #000000 !important; }

  .sleeve-wrapper { border: 2px solid black !important; box-shadow: none !important; }

  &.is-vinyl.meta-track--previous .vinyl-hole,
  &.is-vinyl.meta-track--next .vinyl-hole {
    background: white; border: 1px solid black;
  }

  &.is-vinyl.meta-track--top {
    background: white !important;
    border: 3px solid black;
    box-shadow: 4px 4px 0px rgba(0,0,0,1);

    .label { border-color: black; }
  }
}
</style>
