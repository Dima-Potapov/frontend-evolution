import { prisma } from '@/lib/prisma';
import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';
import styles from './page.module.css';

// force-dynamic — рендерим страницу на КАЖДЫЙ запрос.
// Без этого `next build` попытается отрендерить страницу статически (SSG)
// и выполнит запрос к БД прямо во время сборки — а PostgreSQL на CI/сборочной
// машине может и не быть → prisma упадёт с ошибкой подключения.
// К тому же лента постов меняется постоянно — статика здесь не подходит.
export const dynamic = 'force-dynamic';

// async Server Component — данные читаются на сервере, в браузер уходит готовый HTML
export default async function Home() {
  // В v07: const posts = getPosts();  → массив из globalThis (в памяти процесса)
  // В v08: настоящий запрос к PostgreSQL через Prisma.
  // Эквивалентный SQL:
  //   SELECT * FROM "Post" ORDER BY "createdAt" DESC;
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Можно было бы посчитать агрегатом в БД (prisma.post.aggregate({ _sum: { likes: true } })),
  // но посты уже загружены — проще посчитать в JS
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>📝 Post Feed</h1>
        <p className={styles.subtitle}>v8 · Next.js + Prisma ORM + PostgreSQL</p>
        {posts.length > 0 && (
          <p className={styles.stats}>
            {posts.length} постов · {totalLikes} лайков
          </p>
        )}
      </header>

      <main className={styles.main}>
        <PostForm />
        <PostList posts={posts} />
      </main>
    </div>
  );
}
