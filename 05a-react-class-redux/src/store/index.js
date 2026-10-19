/*
 * store/index.js — создаём ЕДИНСТВЕННЫЙ store приложения.
 *
 * Store — объект с тремя главными методами:
 *   store.getState()        — текущее состояние;
 *   store.dispatch(action)  — отправить action (единственный способ изменить state);
 *   store.subscribe(fn)     — подписаться на изменения (connect() делает это за нас).
 *
 * [v03 OOP]: PostStore extends EventEmitter — по сути тот же паттерн Observer,
 *            только там методы addPost/likePost меняли данные сами,
 *            а в Redux изменения описаны отдельно — в чистом reducer.
 *
 * ⚠️ createStore помечен в Redux 4.2+ как @deprecated (зачёркнут в редакторе):
 * так авторы подталкивают к Redux Toolkit (configureStore). Функция работает
 * и удалять её не собираются — мы НАМЕРЕННО показываем классический API.
 */
import { createStore } from 'redux';
import { reducer } from './reducer';

// Второй аргумент — enhancer. Подключаем расширение Redux DevTools, если оно установлено в браузере:
// вкладка Redux покажет каждый action, diff состояния и позволит «отмотать время назад».
export const store = createStore(
  reducer,
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : undefined
);
