import { useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useRouter, navigateTo } from './router'
import LoginPage from './LoginPage'
import SignUpPage from './SignUpPage'
import HomePage from './HomePage'
import Dashboard from './Dashboard'
import LoadingScreen from './LoadingScreen'

export default function App() {
  const { loading, authenticated } = useAuth()
  const [path] = useRouter()

  // After login, redirect to /home if on root or /login
  useEffect(() => {
    if (!loading && authenticated) {
      if (path === '/' || path === '/login') {
        navigateTo('/home')
      }
    }
  }, [loading, authenticated, path])

  if (loading) return <LoadingScreen />

  // Always allow signup page regardless of auth state
  if (path === '/signup') return <SignUpPage />

  // Not logged in — show login
  if (!authenticated) return <LoginPage />

  // Logged in — route to correct page
  if (path === '/home' || path === '/') return <HomePage />
  if (path === '/dashboard')            return <Dashboard />

  // Fallback
  return <HomePage />
}
