# Версия 7: Next.js 15 + App Router + Server Components

Та же «Лента постов»: добавить пост, лайкнуть, удалить (с подтверждением), заглушка «Постов пока нет», валидация. Но теперь приложение **рендерится на сервере**, а данные меняются через **Server Actions** — без REST API, без `fetch`, без TanStack Query.

> Подзаголовок теперь **оранжевый** (`#f97316`). v4 — зелёный, v5 — бирюзовый, v6 — индиго, v7 — оранжевый.

---

### Что нового по сравнению с v6

| | v6: React + TS + Zustand + TanStack Query | **v7: Next.js 15 (App Router)** |
|---|---|---|
| Тип приложения | **SPA**: браузер получает пустой `<div id="root">` и строит всё сам | **SSR-фреймворк**: сервер присылает готовый HTML со списком постов |
| Сборщик | Vite | **встроен в Next.js** (`next dev`, `next build`) |
| `index.html` | есть | **нет** — его заменяет `app/layout.tsx` (`<html>`, `<body>`) |
| `main.tsx` + `createRoot` | есть | **нет** — Next.js монтирует приложение сам |
| Чтение данных | `useQuery` → `postsApi.getPosts()` в браузере | **`page.tsx` читает `db.posts` прямо на сервере** |
| Изменение данных | `useMutation` + `invalidateQueries` | **Server Actions** + `revalidatePath('/')` |
| «API» | фейковый `postsApi.ts` в браузере | **нет отдельного API** — функции с `'use server'` |
| Загрузка | `isLoading` из TanStack Query | **`loading.tsx`** (React Suspense) |
| Ошибки | `isError` | **`error.tsx`** (Error Boundary) |
| `document.title` | `useEffect` | **`export const metadata`** в `layout.tsx` |
| Форма | `useState` для каждого поля (controlled inputs) | **`useActionState`** + `name`-атрибуты (uncontrolled), работает даже без JS |
| Где хранятся посты | в памяти вкладки браузера | **в памяти сервера** (`globalThis`) — видны всем вкладкам |
| Маршрутизация | нет (одна страница) | **файловая**: папка в `app/` = URL |

Главный сдвиг: **раньше сервер был «где-то там», а весь React работал в браузере. Теперь часть компонентов работает на сервере** и может читать базу данных напрямую.

---

### Краткая история Next.js

- **2016.** Гильермо Раух (Guillermo Rauch) и его компания **ZEIT** (с 2020 года — **Vercel**) выпускают Next.js. Цель — React с серверным рендерингом «из коробки»: без ручной настройки webpack, Babel и Express.
- **2016–2022 — Pages Router.** Каждый файл в папке `pages/` — маршрут. Данные загружаются специальными функциями `getServerSideProps` (SSR), `getStaticProps` (SSG), позже — ISR (`revalidate`). Весь React-код страницы всё равно уезжает в браузер.
- **2020–2022.** Команда React представляет **React Server Components** — компоненты, которые выполняются только на сервере. Их фундамент закладывается в React 18 (Suspense, потоковый рендеринг).
- **2023 — Next.js 13.4: App Router стабилен.** Новая папка `app/`, все компоненты по умолчанию — **Server Components**, появляются `layout.tsx`, `loading.tsx`, `error.tsx` и **Server Actions**.
- **2024–2025 — Next.js 15 + React 19.** `useActionState`, асинхронные транзиции, стабильные Server Actions. App Router — рекомендуемый путь, Pages Router поддерживается для старых проектов.

---

### Главная концепция: CSR vs SSR vs SSG vs ISR

Ключевой вопрос любого фронтенд-фреймворка: **где и когда превращать компоненты в HTML?**

| Стратегия | Где рендерится | Когда | Плюсы | Минусы | Пример в коде |
|---|---|---|---|---|---|
| **CSR** (Client-Side Rendering) | в браузере | после загрузки JS | простой хостинг (статика), богатая интерактивность | пустая страница, пока грузится JS; хуже SEO; медленно на слабых телефонах | v4–v6 (Vite + SPA) |
| **SSR** (Server-Side Rendering) | на сервере | **при каждом запросе** | всегда свежие данные, готовый HTML сразу, хорошее SEO | нагрузка на сервер, ответ ждёт загрузки данных | **v7**: `export const dynamic = 'force-dynamic'` |
| **SSG** (Static Site Generation) | на сервере | **один раз при сборке** (`next build`) | максимально быстро (отдаётся с CDN), дёшево | данные устаревают до следующей сборки | блог, документация, лендинг |
| **ISR** (Incremental Static Regeneration) | на сервере | при сборке + **пересборка в фоне** раз в N секунд | скорость SSG + относительно свежие данные | данные могут отставать на N секунд | `export const revalidate = 60` |

