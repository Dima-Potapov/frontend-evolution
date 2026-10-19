/*
 * vite.config.js — тот же сборщик, что в v05 и v05a.
 * Важно: MobX 6 НЕ требует Babel-плагинов для декораторов —
 * makeAutoObservable работает на обычном JavaScript, поэтому хватает плагина react().
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
});
