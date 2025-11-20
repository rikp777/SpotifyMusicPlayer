<template>
  <div
    v-if="!isEinkMode"
    class="progress-container"
    :class="{ 'is-vinyl': isVinylMode }"
  >
    <div class="time">
      {{ formatTime(currentMs) }} / {{ formatTime(durationMs) }}
    </div>
    <div class="bar">
      <div class="bar__fill" :style="{ width: `${percentage}%` }"></div>
    </div>
  </div>

  <div
    v-else
    class="eink-timestamp"
    :class="{ 'is-vinyl': isVinylMode }"
  >
    {{ formatTime(durationMs) }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentMs: number
  durationMs: number
  isVinylMode: boolean
  isEinkMode: boolean
}>()

const percentage = computed(() => {
  if (!props.durationMs) return 0
  return (props.currentMs / props.durationMs) * 100
})

function formatTime(ms: number): string {
  if (!ms) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
</script>

<style scoped>
/* --- LCD Styles --- */
.progress-container {
  width: 100%;
  max-width: 400px;
  margin: 10px auto;
  text-align: center;
}

.time {
  font-variant-numeric: tabular-nums;
  opacity: 0.8;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.bar {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.bar__fill {
  height: 100%;
  background-color: #ffffff;
  transition: width 1s linear;
}

/* --- Vinyl Mode Overrides --- */
.progress-container.is-vinyl {
  width: 70%;
  max-width: none;
  margin: 4px auto 0;
}

.progress-container.is-vinyl .time {
  font-size: 0.7rem;
  margin-bottom: 4px;
  opacity: 0.9;
  font-weight: 500;
}

.progress-container.is-vinyl .bar {
  height: 2px;
  background-color: rgba(255, 255, 255, 0.3);
}

/* --- E-ink Style --- */
.eink-timestamp {
  font-family: monospace;
  font-size: 0.8rem;
  margin-top: 0.2rem;
  font-weight: bold;
  opacity: 0.8;
  color: #000000;
  text-align: center;
  width: 100%;
}

.eink-timestamp.is-vinyl {
  font-size: 0.75rem;
  margin-top: 0;
}

/* --- Desktop Overrides --- */
@media (min-width: 768px) {
  .progress-container:not(.is-vinyl) {
    margin-left: 0;
    margin-right: 0;
    text-align: left;
  }

  .eink-timestamp:not(.is-vinyl) {
    text-align: left;
  }
}
</style>
