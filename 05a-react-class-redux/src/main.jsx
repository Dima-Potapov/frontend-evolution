/*
 * ============================================================
 *  main.jsx — точка входа
 * ============================================================
 *
 *  ⚠️ НАМЕРЕННО используем СТАРЫЙ API ReactDOM.render (React 16/17).
 *  В React 18 он работает, но в консоли будет предупреждение:
 *    "ReactDOM.render is no longer supported in React 18. Use createRoot instead.
 *     Until you switch to the new API, your app will behave as if it's running React 17."
 *  Это часть учебного материала: так писали main/index.js в 2015–2021 годах.
 *  Минус: в «режиме React 17» не работают concurrent-фичи (автоматический batching
 *  в setTimeout/промисах, useTransition, Suspense для данных).
 *  В React 19 ReactDOM.render удалён окончательно.
 *
 *  Современный вариант (как в v05):
 *    import { createRoot } from 'react-dom/client';
 *    createRoot(document.getElementById('root')).render(<App />);
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

ReactDOM.render(
  /*
   * <Provider store={store}> кладёт store в React Context.
   * Любой компонент ниже, обёрнутый в connect(), достанет store оттуда —
   * не нужно передавать store через props на каждом уровне («prop drilling»).
   * [v05 хуки]: store был локальным — useReducer внутри usePosts().
   */
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
