import { ref, reactive, watch, onMounted, readonly } from 'vue'
import type { AuthState } from '@/types/Auth.ts'

const AUTH_ENDPOINTS = {
  auth: 'https://accounts.spotify.com/authorize',
  token: 'https://accounts.spotify.com/api/token',
};

const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-read-recently-played',
  'user-top-read'
];

export function useSpotifyAuth() {
  const auth = reactive<AuthState>({
    status: false,
    clientId: import.meta.env.VITE_SP_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_SP_CLIENT_SECRET || '',
    authCode: '',
    accessToken: '',
    refreshToken: '',
  });

  const isAuthorized = ref(false);
  let isExchanging = false;

  function initSpotifyAuth() {
    const params = new URLSearchParams({
      client_id: auth.clientId,
      response_type: 'code',
      redirect_uri: `${window.location.origin}/callback`,
      scope: SCOPES.join(' '),
      state: Math.random().toString(36).substring(7),
    });

    window.location.href = `${AUTH_ENDPOINTS.auth}?${params.toString()}`;
  }

  async function requestAccessTokens(grantType: 'authorization_code' | 'refresh_token') {
    if (isExchanging) return;
    isExchanging = true;

    const bodyParams = new URLSearchParams();
    bodyParams.append('grant_type', grantType);

    if (grantType === 'authorization_code') {
      bodyParams.append('code', auth.authCode);
      bodyParams.append('redirect_uri', `${window.location.origin}/callback`);
    } else {
      bodyParams.append('refresh_token', auth.refreshToken);
    }

    try {
      const basicAuth = btoa(`${auth.clientId}:${auth.clientSecret}`);

      const res = await fetch(AUTH_ENDPOINTS.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`
        },
        body: bodyParams
      });

      const data = await res.json();

      if (data.access_token) {
        auth.accessToken = data.access_token;
        if (data.refresh_token) auth.refreshToken = data.refresh_token;
        auth.status = true;
        isAuthorized.value = true;

        if (grantType === 'authorization_code') {
          window.history.replaceState(null, '', location.pathname);
        }
      } else {
        console.error('Spotify Token Error', data);
        auth.status = false;
      }
    } catch (e) {
      console.error('Spotify Auth Fetch Error', e);
    } finally {
      isExchanging = false;
    }
  }

  onMounted(() => {
    const stored = localStorage.getItem('spotify_auth_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(auth, parsed);
      isAuthorized.value = parsed.status;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      auth.authCode = code;
      requestAccessTokens('authorization_code');
    } else if (auth.refreshToken) {
      requestAccessTokens('refresh_token');
    }
  });

  watch(auth, (newVal) => {
    localStorage.setItem('spotify_auth_state', JSON.stringify(newVal));
  }, { deep: true });

  return {
    spotifyAuth: readonly(auth),
    isSpotifyAuthorized: isAuthorized,
    initSpotifyAuth,
    refreshSpotifyToken: () => requestAccessTokens('refresh_token')
  };
}
