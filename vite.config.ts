import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

const isProd = process.env.BUILD_MODE === 'prod'

export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // 监听所有地址
    port: 5173,
    allowedHosts: [
      'localhost',
      '.localhost',
      'fb82677b5d94.ngrok-free.app',  // 当前 ngrok 域名
      '.ngrok-free.app',
      '.ngrok.app',
      '.ngrok.io',
    ],
  },
})

