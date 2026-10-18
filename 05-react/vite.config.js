/*
 * vite.config.js — настройки сборщика Vite.
 *
 * [v4 Vue]:   plugins: [vue()]   — учит Vite понимать файлы .vue.
 * [v5 React]: plugins: [react()] — учит Vite понимать JSX в файлах .jsx
 *             и включает Fast Refresh (горячую замену компонентов без потери состояния:
 *             поправили PostCard.jsx — карточки обновились, а посты на экране остались).
 *
 * Сам Vite одинаковый в обоих случаях: dev-сервер, ES-модули, сборка через Rollup.
 * Сборщик не привязан к фреймворку — фреймворк подключается плагином.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Разрешаем открывать dev-сервер по любому адресу хоста (удобно для превью и Docker).
    allowedHosts: true,
  },
});
