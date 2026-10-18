'use client';

import { useTransition } from 'react';
import { likePost, deletePost } from '@/app/actions/posts';
import type { Post } from '@/lib/types';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // useTransition — запускает Server Action без блокировки UI.
  // isPending — true пока сервер выполняет действие.
  // Используем ОТДЕЛЬНЫЕ транзиции для лайка и удаления,
  // чтобы они не блокировали друг друга.
  const [isLiking, startLikeTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleLike() {
    // startTransition(() => async action) — React 19 поддерживает async в transitions
    startLikeTransition(async () => {
      await likePost(post.id);
      // После await Next.js получает revalidatePath('/') от Server Action
      // и автоматически обновляет данные на странице (без полного reload!)
    });
  }

  function handleDelete() {
    if (!window.confirm('Удалить этот пост?')) return;
    startDeleteTransition(async () => {
      await deletePost(post.id);
    });
  }

  // Date пришёл как string (JSON-сериализация при передаче через Server/Client границу)
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
          onClick={handleLike}
          disabled={isLiking || isDeleting}
          aria-label={`Лайк (${post.likes})`}
        >
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
}
