/**
 * setup-keycloak.js
 * 
 * One-time setup script to configure Keycloak for this app.
 * Requires: keycloak admin credentials set as env vars or edited below.
 * 
 * Usage:
 *   node setup-keycloak.js
 */

const KEYCLOAK_URL = 'http://localhost:8080'
const ADMIN_USER = 'benson'      // Change to your Keycloak admin username
const ADMIN_PASS = 'admin'       // Change to your Keycloak admin password

const REALM_NAME = 'myapp-frontend'
const CLIENT_ID  = 'myapp-frontend'
const REDIRECT_URIS = [
  'http://localhost:5173/*',      // Vite dev server
  'http://localhost:5173',
  'http://localhost:4173/*',      // Vite preview
  'http://localhost:4173',
  'http://localhost:3000/*',
  'http://localhost:3000',
]
const WEB_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  '*',
]

async function getAdminToken() {
  const res = await fetch(
    `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id:  'admin-cli',
        username:   ADMIN_USER,
        password:   ADMIN_PASS,
      }),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Admin login failed: ${res.status} — ${text}`)
  }
  const data = await res.json()
  return data.access_token
}

async function api(token, method, path, body) {
  const res = await fetch(`${KEYCLOAK_URL}/admin${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok && res.status !== 201 && res.status !== 204) {
    const text = await res.text()
    throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  }
  return res
}

async function setup() {
  console.log('🔑 Getting admin token...')
  const token = await getAdminToken()

  // 1. Create realm (skip if exists)
  console.log(`🌐 Creating realm "${REALM_NAME}"...`)
  try {
    await api(token, 'POST', '/realms', {
      realm: REALM_NAME,
      enabled: true,
      displayName: 'MyApp Frontend',
      loginTheme: 'keywind',
    })
    console.log('  ✅ Realm created')
  } catch (e) {
    if (e.message.includes('409')) {
      console.log('  ℹ️  Realm already exists, skipping')
    } else {
      throw e
    }
  }

  // 2. Enable user registration in realm settings
  console.log('📝 Enabling user registration...')
  const realmRes = await api(token, 'GET', `/realms/${REALM_NAME}`)
  const realmConfig = await realmRes.json()
  realmConfig.registrationAllowed = true
  realmConfig.resetPasswordAllowed = true
  realmConfig.verifyEmail = false
  await api(token, 'PUT', `/realms/${REALM_NAME}`, realmConfig)
  console.log('  ✅ Registration enabled')

  // 3. Create client
  console.log(`📱 Creating client "${CLIENT_ID}"...`)
  try {
    await api(token, 'POST', `/realms/${REALM_NAME}/clients`, {
      clientId: CLIENT_ID,
      enabled: true,
      publicClient: true,
      directAccessGrantsEnabled: true,
      standardFlowEnabled: true,
      redirectUris: REDIRECT_URIS,
      webOrigins: ['*'],
      attributes: {
        'pkce.code.challenge.method': 'S256',
      },
    })
    console.log('  ✅ Client created')
  } catch (e) {
    if (e.message.includes('409')) {
      console.log('  ℹ️  Client already exists, updating...')
      const clients = await api(token, 'GET', `/realms/${REALM_NAME}/clients?clientId=${CLIENT_ID}`)
      const clientsData = await clients.json()
      if (clientsData.length > 0) {
        const clientIdUUID = clientsData[0].id
        await api(token, 'PUT', `/realms/${REALM_NAME}/clients/${clientIdUUID}`, {
          clientId: CLIENT_ID,
          enabled: true,
          publicClient: true,
          directAccessGrantsEnabled: true,
          standardFlowEnabled: true,
          redirectUris: REDIRECT_URIS,
          webOrigins: ['*'],
        })
        console.log('  ✅ Client updated')
      }
    } else {
      throw e
    }
  }

  console.log('')
  console.log('✅ Keycloak setup complete!')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Start your Vite dev server: npm run dev')
  console.log('  2. Open http://localhost:5173')
  console.log('  3. Click "Create account" to register a new user')
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message)
  console.error('')
  console.error('Make sure:')
  console.error('  - Keycloak is running at', KEYCLOAK_URL)
  console.error('  - ADMIN_USER / ADMIN_PASS in this file are correct')
  process.exit(1)
})
