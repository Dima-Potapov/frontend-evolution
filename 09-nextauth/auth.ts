/**
 * auth.ts — ВСЯ настройка аутентификации в одном месте (Auth.js v5 / next-auth@5).
 *
 * NextAuth(...) возвращает 4 вещи, которые мы используем по всему приложению:
 *   handlers — GET/POST обработчики для /api/auth/* (вход, выход, колбэк Google)
 *   auth     — «кто сейчас вошёл?» — вызывается в Server Components и Server Actions
 *   signIn   — начать вход (серверная функция)
 *   signOut  — выйти
 *
 * Как работает вход через Google (OAuth 2.0), по шагам:
 *   1. Кнопка «Войти через Google» → редирект на accounts.google.com
 *   2. Пользователь соглашается → Google редиректит обратно на
 *      /api/auth/callback/google?code=...
 *   3. Auth.js на СЕРВЕРЕ обменивает code на токены (с помощью AUTH_GOOGLE_SECRET)
 *      и получает профиль: имя, email, аватар.
 *   4. PrismaAdapter создаёт (или находит) записи User + Account в PostgreSQL.
 *   5. Auth.js ставит httpOnly-cookie с подписанным JWT — это и есть «сессия».
 *   Пароли мы НЕ храним вообще: проверку личности делает Google.
 */
import NextAuth, { type NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const providers: Provider[] = [];

// Google подключаем, только если заданы ключи — иначе на странице входа
// была бы нерабочая кнопка. Ключи Auth.js читает сам из AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

// ДЕМО-вход «по имени» — ТОЛЬКО для учебных целей и локальной разработки,
// чтобы проект запускался без регистрации приложения в Google Cloud.
// Пароля нет → войти может кто угодно под любым именем. НИКОГДА не включайте в продакшене.
export const demoLoginEnabled = process.env.AUTH_DEMO_LOGIN === 'true';

if (demoLoginEnabled) {
  providers.push(
    Credentials({
      id: 'demo',
      name: 'Демо-вход (без пароля)',
      credentials: { name: { label: 'Ваше имя', type: 'text', placeholder: 'Анна' } },
      async authorize(credentials) {
        const name = String(credentials?.name ?? '').trim();
        if (name.length < 2) return null; // null = «вход не удался»

        // Credentials-провайдер НЕ создаёт пользователя через адаптер —
        // делаем это сами, чтобы у демо-пользователя были посты и лайки, как у «гугловского».
        const slug = encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
        const email = `${slug}@demo.local`;
        return prisma.user.upsert({ where: { email }, update: {}, create: { name, email } });
      },
    }),
  );
}

export const config = {
  adapter: PrismaAdapter(prisma),
  providers,

  // Стратегия сессии:
  //   "database" — в cookie лежит случайный id, сессия хранится в таблице Session
  //                (каждый auth() = запрос в БД; сессию легко отозвать).
  //   "jwt"      — в cookie лежит подписанный и зашифрованный токен с данными пользователя
  //                (БД не нужна для проверки; отозвать сложнее).
  // Credentials-провайдер работает только с "jwt", поэтому выбираем его.
  session: { strategy: 'jwt' },

  callbacks: {
    // jwt() вызывается при входе и при каждой проверке сессии.
    // При входе `user` — запись из БД; кладём её id в токен (token.sub).
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    // session() определяет, что увидит приложение в auth(). По умолчанию id там нет —
    // а он нам нужен, чтобы знать автора поста.
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
