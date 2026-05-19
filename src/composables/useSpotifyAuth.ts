import { ref, reactive, watch, onMounted, readonly } from 'vue'
import type { SpotifyAuthState } from '@/types/Auth.ts'

const AUTH_ENDPOINTS = {
  auth: 'https://accounts.spotify.com/authorize',
  token: 'https://accounts.spotify.com/api/token',
}

const STORAGE_KEY = 'spotify_auth_state'
const PKCE_VERIFIER_KEY = 'spotify_pkce_code_verifier'
const OAUTH_STATE_KEY = 'spotify_oauth_state'

const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-read-recently-played',
  'user-top-read',
]

export function useSpotifyAuth() {
  const auth = reactive<SpotifyAuthState>({
    status: false,
    clientId: import.meta.env.VITE_SP_CLIENT_ID || '',
    authCode: '',
    accessToken: '',
    refreshToken: '',
  })

  const isAuthorized = ref(false)
  let isExchanging = false

  function getRedirectUri() {
    return import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback`
  }

  function createRandomString(length = 64) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const values = crypto.getRandomValues(new Uint8Array(length))

    return Array.from(values, (value) => possible[value % possible.length]).join('')
  }

  function base64UrlEncode(bytes: Uint8Array) {
    let binary = ''
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })

    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  async function createCodeChallenge(verifier: string) {
    const data = new TextEncoder().encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)

    return base64UrlEncode(new Uint8Array(digest))
  }

  async function initSpotifyAuth() {
    if (!auth.clientId) {
      console.error('Spotify client ID missing in .env')
      return
    }

    const codeVerifier = createRandomString()
    const codeChallenge = await createCodeChallenge(codeVerifier)
    const state = createRandomString(24)

    sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier)
    sessionStorage.setItem(OAUTH_STATE_KEY, state)

    const params = new URLSearchParams({
      client_id: auth.clientId,
      response_type: 'code',
      redirect_uri: getRedirectUri(),
      scope: SCOPES.join(' '),
      state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    })

    window.location.href = `${AUTH_ENDPOINTS.auth}?${params.toString()}`
  }

  async function requestAccessTokens(grantType: 'authorization_code' | 'refresh_token') {
    if (isExchanging) return
    isExchanging = true

    const bodyParams = new URLSearchParams()
    bodyParams.append('grant_type', grantType)

    if (grantType === 'authorization_code') {
      const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)

      if (!codeVerifier) {
        console.error('Spotify PKCE verifier missing')
        isExchanging = false
        return
      }

      bodyParams.append('code', auth.authCode)
      bodyParams.append('redirect_uri', getRedirectUri())
      bodyParams.append('code_verifier', codeVerifier)
    } else {
      bodyParams.append('refresh_token', auth.refreshToken)
    }

    bodyParams.append('client_id', auth.clientId)

    try {
      const res = await fetch(AUTH_ENDPOINTS.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams,
      })

      const data = await res.json()

      if (data.access_token) {
        auth.accessToken = data.access_token
        if (data.refresh_token) auth.refreshToken = data.refresh_token
        auth.status = true
        isAuthorized.value = true

        if (grantType === 'authorization_code') {
          auth.authCode = ''
          sessionStorage.removeItem(PKCE_VERIFIER_KEY)
          sessionStorage.removeItem(OAUTH_STATE_KEY)
          window.history.replaceState(null, '', location.pathname)
        }
      } else {
        console.error('Spotify Token Error', data)
        auth.status = false
      }
    } catch (e) {
      console.error('Spotify Auth Fetch Error', e)
    } finally {
      isExchanging = false
    }
  }

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SpotifyAuthState>

      auth.status = parsed.status ?? false
      auth.clientId = parsed.clientId || auth.clientId
      auth.authCode = parsed.authCode || ''
      auth.accessToken = parsed.accessToken || ''
      auth.refreshToken = parsed.refreshToken || ''
      isAuthorized.value = auth.status
    }

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY)

    if (code) {
      if (expectedState && state !== expectedState) {
        console.error('Spotify auth state mismatch')
        return
      }

      auth.authCode = code
      requestAccessTokens('authorization_code')
    } else if (auth.refreshToken) {
      requestAccessTokens('refresh_token')
    }
  })

  watch(
    auth,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
    },
    { deep: true },
  )

  return {
    spotifyAuth: readonly(auth),
    isSpotifyAuthorized: isAuthorized,
    initSpotifyAuth,
    refreshSpotifyToken: () => requestAccessTokens('refresh_token'),
  }
}
