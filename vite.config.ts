import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePlugin } from '@tanstack/start/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    vitePlugin({
      routesDirectory: './app/routes',
      generatedRouteTree: './app/routeTree.gen.ts',
    }),
  ],
})

