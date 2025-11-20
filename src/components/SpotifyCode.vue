<template>
  <div class="spotify-code" :class="{ 'is-eink': isEinkMode }">
    <img :src="codeUrl" alt="Scan to play on Spotify" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  trackId: string
  isEinkMode: boolean
}>()

const codeUrl = computed(() => {
  if (!props.trackId) return ''
  const uri = `spotify:track:${props.trackId}`

  if (props.isEinkMode) {
    return `https://scannables.scdn.co/uri/plain/jpeg/FFFFFF/black/640/${uri}`
  }

  return `https://scannables.scdn.co/uri/plain/jpeg/000000/white/640/${uri}`
})
</script>

<style scoped lang="scss">
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

/* --- DESKTOP OVERRIDES --- */
@media (min-width: 768px) {
  .spotify-code {
    justify-content: flex-start;
  }
}

/* --- E-INK MODE --- */
.spotify-code.is-eink {
  opacity: 1;

  img {
    mix-blend-mode: normal !important;
    image-rendering: pixelated;
  }
}
</style>
