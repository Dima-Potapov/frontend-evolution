// Server Component (без 'use client'), как в v07
// Тип Post берётся прямо из сгенерированного Prisma-клиента (по schema.prisma).
// В v07 мы описывали его вручную в lib/types.ts — теперь это делает `prisma generate`.
import type { Post } from '@prisma/client';
import PostCard from './PostCard';
import styles from './PostList.module.css';

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
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
