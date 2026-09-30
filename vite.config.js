import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // App source lives in web/. The repo root only holds a redirect to docs/,
  // so GitHub Pages works whether its folder is set to "/ (root)" or "/docs".
  root: 'web',
  // Relative asset paths so the build works under /Hackathon/ (and /Hackathon/docs/).
  base: './',
  build: { outDir: '../docs', emptyOutDir: true },
})
