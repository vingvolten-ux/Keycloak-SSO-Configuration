import { useState } from 'react'
import { navigateTo } from './router'
import keycloakConfig from './keycloak.config'

const styles = `
  @keyframes rise {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .signup-root {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    background: #080a0f;
  }
  .signup-aurora {
    position: fixed; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 80% 60% at 85% 10%, rgba(167,139,250,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 15% 90%, rgba(79,142,255,0.09) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%);
  }
  .signup-grain {
    position: fixed; inset: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    background-repeat: repeat; background-size: 180px; opacity: 0.5;
  }
  .signup-card {
    position: relative; z-index: 1;
    width: 460px; max-width: calc(100vw - 32px);
    background: #0e1117;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 44px 44px 40px;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6);
    animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }
  .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
  .brand-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, #a78bfa, #4f8eff);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .brand-name {
    font-family: 'Syne', sans-serif; font-size: 17px;
    font-weight: 700; letter-spacing: -0.02em; color: #f0f2f5;
  }
  .signup-h1 {
    font-family: 'Syne', sans-serif; font-size: 26px;
    font-weight: 800; letter-spacing: -0.04em; line-height: 1.15;
    margin-bottom: 6px; color: #f0f2f5;
  }
  .signup-subtitle { font-size: 14px; color: #6b7280; margin-bottom: 28px; }
  .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field { margin-bottom: 16px; }
  .field-label {
    display: block; font-size: 11px; font-weight: 500;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: #6b7280; margin-bottom: 7px;
  }
  .input-wrap { position: relative; }
  .input-wrap svg.input-icon {
    position: absolute; left: 13px; top: 50%;
    transform: translateY(-50%);
    width: 15px; height: 15px; stroke: #6b7280;
    pointer-events: none; transition: stroke 0.2s;
    fill: none; stroke-width: 1.8;
    stroke-linecap: round; stroke-linejoin: round;
  }
  .signup-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; color: #f0f2f5;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; padding: 12px 12px 12px 38px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  .signup-input::placeholder { color: rgba(255,255,255,0.2); }
  .signup-input:focus {
    border-color: #a78bfa;
    background: rgba(167,139,250,0.06);
    box-shadow: 0 0 0 3px rgba(167,139,250,0.12);
  }
  .signup-input.error-input { border-color: rgba(255,95,95,0.5); }
  .eye-btn {
    position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; padding: 4px;
    color: #6b7280; transition: color 0.2s;
    display: flex; align-items: center; cursor: pointer;
  }
  .eye-btn:hover { color: #f0f2f5; }
  .eye-btn svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .strength-bar { display: flex; gap: 4px; margin-top: 8px; }
  .strength-seg {
    flex: 1; height: 3px; border-radius: 2px;
    background: rgba(255,255,255,0.08); transition: background 0.3s;
  }
  .strength-label { font-size: 11px; margin-top: 5px; transition: color 0.3s; }
  .terms-row {
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 22px; margin-top: 4px;
  }
  .terms-row input[type="checkbox"] {
    width: 15px; height: 15px; accent-color: #a78bfa;
    cursor: pointer; flex-shrink: 0; margin-top: 2px;
  }
  .terms-text { font-size: 13px; color: #6b7280; line-height: 1.5; }
  .terms-text button {
    color: #a78bfa; background: none; border: none;
    padding: 0; cursor: pointer; font-size: 13px; transition: color 0.2s;
  }
  .terms-text button:hover { color: #c4b5fd; }
  .btn-primary {
    width: 100%;
    background: linear-gradient(135deg, #a78bfa 0%, #6672ff 100%);
    border: none; border-radius: 13px; color: #fff;
    font-family: 'Syne', sans-serif; font-size: 15px;
    font-weight: 700; padding: 14px; cursor: pointer;
    transition: filter 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(167,139,250,0.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    position: relative; overflow: hidden;
  }
  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
    border-radius: inherit;
  }
  .btn-primary:hover:not(:disabled) {
    filter: brightness(1.1); transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(167,139,250,0.5);
  }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .spinner {
    width: 17px; height: 17px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite; flex-shrink: 0;
  }
  .error-banner {
    background: rgba(255,95,95,0.1);
    border: 1px solid rgba(255,95,95,0.25);
    border-radius: 10px; color: #ff8f8f;
    font-size: 13px; padding: 11px 14px; margin-bottom: 16px;
    animation: fadeUp 0.2s ease both;
  }
  .field-error { font-size: 11px; color: #ff8f8f; margin-top: 5px; }
  .card-footer {
    text-align: center; margin-top: 22px;
    font-size: 13px; color: #6b7280;
  }
  .card-footer button {
    color: #4f8eff; background: none; border: none;
    padding: 0; cursor: pointer; font-size: 13px; transition: color 0.2s;
  }
  .card-footer button:hover { color: #7aaaff; }
  .secure-badge {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 18px; font-size: 11px;
    color: rgba(255,255,255,0.18); letter-spacing: 0.04em;
  }
  .secure-badge svg { width: 11px; height: 11px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; }
`

