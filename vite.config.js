import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import serverPlugin from './vite-plugins/vite-server-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), serverPlugin()],
});
