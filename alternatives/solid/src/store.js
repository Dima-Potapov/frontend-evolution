/*
 * store.js — глобальное состояние на примитивах SolidJS.
 *
 * В Solid нет отдельной библиотеки для стейт-менеджмента (Redux, MobX, Pinia):
 * сигналы и store — часть самого фреймворка и работают ВНЕ компонентов.
 *
 *   createSignal(v)  → [getter, setter]  — одно реактивное значение
 *   createStore(obj) → [state, setState] — реактивный объект/массив (на Proxy,
 *                                          каждое поле отслеживается отдельно)
 *   createMemo(fn)   → закэшированное вычисляемое значение (как computed во Vue/MobX)
 *
 * Сравни:
 *   [v05 React]  useReducer внутри компонента → новый массив → перерендер компонента
 *   [v05b MobX]  класс + makeAutoObservable → post.likes++ → перерендер observer-компонента
 *   [Solid]      createStore → setPosts(...) → обновляется ТОЛЬКО текстовый узел
 *                с числом лайков. Компонент заново не вызывается вообще.
 */
import { createStore, produce } from 'solid-js/store';
import { createMemo, createRoot } from 'solid-js';

// createRoot — «владелец» для вычислений, созданных вне компонентов
// (иначе Solid предупредит, что memo некому уничтожить).
export const postStore = createRoot(() => {
  const [posts, setPosts] = createStore([]);

  function addPost(title, body) {
    // setPosts принимает функцию от предыдущего значения — как setState в React.
    setPosts((prev) => [
      { id: Date.now(), title, body, likes: 0, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }

  function likePost(id) {
    // «Путь» в store: найти элемент по условию и изменить ОДНО поле.
    // Solid уведомит только тех, кто читал likes именно у этого поста.
    setPosts((p) => p.id === id, 'likes', (likes) => likes + 1);
  }

  function deletePost(id) {
    // produce — мутабельный стиль (как в MobX / Immer), если так удобнее.
    setPosts(
      produce((draft) => {
        const index = draft.findIndex((p) => p.id === id);
        if (index !== -1) draft.splice(index, 1);
      }),
    );
  }

  // Вычисляемые значения: пересчитываются только при изменении зависимостей.
  const postsCount = createMemo(() => posts.length);
  const totalLikes = createMemo(() => posts.reduce((sum, p) => sum + p.likes, 0));

  return { posts, addPost, likePost, deletePost, postsCount, totalLikes };
});
