/*
 * ============================================================
 *  actions.js — ЧТО может произойти в приложении
 * ============================================================
 *
 *  Action (действие) — обычный объект { type, payload }, который описывает событие:
 *  «пользователь добавил пост», «пользователь лайкнул пост №5».
 *  Action НИЧЕГО не меняет сам — это лишь «письмо», которое отправляется в store
 *  через store.dispatch(action). Решает, что делать с письмом, reducer.
 *
 *  [v05 хуки]: в usePosts.js были те же объекты { type: 'add', ... } для useReducer,
 *              только типы были строками «на месте», без констант и без creators.
 */

// ── Action Types ─────────────────────────────────────────────
// Константы вместо строк «на месте»: опечатка в 'LIKE_POTS' молча ничего не сделает,
// а опечатка в LIKE_POTS (переменная) сразу упадёт с ReferenceError.
// Это классическая часть Redux-boilerplate (см. README → «Проблема boilerplate»).
export const ADD_POST = 'ADD_POST';
export const LIKE_POST = 'LIKE_POST';
export const DELETE_POST = 'DELETE_POST';

// ── Action Creators ──────────────────────────────────────────
// Функции, которые СОЗДАЮТ action-объекты. Зачем, если можно писать объект руками?
//   • один источник формы action (не нужно помнить, где id, а где payload);
//   • «нечистые» вещи (Date.now(), new Date()) делаются ЗДЕСЬ, а не в reducer —
//     reducer обязан быть чистой функцией;
//   • connect() умеет превращать объект { addPost, likePost } в функции,
//     которые сразу вызывают dispatch (см. mapDispatchToProps в App.jsx).

export const addPost = (title, body) => ({
  type: ADD_POST,
  payload: {
    id: Date.now(),
    title,
    body,
    likes: 0,
    createdAt: new Date().toISOString(), // строка, а не Date: state в Redux должен быть сериализуемым
  },
});

export const likePost = (id) => ({ type: LIKE_POST, payload: { id } });

export const deletePost = (id) => ({ type: DELETE_POST, payload: { id } });
