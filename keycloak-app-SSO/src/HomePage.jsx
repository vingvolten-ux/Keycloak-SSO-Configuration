import { useState } from 'react'
import { useAuth } from './AuthContext'
import { useNavigate } from './router'

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .home-root {
    min-height: 100vh;
    background: #080a0f;
    color: #f0f2f5;
    font-family: 'DM Sans', sans-serif;
    display: flex; flex-direction: column;
  }

  /* ── NAV ── */
  .home-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 48px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(8,10,15,0.85);
    backdrop-filter: blur(16px);
    position: sticky; top: 0; z-index: 20;
  }
  .nav-left { display: flex; align-items: center; gap: 12px; }
  .nav-logo-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #4f8eff, #a78bfa);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
  }
  .nav-logo-name {
    font-family: 'Syne', sans-serif; font-size: 17px;
    font-weight: 700; letter-spacing: -0.03em;
  }
  .nav-links {
    display: flex; align-items: center; gap: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 4px;
  }
  .nav-link {
    font-size: 13px; color: #6b7280; background: none; border: none;
    padding: 7px 14px; border-radius: 9px; cursor: pointer;
    transition: color 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-link:hover { color: #f0f2f5; background: rgba(255,255,255,0.06); }
  .nav-link.active { color: #f0f2f5; background: rgba(255,255,255,0.1); }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .nav-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #4f8eff, #a78bfa);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
    cursor: pointer;
  }
  .nav-user-name { font-size: 13px; color: #9ca3af; }
  .btn-logout {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 9px; color: #6b7280;
    font-size: 12px; padding: 7px 14px; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .btn-logout:hover { background: rgba(255,95,95,0.1); border-color: rgba(255,95,95,0.2); color: #ff8f8f; }

  /* ── HERO ── */
  .hero {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 80px 24px 60px;
    position: relative; overflow: hidden;
  }
  .hero-glow {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,142,255,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 20% 80%, rgba(167,139,250,0.08) 0%, transparent 50%),
      radial-gradient(ellipse 40% 30% at 80% 60%, rgba(79,142,255,0.06) 0%, transparent 50%);
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(79,142,255,0.1);
    border: 1px solid rgba(79,142,255,0.2);
    border-radius: 100px; padding: 6px 14px;
    font-size: 12px; font-weight: 500; color: #7aaaff;
    margin-bottom: 28px; letter-spacing: 0.02em;
    animation: fadeUp 0.5s ease both;
  }
  .hero-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #4f8eff; animation: pulse 2s ease infinite;
  }
  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(42px, 7vw, 72px);
    font-weight: 800; letter-spacing: -0.05em; line-height: 1.05;
    max-width: 700px; margin-bottom: 22px;
    animation: fadeUp 0.5s 0.1s ease both; opacity: 0;
    animation-fill-mode: forwards;
  }
  .hero-title span {
    background: linear-gradient(135deg, #4f8eff, #a78bfa 60%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    font-size: 17px; color: #6b7280; line-height: 1.6;
    max-width: 480px; margin-bottom: 44px;
    animation: fadeUp 0.5s 0.2s ease both; opacity: 0;
    animation-fill-mode: forwards;
  }
  .hero-actions {
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.5s 0.3s ease both; opacity: 0;
    animation-fill-mode: forwards;
  }
  .btn-cta {
    background: linear-gradient(135deg, #4f8eff 0%, #6672ff 100%);
    border: none; border-radius: 12px; color: #fff;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
    padding: 14px 28px; cursor: pointer;
    box-shadow: 0 4px 20px rgba(79,142,255,0.4);
    transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-cta:hover {
    filter: brightness(1.1); transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(79,142,255,0.5);
  }
  .btn-secondary {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 12px; color: #9ca3af;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    padding: 14px 28px; cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.06); color: #f0f2f5; border-color: rgba(255,255,255,0.22); }

  /* ── STATS ── */
  .stats-row {
    display: flex; align-items: center; justify-content: center; gap: 48px;
    margin-top: 64px; padding-top: 48px;
    border-top: 1px solid rgba(255,255,255,0.06);
    flex-wrap: wrap;
    animation: fadeUp 0.5s 0.4s ease both; opacity: 0;
    animation-fill-mode: forwards;
  }
  .stat { text-align: center; }
  .stat-value {
    font-family: 'Syne', sans-serif; font-size: 28px;
    font-weight: 800; letter-spacing: -0.04em;
    background: linear-gradient(135deg, #f0f2f5, #9ca3af);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .stat-label { font-size: 12px; color: #4b5563; margin-top: 4px; letter-spacing: 0.04em; }

  /* ── FEATURES ── */
  .features-section {
    padding: 80px 48px;
    max-width: 1100px; margin: 0 auto; width: 100%;
  }
  .section-tag {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #4f8eff;
    margin-bottom: 12px;
  }
  .section-title {
    font-family: 'Syne', sans-serif; font-size: 32px;
    font-weight: 800; letter-spacing: -0.04em; margin-bottom: 48px;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  .feature-card {
    background: #0e1117;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 28px;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .feature-card:hover {
    border-color: rgba(79,142,255,0.3);
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.3);
  }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px; font-size: 20px;
  }
  .feature-name {
    font-family: 'Syne', sans-serif; font-size: 16px;
    font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px;
  }
  .feature-desc { font-size: 14px; color: #6b7280; line-height: 1.6; }

  /* ── ACTIVITY ── */
  .activity-section {
    padding: 0 48px 80px;
    max-width: 1100px; margin: 0 auto; width: 100%;
  }
  .activity-list {
    background: #0e1117; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; overflow: hidden;
  }
  .activity-item {
    display: flex; align-items: center; gap: 16px;
    padding: 18px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: background 0.15s;
  }
  .activity-item:last-child { border-bottom: none; }
  .activity-item:hover { background: rgba(255,255,255,0.02); }
  .activity-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
  .activity-text { flex: 1; font-size: 14px; color: #d1d5db; }
  .activity-text strong { color: #f0f2f5; font-weight: 500; }
  .activity-time { font-size: 12px; color: #4b5563; }

  /* ── FOOTER ── */
  .home-footer {
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 24px 48px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: #4b5563;
  }
`

const features = [
  { icon: '⚡', color: 'rgba(251,191,36,0.15)', text: 'Fast & Reliable', desc: 'Built for performance from the ground up with optimized rendering and minimal overhead.' },
  { icon: '🔐', color: 'rgba(79,142,255,0.15)', text: 'Secure by Default', desc: 'Keycloak-powered auth with PKCE, token refresh, and role-based access out of the box.' },
  { icon: '🎨', color: 'rgba(167,139,250,0.15)', text: 'Fully Customizable', desc: 'Every component is designed to be tweaked, extended, and made entirely your own.' },
  { icon: '📊', color: 'rgba(52,211,153,0.15)', text: 'Built-in Analytics', desc: 'Track usage, monitor performance, and get insights without any extra configuration.' },
  { icon: '🌍', color: 'rgba(251,113,133,0.15)', text: 'Global CDN', desc: 'Deploy once, serve everywhere. Your users get fast load times from anywhere on earth.' },
  { icon: '🤝', color: 'rgba(251,146,60,0.15)', text: 'Team Ready', desc: 'Invite teammates, manage roles, and collaborate without stepping on each other\'s toes.' },
]

const activity = [
  { dot: '#34d399', text: <><strong>Login successful</strong> — welcome back to your workspace</>, time: 'Just now' },
  { dot: '#4f8eff', text: <><strong>Session started</strong> — authenticated via Keycloak SSO</>, time: '1m ago' },
  { dot: '#a78bfa', text: <><strong>Profile synced</strong> — your account details are up to date</>, time: '1m ago' },
  { dot: '#fbbf24', text: <><strong>Token issued</strong> — access token valid for 5 minutes</>, time: '1m ago' },
]

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('home')

  const initials = user
    ? ((user.given_name?.[0] || '') + (user.family_name?.[0] || '')) || user.preferred_username?.[0]?.toUpperCase() || '?'
    : '?'

  const firstName = user?.given_name || user?.preferred_username || 'there'

  return (
    <>
      <style>{styles}</style>
      <div className="home-root">

        {/* NAV */}
        <nav className="home-nav">
          <div className="nav-left">
            <div className="nav-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="nav-logo-name">MyApp</span>
          </div>

          <div className="nav-links">
            {['home', 'features', 'activity'].map(link => (
              <button
                key={link}
                className={`nav-link ${activeNav === link ? 'active' : ''}`}
                onClick={() => setActiveNav(link)}
              >
                {link.charAt(0).toUpperCase() + link.slice(1)}
              </button>
            ))}
          </div>

          <div className="nav-right">
            <span className="nav-user-name">{user?.preferred_username || user?.email}</span>
            <div className="nav-avatar">{initials}</div>
            <button className="btn-logout" onClick={logout}>Sign out</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-glow" />

          <div className="hero-badge">
            <div className="hero-badge-dot" />
            You're signed in as {user?.preferred_username || user?.email}
          </div>

          <h1 className="hero-title">
            Welcome back,<br /><span>{firstName}</span>
          </h1>

          <p className="hero-sub">
            Your workspace is ready. Everything is synced and you're good to go.
          </p>

          <div className="hero-actions">
            <button className="btn-cta" onClick={() => navigate('/dashboard')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Go to Dashboard
            </button>
            <button className="btn-secondary" onClick={() => setActiveNav('features')}>
              Explore features
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <div className="stats-row">
            {[
              { value: '99.9%', label: 'UPTIME SLA' },
              { value: '<50ms', label: 'AVG RESPONSE' },
              { value: '256-bit', label: 'ENCRYPTION' },
              { value: 'SOC 2', label: 'COMPLIANT' },
            ].map(s => (
              <div className="stat" key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section">
          <div className="section-tag">What's inside</div>
          <div className="section-title">Everything you need</div>
          <div className="features-grid">
            {features.map(f => (
              <div className="feature-card" key={f.text}>
                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <div className="feature-name">{f.text}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIVITY */}
        <section className="activity-section">
          <div className="section-tag">Session</div>
          <div className="section-title">Recent activity</div>
          <div className="activity-list">
            {activity.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" style={{ background: a.dot }} />
                <div className="activity-text">{a.text}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="home-footer">
          <span>© 2026 MyApp. All rights reserved.</span>
          <span>Secured by Keycloak · v1.0.0</span>
        </footer>

      </div>
    </>
  )
}
