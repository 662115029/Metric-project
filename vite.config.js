import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  root: 'Basic Project',
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./Basic Project/src', import.meta.url)) }
  },
})
