<template>
  <div class="authorise">
    <h1 class="authorise__heading">Authorise</h1>

    <p class="authorise__copy">
      Log in and start listening to music!
    </p>

    <button
      class="authorise__button button button--authorise"
      @click="initAuthorise"
    >
      Log in with Spotify
    </button>
  </div>
</template>

<script setup lang="ts">

import { useSpotifyAuth } from '@/composables/useSpotifyAuth.ts'

const { initAuthorise } = useSpotifyAuth();
</script>

<style scoped>
.authorise {
  align-items: center;
  background-color: var(--colour-background-now-playing);
  color: var(--color-text-primary);
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: center;
  padding: var(--spacing-l);
}

.authorise__copy {
  max-width: 480px;
  text-align: center;
  margin: 0 0 var(--spacing-m) 0;
}

.authorise__button {
  margin-bottom: var(--spacing-l);
}

.authorise__credit {
  opacity: 0.8;
  font-size: 0.7em;
}

.authorise__credit a {
  color: inherit;
}

.button {
  align-items: center;
  appearance: none;
  background-color: transparent;
  border: 1px solid transparent;
  color: var(--colour-text-secondary);
  display: inline-flex;
  font-weight: var(--font-weight-heading);
  min-height: 32px;
  padding: var(--spacing-l) var(--spacing-xl);
  text-align: center;
  text-transform: uppercase;
  cursor: pointer;
}

.button--authorise {
  background-color: var(--color-brand-spotify);
  color: var(--color-text-primary);
}
</style>
