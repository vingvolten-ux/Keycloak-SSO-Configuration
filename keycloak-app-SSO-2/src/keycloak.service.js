import Keycloak from 'keycloak-js'
import keycloakConfig from './keycloak.config'

// Singleton instance — one Keycloak object for the whole app
const keycloak = new Keycloak(keycloakConfig)

let _initialized = false

/**
 * Initialize Keycloak.
 * Call once at app startup (see main.jsx).
 * onLoad: 'check-sso' — silently checks if user is already logged in
 *         'login-required' — immediately redirects to Keycloak if not authenticated
 */
export async function initKeycloak(onAuthCallback) {
  if (_initialized) return

  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',         // PKCE for security
      checkLoginIframe: false,     // avoids iframe issues in some setups
    })

    _initialized = true
    onAuthCallback(authenticated)
  } catch (err) {
    console.error('Keycloak init failed', err)
    onAuthCallback(false)
  }
}

/** Redirect to Keycloak login */
export function login() {
  keycloak.login()
}

/** Redirect to Keycloak logout — always lands back on sign in page */
export function logout() {
  // Clear direct grant tokens
  sessionStorage.removeItem('kc_access_token')
  sessionStorage.removeItem('kc_refresh_token')
  sessionStorage.removeItem('kc_id_token')

  // SSO logout — redirect back to root (sign in page)
  if (keycloak.authenticated) {
    keycloak.logout({ redirectUri: window.location.origin + '/' })
  } else {
    window.location.href = '/'
  }
}

/** Returns the raw access token string */
export function getToken() {
  return keycloak.token
}

/** Returns parsed token payload */
export function getTokenParsed() {
  return keycloak.tokenParsed
}

/** True if user is authenticated */
export function isAuthenticated() {
  return !!keycloak.authenticated
}

/** Refresh token if it expires within 30 seconds */
export async function refreshToken() {
  try {
    await keycloak.updateToken(30)
    return keycloak.token
  } catch {
    keycloak.login()
  }
}

export default keycloak
