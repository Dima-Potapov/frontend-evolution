/*
 * vite.config.js — тот же сборщик, что в v05.
 * Vite не знает ни про классы, ни про Redux: плагин react() просто учит его JSX.
 * В «эпоху» классов и Redux (2015–2019) на этом месте был create-react-app (webpack + Babel),
 * а ещё раньше — ручной webpack.config.js на сотню строк.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
});
