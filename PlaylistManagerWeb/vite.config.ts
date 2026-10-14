import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The API has no CORS policy, so the dev and preview servers proxy /api to it.
// Override the target with API_URL if the API runs somewhere other than the default http profile.
const apiTarget = process.env.API_URL ?? 'http://localhost:5239'
const proxy = { '/api': { target: apiTarget, changeOrigin: true } }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
})