Посты в нашей ленте меняются постоянно и должны появляться сразу, поэтому выбран **SSR** (`force-dynamic`). Без этой строки Next.js отрендерил бы страницу один раз при `npm run build` (SSG), и новые посты бы не появлялись.

> После загрузки HTML React **«гидрирует»** (hydration) страницу: подключает обработчики событий к Client Components. Пользователь видит контент сразу, а кнопки оживают через мгновение.

---

### Server Components vs Client Components

В App Router **каждый компонент по умолчанию — Server Component**. Чтобы компонент стал клиентским, в первой строке файла пишут `'use client'`.

| Критерий | Server Component (по умолчанию) | Client Component (`'use client'`) |
|---|---|---|
| Где выполняется | **только на сервере** (при запросе или сборке) | на сервере для первого HTML **и** в браузере (гидрация, перерендеры) |
| Хуки `useState`, `useEffect`, `useTransition`... | ❌ нельзя | ✅ можно |
| События `onClick`, `onChange`, `onSubmit` | ❌ нельзя (нет браузера — некому кликать) | ✅ можно |
| Браузерные API (`window`, `localStorage`, `confirm`) | ❌ нет | ✅ есть |
| Может быть `async` и делать `await` прямо в теле | ✅ да (`async function Home()`) | ❌ нет |
| Доступ к БД, файловой системе, секретам (`process.env.DB_PASSWORD`) | ✅ напрямую | ❌ нет (код виден пользователю) |
| Попадает в JS-бандл браузера | ❌ **нет** — браузер получает только результат (HTML/RSC-payload) | ✅ да |
| Когда использовать | получить и показать данные, разметка, всё неинтерактивное | формы, кнопки, состояние, анимации, браузерные API |
| В нашем коде | `layout.tsx`, `page.tsx`, `loading.tsx`, `PostList.tsx` | `PostForm.tsx`, `PostCard.tsx`, `error.tsx` |

Правила, которые важно запомнить:

1. **Server Component может рендерить Client Component** (`PostList` → `PostCard`). Пропсы при этом **сериализуются**: можно передавать строки, числа, массивы, объекты, `Date`, но **нельзя обычные функции** (кроме Server Actions).
2. **Client Component не может импортировать Server Component.** Всё, что импортирует файл с `'use client'`, тоже становится клиентским. (Обойти можно, передав серверный компонент как `children`.)
3. `'use client'` — это **граница**, а не метка «только браузер». Ставьте её как можно «ниже» по дереву: чем меньше клиентских компонентов, тем меньше JS скачивает пользователь.

```
layout.tsx            (Server)
└── page.tsx          (Server, async — читает db)
    ├── PostForm      (Client — useActionState)
    └── PostList      (Server — просто разметка)
        └── PostCard × N   (Client — onClick, useTransition, confirm)
```

---

### App Router: «магические» файлы

В папке `app/` имя файла имеет значение. Next.js находит эти файлы сам и связывает их через React-механизмы.

| Файл | Что делает | Server / Client | Есть в проекте |
|---|---|---|---|
| `page.tsx` | **Страница** — содержимое маршрута. `app/page.tsx` → `/`, `app/posts/page.tsx` → `/posts`. Без `page.tsx` папка не становится маршрутом | Server (по умолчанию) | ✅ |
| `layout.tsx` | **Обёртка** для страниц этой папки и всех вложенных. Корневой layout обязан содержать `<html>` и `<body>`. **Не перерендеривается** при переходе между дочерними страницами (сохраняет состояние) | Server (по умолчанию) | ✅ |
| `loading.tsx` | **Индикатор загрузки.** Next.js оборачивает страницу в `<Suspense fallback={<Loading />}>` — показывается, пока async-страница ждёт данные | Server (по умолчанию) | ✅ |
| `error.tsx` | **Error Boundary.** Ловит ошибки страницы и её детей, получает `error` и `reset()`. Обязан быть Client Component (Error Boundary в React работают только на клиенте) | **Client** обязательно | ✅ |
| `not-found.tsx` | Страница **404**. Показывается для несуществующих URL или при вызове `notFound()` из `next/navigation` | Server (по умолчанию) | ❌ (задание 3) |

Есть и другие: `template.tsx`, `route.ts` (настоящий API-эндпоинт), `global-error.tsx`, `opengraph-image.tsx`, а в корне проекта — `middleware.ts`.

