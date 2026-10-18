# Версия 6: React + TypeScript + Zustand + TanStack Query

Та же «Лента постов»: добавить пост, лайкнуть, удалить (с подтверждением), заглушка «Постов пока нет», валидация пустых полей. Но теперь — в стиле **современного продакшн-приложения**.

> Подзаголовок теперь **индиго** (`#6366f1`). v4 (Vue) — зелёный, v5 (React) — бирюзовый, v6 — индиго.

---

### Что нового по сравнению с v5

| | v5: React + хуки | **v6: React + TS + Zustand + TanStack Query** |
|---|---|---|
| Язык | JavaScript (`.jsx`) | **TypeScript (`.tsx`, `.ts`)** |
| Данные постов | `useState` в компоненте | **TanStack Query** — кеш «серверных» данных |
| UI-состояние | `useState` / Context | **Zustand** — сортировка в отдельном сторе |
| Источник данных | массив в памяти компонента | **фейковый API** (`postsApi.ts`) с задержками, как настоящий сервер |
| Загрузка / ошибки | нет | `isLoading`, `isError`, `isPending` — **из коробки** |
| Стили | обычный CSS | **CSS Modules** (`*.module.css`) — изолированные классы |
| Новые фичи | — | сортировка «Новые / Популярные», дата поста, спиннер загрузки, `document.title` со счётчиком |

---

### Зачем TypeScript

TypeScript — это JavaScript **плюс типы**. Браузер TypeScript не понимает: перед запуском `tsc`/Vite стирает типы и получается обычный JS. Но пока вы пишете код, типы дают три суперсилы:

1. **Ошибки ловятся до запуска (на этапе компиляции).**
   ```ts
   likePost('5');      // ❌ Argument of type 'string' is not assignable to parameter of type 'number'
   post.titel;         // ❌ Property 'titel' does not exist on type 'Post'. Did you mean 'title'?
   setSortOrder('old') // ❌ '"old"' is not assignable to type 'SortOrder'
   ```
   В JavaScript все три ошибки всплыли бы только у пользователя в браузере (или не всплыли бы вовсе, а тихо сломали логику).
2. **Автодополнение в редакторе.** Напишите `post.` — VS Code покажет `id`, `title`, `body`, `likes`, `createdAt`. Не нужно помнить форму данных.
3. **Типы = документация.** Сигнатура `createPost(data: CreatePostDto): Promise<Post>` сразу говорит, что функция принимает и возвращает. Её не надо искать в коде.

И безопасный рефакторинг: переименовали поле в интерфейсе — компилятор покажет **все** места, которые нужно поправить.

---

### Zustand vs Redux

**Zustand** («состояние» по-немецки) — крошечная (~1 КБ) библиотека для глобального состояния. Весь наш стор — это одна функция `create`:

```ts
export const useUIStore = create<UIState>((set) => ({
  sortOrder: 'newest',
  setSortOrder: (sortOrder) => set({ sortOrder }),
}));

// В любом компоненте, без Provider:
const sortOrder = useUIStore(state => state.sortOrder);
```

| | Redux (классический) | Redux Toolkit | **Zustand** |
|---|---|---|---|
| Сколько кода на простой стор | много: actions, action types, reducer, store | средне: `createSlice` + `configureStore` | **одна функция `create`** |
| Нужен `<Provider>` | да | да | **нет** |
| Как менять состояние | `dispatch({ type: 'SET_SORT', payload })` | `dispatch(setSort(order))` | **просто вызвать `setSortOrder(order)`** |
| Иммутабельность | вручную (`...state`) | Immer внутри | `set()` делает shallow merge |
| Подписка на часть стора | `useSelector` | `useSelector` | **селектор в самом хуке** `useUIStore(s => s.x)` |
| DevTools | да | да | да (через middleware `devtools`) |
| Размер | ~2 КБ + react-redux | ~12 КБ | **~1 КБ** |
| Когда выбирать | легаси-проекты | большие команды, строгие правила | **большинство новых проектов** |

> Селектор `state => state.sortOrder` важен: компонент перерендерится, **только** когда изменится именно `sortOrder`, а не любое поле стора.

---

### TanStack Query: что он решает

Раньше (v5) данные постов жили в `useState`. Но в реальном приложении посты лежат **на сервере**, и сразу появляется куча вопросов:

- показать спиннер, пока идёт запрос; показать ошибку, если запрос упал;
- повторить запрос при сбое сети;
- не делать один и тот же запрос дважды, если два компонента просят одни данные;
- после создания поста — обновить список;
- выкинуть устаревшие данные из памяти.

Писать это руками через `useEffect` + `useState` — десятки строк с багами (гонки запросов, утечки, двойные запросы в StrictMode). **TanStack Query** (раньше — React Query) делает всё это сам.

#### Ключевые понятия

