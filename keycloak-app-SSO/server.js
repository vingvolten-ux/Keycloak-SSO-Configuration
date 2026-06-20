/**
 * server.js — Minimal production server with Keycloak proxy
 *
 * Proxies /api/* → Keycloak to avoid CORS.
 * Serves static files from dist/.
 *
 * Usage:
 *   npm run build
 *   node server.js
 *
 * Then open http://localhost:3000
 */

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KEYCLOAK_URL = 'http://localhost:8080'
const PORT = process.env.PORT || 3000
const DIST_DIR = path.join(__dirname, 'dist')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function serveStatic(res, filePath) {
  try {
    const content = fs.readFileSync(filePath)
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
    res.end(content)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}

function proxyToKeycloak(req, res) {
  const targetPath = req.url.replace('/api', '')
  const targetUrl = new URL(targetPath, KEYCLOAK_URL)
  const url = targetUrl.toString()

  console.log(`[PROXY] ${req.method} ${req.url} → ${url}`)

  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', () => {
    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
    }

    const proxyReq = http.request(url, options, proxyRes => {
      // Copy headers from Keycloak response
      res.writeHead(proxyRes.statusCode, proxyRes.headers)

      // Keycloak returns 302 on registration success — don't auto-follow,
      // let the browser handle it (or we intercept for our SPA)
      if (proxyRes.statusCode === 302 || proxyRes.statusCode === 303) {
        res.end()
        return
      }

      proxyRes.pipe(res)
    })

    proxyReq.on('error', err => {
      console.error('[PROXY ERROR]', err.message)
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Proxy error', message: err.message }))
    })

    if (body) proxyReq.write(body)
    proxyReq.end()
  })
}

const server = http.createServer((req, res) => {
  // Proxy API requests to Keycloak
  if (req.url.startsWith('/api')) {
    proxyToKeycloak(req, res)
    return
  }

  // Serve static files
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url)

  // If file doesn't exist and it's not an asset, serve index.html (SPA fallback)
  if (!fs.existsSync(filePath) && !req.url.includes('.')) {
    filePath = path.join(DIST_DIR, 'index.html')
  }

  serveStatic(res, filePath)
})

server.listen(PORT, () => {
  console.log(`\n✅ MyApp server running at http://localhost:${PORT}`)
  console.log(`   📡 API proxy → ${KEYCLOAK_URL}`)
  console.log(`   📁 Static files → dist/\n`)
})
