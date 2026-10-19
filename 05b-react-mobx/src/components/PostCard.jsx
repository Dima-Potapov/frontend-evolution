/*
 * PostCard.jsx — карточка одного поста.
 *
 * observer(PostCard) читает post.title, post.body, post.likes.
 * При post.likes++ в store перерисуется ТОЛЬКО эта карточка —
 * без React.memo, PureComponent и сравнения props (как приходилось в v05a).
 *
 * confirmDelete — локальное UI-состояние (useState), ему не место в store.
 * [v05a]: this.state = { confirmDelete: false } в классе.
 */
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { postStore } from '../store/PostStore';
import styles from '../styles/PostCard.module.css';

const PostCard = observer(function PostCard({ post }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dateStr = new Date(post.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className={`${styles.card} ${confirmDelete ? styles.confirming : ''}`}>
      <h2 className={styles.title}>{post.title}</h2>
      <p className={styles.body}>{post.body}</p>
      <time className={styles.date} dateTime={post.createdAt}>{dateStr}</time>

      <div className={styles.actions}>
        {confirmDelete ? (
          <>
            <span className={styles.question}>Удалить этот пост?</span>
            <button
              type="button"
              className={styles.danger}
              // Прямой вызов метода store. После удаления карточка размонтируется.
              onClick={() => postStore.deletePost(post.id)}
            >
              Подтвердить
            </button>
            <button type="button" className={styles.secondary} onClick={() => setConfirmDelete(false)}>
              Отмена
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`${styles.like} ${post.likes > 0 ? styles.liked : ''}`}
              // [v05a]: this.props.onLike(id) → dispatch(likePost(id)) → reducer → новый state
              // [v05b]: postStore.likePost(id) → post.likes++ → перерисовка этой карточки
              onClick={() => postStore.likePost(post.id)}
            >
              ❤️ {post.likes}
            </button>
            <button type="button" className={styles.delete} onClick={() => setConfirmDelete(true)}>
              🗑️ Удалить
            </button>
          </>
        )}
      </div>
    </article>
  );
});

export default PostCard;
