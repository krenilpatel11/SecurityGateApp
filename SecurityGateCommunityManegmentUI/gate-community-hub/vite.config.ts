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
  server: useHttps ? {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    }
  } : {},
})