---

### Server Actions

**Server Action** — асинхронная функция, которая **выполняется на сервере**, но вызывается из клиентского кода как обычная функция. Объявляется директивой `'use server'` (в начале файла — тогда серверными становятся все экспортируемые функции).

```ts
// app/actions/posts.ts
'use server';

export async function likePost(id: number): Promise<void> {
  const post = db.posts.find(p => p.id === id); // работает на сервере!
  if (post) post.likes += 1;
  revalidatePath('/');                          // «главная устарела — перерендери»
}

// components/PostCard.tsx ('use client')
startLikeTransition(async () => {
  await likePost(post.id);                      // выглядит как вызов функции...
});
```

**Что происходит под капотом:** при сборке Next.js заменяет импорт `likePost` в клиентском коде на «заглушку» с уникальным ID. При вызове браузер отправляет POST-запрос на текущую страницу с этим ID и аргументами; сервер выполняет настоящую функцию и возвращает результат — и, если был `revalidatePath`, **сразу свежий RSC-payload страницы**. Один запрос вместо «мутация + повторная загрузка».

#### Две сигнатуры в проекте

| Использование | Сигнатура | Где |
|---|---|---|
| С формой через `useActionState` | `(prevState: PostFormState, formData: FormData) => Promise<PostFormState>` | `createPost` → `PostForm.tsx` |
| Как обычная функция через `useTransition` | `(id: number) => Promise<void>` | `likePost`, `deletePost` → `PostCard.tsx` |

#### `revalidatePath` — замена `invalidateQueries`

| v6 (TanStack Query) | v7 (Next.js) |
|---|---|
| `onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })` | `revalidatePath('/')` внутри Server Action |
| браузер делает **второй** запрос `getPosts()` | сервер сразу присылает обновлённую страницу в ответе на action |
| кеш живёт в браузере | кеш живёт в Next.js на сервере |

Есть и `revalidateTag('posts')` — точечная инвалидация данных, помеченных тегом.

> ⚠️ **Server Action — это публичный HTTP-эндпоинт.** Любой может вызвать его с любыми аргументами. Поэтому валидация (`if (!title) return { error }`) и проверка прав **всегда** делаются на сервере, даже если в форме стоит `required`.

#### Server Actions vs REST API

| | Server Actions | REST API (`app/api/.../route.ts` или отдельный бэкенд) |
|---|---|---|
| Как вызвать | `await likePost(id)` — как функцию | `fetch('/api/posts/1/like', { method: 'PATCH' })` |
| Типизация | **сквозная**: TypeScript проверяет аргументы и результат | вручную описывать типы запроса/ответа |
| Работа без JS | ✅ с `<form action>` (прогрессивное улучшение) | ❌ |
| Обновление UI | `revalidatePath` — в том же ответе | отдельный повторный запрос |
| Кто может вызывать | только ваше Next.js-приложение (URL — внутренний) | кто угодно: мобильное приложение, другие сервисы, партнёры |
| HTTP-методы, кеширование GET | только POST, для чтения не предназначены | любые методы, кешируемые GET |
| **Когда выбирать** | **мутации** (создать/изменить/удалить) из UI вашего Next.js-приложения | публичный API, мобильные клиенты, вебхуки, чтение данных внешними клиентами |

Для **чтения** в App Router не нужно ни то, ни другое: Server Component просто читает данные (`db.posts`, `await prisma...`, `await fetch(...)`).

---

### Структура проекта

```
07-nextjs/
├── package.json             — зависимости: next, react, react-dom
├── next.config.ts           — настройки Next.js (пока пустые)
├── tsconfig.json            — TypeScript + алиас @/* → корень проекта
├── README.md
├── lib/
│   ├── types.ts             — interface Post, PostFormState
│   └── db.ts                — in-memory «база» в globalThis (переживает HMR)
├── app/                     — App Router: структура папок = структура URL
│   ├── layout.tsx           — корневой layout: <html>, <body>, metadata
│   ├── globals.css          — глобальные стили
│   ├── page.tsx             — главная «/»: async Server Component, читает db
│   ├── page.module.css
│   ├── loading.tsx          — спиннер (Suspense)
│   ├── loading.module.css
│   ├── error.tsx            — Error Boundary ('use client')
│   ├── error.module.css
│   └── actions/
│       └── posts.ts         — Server Actions: createPost, likePost, deletePost
└── components/
    ├── PostForm.tsx         — 'use client': useActionState
    ├── PostForm.module.css
    ├── PostList.tsx         — Server Component: список / заглушка
    ├── PostList.module.css
    ├── PostCard.tsx         — 'use client': useTransition, confirm
    └── PostCard.module.css
```

