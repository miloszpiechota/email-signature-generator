import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// frontend/vite.config.js
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/email-signature-generator/' : '/',
}));
