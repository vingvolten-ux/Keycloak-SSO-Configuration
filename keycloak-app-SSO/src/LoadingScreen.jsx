const styles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-root {
    min-height: 100vh; background: #080a0f;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 20px;
  }
  .loading-spinner {
    width: 36px; height: 36px;
    border: 2px solid rgba(255,255,255,0.08);
    border-top-color: #4f8eff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .loading-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: rgba(255,255,255,0.3);
    letter-spacing: 0.04em;
  }
`

export default function LoadingScreen() {
  return (
    <>
      <style>{styles}</style>
      <div className="loading-root">
        <div className="loading-spinner" />
        <div className="loading-text">Connecting to Keycloak…</div>
      </div>
    </>
  )
}
