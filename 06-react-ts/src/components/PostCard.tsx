import { memo } from 'react';
import { useLikePost, useDeletePost } from '../hooks/usePosts';
import type { Post } from '../types/post';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
}

// memo() — оборачиваем компонент для мемоизации
// Перерендер только если изменились пропсы (сравнение shallow)
// TypeScript: memo<PostCardProps>(function PostCard...) — сохраняем типизацию
const PostCard = memo(function PostCard({ post }: PostCardProps) {
  // Каждая мутация независима — isPending у лайка не влияет на isPending удаления
  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  function handleDelete() {
    if (!window.confirm('Удалить этот пост?')) return;
    deletePost(post.id);
  }

  // Форматируем дату — TypeScript: new Date(post.createdAt) т.к. JSON сериализует Date в string
  const dateStr = new Date(post.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className={`${styles.card} ${isDeleting ? styles.deleting : ''}`}>
      <div className={styles.body}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.text}>{post.body}</p>
        <time className={styles.date}>{dateStr}</time>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.likeBtn}
          onClick={() => likePost(post.id)}
          disabled={isLiking || isDeleting}
          aria-label={`Лайк (${post.likes})`}
        >
          {/* isPending показывает, что лайк "летит" на сервер */}
          {isLiking ? '...' : `❤️ ${post.likes}`}
        </button>

        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={isLiking || isDeleting}
          aria-label="Удалить пост"
        >
          {isDeleting ? '...' : '🗑'}
        </button>
      </div>
    </article>
  );
});

export default PostCard;
