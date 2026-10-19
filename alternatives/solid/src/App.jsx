/*
 * App.jsx — корневой компонент.
 *
 * Выглядит как React, но работает иначе:
 *   - функция App выполняется ОДИН раз (это «setup», а не «render»);
 *   - {postStore.postsCount()} — вызов геттера ВНУТРИ JSX. Компилятор превращает
 *     это выражение в маленький эффект, который обновит только этот текст.
 *   - <Show> вместо `cond && <div/>`: обычный `&&` тоже работает, но <Show>
 *     явно говорит компилятору, что здесь условный блок.
 */
import { Show } from 'solid-js';
import { postStore } from './store';
import PostForm from './components/PostForm';
import PostList from './components/PostList';

export default function App() {
  console.log('[Solid] App() выполнен — это произойдёт только один раз');

  return (
    <div class="app">
      {/* В Solid пишут class, а не className — ближе к обычному HTML */}
      <h1 class="title">📝 Лента постов</h1>
      <p class="subtitle">SolidJS (Signals, без виртуального DOM)</p>

      <PostForm />

      <Show when={postStore.postsCount() > 0}>
        <p class="stats">
          Постов: {postStore.postsCount()} · Лайков: {postStore.totalLikes()}
        </p>
      </Show>

      <PostList />
    </div>
  );
}
