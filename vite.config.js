import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works under a sub-path like
  // https://divaarifah123.github.io/Hackathon/
  base: './',
  // GitHub Pages ("Deploy from a branch") serves this folder: pick /docs as the folder.
  build: { outDir: 'docs', emptyOutDir: true },
})
