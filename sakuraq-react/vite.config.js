import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SakuraQ React edition — pure static app, no backend.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: false },
})
