import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3030,
    // Headers de sécurité allégés pour le développement
    headers: {
      'X-Content-Type-Options': 'nosniff',
      // Permissions Policy autorisant payment pour CONVOCORE et autres widgets
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self "https://vg-bunny-cdn.b-cdn.net" "https://js.stripe.com"), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), bluetooth=()',
      // CSP permissive pour développement - évite les conflits avec les extensions navigateur
      'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; connect-src * ws: wss:; frame-src *; object-src 'none';"
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Configuration pour la production
  build: {
    // Désactiver les source maps en prod pour éviter l'exposition du code
    sourcemap: process.env.NODE_ENV === 'development',
    // Minification pour obfusquer le code
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    }
  }
})