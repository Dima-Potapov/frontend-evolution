import { db } from '@/lib/db';
import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';
import styles from './page.module.css';

// force-dynamic: страница ВСЕГДА рендерится на сервере при каждом запросе (SSR)
// Без этого Next.js попытается сделать Static Generation (SSG) — один рендер при сборке.
// Альтернатива: fetch(..., { cache: 'no-store' }) тоже делает страницу динамической.
//
// Если бы данные менялись редко — можно убрать force-dynamic и использовать ISR:
// export const revalidate = 60; // пересобирать каждые 60 секунд
export const dynamic = 'force-dynamic';

// page.tsx — ASYNC Server Component!
// Может быть async функцией — данные читаем напрямую, без fetch и без useEffect.
// Нет useState, нет useEffect, нет 'use client' — это чистый серверный код.
export default async function Home() {
  // Читаем данные прямо из "базы данных" на сервере
  // В реальном приложении: const posts = await prisma.post.findMany(...)
  // Этот код никогда не попадёт в браузер — он выполняется только на сервере
  const posts = [...db.posts].reverse(); // новые сверху

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>📝 Post Feed</h1>
        {/* Цвет v07: оранжевый #f97316 */}
        <p className={styles.subtitle}>
          v7 · Next.js 15 + App Router + Server Components
        </p>
        {posts.length > 0 && (
          <p className={styles.stats}>
            {posts.length} постов · {totalLikes} лайков
          </p>
        )}
      </header>

      <main className={styles.main}>
        {/*
          PostForm — Client Component ('use client')
          Нужна интерактивность: controlled inputs, pending state формы.

          PostList — Server Component (нет 'use client')
          Просто рендерит список. Внутри PostCard — Client Component.

          Server Component может содержать Client Components — это нормально!
          Обратное НЕ работает: Client Component не может содержать Server Component напрямую.
        */}
        <PostForm />
        <PostList posts={posts} />
      </main>
    </div>
  );
}
