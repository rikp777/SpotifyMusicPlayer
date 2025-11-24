import { reactive, readonly, onMounted, watch } from 'vue';
import type { YouTubeAuthState } from '@/types/Auth';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CLIENT_ID = import.meta.env.VITE_YT_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/callback`;

const ytAuth = reactive<YouTubeAuthState>({
  status: false,
  accessToken: '',
  refreshToken: '',
});

export function useYouTubeAuth() {

  function initAuthorise() {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      include_granted_scopes: 'true',
      state: 'youtube-auth',
    });
    window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  function checkUrlForToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    if (params.has('access_token') && params.get('state') === 'youtube-auth') {
      ytAuth.accessToken = params.get('access_token') || '';
      ytAuth.status = true;

      window.history.replaceState(null, '', ' ');
    }
  }

  onMounted(() => {
    checkUrlForToken();
  });

  return {
    ytAuth: readonly(ytAuth),
    initYouTubeAuth: initAuthorise
  };
}
