import { ref, watch, onUnmounted, readonly } from 'vue';
import type { Ref } from 'vue';
import type { MusicProvider } from '@/types/MusicProvider';
import type { PlayerState } from '@/types/Auth';

export function useMusicPlayer(providerRef: Ref<MusicProvider>) {
  function getEmptyState(): PlayerState {
    return {
      playing: false,
      trackArtists: [],
      trackTitle: 'Waiting for music...',
      trackAlbum: {},
      progressMs: 0,
      durationMs: 0,
      nextTrack: undefined,
      previousTrack: undefined,
      tags: []
    };
  }

  const playerState = ref<PlayerState>(getEmptyState());

  let pollTimer: number | undefined;
  let progressTimer: number | undefined;

  async function fetchState() {
    try {
      const data = await providerRef.value.getNowPlaying();

      if (data) {

        playerState.value = {
          ...playerState.value,
          ...data
        };

        if (data.playing) {
          startLocalProgress();
        } else {
          stopLocalProgress();
        }
      } else {
        playerState.value.playing = false;
        stopLocalProgress();
      }

      if (!playerState.value.topTrack && providerRef.value.getMonthFavorite) {
        const top = await providerRef.value.getMonthFavorite();
        if (top) playerState.value.topTrack = top;
      }
    } catch (e) {
      console.error("Error in fetchState", e);
      playerState.value.playing = false;
    }
  }

  function startLocalProgress() {
    if (progressTimer) clearInterval(progressTimer);

    progressTimer = setInterval(() => {
      if (playerState.value.playing &&
        playerState.value.durationMs > 0 &&
        playerState.value.progressMs < playerState.value.durationMs) {
        playerState.value.progressMs += 1000;
      }
    }, 1000) as unknown as number;
  }

  function stopLocalProgress() {
    if (progressTimer) clearInterval(progressTimer);
    progressTimer = undefined;
  }

  function start() {
    stop();
    fetchState();
    pollTimer = setInterval(fetchState, 2500) as unknown as number;
  }

  function stop() {
    if (pollTimer) clearInterval(pollTimer);
    stopLocalProgress();
  }

  watch(providerRef, () => {
    console.log(`Switched to ${providerRef.value.name}`);

    playerState.value = getEmptyState();

    start();
  }, { immediate: true });

  onUnmounted(stop);

  return {
    playerState: readonly(playerState)
  };
}
