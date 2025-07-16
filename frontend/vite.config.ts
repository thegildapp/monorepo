import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import relay from 'vite-plugin-relay'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), relay],
  build: {
    // Ensure TypeScript errors fail the build
    target: 'ES2022',
    sourcemap: true
  },
  server: {
    // Ensure the dev server respects TypeScript errors
    hmr: {
      overlay: true
    }
  }
})