function getStrength(password) {
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthColors = ['#ff5f5f', '#ff9f5f', '#fbbf24', '#34d399', '#4f8eff']
const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']

export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    username: '', password: '', confirmPassword: '',
  })
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed]           = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess]         = useState(false)

  const strength = getStrength(form.password)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function validate() {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim())  errs.lastName  = 'Required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (!form.username.trim())  errs.username  = 'Required'
    if (form.username.includes(' ')) errs.username = 'No spaces allowed'
    if (form.password.length < 8)   errs.password = 'At least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!agreed) errs.terms = 'You must agree to the terms'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const { realm, clientId } = keycloakConfig

      // POST through our Vite proxy (dev) or production proxy server.
      // This avoids CORS since the browser talks to same-origin '/api'.
      const registerUrl = `/api/realms/${realm}/protocol/openid-connect/registrations`

      const res = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id:         clientId,
          firstName:         form.firstName,
          lastName:          form.lastName,
          email:             form.email,
          username:          form.username,
          password:          form.password,
          'password-confirm': form.confirmPassword,
        }),
        redirect: 'manual',
      })

      // Keycloak returns 302 on success (redirect to the redirect_uri).
      // On failure it returns 200 with an HTML page containing error fields.
      if (res.status === 302 || res.status === 303) {
        setSuccess(true)
      } else if (res.status === 409) {
        throw new Error('A user with that username or email already exists.')
      } else {
        // Try to read error details from the response body
        const text = await res.text()
        // Look for common Keycloak error messages in the HTML
        if (text.includes('usernameExists')) {
          throw new Error('Username is already taken.')
        }
        if (text.includes('emailExists')) {
          throw new Error('Email is already registered.')
        }
        if (text.includes('invalidPassword')) {
          throw new Error('Password does not meet the policy requirements.')
        }
        throw new Error('Registration failed. Please check your input and try again.')
      }
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError(
          'Cannot reach Keycloak. Make sure it is running at http://localhost:8080.'
        )
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <style>{styles}</style>
        <div className="signup-root">
          <div className="signup-aurora" />
          <div className="signup-grain" />
          <div className="signup-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h1 className="signup-h1">Account created!</h1>
            <p className="signup-subtitle" style={{ marginBottom: 28 }}>
              Welcome to MyApp, <strong style={{ color: '#f0f2f5' }}>{form.firstName}</strong>. Your account is ready.
            </p>
            <button className="btn-primary" onClick={() => navigateTo('/')}>
              Sign in now
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="signup-root">
        <div className="signup-aurora" />
        <div className="signup-grain" />

        <div className="signup-card">
          <div className="brand">
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="brand-name">MyApp</span>
          </div>

          <h1 className="signup-h1">Create an account</h1>
          <p className="signup-subtitle">Join MyApp — it only takes a minute</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="name-row">
              <div className="field">
                <label className="field-label">First name</label>
                <div className="input-wrap">
                  <input type="text" className={`signup-input${fieldErrors.firstName ? ' error-input' : ''}`}
                    placeholder="John" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
                  <svg className="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                {fieldErrors.firstName && <div className="field-error">{fieldErrors.firstName}</div>}
              </div>
              <div className="field">
                <label className="field-label">Last name</label>
                <div className="input-wrap">
                  <input type="text" className={`signup-input${fieldErrors.lastName ? ' error-input' : ''}`}
                    placeholder="Doe" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
                  <svg className="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                {fieldErrors.lastName && <div className="field-error">{fieldErrors.lastName}</div>}
              </div>
            </div>

            <div className="field">
              <label className="field-label">Email</label>
              <div className="input-wrap">
                <input type="email" className={`signup-input${fieldErrors.email ? ' error-input' : ''}`}
                  placeholder="john@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
                <svg className="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
            </div>

            <div className="field">
              <label className="field-label">Username</label>
              <div className="input-wrap">
                <input type="text" className={`signup-input${fieldErrors.username ? ' error-input' : ''}`}
                  placeholder="johndoe" value={form.username} onChange={set('username')} autoComplete="username" />
                <svg className="input-icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </div>
              {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <div className="input-wrap">
                <input type={showPass ? 'text' : 'password'}
                  className={`signup-input${fieldErrors.password ? ' error-input' : ''}`}
                  placeholder="Min. 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />
                <svg className="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}>
                  {showPass
                    ? <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {form.password.length > 0 && (
                <>
                  <div className="strength-bar">
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className="strength-seg" style={{ background: i < strength ? strengthColors[strength - 1] : undefined }} />
                    ))}
                  </div>
                  <div className="strength-label" style={{ color: strengthColors[strength - 1] || '#6b7280' }}>
                    {strengthLabels[strength - 1] || 'Very weak'}
                  </div>
                </>
              )}
              {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
            </div>

            <div className="field">
              <label className="field-label">Confirm password</label>
              <div className="input-wrap">
                <input type={showConfirm ? 'text' : 'password'}
                  className={`signup-input${fieldErrors.confirmPassword ? ' error-input' : ''}`}
                  placeholder="Repeat your password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
                <svg className="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm
                    ? <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
            </div>

            <div className="terms-row">
              <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label className="terms-text" htmlFor="terms">
                I agree to the <button type="button">Terms of Service</button> and <button type="button">Privacy Policy</button>
              </label>
            </div>
            {fieldErrors.terms && <div className="field-error" style={{ marginTop: -12, marginBottom: 12 }}>{fieldErrors.terms}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <div className="card-footer">
            Already have an account?{' '}
            <button onClick={() => navigateTo('/')}>Sign in</button>
          </div>

          <div className="secure-badge">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secured by Keycloak
          </div>
        </div>
      </div>
    </>
  )
}
