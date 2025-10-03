import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    port: 5174,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@features': resolve(__dirname, './src/redux/features'),
      '@components': resolve(__dirname, './src/components'),
      '@Api': resolve(__dirname, './src/Api'),
    }
  }
});