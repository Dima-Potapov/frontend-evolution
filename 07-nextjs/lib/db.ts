import type { Post } from './types';

// В Next.js dev-режиме HMR (Hot Module Replacement) перезагружает модули,
// сбрасывая module-level переменные.
// Решение: хранить данные в globalThis — он переживает HMR.
//
// В продакшене: каждый serverless-воркер имеет СВОЮ копию globalThis.
// Для персистентности в реальном приложении нужна внешняя БД (Postgres, Redis).
// Это главное ограничение in-memory стора на сервере!
declare global {
  // eslint-disable-next-line no-var
  var __postsStore: { posts: Post[]; nextId: number } | undefined;
}

if (!globalThis.__postsStore) {
  globalThis.__postsStore = { posts: [], nextId: 1 };
}

// Единственный инстанс стора на весь процесс
export const db = globalThis.__postsStore;
