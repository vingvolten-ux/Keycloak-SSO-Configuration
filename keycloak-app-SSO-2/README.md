# MyApp — Keycloak React Starter

A React app with Keycloak authentication, built with Vite.

## Project Structure

```
src/
  keycloak.config.js   ← PUT YOUR KEYCLOAK DETAILS HERE
  keycloak.service.js  ← Keycloak singleton + helper functions
  AuthContext.jsx      ← React context — useAuth() hook
  App.jsx              ← Root: shows Login or Dashboard based on auth state
  LoginPage.jsx        ← Login UI (direct grant + SSO button)
  Dashboard.jsx        ← Protected page shown after login
  LoadingScreen.jsx    ← Shown while Keycloak initializes
  main.jsx             ← Entry point
public/
  silent-check-sso.html ← Required for silent SSO check
```

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Keycloak
Edit `src/keycloak.config.js`:
```js
const keycloakConfig = {
  url:      'https://your-keycloak-host/auth',
  realm:    'your-realm',
  clientId: 'your-client-id',
}
```

### 3. Run the dev server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

## Keycloak Client Settings

In your Keycloak Admin Console, make sure your client has:

| Setting | Value |
|---|---|
| Client Protocol | openid-connect |
| Access Type | public |
| Standard Flow | ✅ Enabled (for SSO button) |
| Direct Access Grants | ✅ Enabled (for username/password form) |
| Valid Redirect URIs | http://localhost:5173/* and your production URL |
| Web Origins | http://localhost:5173 and your production URL |

## Auth Flows

**SSO Button (recommended for production)**
Clicking "Continue with SSO" redirects the user to Keycloak's hosted login page.
Keycloak handles credentials and redirects back with an authorization code.

**Direct Grant (username/password form)**
Credentials are submitted directly to Keycloak's token endpoint.
Requires "Direct Access Grants" enabled on your client.

## useAuth() Hook

Use anywhere in your app:

```jsx
import { useAuth } from './AuthContext'

function MyComponent() {
  const { authenticated, user, login, logout, loading } = useAuth()

  if (!authenticated) return <button onClick={login}>Sign In</button>
  return <div>Hello {user.preferred_username}</div>
}
```
