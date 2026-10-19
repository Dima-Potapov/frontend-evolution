'use client';

import { useTransition } from 'react';
import type { Post } from '@prisma/client';
import { likePost, deletePost } from '@/app/actions/posts';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // Отдельные транзиции для лайка и удаления — как в v07
  const [isLiking, startLikeTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleLike() {
    startLikeTransition(async () => {
      await likePost(post.id);
    });
  }

  function handleDelete() {
    if (!window.confirm('Удалить этот пост?')) return;
    startDeleteTransition(async () => {
      await deletePost(post.id);
    });
  }

  // createdAt из PostgreSQL — DateTime (Date); new Date() работает и с Date, и со строкой
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
        >
          {isLiking ? '...' : `❤️ ${post.likes}`}
        </button>

        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={isLiking || isDeleting}
        >
          {isDeleting ? '...' : '🗑'}
        </button>
      </div>
    </article>
  );
}
