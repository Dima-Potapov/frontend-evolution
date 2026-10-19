# Версия 8: Next.js 15 + Prisma ORM + PostgreSQL

Та же «Лента постов» (создание, лайки, удаление с подтверждением, пустое состояние, валидация), та же архитектура, что в v7 (App Router, Server Components, Server Actions). Но данные теперь хранятся не в памяти процесса, а в **настоящей базе данных PostgreSQL**, к которой мы обращаемся через **Prisma ORM**.

---

## 1. Что нового по сравнению с v7

| | v7 | v8 |
|---|---|---|
| Хранилище | массив в `globalThis` (хак) | PostgreSQL |
| Перезапуск сервера | 💥 все посты пропадают | ✅ данные сохраняются |
| Несколько инстансов (масштабирование) | у каждого свой массив, свой стейт | один общий стейт в БД |
| Тип `Post` | вручную в `lib/types.ts` | генерируется Prisma из `schema.prisma` |
| Лайк | `post.likes += 1` (возможна гонка) | атомарный `UPDATE ... SET likes = likes + 1` |

Компоненты почти не изменились: поменялся только **слой данных** (`lib/prisma.ts`, `app/actions/posts.ts`, `app/page.tsx`). Это и есть сила хорошей архитектуры: UI не знает, откуда берутся данные.

## 2. Образовательная ирония 🙃

В v7 мы сохраняли посты в `globalThis` и честно называли это **хаком**.

