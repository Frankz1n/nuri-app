import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const BRAND_GREEN = '#184834'
const BRAND_CREAM = '#fff7e9'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: o app funciona em qualquer subpasta e com rotas por hash (#/...).
  base: './',
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      // "prompt": a nova versão só assume depois que a pessoa aceitar o aviso.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: './',
        name: 'Nuri',
        short_name: 'Nuri',
        description: 'Aprenda hangul e coreano básico no seu ritmo, mesmo offline.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: BRAND_GREEN,
        background_color: BRAND_CREAM,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Prefixo próprio: a limpeza de caches antigos só toca caches do Nuri (nunca o localStorage).
        cacheId: 'nuri',
        globPatterns: ['**/*.{html,css,js,svg,png,ico,webmanifest,woff,woff2,mp3,mp4,jpg,jpeg,webp}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
      },
    }),
  ],
})
