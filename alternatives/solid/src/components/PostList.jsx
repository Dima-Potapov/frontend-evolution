/*
 * PostList.jsx — список постов.
 *
 * <For each={...}> вместо array.map(): For следит за элементами по ссылке.
 * Добавили пост — создаётся ОДНА новая карточка, остальные DOM-узлы не трогаются.
 * Поэтому `key` здесь не нужен (в React без key всё ломается).
 *
 * <Show fallback={...}> — условный рендер с «запасным» содержимым (empty state).
 */
import { For, Show } from 'solid-js';
import { postStore } from '../store';
import PostCard from './PostCard';

export default function PostList() {
  return (
    <Show
      when={postStore.posts.length > 0}
      fallback={
        <div class="empty">
          <p>Постов пока нет 🌱</p>
          <p class="hint">Напишите первый пост в форме выше</p>
        </div>
      }
    >
      <ul class="list">
        <For each={postStore.posts}>{(post) => <li><PostCard post={post} /></li>}</For>
      </ul>
    </Show>
  );
}