В v8 у нас настоящая БД... и в `lib/prisma.ts` мы **снова** пишем в `globalThis`:

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Только теперь это [официальная рекомендация Prisma](https://www.prisma.io/docs/guides/nextjs-prisma-client-dev-practices). Почему так:

- В dev-режиме Next.js использует **HMR** (Hot Module Replacement): после каждого сохранения файла модули выполняются заново.
- Каждый `new PrismaClient()` открывает свой **пул соединений** с PostgreSQL.
- Без `globalThis` после пары десятков правок PostgreSQL упрётся в лимит соединений: `FATAL: sorry, too many clients already`.
- `globalThis` переживает HMR, поэтому один клиент создаётся один раз и переиспользуется.

Принципиальная разница: в v7 в `globalThis` лежали **данные**, в v8 там лежит только **подключение** к БД. В production HMR нет, поэтому в `globalThis` ничего не кладём.

## 3. Что такое ORM

**ORM (Object-Relational Mapping)** — прослойка, которая позволяет работать с таблицами БД как с объектами языка программирования.

```ts
// Raw SQL — строка, никакой типизации, легко ошибиться в имени колонки
await pool.query('SELECT * FROM "Post" ORDER BY "createdAt" DESC');

// ORM (Prisma) — автодополнение, проверка типов, защита от SQL-инъекций
await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
```

Плюсы ORM: типобезопасность, миграции, меньше шаблонного кода, параметризованные запросы «из коробки».
Минусы: ещё один слой абстракции, сложные запросы иногда проще написать на SQL (в Prisma для этого есть `prisma.$queryRaw`).

Популярные альтернативы в мире TypeScript:
- **Drizzle ORM** — лёгкий, «SQL-like» синтаксис, схема описывается на TS;
- **TypeORM** — классический ORM на декораторах (похож на Hibernate / Doctrine);
- **Sequelize** — один из старейших ORM для Node.js;
- **Knex** — не ORM, а query builder: строит SQL через цепочки методов.

## 4. Prisma: ключевые концепции

- **`prisma/schema.prisma`** — единственный источник правды. Из него получаются и TypeScript-типы, и структура таблиц.
- **`prisma generate`** — генерирует типизированный клиент `@prisma/client`. Живая БД **не нужна**: клиент строится только по схеме.
- **`prisma migrate dev`** — сравнивает схему с БД, создаёт SQL-миграцию в `prisma/migrations/` и применяет её (плюс автоматически вызывает `generate`).
- **`prisma studio`** — визуальный интерфейс для просмотра и редактирования данных (`npm run db:studio`, откроется на http://localhost:5555).
- **Атомарные операции:**

```ts
// ❌ v7-подход: прочитать → изменить → записать.
// Два одновременных запроса прочитают likes = 5, оба запишут 6 — один лайк потерян (race condition)
post.likes += 1;

// ✅ v8: инкремент выполняется внутри БД одним запросом:
// UPDATE "Post" SET "likes" = "likes" + 1 WHERE "id" = $1
await prisma.post.update({ where: { id }, data: { likes: { increment: 1 } } });
```

## 5. Сравнение v7 и v8

| Операция | v7 (globalThis) | v8 (Prisma + PostgreSQL) |
|---|---|---|
| Чтение | `getPosts()` → массив из памяти | `prisma.post.findMany({ orderBy: { createdAt: 'desc' } })` |
| Создание | `store.posts.unshift({ id: store.nextId++, ... })` | `prisma.post.create({ data: { title, body } })` |
| Лайк | `post.likes += 1` | `prisma.post.update({ where: { id }, data: { likes: { increment: 1 } } })` |
| Удаление | `store.posts = store.posts.filter(p => p.id !== id)` | `prisma.post.delete({ where: { id } })` |

## 6. Как запустить

```bash
# 1. Установить PostgreSQL (или использовать Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
# 2. Создать .env из .env.example
cp .env.example .env
# 3. Установить зависимости и сгенерировать клиент
npm install
# 4. Создать таблицы в БД
npm run db:migrate
# 5. Запустить
npm run dev
```

Открой http://localhost:3000.

> ⚠️ Без запущенного PostgreSQL `npm run build` всё равно пройдёт (страница помечена `force-dynamic`, запросы к БД во время сборки не выполняются), но при открытии страницы появится ошибка с подсказкой из `app/error.tsx`.

## 7. Структура проекта

```
08-nextjs-prisma/
├── package.json
├── next.config.ts
├── tsconfig.json
├── .env.example            ← шаблон; настоящий .env не коммитится
├── .gitignore
├── prisma/
│   ├── schema.prisma       ← модель Post (источник правды)
│   └── migrations/         ← SQL-миграции (создаются migrate dev)
├── lib/
│   └── prisma.ts           ← единственный PrismaClient (globalThis — уже официально!)
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx            ← async Server Component: prisma.post.findMany()
│   ├── page.module.css
│   ├── loading.tsx         ← спиннер (Suspense)
│   ├── loading.module.css
│   ├── error.tsx           ← Error Boundary + подсказка про БД
│   ├── error.module.css
│   └── actions/
│       └── posts.ts        ← Server Actions: create / like / delete через Prisma
└── components/
    ├── PostForm.tsx        ← Client: useActionState
    ├── PostList.tsx        ← Server: список / пустое состояние
    ├── PostCard.tsx        ← Client: useTransition для лайка и удаления
    └── *.module.css
```

## 8. Что такое миграции

**Миграция** — это SQL-файл, который переводит структуру БД из одного состояния в другое («добавить таблицу», «добавить колонку»). Миграции — это «git для схемы базы данных»:

- каждое изменение `schema.prisma` → `npx prisma migrate dev --name описание`;
- Prisma сравнивает схему с текущей БД и генерирует файл `prisma/migrations/<дата>_<имя>/migration.sql`;
- папка `prisma/migrations/` **коммитится в git**: так все разработчики и production-сервер получают одинаковую структуру БД;
- на production применяют уже готовые миграции командой `npx prisma migrate deploy` (без генерации новых).

Пример первой миграции (`init`):

```sql
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
```

## 9. In-memory или PostgreSQL: что когда использовать

| Ситуация | Выбор |
|---|---|
| Быстрый прототип, демо, обучение (как v7) | in-memory: ноль настройки |
| Unit-тесты, моки | in-memory / SQLite |
| Локальная разработка реального продукта | PostgreSQL в Docker |
| Production, несколько серверов, важные данные | PostgreSQL (managed: Neon, Supabase, RDS…) |
| Кэш, сессии, счётчики | Redis (in-memory, но внешний и общий) |

Главное правило: если потеря данных при перезапуске недопустима или серверов больше одного — нужна внешняя БД.

## 10. Задания для практики

1. **Автор поста.** Добавь в модель поле `author String @default("Аноним")`, создай миграцию (`npx prisma migrate dev --name add_author`) и выведи автора в `PostCard`.
2. **Пагинация.** Покажи по 5 постов на страницу через `take` и `skip` в `findMany`, номер страницы передавай через `searchParams`.
3. **Поиск.** Добавь поле поиска по заголовку: `where: { title: { contains: query, mode: 'insensitive' } }`.
4. **Prisma Studio.** Запусти `npm run db:studio`, отредактируй пост вручную и убедись, что изменение видно в приложении после обновления страницы.
5. **SQLite вместо PostgreSQL.** Поменяй `provider = "sqlite"` и `DATABASE_URL="file:./dev.db"`, пересоздай миграции. Код приложения менять не придётся — в этом и сила ORM.
6. **Optimistic update.** Используй `useOptimistic` (React 19), чтобы лайк увеличивался мгновенно, ещё до ответа сервера.
7. **Seed-скрипт.** Создай `prisma/seed.ts`, который наполняет БД тестовыми постами, и подключи его в `package.json` (`"prisma": { "seed": "tsx prisma/seed.ts" }`), чтобы работал `npm run db:seed`.

## 11. Анонс v9: аутентификация 🔐

В следующей версии добавим вход через **NextAuth.js (Auth.js) + Google OAuth**:
- новая модель `User` в `schema.prisma`;
- связь **User → Posts** (один ко многим): у каждого поста появится автор;
- **защищённые роуты и Server Actions**: создавать, лайкать и удалять посты смогут только авторизованные пользователи (а удалять — только свои).
