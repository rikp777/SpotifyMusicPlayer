<template>
  <div class="track-detail-overlay" @click.self="$emit('close')">
    <div
      class="detail-card"
      :class="{ 'is-vinyl': isVinylMode, 'is-eink': isEinkMode }"
    >
      <button class="close-btn" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div class="content-row">
        <div class="image-container">
          <a
            v-if="track.url"
            :href="track.url"
            target="_blank"
            class="art-link"
          >
            <img :src="track.image" :alt="track.title" class="album-art" />
            <div v-if="isVinylMode && !isEinkMode" class="vinyl-glare"></div>
            <div class="hover-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </div>
          </a>

          <template v-else>
            <img :src="track.image" :alt="track.title" class="album-art" />
            <div v-if="isVinylMode && !isEinkMode" class="vinyl-glare"></div>
          </template>
        </div>

        <div class="info-container">
          <div class="text-group">
            <span class="label">{{ label }}</span>

            <h2 class="title">
              <a
                v-if="track.url"
                :href="track.url"
                target="_blank"
                class="text-link"
              >
                {{ track.title }}
              </a>
              <span v-else>{{ track.title }}</span>
            </h2>

            <h3 class="artist">{{ track.artist }}</h3>
          </div>

          <div v-if="track.playCount" class="stats-box">
            <div class="stat-circle">
              <span class="stat-number">{{ track.playCount }}</span>
              <span class="stat-label">Plays</span>
            </div>
            <div class="stat-context" v-if="label.includes('Obsession')">
              This Month
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SimpleTrack {
  title: string
  artist: string
  image: string
  playCount?: number
  url?: string
}

defineProps<{
  track: SimpleTrack
  label: string
  isVinylMode: boolean
  isEinkMode: boolean
}>()

defineEmits(['close'])
</script>

<style scoped lang="scss">
.track-detail-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.detail-card {
  position: relative;
  width: 90%; max-width: 800px;
  color: white;
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.content-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  @media (min-width: 600px) {
    flex-direction: row;
    align-items: center;
    text-align: left;
  }
}

.image-container {
  position: relative;
  width: 100%; max-width: 300px;
  aspect-ratio: 1;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  .album-art { width: 100%; height: 100%; object-fit: cover; }

  .art-link {
    display: block; width: 100%; height: 100%; cursor: pointer; position: relative;
    &:hover .hover-icon { opacity: 1; }
  }

  .hover-icon {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.6); padding: 10px; border-radius: 50%;
    color: white; opacity: 0; transition: opacity 0.3s;
    display: flex; align-items: center; justify-content: center;
  }
}

.info-container {
  display: flex; flex-direction: column; gap: 2rem;
  align-items: center;

  @media (min-width: 600px) {
    align-items: flex-start;
  }

  .label {
    text-transform: uppercase; letter-spacing: 3px; font-size: 0.75rem;
    opacity: 0.6; margin-bottom: 0.5rem; display: block; border: 1px solid rgba(255,255,255,0.3);
    padding: 4px 8px; border-radius: 4px; width: fit-content;
  }

  .title {
    font-size: 2.2rem; margin: 0; line-height: 1.1; font-weight: 700;

    .text-link {
      color: inherit; text-decoration: none; border-bottom: 2px solid transparent; transition: border-color 0.2s;
      &:hover { border-bottom-color: rgba(255,255,255,0.5); }
    }
  }

  .artist { font-size: 1.2rem; margin: 0.5rem 0 0 0; opacity: 0.8; font-weight: 400; }
}

/* DE PLAY COUNT STYLING */
.stats-box {
  display: flex; align-items: center; gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  padding: 10px 20px 10px 10px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-circle {
  background: #ffcc00;
  color: black;
  width: 60px; height: 60px;
  border-radius: 50%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  line-height: 1;
  box-shadow: 0 5px 15px rgba(255, 204, 0, 0.3);
}

.stat-number { font-weight: 800; font-size: 1.2rem; }
.stat-label { font-size: 0.6rem; text-transform: uppercase; font-weight: 600; }
.stat-context { font-size: 0.9rem; opacity: 0.8; }

.close-btn {
  position: absolute; top: -50px; right: 0;
  background: rgba(255,255,255,0.1); border: none; border-radius: 50%;
  width: 40px; height: 40px;
  color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255,255,255,0.2); }
}

/* --- VINYL MODE --- */
.is-vinyl {
  .image-container { border-radius: 2px; }
  .vinyl-glare {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

/* --- E-INK MODE --- */
.track-detail-overlay:has(.is-eink) { background: rgba(255, 255, 255, 0.95); backdrop-filter: none; }
.is-eink {
  color: black;
  .image-container { box-shadow: none; border: 4px solid black; }
  .label { border-color: black; opacity: 1; }
  .close-btn { color: black; border: 2px solid black; background: transparent; }

  .stats-box { background: transparent; border: 2px solid black; border-radius: 0; }
  .stat-circle {
    background: white; color: black; border: 2px solid black; box-shadow: none;
  }

  .title .text-link:hover { border-bottom-color: black; }
  .hover-icon { color: black; background: rgba(255,255,255,0.8); border: 1px solid black; }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
