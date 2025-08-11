import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // guarantee HTML entry so dist/index.html is emitted
      input: 'index.html'
    }
  }
})
