import { ref, watch, onUnmounted, readonly } from 'vue';
import type { PlayerState, AuthState } from '@/types/Auth';

const API_ENDPOINT_BASE = 'https://api.spotify.com/v1';
const NOW_PLAYING_PATH = 'me/player/currently-playing';
const QUEUE_PATH = 'me/player/queue';
const RECENTLY_PLAYED_PATH = 'me/player/recently-played';

const playerState = ref<PlayerState>({
  playing: false,
  trackArtists: [],
  trackTitle: '',
  trackAlbum: {},
  durationMs: 0,
  progressMs: 0,
  nextTrack: undefined,
});

let pollPlaying: number | undefined;
let localProgressTimer: number | undefined;

export function useSpotifyApi(auth: AuthState, requestRefreshToken: () => void) {
  function getEmptyPlayer(): PlayerState {
    return {
      playing: false,
      trackArtists: [],
      trackTitle: '',
      trackAlbum: {},
      progressMs: 0,
      durationMs: 0,
      nextTrack: undefined,
    };
  }

  function stopPolling() {
    if (pollPlaying) clearInterval(pollPlaying);
    if (localProgressTimer) clearInterval(localProgressTimer);
    pollPlaying = undefined;
    localProgressTimer = undefined;
  }

  function startLocalProgress() {
    if (localProgressTimer) clearInterval(localProgressTimer);

    localProgressTimer = setInterval(() => {
      if (playerState.value.playing && playerState.value.progressMs < playerState.value.durationMs) {
        playerState.value.progressMs += 1000;
      }
    }, 1000) as unknown as number;
  }

  function startPolling() {
    stopPolling();
    getNowPlaying();
    pollPlaying = setInterval(getNowPlaying, 2500) as unknown as number;
    startLocalProgress();
  }

  function handleNowPlayingResponse(data: any, nextTrackData: any, previousTrackData: any) {
    if (data.is_playing === false) {
      playerState.value = getEmptyPlayer();
      return;
    }

    if (data.item?.id === playerState.value.trackId) {
      if (nextTrackData && JSON.stringify(playerState.value.nextTrack) !== JSON.stringify(nextTrackData)) {
        playerState.value.nextTrack = nextTrackData;
      }
      if (previousTrackData && JSON.stringify(playerState.value.previousTrack) !== JSON.stringify(previousTrackData)) {
        playerState.value.previousTrack = previousTrackData;
      }
      return;
    }

    if (data.item) {
      playerState.value = {
        playing: data.is_playing,
        trackArtists: data.item.artists.map((artist: any) => artist.name),
        trackTitle: data.item.name,
        trackId: data.item.id,
        trackAlbum: {
          title: data.item.album.name,
          image: data.item.album.images[0]?.url,
        },
        progressMs: data.progress_ms,
        durationMs: data.item.duration_ms,
        nextTrack: nextTrackData,
        previousTrack: previousTrackData
      };
    }
  }

  async function getQueue(accessToken: string) {
    try {
      const response = await fetch(`${API_ENDPOINT_BASE}/${QUEUE_PATH}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return null;
      const data = await response.json();

      if (data.queue && data.queue.length > 0) {
        const nextItem = data.queue[0];
        return {
          title: nextItem.name,
          artist: nextItem.artists.map((a: any) => a.name).join(', '),
          image: nextItem.album.images[0]?.url
        };
      }
      return null;
    } catch (e) {
      console.error('Queue fetch error', e);
      return null;
    }
  }

  async function getRecentlyPlayed(accessToken: string) {
    try {
      const response = await fetch(`${API_ENDPOINT_BASE}/${RECENTLY_PLAYED_PATH}?limit=1`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return null;
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const track = data.items[0].track;
        return {
          title: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          image: track.album.images[0]?.url
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async function getNowPlaying() {
    if (!auth.accessToken) {
      stopPolling();
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINT_BASE}/${NOW_PLAYING_PATH}`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      if (response.status === 204) {
        playerState.value = getEmptyPlayer();
        return;
      }

      if (response.status === 401) {
        throw new Error('401 Token Expired');
      }

      if (!response.ok) {
        throw new Error(`Spotify API Error: ${response.status}`);
      }

      const data = await response.json();

      let nextTrackData = undefined;
      let previousTrackData = undefined;
      if (data.is_playing) {
        const [queue, recent] = await Promise.all([
          getQueue(auth.accessToken),
          getRecentlyPlayed(auth.accessToken)
        ]);

        if (queue) nextTrackData = queue;
        if (recent) previousTrackData = recent;
      }

      handleNowPlayingResponse(data, nextTrackData, previousTrackData);

    } catch (error) {
      console.error('Error retrieving Now Playing data:', error);

      if (error instanceof Error && error.message.includes('401')) {
        requestRefreshToken();
      }

      playerState.value = getEmptyPlayer();
    }
  }

  watch(() => auth.accessToken, (newToken) => {
    if (newToken) {
      startPolling();
    } else {
      stopPolling();
      playerState.value = getEmptyPlayer();
    }
  }, { immediate: true });

  onUnmounted(() => {
    stopPolling();
  });

  return {
    playerState: readonly(playerState),
    stopPolling,
  };
}
