import { createContext, useContext, useState, useEffect } from 'react'
import { initKeycloak, login, logout, getTokenParsed, isAuthenticated, refreshToken } from './keycloak.service'
import keycloakConfig from './keycloak.config'

const AuthContext = createContext(null)

/** Refresh a direct-grant token using the stored refresh token */
async function refreshDirectGrantToken() {
  const refreshTkn = sessionStorage.getItem('kc_refresh_token')
  if (!refreshTkn) return

  try {
    const { url, realm, clientId } = keycloakConfig
    const res = await fetch(
      `${url}/realms/${realm}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'refresh_token',
          client_id:     clientId,
          refresh_token: refreshTkn,
        }),
      }
    )
    const data = await res.json()
    if (res.ok) {
      sessionStorage.setItem('kc_access_token',  data.access_token)
      sessionStorage.setItem('kc_refresh_token', data.refresh_token)
    } else {
      // Refresh failed — clear tokens
      sessionStorage.removeItem('kc_access_token')
      sessionStorage.removeItem('kc_refresh_token')
    }
  } catch (err) {
    console.warn('Direct grant token refresh failed', err)
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    user: null,
  })

  useEffect(() => {
    initKeycloak((authenticated) => {
      // Also check if there's a direct-grant token in sessionStorage
      const directToken = sessionStorage.getItem('kc_access_token')
      const isAuth = authenticated || !!directToken

      setAuthState({
        loading: false,
        authenticated: isAuth,
        user: authenticated ? getTokenParsed() : null,
      })
    })
  }, [])

  // Auto-refresh SSO token every 60s
  useEffect(() => {
    if (!authState.authenticated) return
    const interval = setInterval(() => {
      refreshToken()               // SSO token
      refreshDirectGrantToken()    // Direct grant token
    }, 60_000)
    return () => clearInterval(interval)
  }, [authState.authenticated])

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
