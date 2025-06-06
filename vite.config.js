import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // listen on all interfaces
    port: 5174,
    allowedHosts: ['tenant1.fleetquest.com', 'localhost', '127.0.0.1'], // all lowercase as in error message
  }
})
