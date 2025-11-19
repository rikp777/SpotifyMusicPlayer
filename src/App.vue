<script setup lang="ts">
import { computed } from 'vue';
import Authorise from '@/components/Authorise.vue';
import NowPlaying from '@/components/NowPlaying.vue';
import { useSpotifyApi } from '@/composables/useSpotifyApi.ts';
import { useAuth } from '@/composables/useAuth.ts';

const {
  auth,
  isAuthorized,
  requestAccessTokens
} = useAuth();

const handleTokenRefreshRequest = () => {

  requestAccessTokens('refresh_token');
};

const { playerState } = useSpotifyApi(auth, handleTokenRefreshRequest);

const currentComponent = computed(() => {
  return isAuthorized.value ? NowPlaying : Authorise;
});
</script>

<template>
  <div id="app">
    <Component
      :is="currentComponent"
      :auth="auth"
      :player="playerState"
      @requestRefreshToken="handleTokenRefreshRequest"
    ></Component>
  </div>
</template>
