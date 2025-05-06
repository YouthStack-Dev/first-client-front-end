import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "tenant1.fleetQuest.com", // This binds Vite to all available interfaces
    port: 5174, // Default port
  }
})
