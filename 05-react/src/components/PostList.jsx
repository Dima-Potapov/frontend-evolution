/*
 * ============================================================
 *  PostList.jsx — список карточек или заглушка «постов нет»
 * ============================================================
 *
 *  «Глупый» (презентационный) компонент: своего состояния нет,
 *  он только показывает то, что получил через props, и пробрасывает колбэки.
 */

import PostCard from './PostCard.jsx';
import styles from './PostList.module.css';

export default function PostList({ posts, onLike, onRemove }) {
  /*
   * Ранний return вместо v-if / v-else.
   * [v4]: <div v-if="posts.length > 0">...</div> <p v-else>...</p>
   * [v5]: обычный if в JavaScript. Компонент — функция, а в функции можно всё.
   * [v3]: classList.toggle('hidden', posts.length > 0) — заглушка всегда была в DOM.
   */
  if (posts.length === 0) {
    return <p className={styles.empty}>Пока нет ни одного поста. Напишите первый! ✍️</p>;
  }

  return (
    <div className={styles.list}>
      {/*
        Список через map вместо v-for.
        posts.map(post => <PostCard ... />) возвращает МАССИВ JSX-элементов,
        а React умеет рисовать массивы.

        key={post.id} — та же роль, что :key во Vue (подробно — в PostList.vue v4):
        по ключу React при сравнении старого и нового Virtual DOM понимает,
        какая карточка какая. Добавили пост в начало — React создаст ОДНУ
        новую карточку, а не перепишет все.
        Без key React выдаст предупреждение в консоль.
        key={index} — плохая идея по той же причине, что и во Vue.

        key — служебный атрибут: внутрь PostCard он НЕ попадает (props.key === undefined).

        onLike={onLike} — просто передаём функцию дальше, внук вызовет её сам.
        [v4]: @like="emit('like', $event)" — во Vue событие пришлось «перевыпускать»
              на каждом уровне. В React колбэк просто передаётся вниз как есть.

        Когда уровней становится много, передача через каждого посредника
        («prop drilling») утомляет. Решения: Context (встроен в React)
        или внешний стор — Zustand в v6.
      */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={onLike} onRemove={onRemove} />
      ))}
    </div>
  );
}
