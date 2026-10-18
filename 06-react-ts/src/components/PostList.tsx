import type { Post } from '../types/post';
import PostCard from './PostCard';
import styles from './PostList.module.css';

// TypeScript: интерфейс пропсов компонента
interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Постов пока нет</p>
        <p className={styles.hint}>Напиши первый!</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {posts.map(post => (
        // key — обязателен для списков, React использует для reconciliation
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
