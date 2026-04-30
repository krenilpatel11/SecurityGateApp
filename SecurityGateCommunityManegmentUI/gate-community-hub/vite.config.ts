import path from "path"
import fs from "fs"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Only use HTTPS in local dev when cert files exist
const certPath = './localhost-key.pem'
const useHttps = fs.existsSync(certPath)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // UI primitives
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-menu',
          ],
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
          // Socket.io client
          'vendor-socket': ['socket.io-client'],
          // Icons
          'vendor-icons': ['lucide-react', 'react-icons'],
          // Heavy cognitive-services SDK (botframework dep) — isolate it
          'vendor-speech': ['microsoft-cognitiveservices-speech-sdk'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: useHttps ? {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    }
  } : {},
})
