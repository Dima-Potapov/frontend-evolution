// Server Component (без 'use client'), как в v07–v08.
// В v08 тип Post брался из @prisma/client. В v09 карточке нужны ещё автор и лайки
// из связанных таблиц — поэтому используем свой тип PostView (lib/types.ts).
import type { PostView } from '@/lib/types';
import PostCard from './PostCard';
import styles from './PostList.module.css';

interface PostListProps {
  posts: PostView[];
  canLike: boolean;
}

export default function PostList({ posts, canLike }: PostListProps) {
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
          <PostCard post={post} canLike={canLike} />
        </li>
      ))}
    </ul>
  );
}
