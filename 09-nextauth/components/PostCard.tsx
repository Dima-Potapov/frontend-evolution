'use client';

import { useOptimistic, useState, useTransition } from 'react';
import type { PostView } from '@/lib/types';
import { toggleLike, deletePost } from '@/app/actions/posts';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: PostView;
  canLike: boolean; // гостю кнопка лайка неактивна
}

export default function PostCard({ post, canLike }: PostCardProps) {
  const [, startLikeTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // useOptimistic (React 19) — «оптимистичный» лайк: сердечко меняется СРАЗУ,
  // не дожидаясь ответа сервера. Когда придут свежие данные с сервера
  // (после revalidatePath), React заменит оптимистичное значение настоящим.
  // Редьюсер принимает ЖЕЛАЕМОЕ состояние (liked: true/false), а не «переключи»:
  // так повторное применение не испортит счётчик.
  const [like, setOptimisticLike] = useOptimistic(
    { likedByMe: post.likedByMe, likeCount: post.likeCount },
    (state, liked: boolean) =>
      state.likedByMe === liked
        ? state
        : { likedByMe: liked, likeCount: state.likeCount + (liked ? 1 : -1) },
  );
  // Инлайн-подтверждение удаления (как в других версиях) вместо window.confirm
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLike() {
    setError(null);
    const nextLiked = !like.likedByMe;
    startLikeTransition(async () => {
      setOptimisticLike(nextLiked); // мгновенно обновляем экран
      try {
        await toggleLike(post.id);
      } catch {
        // Сервер отказал (например, сессия истекла) — сообщаем пользователю
        setError('Не удалось поставить лайк. Войдите снова.');
      }
    });
  }

  function handleDelete() {
    setError(null);
    startDeleteTransition(async () => {
      try {
        await deletePost(post.id);
      } catch {
        setError('Не удалось удалить пост');
        setConfirmDelete(false);
      }
    });
  }

  const dateStr = new Date(post.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const busy = isDeleting;

  return (
    <article className={`${styles.card} ${isDeleting ? styles.deleting : ''}`}>
      <div className={styles.body}>
        {/* НОВОЕ в v09: у поста есть автор (связь Post → User) */}
        <div className={styles.author}>
          {post.author.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author.image} alt="" className={styles.avatar} />
          ) : (
            <span className={styles.avatarFallback}>{post.author.name[0]?.toUpperCase()}</span>
          )}
          <span className={styles.authorName}>{post.author.name}</span>
          {post.isMine && <span className={styles.mine}>вы</span>}
        </div>

        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.text}>{post.body}</p>
        <time className={styles.date}>{dateStr}</time>
        {error && <p className={styles.error} role="alert">{error}</p>}

        {confirmDelete && (
          <div className={styles.confirm}>
            <span>Удалить пост?</span>
            <button className={styles.confirmYes} onClick={handleDelete} disabled={busy}>
              {isDeleting ? '...' : 'Подтвердить'}
            </button>
            <button className={styles.confirmNo} onClick={() => setConfirmDelete(false)} disabled={busy}>
              Отмена
            </button>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.likeBtn} ${like.likedByMe ? styles.liked : ''}`}
          onClick={handleLike}
          disabled={!canLike || busy}
          title={canLike ? (like.likedByMe ? 'Убрать лайк' : 'Нравится') : 'Войдите, чтобы ставить лайки'}
        >
          {/* 🤍 — ещё не лайкал, ❤️ — уже лайкнул (повторный клик снимает лайк) */}
          {`${like.likedByMe ? '❤️' : '🤍'} ${like.likeCount}`}
        </button>

        {/* Кнопка удаления — только у автора. Это удобство интерфейса;
            сервер в deletePost всё равно проверит авторство. */}
        {post.isMine && !confirmDelete && (
          <button
            className={styles.deleteBtn}
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            title="Удалить"
          >
            🗑
          </button>
        )}
      </div>
    </article>
  );
}
