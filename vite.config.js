import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'
import serverPlugin from './vite-plugins/vite-server-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serverPlugin()],
});
