<template>
  <div
    v-if="tags && tags.length > 0"
    class="vibe-tags-minimal"
    :class="{ 'is-eink': isEinkMode }"
  >
    <span v-for="(tag, index) in tags" :key="tag" class="text-tag">
      #{{ tag }}<span v-if="index < tags.length - 1" class="tag-sep"> </span>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tags: string[]
  isEinkMode: boolean
}>()
</script>

<style scoped lang="scss">
.vibe-tags-minimal {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
  opacity: 0.6;
  width: 100%;

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

/* --- DESKTOP OVERRIDES --- */
@media (min-width: 768px) {
  .vibe-tags-minimal {
    justify-content: flex-start;
  }
}

/* --- E-INK MODE --- */
.vibe-tags-minimal.is-eink {
  opacity: 1 !important;

  .text-tag {
    color: #000000 !important;
    font-weight: bold;
  }
}
</style>
