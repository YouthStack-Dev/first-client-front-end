import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "fleetquest.com", // Your custom hostname
    port: 5174, // Default port
  }
})



