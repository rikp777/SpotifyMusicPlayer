<template>
  <div class="no-music-playing" :class="{ 'eink-mode': isEinkMode }">

    <div class="art-background-container">
      <div class="image-box" v-if="artImage">
        <img
          :src="artImage"
          :alt="artTitle || 'Modern Art Background'"
          class="background-art"
          :class="{ 'is-loading': isLoading }"
        />

        <div class="art-credits" v-if="artTitle">
          <span class="art-title">{{ artTitle }}</span>
          <span v-if="artArtist" class="art-artist">{{ artArtist }}</span>
        </div>
      </div>

      <div class="gradient-overlay"></div>
    </div>

    <div class="content-overlay">
      <div class="message-container">
        <h1 class="quote-text">
          "{{ quote }}"
        </h1>

        <div class="quote-attribution">
          <span class="kanye-tag">- Kanye West</span>
        </div>
      </div>

      <button
        v-if="!isEinkMode"
        class="refresh-btn"
        @click="refreshContent"
        :disabled="isLoading"
        title="New Inspiration"
      >
        <span class="icon" :class="{ 'spinning': isLoading }">↻</span>
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  isEinkMode: boolean
}>()

const quote = ref('Loading inspiration...')
const artImage = ref('')
const artTitle = ref('')
const artArtist = ref('')
const isLoading = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | null = null

const fetchQuote = async () => {
  try {
    const res = await fetch('https://api.kanye.rest/')
    const data = await res.json()
    if (data && data.quote) {
      quote.value = data.quote
    }
  } catch (e) {
    quote.value = "I'm not a businessman, I'm a business, man!"
  }
}

const fetchArt = async () => {
  try {
    const searchTerms = ['abstract', 'modern art', 'geometric', 'sunflowers', 'landscape', 'pop art', 'minimalism'];
    const randomSearchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const searchRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(randomSearchTerm)}&hasImages=true&isPublicDomain=true`);
    const searchData = await searchRes.json();

    let objectIDs = searchData.objectIDs || [];

    if (objectIDs.length === 0) {
      const fallbackRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=art&hasImages=true&isPublicDomain=true`);
      const fallbackData = await fallbackRes.json();
      objectIDs = fallbackData.objectIDs || [];
    }

    if (objectIDs.length === 0) return;

    let foundImage = false
    let attempts = 0
    const maxAttempts = 5;

    while (!foundImage && attempts < maxAttempts) {
      const randomIndex = Math.floor(Math.random() * objectIDs.length)
      const objectId = objectIDs[randomIndex]

      const objRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`)
      const objData = await objRes.json()

      if ((objData.primaryImage && objData.primaryImage.length > 0) || (objData.primaryImageSmall && objData.primaryImageSmall.length > 0)) {
        artImage.value = objData.primaryImage || objData.primaryImageSmall
        artTitle.value = objData.title || "Untitled"
        artArtist.value = objData.artistDisplayName || "Unknown Artist"
        foundImage = true
      }
      attempts++
    }
  } catch (e) {
    console.error("Failed to fetch art", e)
  }
}

const refreshContent = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  await Promise.all([fetchQuote(), fetchArt()]);
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
}

onMounted(() => {
  refreshContent();
  refreshTimer = setInterval(() => {
    refreshContent();
  }, 7 * 60 * 1000);
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
})
</script>

<style scoped lang="scss">
.no-music-playing {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  background-color: #1a1a1a;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

.art-background-container {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-box {
  position: relative;
  display: flex;
  max-width: 100vw;
  max-height: 100vh;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
}

.background-art {
  display: block;
  width: auto;
  height: auto;

  max-width: 100vw;
  max-height: 100vh;

  object-fit: contain;
  filter: brightness(0.5) saturate(1.2);
  transition: filter 0.5s ease, opacity 0.5s ease;

  &.is-loading {
    opacity: 0.5;
    filter: brightness(0.3) blur(2px);
  }
}

.gradient-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: radial-gradient(circle at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 100%);
  z-index: 1;
  pointer-events: none;
}

.art-credits {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;

  text-align: right;
  font-size: 0.6rem;
  opacity: 0.6;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 200px;
  transition: opacity 0.3s ease;
  text-shadow: 0 1px 2px rgba(0,0,0,1);

  background: linear-gradient(to left, rgba(0,0,0,0.3), transparent);
  padding: 5px 10px;
  border-radius: 4px;

  &:hover {
    opacity: 1;
    background: linear-gradient(to left, rgba(0,0,0,0.6), transparent);
  }

  .art-title { font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
  .art-artist { font-style: italic; }
}

.content-overlay {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: var(--spacing-l);
  box-sizing: border-box;
  pointer-events: none;
}

.message-container {
  width: 100%;
  max-width: 900px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: center;
  flex-grow: 1;
}

.quote-text {
  font-family: 'Georgia', serif;
  font-size: clamp(1.8rem, 6vw, 3.5rem);
  font-weight: 700;
  font-style: italic;
  line-height: 1.3;
  margin: 0;
}

.quote-attribution {
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  opacity: 0.8;
}

.refresh-btn {
  pointer-events: auto;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  background: transparent;
  border: none;
  color: rgba(255,255,255,0.3);

  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: rgba(255,255,255,0.9);
    transform: translateX(-50%) rotate(180deg);
  }

  .icon {
    font-size: 1rem;
    line-height: 1;
    &.spinning {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin { 100% { transform: rotate(360deg); } }


/* --- E-INK MODE --- */
.eink-mode {
  background-color: #FFFFFF;
  color: #000000;
  text-shadow: none;

  .image-box {
    box-shadow: none;
  }

  .art-background-container .background-art {
    filter: grayscale(100%) contrast(1.2) brightness(1.0);
    opacity: 0.2;
  }

  .gradient-overlay { background: none; }

  .quote-text, .quote-attribution {
    color: #000000;
    opacity: 1;
  }

  .art-credits {
    color: #000000;
    opacity: 1;
    text-shadow: none;
    background: none;
  }
}
</style>
