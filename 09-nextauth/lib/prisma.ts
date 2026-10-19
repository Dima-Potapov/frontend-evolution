import { PrismaClient } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════════════
// ОБРАЗОВАТЕЛЬНАЯ ИРОНИЯ
// ═══════════════════════════════════════════════════════════════════════════
//
// В v07 мы складывали посты в globalThis — и честно называли это ХАКОМ:
// «база данных» в памяти процесса, которая умирает при перезапуске сервера.
//
// В v08 у нас настоящая PostgreSQL... и мы СНОВА пишем в globalThis! 🙃
// Но теперь это ОФИЦИАЛЬНАЯ рекомендация Prisma для Next.js:
// https://www.prisma.io/docs/guides/nextjs-prisma-client-dev-practices
//
// Почему так?
//   • В dev-режиме Next.js использует HMR (Hot Module Replacement): при каждом
//     сохранении файла модули перевыполняются заново.
//   • Если писать просто `export const prisma = new PrismaClient()`, то после
//     каждого сохранения создаётся НОВЫЙ PrismaClient со СВОИМ пулом соединений.
//   • Старые клиенты не закрываются → через пару десятков правок PostgreSQL
//     упирается в лимит соединений: "FATAL: sorry, too many clients already".
//   • globalThis переживает HMR (это объект процесса Node.js, а не модуля),
//     поэтому храним там один-единственный клиент и переиспользуем его.
//
// Разница с v07 принципиальная:
//   v07 — в globalThis лежали САМИ ДАННЫЕ (хак вместо БД);
//   v08 — в globalThis лежит лишь ПОДКЛЮЧЕНИЕ к БД, данные — в PostgreSQL.
//
// В production HMR нет, модуль выполняется один раз — globalThis не нужен.
// ═══════════════════════════════════════════════════════════════════════════

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Берём уже созданный клиент (если он пережил HMR) или создаём новый
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Сохраняем клиент в globalThis только в dev — именно там работает HMR
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
