
const config = {
  authNamespace: 'nowify_auth_state'
}

export function getStoredAuth() {
  try {
    const stored = window.localStorage.getItem(config.authNamespace)
    return stored ? JSON.parse(stored) : {}
  } catch (err) {
    return {}
  }
}

export function setStoredAuth(authState: any) {
  try {
    window.localStorage.setItem(config.authNamespace, JSON.stringify(authState))
  } catch (err) {
    console.error('Could not save auth', err)
  }
}

export function getEnvBoolean(keySuffix: string, isVinyl: boolean): boolean {
  const prefix = isVinyl ? 'VITE_VINYL_' : 'VITE_STD_';
  const fullKey = `${prefix}${keySuffix}`;
  return import.meta.env[fullKey] !== 'false';
}
