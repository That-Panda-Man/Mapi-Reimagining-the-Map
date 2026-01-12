import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Check if running with netlify dev (which handles API proxying)
const isNetlifyDev = process.env.NETLIFY_DEV === 'true'

// Check for SSL certs relative to this config file
const certPath = path.join(__dirname, 'cert')
const hasSSLCerts = fs.existsSync(path.join(certPath, 'key.pem')) && fs.existsSync(path.join(certPath, 'cert.pem'))

export default defineConfig({
  plugins: [vue()],
  server: {
    // Only use HTTPS certs if they exist and not running with netlify dev
    ...(hasSSLCerts && !isNetlifyDev ? {
      https: {
        key: fs.readFileSync(path.join(certPath, 'key.pem')),
        cert: fs.readFileSync(path.join(certPath, 'cert.pem'))
      }
    } : {}),
    host: 'localhost',
    port: 5173,
    // Proxy only needed for standalone Vite dev (not with netlify dev)
    ...(!isNetlifyDev ? {
      proxy: {
        '/api': {
          target: 'http://localhost:5174',
          changeOrigin: true
        }
      }
    } : {})
  }
})