`next-env.d.ts` и папка `.next/` создаются автоматически при первом `npm run dev` / `npm run build`.

---

### Как запустить

Нужен [Node.js](https://nodejs.org/) 18.18+ (лучше 20+).

```bash
cd 07-nextjs
npm install       # установить зависимости
npm run dev       # dev-сервер → откройте http://localhost:3000
npm run build     # продакшн-сборка + проверка типов TypeScript
npm run start     # запустить собранную версию (после build) → http://localhost:3000
```

Попробуйте:

- откройте приложение в **двух вкладках** — добавьте пост в одной и обновите другую. Пост виден в обеих: данные живут на сервере, а не в браузере (в v6 так не было);
- откройте «Просмотр кода страницы» (Ctrl+U) — посты уже есть в HTML. В v6 там был только пустой `<div id="root">`;
- отключите JavaScript в DevTools и отправьте форму — пост всё равно создастся (прогрессивное улучшение).

> Посты хранятся в памяти Node.js-процесса: после перезапуска сервера они пропадут. Это нормально для учебного примера — в v8 подключим настоящую БД.

---

### Задания для практики

1. **Сортировка через URL (`searchParams`).** Добавьте ссылки `?sort=newest` и `?sort=popular`. В `page.tsx` примите `{ searchParams }: { searchParams: Promise<{ sort?: string }> }` (в Next.js 15 это Promise — нужен `await`) и сортируйте посты на сервере. Сравните с Zustand из v6: состояние теперь в URL — им можно поделиться ссылкой, и оно переживает перезагрузку.
2. **Страница поста `/posts/[id]` (динамический роут).** Создайте `app/posts/[id]/page.tsx`, который получает `params` и показывает один пост. В `PostCard` сделайте заголовок ссылкой через `<Link href={`/posts/${post.id}`}>` из `next/link`. Добавьте `generateMetadata`, чтобы `<title>` был заголовком поста.
3. **`not-found.tsx`.** Создайте `app/not-found.tsx` с красивой страницей 404. В `app/posts/[id]/page.tsx` вызывайте `notFound()` из `next/navigation`, если пост не найден. Откройте `/posts/999`.
4. **`middleware.ts`.** В корне проекта создайте `middleware.ts`, который логирует каждый запрос (`console.log(request.nextUrl.pathname)`) и добавляет заголовок `x-frontend-evolution: v7`. Проверьте заголовок в DevTools → Network.
5. **Мгновенный лайк через `useOptimistic`.** В `PostCard` используйте `const [optimisticLikes, addOptimisticLike] = useOptimistic(post.likes, (cur) => cur + 1)` и вызывайте `addOptimisticLike()` внутри транзиции перед `await likePost(...)`. Лайк станет мгновенным, а при ошибке React сам откатит значение. Сравните с `onMutate` из задания v6.
6. **Проверьте `error.tsx`.** Временно добавьте в `page.tsx` `if (Math.random() < 0.5) throw new Error('Сервер устал')`. Посмотрите, как Error Boundary показывает ошибку и как работает кнопка «Попробовать снова» (`reset`).
7. **Со звёздочкой: ISR вместо SSR.** Замените `export const dynamic = 'force-dynamic'` на `export const revalidate = 30`, выполните `npm run build && npm run start`. Что изменилось? Почему пост всё равно появляется сразу после создания (подсказка: `revalidatePath`), а изменения, сделанные «в обход» actions, — только через 30 секунд?

---

### Что дальше: v8 — Full-stack с Prisma + PostgreSQL

Сейчас «база данных» — это массив в `globalThis`. Это хак: данные пропадают при перезапуске сервера, а в продакшене каждый serverless-воркер получает **свою** копию массива (пользователи видели бы разные ленты).

В v8 подключим **настоящую базу данных**:

- **PostgreSQL** — реляционная БД, где посты хранятся на диске и переживают перезапуски;
- **Prisma ORM** — описываем модель в `schema.prisma`, а Prisma генерирует **типобезопасный клиент**: `await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })` с автодополнением;
- **миграции** — история изменений структуры БД (`prisma migrate dev`);
- **убираем `globalThis`-хак** из `lib/db.ts` (останется только приём для одного экземпляра Prisma Client в dev-режиме);
- получаем **реальную персистентность**: посты одинаковы для всех пользователей и сохраняются навсегда.

Server Components и Server Actions останутся теми же — поменяется только то, **откуда** они берут данные. В этом и сила слоёной архитектуры.
