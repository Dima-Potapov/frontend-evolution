import { useEffect, useMemo } from 'react';
import { usePostsQuery } from './hooks/usePosts';
import { useUIStore } from './store/useUIStore';
import type { Post, SortOrder } from './types/post';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import styles from './App.module.css';

export default function App() {
  // TanStack Query: данные постов из серверного кеша
  // isLoading — первый запрос, isFetching — любой (включая фоновый рефетч)
  const { data: posts, isLoading, isError, error } = usePostsQuery();

  // Zustand: UI-состояние (порядок сортировки)
  // useUIStore — прямой доступ без Provider (в отличие от Context/Redux)
  const sortOrder = useUIStore(state => state.sortOrder);
  const setSortOrder = useUIStore(state => state.setSortOrder);

  // useMemo: пересчитываем отсортированные посты только когда изменились posts или sortOrder
  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts].sort((a: Post, b: Post) => {
      if (sortOrder === 'mostLiked') return b.likes - a.likes;
      // 'newest': сортируем по дате создания (новые сверху)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, sortOrder]);

  const totalLikes = useMemo(
    () => (posts ?? []).reduce((sum: number, p: Post) => sum + p.likes, 0),
    [posts]
  );

  useEffect(() => {
    document.title = posts
      ? `Посты (${posts.length}) · ${totalLikes} лайков`
      : 'Загрузка...';
  }, [posts, totalLikes]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>📝 Post Feed</h1>
        {/* TypeScript: subtitle цвет — индиго/фиолетовый (#6366f1) */}
        <p className={styles.subtitle}>v6 · React + TypeScript + Zustand + TanStack Query</p>
      </header>

      <main className={styles.main}>
        <PostForm />

        {/* Сортировка управляется Zustand-стором */}
        {posts && posts.length > 1 && (
          <div className={styles.sortBar}>
            <span>Сортировка:</span>
            {(['newest', 'mostLiked'] as SortOrder[]).map(order => (
              <button
                key={order}
                className={`${styles.sortBtn} ${sortOrder === order ? styles.active : ''}`}
                onClick={() => setSortOrder(order)}
              >
                {order === 'newest' ? '🕐 Новые' : '❤️ Популярные'}
              </button>
            ))}
          </div>
        )}

        {/* Состояния загрузки — TanStack Query предоставляет их из коробки */}
        {isLoading && (
          <div className={styles.status}>
            <div className={styles.spinner} />
            Загрузка постов...
          </div>
        )}

        {isError && (
          <div className={styles.error}>
            Ошибка: {error instanceof Error ? error.message : 'Что-то пошло не так'}
          </div>
        )}

        {!isLoading && !isError && (
          <PostList posts={sortedPosts} />
        )}

        {posts && posts.length > 0 && (
          <div className={styles.stats}>
            Итого: {posts.length} постов · {totalLikes} лайков
          </div>
        )}
      </main>
    </div>
  );
}
