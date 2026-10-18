// НЕТ 'use client' — это Server Component!
// Рендерится на сервере, получает посты как проп от page.tsx
// Клиент получает готовый HTML — без JS для рендера этого компонента
import type { Post } from '@/lib/types';
import PostCard from './PostCard';
import styles from './PostList.module.css';

interface PostListProps {
  posts: Post[];
}

// Server Component может принимать любые сериализуемые пропсы.
// НО: нельзя передавать функции, классы, объекты с методами — только plain data.
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
          {/*
            PostCard — Client Component внутри Server Component.
            Это разрешено! Данные поста сериализуются и передаются через границу.
            Date сериализуется в строку — PostCard получает string, не Date объект.
          */}
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
