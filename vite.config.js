import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // true binds to all available IPs, useful for testing on LAN
    port: 5174,
  },
});

