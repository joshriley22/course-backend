import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = process.env.VITE_BACKEND_URL ?? 'http://localhost:8000'

const backendRoutes = ['/courses', '/classes', '/professors', '/majors']

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      backendRoutes.map((route) => [
        route,
        {
          target: BACKEND_URL,
          changeOrigin: true,
        },
      ])
    ),
  },
})
