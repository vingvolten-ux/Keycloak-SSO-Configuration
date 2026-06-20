/**
 * api.js — Authenticated fetch utility
 *
 * Automatically attaches the Keycloak access token to every request.
 * Works for both login flows:
 *   - SSO (Keycloak JS SDK)       → token lives in keycloak.token
 *   - Direct grant (form login)   → token lives in sessionStorage
 *
 * Usage:
 *   import api from './api'
 *
 *   const data = await api.get('/users')
 *   const data = await api.post('/orders', { item: 'widget' })
 *   const data = await api.put('/orders/1', { status: 'shipped' })
 *   await api.delete('/orders/1')
 *
 *   // Or use apiFetch directly for full control:
 *   const data = await apiFetch('/upload', {
 *     method: 'POST',
 *     body: formData,   // no Content-Type needed for FormData
 *   })
 */

import keycloak from './keycloak.service'

// ============================================================
//  Set your backend base URL here
//  e.g. 'https://api.myapp.com'  or  'http://localhost:3001'
// ============================================================
export const API_BASE_URL = ''   // leave empty to use relative URLs

// ============================================================
//  TOKEN RESOLUTION
//  Checks both sources and returns whichever token is present.
//  SSO flow populates keycloak.token.
//  Direct grant flow populates sessionStorage.
// ============================================================
function getAccessToken() {
  // 1. SSO / Keycloak JS token (most up-to-date after refresh)
  if (keycloak.token) return keycloak.token

  // 2. Direct grant token stored on login
  const stored = sessionStorage.getItem('kc_access_token')
  if (stored) return stored

  return null
}

// ============================================================
//  TOKEN REFRESH
//  Before every request, try to refresh the SSO token if it
//  expires within 30 seconds. For direct grant tokens, the
//  AuthContext already refreshes every 60s automatically.
// ============================================================
async function ensureFreshToken() {
  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30)
    } catch {
      // Token refresh failed — user may need to log in again
      console.warn('Token refresh failed — redirecting to login')
      keycloak.login()
    }
  }
}

// ============================================================
//  CORE FETCH WRAPPER
// ============================================================
export async function apiFetch(endpoint, options = {}) {
  // Refresh token if needed (SSO flow)
  await ensureFreshToken()

  const token = getAccessToken()

  // Build headers — merge caller headers on top of defaults
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 — token rejected by server
  if (response.status === 401) {
    console.warn('401 Unauthorized — token may be expired, redirecting to login')
    sessionStorage.removeItem('kc_access_token')
    sessionStorage.removeItem('kc_refresh_token')
    keycloak.login()
    return
  }

  // Handle empty responses (204 No Content, DELETE, etc.)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null
  }

  // Parse JSON or return text
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  // Throw for non-2xx so callers can catch errors
  if (!response.ok) {
    const message =
      (typeof body === 'object' && (body?.message || body?.error || body?.errorMessage)) ||
      (typeof body === 'string' && body) ||
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return body
}

// ============================================================
//  CONVENIENCE METHODS
// ============================================================
const api = {
  /** GET request */
  get(endpoint, options = {}) {
    return apiFetch(endpoint, { ...options, method: 'GET' })
  },

  /** POST request — body is auto-serialized to JSON */
  post(endpoint, body, options = {}) {
    return apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  },

  /** PUT request — body is auto-serialized to JSON */
  put(endpoint, body, options = {}) {
    return apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  },

  /** PATCH request — body is auto-serialized to JSON */
  patch(endpoint, body, options = {}) {
    return apiFetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  },

  /** DELETE request */
  delete(endpoint, options = {}) {
    return apiFetch(endpoint, { ...options, method: 'DELETE' })
  },
}

export default api
