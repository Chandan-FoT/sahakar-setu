import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sahakar-setu/',
  server: {
    host: true, // Expose to local network (WiFi / Hotspot for all 6 team members)
    port: 5173,
    open: false
  }
})