| Понятие | Что это | Где в коде |
|---|---|---|
| `queryKey` | Уникальный «адрес» данных в кеше. Массив: `['posts']`, `['posts', id]`, `['posts', { sort }]` | `hooks/usePosts.ts` |
| `queryFn` | Функция, которая **достаёт** данные (возвращает Promise) | `queryFn: postsApi.getPosts` |
| `useQuery` | Хук чтения: отдаёт `{ data, isLoading, isError, error, isFetching }` | `usePostsQuery()` |
| `useMutation` | Хук изменения (POST/PATCH/DELETE): отдаёт `{ mutate, isPending, isError }` | `useCreatePost()`, `useLikePost()`, `useDeletePost()` |
| `invalidateQueries` | «Данные по этому ключу устарели» → Query сам перезапросит их | `onSuccess` в мутациях |
| `isLoading` | Первая загрузка (данных ещё нет вообще) | спиннер в `App.tsx` |
| `isPending` (у мутации) | Запрос мутации сейчас «летит» на сервер | «Публикация...», «...» на кнопках |
| `staleTime` | Сколько данные считаются свежими и не перезапрашиваются | `staleTime: 0` |
| `QueryClient` | Хранилище кеша, одно на приложение; передаётся через `QueryClientProvider` | `main.tsx` |

#### Поток данных при создании поста

```
Пользователь жмёт «Опубликовать»
  → createPost({ title, body })        (useMutation.mutate)
  → isPending = true → кнопка «Публикация...»
  → postsApi.createPost()              (400 мс «сеть»)
  → onSuccess → invalidateQueries(['posts'])
  → useQuery сам вызывает postsApi.getPosts()   (600 мс)
  → data обновилась → App перерендерился → новый пост в списке
```

Это **пессимистичное** обновление: ждём ответа сервера, потом показываем. Бывает и **оптимистичное** — сразу меняем кеш (`setQueryData`), а при ошибке откатываем (см. задания).

---

### Server state vs Client state

Главная архитектурная идея версии: **состояние бывает двух видов, и хранить их нужно по-разному.**

| | Server state (серверное) | Client state (клиентское / UI) |
|---|---|---|
| Пример | список постов, лайки, профиль пользователя | порядок сортировки, открыта ли модалка, текст в инпуте, тема |
| Где «истина» | **на сервере**; у нас — лишь копия (кеш) | **только в браузере** |
| Может устареть? | да — другой пользователь мог лайкнуть пост | нет |
| Асинхронное? | да (загрузка, ошибки, повторы) | нет, мгновенное |
| Чем управляем | **TanStack Query** | **Zustand** (глобальное) или `useState` (локальное) |
| В нашем коде | `hooks/usePosts.ts` | `store/useUIStore.ts`, форма в `PostForm.tsx` |

Типичная ошибка — класть серверные данные в Redux/Zustand и руками писать `isLoading`, `error`, повторную загрузку. С TanStack Query глобальный стор становится маленьким: в нём остаётся только настоящее UI-состояние.

---

### Структура проекта

```
06-react-ts/
├── index.html               — точка входа, <div id="root">
├── package.json             — зависимости и скрипты
├── tsconfig.json            — «корневой» конфиг TS: ссылается на два других
├── tsconfig.app.json        — правила TS для кода приложения (src/)
├── tsconfig.node.json       — правила TS для vite.config.ts (запускается в Node)
├── vite.config.ts           — настройки Vite + плагин React
└── src/
    ├── main.tsx             — createRoot + QueryClientProvider
    ├── App.tsx              — корневой компонент: запрос постов, сортировка, статистика
    ├── App.module.css
    ├── index.css            — глобальные стили (сброс, body)
    ├── vite-env.d.ts        — типы Vite (чтобы TS понимал импорт *.module.css)
    ├── types/
    │   └── post.ts          — interface Post, CreatePostDto, SortOrder
    ├── api/
    │   └── postsApi.ts      — фейковый сервер: массив в памяти + задержки
    ├── store/
    │   └── useUIStore.ts    — Zustand: sortOrder
    ├── hooks/
    │   └── usePosts.ts      — TanStack Query: useQuery + 3 × useMutation
    └── components/
        ├── PostForm.tsx     — форма с валидацией и isPending
        ├── PostForm.module.css
        ├── PostList.tsx     — список / заглушка
        ├── PostList.module.css
        ├── PostCard.tsx     — карточка (memo, лайк, удаление)
        └── PostCard.module.css
```

Слои зависят только «вниз»: `components → hooks/store → api → types`. Компоненты не знают, что API фейковый: замените тело `postsApi` на `fetch` — и ни один компонент не изменится.

---

### Ключевые концепции TypeScript в проекте

