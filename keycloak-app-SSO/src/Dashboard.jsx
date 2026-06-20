import { useAuth } from './AuthContext'
import { navigateTo } from './router'

const styles = `
  @keyframes rise {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dash-root {
    min-height: 100vh;
    background: #080a0f;
    color: #f0f2f5;
    font-family: 'DM Sans', sans-serif;
  }

  .dash-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    background: rgba(14,17,23,0.8);
    backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 10;
  }

  .nav-brand {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif; font-size: 18px;
    font-weight: 700; letter-spacing: -0.02em;
  }
  .nav-brand-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #4f8eff, #a78bfa);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }

  .nav-right { display: flex; align-items: center; gap: 16px; }
  .nav-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #4f8eff, #a78bfa);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
  }
  .nav-username { font-size: 14px; color: #9ca3af; }

  .btn-logout {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #9ca3af;
    font-size: 13px; padding: 8px 16px; cursor: pointer;
    transition: background 0.2s, color 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-logout:hover { background: rgba(255,255,255,0.1); color: #f0f2f5; }

  .dash-body {
    max-width: 960px; margin: 0 auto;
    padding: 60px 40px;
    animation: rise 0.4s ease both;
  }

  .dash-greeting {
    font-family: 'Syne', sans-serif; font-size: 36px;
    font-weight: 800; letter-spacing: -0.04em;
    margin-bottom: 8px;
  }
  .dash-sub { font-size: 15px; color: #6b7280; margin-bottom: 48px; }

  .cards-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px; margin-bottom: 40px;
  }
  .info-card {
    background: #0e1117; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 24px;
  }
  .info-card-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; color: #6b7280; margin-bottom: 8px;
  }
  .info-card-value {
    font-family: 'Syne', sans-serif; font-size: 18px;
    font-weight: 700; word-break: break-all;
    color: #f0f2f5;
  }
  .info-card-value.mono {
    font-family: 'DM Mono', monospace; font-size: 12px;
    color: #4f8eff; font-weight: 400;
  }

  .token-box {
    background: #0e1117; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 24px;
  }
  .token-box-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; color: #6b7280; margin-bottom: 12px;
  }
  .token-text {
    font-family: monospace; font-size: 11px; color: #4f8eff;
    background: rgba(79,142,255,0.06); border-radius: 8px;
    padding: 12px; word-break: break-all; line-height: 1.6;
    max-height: 80px; overflow: hidden;
    -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent);
    mask-image: linear-gradient(to bottom, black 40%, transparent);
  }
  .btn-back {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 9px; color: #9ca3af;
    font-size: 12px; padding: 7px 14px; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-back:hover { background: rgba(255,255,255,0.1); color: #f0f2f5; }
`

export default function Dashboard() {
  const { user, logout } = useAuth()

  const initials = user
    ? ((user.given_name?.[0] || '') + (user.family_name?.[0] || '')) || user.preferred_username?.[0]?.toUpperCase() || '?'
    : '?'

  const token = sessionStorage.getItem('kc_access_token') || '(token stored in Keycloak session)'

  return (
    <>
      <style>{styles}</style>
      <div className="dash-root">
        <nav className="dash-nav">
          <div className="nav-brand">
            <div className="nav-brand-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            MyApp
          </div>
          <div className="nav-right">
            <button className="btn-back" onClick={() => navigateTo('/home')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Home
            </button>
            <span className="nav-username">{user?.preferred_username || user?.email || 'User'}</span>
            <div className="nav-avatar">{initials}</div>
            <button className="btn-logout" onClick={logout}>Sign out</button>
          </div>
        </nav>

        <div className="dash-body">
          <h1 className="dash-greeting">
            Hello, {user?.given_name || user?.preferred_username || 'there'} 👋
          </h1>
          <p className="dash-sub">You're authenticated via Keycloak. Here's your session info.</p>

          <div className="cards-grid">
            <div className="info-card">
              <div className="info-card-label">Username</div>
              <div className="info-card-value">{user?.preferred_username || '—'}</div>
            </div>
            <div className="info-card">
              <div className="info-card-label">Email</div>
              <div className="info-card-value">{user?.email || '—'}</div>
            </div>
            <div className="info-card">
              <div className="info-card-label">Full Name</div>
              <div className="info-card-value">{user?.name || '—'}</div>
            </div>
            <div className="info-card">
              <div className="info-card-label">Roles</div>
              <div className="info-card-value" style={{fontSize:'14px'}}>
                {user?.realm_access?.roles?.filter(r => !r.startsWith('default-')).join(', ') || '—'}
              </div>
            </div>
          </div>

          <div className="token-box">
            <div className="token-box-label">Access Token (preview)</div>
            <div className="token-text">{token}</div>
          </div>
        </div>
      </div>
    </>
  )
}
