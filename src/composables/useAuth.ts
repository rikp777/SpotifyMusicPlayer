import { ref, reactive, watch, onMounted, readonly } from 'vue'
import type { AuthState } from '@/types/Auth.ts'
import { getStoredAuth, setStoredAuth } from '@/utils/general.ts'
const AUTH_ENDPOINTS = {
  auth: 'https://accounts.spotify.com/authorize',
  token: 'https://accounts.spotify.com/api/token',
};

const initialAuth: AuthState = {
  status: false,
  clientId: import.meta.env.VITE_SP_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_SP_CLIENT_SECRET || '',
  authCode: '',
  accessToken: '',
  refreshToken: '',
};

const auth = reactive<AuthState>({ ...initialAuth });
const isAuthorized = ref(false);

let isExchanging = false;

export function useAuth() {
  function initAuthorise() {
    const searchParams = new URLSearchParams();
    searchParams.append('client_id', auth.clientId);
    searchParams.append('response_type', 'code');

    const redirectUri = `${window.location.origin}/callback`;
    searchParams.append('redirect_uri', redirectUri);

    const scopes = [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-read-recently-played'
    ];

    searchParams.append('scope', scopes);
    const state = Math.random().toString(36).substring(2, 15);
    searchParams.append('state', state);

    window.location.href = `${AUTH_ENDPOINTS.auth}?${searchParams.toString()}`;
  }

  function cleanupUrl() {
    const newUrl = location.protocol + '//' + location.host + location.pathname;
    window.history.replaceState(null, '', newUrl);
  }

  function handleAccessTokenResponse(data: any) {
    isExchanging = false;
    if (data.access_token) {
      auth.accessToken = data.access_token;
      if (data.refresh_token) auth.refreshToken = data.refresh_token;
      auth.status = true;
      isAuthorized.value = true;
      cleanupUrl();
    } else {
      console.error('Token Error:', data);
      auth.status = false;
      isAuthorized.value = false;
    }
  }

  async function requestAccessTokens(grantType: 'authorization_code' | 'refresh_token') {
    if (grantType === 'authorization_code' && isExchanging) return;
    if (grantType === 'authorization_code') isExchanging = true;

    const fetchData: Record<string, string> = { grant_type: grantType };
    const correctRedirectUri = `${window.location.origin}/callback`;

    if (grantType === 'authorization_code') {
      fetchData.code = auth.authCode;
      fetchData.redirect_uri = correctRedirectUri;
    }
    if (grantType === 'refresh_token') {
      fetchData.refresh_token = auth.refreshToken;
    }

    const queryBody = new URLSearchParams(fetchData).toString();
    const clientDetails = btoa(`${auth.clientId}:${auth.clientSecret}`);

    try {
      const res = await fetch(AUTH_ENDPOINTS.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${clientDetails}`
        },
        body: queryBody
      });

      const data = await res.json();
      handleAccessTokenResponse(data);
    } catch (error) {
      console.error('Fetch Error:', error);
      isExchanging = false;
    }
  }

  onMounted(() => {
    const stored = getStoredAuth();
    Object.assign(auth, { ...stored, authCode: '' });

    isAuthorized.value = auth.status;

    const currentParams = new URLSearchParams(window.location.search);
    const urlAuthCode = currentParams.get('code');

    if (urlAuthCode) {
      auth.authCode = urlAuthCode;
      cleanupUrl();
      requestAccessTokens('authorization_code');
    }
    else if (auth.refreshToken) {

      requestAccessTokens('refresh_token');
    }
  });

  watch(auth, (newAuth) => {
    setStoredAuth(newAuth);
    isAuthorized.value = newAuth.status;
  }, { deep: true });

  return {
    auth: readonly(auth),
    isAuthorized,
    initAuthorise,
    requestAccessTokens,
  };
}
