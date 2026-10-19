import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

// vite-plugin-solid компилирует JSX НЕ в React.createElement,
// а в реальные DOM-операции + точечные подписки на сигналы.
export default defineConfig({
  plugins: [solid()],
  server: { allowedHosts: true },
});