| Концепция | Пример | Где |
|---|---|---|
| **Interface** — описание формы объекта | `interface Post { id: number; title: string; ... }` | `types/post.ts` |
| **Union literal type** — только перечисленные значения | `type SortOrder = 'newest' \| 'mostLiked'` | `types/post.ts` |
| **`Pick<T, K>`** — взять часть полей | `type CreatePostDto = Pick<Post, 'title' \| 'body'>` | `types/post.ts` |
| **`Partial<T>`** — все поля необязательные | `useState<Partial<CreatePostDto>>({})` — объект ошибок, где может не быть ни одного поля | `PostForm.tsx` |
| **`keyof T`** — союз имён полей | `handleChange(field: keyof CreatePostDto, ...)` → только `'title' \| 'body'` | `PostForm.tsx` |
| **Generics** — тип-параметр | `create<UIState>(...)`, `useState<CreatePostDto>(...)`, `Promise<Post[]>` | стор, форма, API |
| **Вывод типов (inference)** | `useQuery` сам понимает, что `data` — `Post[] \| undefined`, из типа `queryFn` | `App.tsx` |
| **Явные возвращаемые типы** | `async getPosts(): Promise<Post[]>` — «контракт» API | `postsApi.ts` |
| **`as const`** | `['posts'] as const` → тип `readonly ['posts']`, а не `string[]` | `usePosts.ts` |
| **Non-null assertion `!`** | `posts.find(...)!` — «точно не `undefined`». Опасно: компилятор верит на слово | `postsApi.ts` |
| **Сужение типов (narrowing)** | `if (!rootElement) throw ...` — дальше TS знает, что это `HTMLElement`; `error instanceof Error` | `main.tsx`, `App.tsx` |
| **`import type`** | `import type { Post } from ...` — импорт только типа, стирается при сборке | везде |
| **Типы событий React** | `FormEvent<HTMLFormElement>` | `PostForm.tsx` |

---

### Как запустить

Нужен [Node.js](https://nodejs.org/) 18+.

```bash
cd 06-react-ts
npm install       # установить зависимости
npm run dev       # dev-сервер → http://localhost:5173
npm run build     # проверка типов (tsc -b) + сборка в dist/
npm run preview   # посмотреть собранную версию
```

> `npm run build` сначала запускает `tsc -b`. Если в коде есть ошибка типов — сборка **упадёт**. Так TypeScript не пускает баги в продакшн.

Обратите внимание: «сервер» живёт в памяти вкладки — после перезагрузки страницы посты пропадут. Это нормально для учебного фейкового API.

---

### Задания для практики

1. **React Query DevTools.** `npm i -D @tanstack/react-query-devtools`, добавьте `<ReactQueryDevtools />` внутрь `QueryClientProvider` в `main.tsx`. Посмотрите, как ключ `['posts']` становится `fetching → fresh → stale` после каждой мутации.
2. **Оптимистичный лайк.** В `useLikePost` добавьте `onMutate`: сразу увеличьте `likes` в кеше через `queryClient.setQueryData<Post[]>(['posts'], ...)`, сохраните старое значение и откатите его в `onError`. Лайк станет мгновенным, без «...».
3. **Сломайте сервер.** В `postsApi.getPosts` бросайте ошибку в 50% случаев (`Math.random() < 0.5`). Посмотрите, как работают `retry: 1` и блок ошибки в `App.tsx`. Добавьте кнопку «Повторить» через `refetch` из `useQuery`.
4. **Поиск в Zustand.** Добавьте в `UIState` поле `search: string` и `setSearch`. Фильтруйте `sortedPosts` в `useMemo`. Подумайте: почему поиск — это client state, а не server state?
5. **Строгий тип для `Omit`.** Опишите `type UpdatePostDto = Partial<Omit<Post, 'id' | 'createdAt'>>` и реализуйте `postsApi.updatePost(id, data)` + хук `useUpdatePost` для редактирования поста.
6. **Сохранение сортировки.** Подключите middleware `persist` из `zustand/middleware`, чтобы выбранная сортировка переживала перезагрузку страницы.
7. **Со звёздочкой: настоящий API.** Замените тело `postsApi` на `fetch('https://jsonplaceholder.typicode.com/posts')`. Какие типы придётся поправить? Почему компоненты менять не нужно?

---

### Что дальше: v7 — Next.js (App Router)

Сейчас всё приложение — **SPA**: браузер получает пустой `<div id="root">`, скачивает JS и только потом рисует интерфейс и делает запросы. В v7 перейдём на **Next.js**:

- **SSR (Server-Side Rendering)** — страница рендерится на сервере, пользователь сразу получает готовый HTML (быстрее первый показ, лучше SEO);
- **SSG (Static Site Generation)** — страницы собираются заранее при сборке и раздаются как статика;
- **Файловая маршрутизация** — папка `app/posts/[id]/page.tsx` автоматически становится маршрутом `/posts/123`, без react-router;
- **Server Components** — компоненты, которые выполняются **только на сервере** и могут прямо обращаться к базе данных; в браузер уходит лишь HTML, без их JS;
- **Server Actions** — функции с `'use server'`, которые вызываются из формы как обычные функции, но выполняются на сервере. Во многих случаях они заменят наш `postsApi` и даже часть TanStack Query.
