/*
 * ============================================================
 *  reducer.js — КАК меняется состояние
 * ============================================================
 *
 *  Reducer — ЧИСТАЯ функция: (текущее состояние, action) → новое состояние.
 *  Правила чистоты (их нарушение — самый частый баг в Redux):
 *    1. Не мутировать state: никаких state.posts.push(), post.likes++.
 *       Всегда возвращаем НОВЫЕ объекты/массивы (spread, map, filter).
 *    2. Никаких побочных эффектов: запросов, Date.now(), Math.random(), localStorage.
 *    3. Одинаковые аргументы → всегда одинаковый результат.
 *
 *  Почему так строго? connect() сравнивает старый и новый state ПО ССЫЛКЕ (===).
 *  Если мутировать массив, ссылка не изменится → компонент НЕ перерисуется.
 *  Плюс иммутабельность даёт «машину времени» в Redux DevTools.
 *
 *  [v05 хуки]: usePosts.js использовал useReducer с ТАКОЙ ЖЕ функцией.
 *              useReducer — это «маленький Redux внутри одного компонента»:
 *              Дэн Абрамов (соавтор Redux) потом перенёс эту идею в сам React.
 */
import { ADD_POST, LIKE_POST, DELETE_POST } from './actions';

// Начальное состояние всего приложения — одно дерево (single source of truth)
const initialState = { posts: [] };

// state = initialState: при самом первом вызове (store создаётся) state === undefined
export function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_POST:
      // Новый пост — в НАЧАЛО массива: так лента сразу идёт в обратном хронологическом порядке
      return { ...state, posts: [action.payload, ...state.posts] };

    case LIKE_POST:
      // map возвращает новый массив; лайкнутый пост — новый объект, остальные — те же ссылки
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.payload.id ? { ...p, likes: p.likes + 1 } : p
        ),
      };

    case DELETE_POST:
      return { ...state, posts: state.posts.filter((p) => p.id !== action.payload.id) };

    // ОБЯЗАТЕЛЬНО: неизвестный action → вернуть state как есть.
    // Redux при создании store отправляет служебный action '@@redux/INIT...'.
    default:
      return state;
  }
}
