import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { PostView } from '@/lib/types';
import AuthBar from '@/components/AuthBar';
import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';
import styles from './page.module.css';

// Рендерим на каждый запрос (как в v08): лента и сессия у каждого свои
export const dynamic = 'force-dynamic';

export default async function Home() {
  // НОВОЕ в v09: «кто смотрит страницу?» — читаем сессию из cookie.
  // Гость → session === null.
  const session = await auth();
  const userId = session?.user?.id;

  // Один запрос Prisma подтягивает данные из ТРЁХ таблиц:
  //   include.author   — JOIN "User" (связь 1:N: у поста один автор)
  //   _count.likes     — COUNT(*) из "Like" для каждого поста
  //   likes.where      — есть ли среди лайков МОЙ (чтобы закрасить сердечко)
  const rows = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { likes: true } },
      // Для гостя userId нет — фильтр, который ничего не найдёт
      likes: { where: { userId: userId ?? '__guest__' }, select: { userId: true } },
    },
  });

  // Превращаем «сырые» строки БД в удобный для экрана PostView
  const posts: PostView[] = rows.map(row => ({
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    author: { name: row.author.name ?? 'Без имени', image: row.author.image },
    likeCount: row._count.likes,
    likedByMe: row.likes.length > 0,
    isMine: row.authorId === userId,
  }));

  const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);

  return (
    <div className={styles.app}>
      <AuthBar />

      <header className={styles.header}>
        <h1>📝 Post Feed</h1>
        <p className={styles.subtitle}>v9 · Next.js + Auth.js (Google OAuth) + Prisma</p>
        {posts.length > 0 && (
          <p className={styles.stats}>
            {posts.length} постов · {totalLikes} лайков
          </p>
        )}
      </header>

      <main className={styles.main}>
        {/* Гостю форму не показываем. Но это ТОЛЬКО удобство интерфейса —
            настоящая защита находится в Server Action createPost. */}
        {session ? (
          <PostForm />
        ) : (
          <div className={styles.guest}>
            <Link href="/signin">Войдите</Link>, чтобы писать посты и ставить лайки
          </div>
        )}
        <PostList posts={posts} canLike={Boolean(session)} />
      </main>
    </div>
  );
}
