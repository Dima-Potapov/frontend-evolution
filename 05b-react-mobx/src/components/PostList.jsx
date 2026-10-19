/*
 * PostList.jsx — список постов.
 *
 * [v05a Redux]: получал posts через props от App (а тот — из connect()).
 * [v05b MobX]:  сам читает postStore.posts. Никакого «prop drilling».
 *
 * PostList читает: длину массива и его элементы (map).
 * Поэтому он перерисуется при добавлении/удалении поста,
 * но НЕ при лайке: post.likes читает уже PostCard, а не PostList.
 * Это и есть granular reactivity — точечные перерисовки.
 */
import { observer } from 'mobx-react-lite';
import { postStore } from '../store/PostStore';
import PostCard from './PostCard';
import styles from '../styles/PostList.module.css';

const PostList = observer(function PostList() {
  if (postStore.posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Постов пока нет</p>
        <p className={styles.hint}>Напиши первый!</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {postStore.posts.map(post => (
        <li key={post.id}>
          {/* Передаём сам observable-объект поста — PostCard подпишется на его поля */}
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
});

export default PostList;
