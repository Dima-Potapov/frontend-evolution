/*
 * main.jsx — точка входа.
 *
 * [v05a Redux]: ReactDOM.render(<Provider store={store}><App /></Provider>, root)
 * [v05b MobX]:  createRoot (React 18) и НИКАКОГО Provider.
 *               Store — обычный JS-объект в модуле PostStore.js; компоненты
 *               импортируют его напрямую, а observer() подписывает их на изменения.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
