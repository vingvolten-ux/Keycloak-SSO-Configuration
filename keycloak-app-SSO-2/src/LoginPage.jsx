import { useState } from 'react'
import { useAuth } from './AuthContext'
import { navigateTo } from './router'

const styles = `
  @keyframes rise {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: #080a0f;
  }

  .login-aurora {
    position: fixed; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 80% 60% at 15% 10%, rgba(79,142,255,0.13) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 85% 90%, rgba(120,80,255,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%);
  }

  .login-grain {
    position: fixed; inset: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    background-repeat: repeat; background-size: 180px; opacity: 0.5;
  }

  .login-card {
    position: relative; z-index: 1;
    width: 440px; max-width: calc(100vw - 32px);
    background: #0e1117;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 48px 44px 44px;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4);
    animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }

  .brand {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 36px;
  }
  .brand-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #4f8eff, #a78bfa);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 700;
    letter-spacing: -0.02em; color: #f0f2f5;
  }

  .login-h1 {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -0.04em; line-height: 1.15;
    margin-bottom: 6px; color: #f0f2f5;
  }
  .login-subtitle {
    font-size: 14px; color: #6b7280;
    margin-bottom: 32px; font-weight: 400;
  }

  .field { margin-bottom: 18px; }
  .field-label {
    display: block; font-size: 12px; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: #6b7280; margin-bottom: 8px;
  }
  .input-wrap { position: relative; }
  .input-wrap svg.input-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    width: 16px; height: 16px; stroke: #6b7280;
    pointer-events: none; transition: stroke 0.2s;
  }
  .login-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; color: #f0f2f5;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; padding: 13px 14px 13px 42px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  .login-input::placeholder { color: rgba(255,255,255,0.22); }
  .login-input:focus {
    border-color: #4f8eff;
    background: rgba(79,142,255,0.06);
    box-shadow: 0 0 0 3px rgba(79,142,255,0.15);
  }
  .login-input:focus ~ svg.input-icon { stroke: #4f8eff; }

  .eye-btn {
    position: absolute; right: 13px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; padding: 4px;
    color: #6b7280; transition: color 0.2s;
    display: flex; align-items: center;
  }
  .eye-btn:hover { color: #f0f2f5; }
  .eye-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

  .options {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; margin-top: -4px;
  }
  .remember {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #6b7280; cursor: pointer;
  }
  .remember input[type="checkbox"] { width: 15px; height: 15px; accent-color: #4f8eff; cursor: pointer; }
  .forgot { font-size: 13px; color: #4f8eff; transition: color 0.2s; background: none; border: none; padding: 0; }
  .forgot:hover { color: #7aaaff; }

  .btn-primary {
    width: 100%;
    background: linear-gradient(135deg, #4f8eff 0%, #6672ff 100%);
    border: none; border-radius: 14px;
    color: #fff; font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: 0.01em;
    padding: 15px; cursor: pointer;
    transition: filter 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(79,142,255,0.35);
    position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
    border-radius: inherit;
  }
  .btn-primary:hover:not(:disabled) {
    filter: brightness(1.1);
    box-shadow: 0 6px 28px rgba(79,142,255,0.5);
    transform: translateY(-1px);
  }
  .btn-primary:active:not(:disabled) { transform: translateY(0); filter: brightness(0.97); }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  .divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0; font-size: 12px; color: #6b7280;
  }
  .divider::before, .divider::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(255,255,255,0.07);
  }

  .btn-sso {
    width: 100%; background: transparent;
    border: 1px solid rgba(255,255,255,0.16);
    border-radius: 14px; color: #f0f2f5;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; padding: 13px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: background 0.2s, border-color 0.2s;
  }
  .btn-sso:hover { background: rgba(255,255,255,0.05); }

  .error-banner {
    background: rgba(255,95,95,0.1);
    border: 1px solid rgba(255,95,95,0.3);
    border-radius: 10px; color: #ff8f8f;
    font-size: 13px; padding: 11px 14px;
    margin-bottom: 18px;
    animation: rise 0.2s ease both;
  }

  .card-footer {
    text-align: center; margin-top: 28px;
    font-size: 13px; color: #6b7280;
  }
  .card-footer button { color: #4f8eff; background: none; border: none; padding: 0; font-size: 13px; }
  .card-footer button:hover { color: #7aaaff; }

  .secure-badge {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 20px; font-size: 11px;
    color: rgba(255,255,255,0.2); letter-spacing: 0.04em;
  }
`

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Direct Grant login (requires Direct Access Grants enabled on your Keycloak client)
  async function handleDirectLogin(e) {
    e.preventDefault()
    if (!username || !password) { setError('Please enter your username and password.'); return }

    setError(''); setLoading(true)
    try {
      const { url, realm, clientId } = (await import('./keycloak.config')).default
      const tokenUrl = `${url}/realms/${realm}/protocol/openid-connect/token`

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'password', client_id: clientId, username, password, scope: 'openid profile email' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error_description || 'Login failed')

      sessionStorage.setItem('kc_access_token', data.access_token)
      sessionStorage.setItem('kc_refresh_token', data.refresh_token)
      window.location.href = '/home'
    } catch (err) {
      setError(err.message.includes('Invalid') || err.message.includes('credentials')
        ? 'Incorrect username or password.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="login-aurora" />
        <div className="login-grain" />

        <div className="login-card">
          {/* Brand */}
          <div className="brand">
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="brand-name">MyApp</span>
          </div>

          <h1 className="login-h1">Welcome back</h1>
          <p className="login-subtitle">Sign in to continue to your workspace</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleDirectLogin}>
            <div className="field">
              <label className="field-label" htmlFor="username">Username or Email</label>
              <div className="input-wrap">
                <input
                  id="username" type="text" className="login-input"
                  placeholder="you@example.com" autoComplete="username"
                  value={username} onChange={e => setUsername(e.target.value)}
                />
                <UserIcon />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password" type={showPass ? 'text' : 'password'}
                  className="login-input" placeholder="••••••••••"
                  autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <LockIcon />
                <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)} aria-label="Toggle password">
                  {showPass ? (
                    <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="options">
              <label className="remember">
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" className="forgot" onClick={login}>Forgot password?</button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="divider">or</div>

          {/* SSO — recommended for production */}
          <button className="btn-sso" onClick={login}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Continue with SSO
          </button>

          <div className="card-footer">
            Don't have an account?{' '}
            <button onClick={() => navigateTo('/signup')}>Create account</button>
          </div>

          <div className="secure-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Secured by Keycloak
          </div>
        </div>
      </div>
    </>
  )
}
