import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'canvas-lens'
        }
      }
    })
  ],
  server: {
    port: 3002,
    open: true
  }
});
