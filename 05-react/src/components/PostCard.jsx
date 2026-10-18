/*
 * ============================================================
 *  PostCard.jsx — одна карточка поста
 * ============================================================
 *
 *  Здесь показана оптимизация React.memo и объяснено, зачем
 *  в usePosts понадобились useCallback и иммутабельные обновления.
 */

import { memo } from 'react';
import styles from './PostCard.module.css';

/*
 * Обычный компонент-функция. Props: пост и два колбэка.
 *
 * ── Почему перерисовывается лишнее и что с этим делает memo ──
 *
 * По умолчанию, когда родитель (PostList) рендерится заново, React заново вызывает
 * функции ВСЕХ дочерних компонентов. Лайкнули один пост → App → PostList →
 * все 100 PostCard вызываются заново. Это не значит, что меняется DOM:
 * React сравнит Virtual DOM и обновит только одну цифру. Но сами функции
 * вызываются, и для тяжёлых компонентов это может тормозить.
 *
 * [v4 Vue]: такой проблемы нет «из коробки»: Vue знает, что карточка зависит
 *           от post.likes конкретного поста, и перерисует только её.
 *
 * memo(Компонент) говорит React: «перед вызовом сравни новые props со старыми
 * (поверхностно, по ссылкам). Если ни один не изменился — пропусти рендер».
 * Чтобы это сработало, должны совпасть ВСЕ props:
 *   • post     — для нелайкнутых постов это ТОТ ЖЕ объект, потому что reducer
 *                делает map и возвращает старые объекты как есть
 *                (а лайкнутому — новый { ...post }). Иммутабельность здесь окупается!
 *   • onLike, onRemove — ТЕ ЖЕ функции благодаря useCallback в usePosts.
 *                Без useCallback на каждом рендере приходили бы новые функции,
 *                и memo был бы бесполезен.
 *
 * Проверить можно в React DevTools → Profiler: при лайке рендерится одна карточка.
 *
 * Важно: memo, useMemo, useCallback — ОПТИМИЗАЦИИ. В маленьком приложении они
 * не нужны, они тут для обучения. Новый React Compiler умеет расставлять
 * их автоматически, и в будущем писать их руками придётся всё реже.
 */
function PostCard({ post, onLike, onRemove }) {
  /*
   * confirm живёт в интерфейсе, а не в хранилище — как в v4 (PostCard.vue).
   * [v3]: этот confirm был в App.js (контроллере).
   */
  function handleRemove() {
    if (confirm('Удалить этот пост?')) {
      onRemove(post.id);
    }
  }

  return (
    /*
     * data-id больше не нужен (как и в v4): каждая карточка — отдельный вызов
     * функции и «помнит» свой post через замыкание.
     */
    <article className={styles.card}>
      {/* {post.title} — экранируется автоматически. Вставить HTML можно только
          через dangerouslySetInnerHTML. Название специально пугающее: это аналог v-html и innerHTML, путь к XSS. */}
      <h2 className={styles.title}>{post.title}</h2>
      <p className={styles.body}>{post.body}</p>

      <div className={styles.actions}>
        {/*
          onClick={() => onLike(post.id)} — стрелочная функция нужна, чтобы передать аргумент.
          onClick={onLike(post.id)} вызвал бы лайк СРАЗУ при рендере (и ушёл бы в бесконечный цикл
          ре-рендеров: рендер → лайк → ре-рендер → лайк...).

          Динамический класс собираем обычным JS-выражением:
          [v4]: :class="{ liked: post.likes > 0 }"
          [v5]: шаблонная строка + тернарный оператор. Для сложных случаев есть
                библиотека clsx: clsx('btn', styles.like, { [styles.liked]: post.likes > 0 }).
        */}
        <button
          type="button"
          className={`btn ${styles.like} ${post.likes > 0 ? styles.liked : ''}`}
          onClick={() => onLike(post.id)}
        >
          ❤️ {post.likes}
        </button>

        <button type="button" className={`btn ${styles.delete}`} onClick={handleRemove}>
          🗑️ Удалить
        </button>
      </div>
    </article>
  );
}

// Экспортируем «обёрнутую» версию. Снаружи это всё тот же компонент <PostCard />.
export default memo(PostCard);
