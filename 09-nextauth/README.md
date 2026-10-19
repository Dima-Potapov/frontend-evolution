# Версия 9: Next.js 15 + Auth.js (Google OAuth) + Prisma + PostgreSQL

Та же «Лента постов», что в v8: Next.js App Router, Server Components, Server Actions, PostgreSQL и Prisma.
Новое в этой версии: появились **пользователи**.

- войти можно через **Google** (OAuth 2.0) или через учебный **демо-вход по имени**;
- у каждого поста есть **автор**;
- лайк привязан к пользователю: **один человек может поставить один лайк**, а повторный клик его снимает;
- удалить пост может **только его автор**;
- гость читает ленту, но не может писать посты и ставить лайки.

Цвет подзаголовка этой версии — синий `#3b82f6`.

---

## 1. Что нового по сравнению с v8

| | v8 | v9 |
|---|---|---|
| Кто пользуется | все анонимны | гость или вошедший пользователь |
| Таблицы | `Post` | `User`, `Post`, `Like` + служебные `Account`, `Session`, `VerificationToken` |
| Лайк | число `likes` у поста, можно жать бесконечно | строка в таблице `Like (userId, postId)`, один лайк от одного человека |
| Удаление | может любой | только автор (проверка на сервере) |
| Подтверждение удаления | `window.confirm` | своё в карточке: «Подтвердить / Отмена» |
| Обновление лайка | ждём сервер | **оптимистично** (`useOptimistic`): сердечко меняется сразу |
| Новые файлы | — | `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/signin/page.tsx`, `components/AuthBar.tsx`, `lib/types.ts`, `types/next-auth.d.ts` |

## 2. Два слова, которые постоянно путают

| Термин | Вопрос | Пример в нашем коде |
|---|---|---|
| **Аутентификация** (authentication, AuthN) | «**Кто** ты?» | `const session = await auth()` — есть сессия или нет |
| **Авторизация** (authorization, AuthZ) | «**Что** тебе можно?» | `deleteMany({ where: { id, authorId: userId } })` — удалить можно только свой пост |

Сначала мы узнаём, кто пользователь, а потом решаем, что ему можно делать.

## 3. Как работает вход через Google (OAuth 2.0)

Пароли мы **не храним вообще**. Личность пользователя проверяет Google, а нам он сообщает: «Это Анна, вот её email и аватар».

```
Браузер                    Наш сервер (Next.js)                Google
   │  клик «Войти через Google»  │                                  │
   │ ──────────────────────────► │  signIn('google')                │
   │ ◄────── редирект ────────── │                                  │
   │ ─────────────────────────────────────────────────────────────► │  экран «Разрешить доступ?»
   │ ◄──────────── редирект на /api/auth/callback/google?code=XYZ ── │
   │ ──────────────────────────► │                                  │
   │                             │ ── code + AUTH_GOOGLE_SECRET ──► │
   │                             │ ◄── токены + профиль ─────────── │
   │                             │  PrismaAdapter: создать/найти     │
   │                             │  User + Account в PostgreSQL      │
   │ ◄── Set-Cookie: сессия ──── │                                  │
```

Важные детали:
- `code` сам по себе бесполезен. Обменять его на токены может только тот, у кого есть **секрет** `AUTH_GOOGLE_SECRET`, а секрет хранится только на сервере.
- Всю эту схему выполняет Auth.js в обработчике `app/api/auth/[...nextauth]/route.ts`. Нам остаётся написать одну строку: `export const { GET, POST } = handlers`.

## 4. Где хранится сессия: JWT или база данных

После входа браузер должен как-то «помнить» пользователя. Для этого используется **cookie**.

| Стратегия | Что лежит в cookie | Плюсы | Минусы |
|---|---|---|---|
| `jwt` (выбрана у нас) | зашифрованный токен с `id` пользователя | `auth()` не обращается к БД, работает быстро | токен сложно «отозвать» до истечения срока |
| `database` | случайный id, сама сессия хранится в таблице `Session` | сессию можно удалить в любой момент, например «выйти на всех устройствах» | каждый `auth()` делает запрос к БД |

Мы выбрали `jwt`, потому что провайдер Credentials (наш демо-вход) работает только с JWT.

Cookie имеет флаг **httpOnly**, поэтому JavaScript на странице (`document.cookie`) не может её прочитать. Даже если на страницу попадёт вредоносный скрипт (XSS), украсть сессию так не получится.

## 5. Связи между таблицами

```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]      // 1:N — у пользователя много постов
  likes Like[]
}

model Post {
  id       Int    @id @default(autoincrement())
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  likes    Like[]
}

model Like {               // N:M — «многие ко многим» через отдельную таблицу
  userId String
  postId Int
  @@id([userId, postId])   // составной ключ: пара (кто, что) уникальна
}
```

- **1:N (один ко многим):** у поста один автор, у автора много постов. В `Post` хранится внешний ключ `authorId`.
- **N:M (многие ко многим):** один пользователь лайкает много постов, у одного поста много лайков. Для такой связи нужна промежуточная таблица `Like`.
- **`@@id([userId, postId])`** не даёт поставить два лайка на один пост, причём это гарантирует **сама база данных**, а не только наш код.
- **`onDelete: Cascade`:** если удалить пост, его лайки удалятся автоматически.

Почему лайк больше не хранится числом? Число не знает, **кто** поставил лайк. Поэтому нельзя ни запретить повторный лайк, ни показать «вы уже лайкнули». Количество теперь считаем запросом: `_count: { select: { likes: true } }` (в SQL это `COUNT(*)`).

## 6. Главное правило: никогда не доверяй клиенту

Спрятать кнопку 🗑 у чужих постов — это только **удобство** интерфейса, а не защита. Server Action — это обычный HTTP-эндпоинт. Его можно вызвать вручную через DevTools или `curl`, даже если кнопки на экране нет.

Поэтому каждое действие в `app/actions/posts.ts` само выполняет проверки:

```ts
export async function deletePost(postId: number) {
  const userId = await currentUserId();            // 1. аутентификация
  if (!userId) throw new Error('Войдите...');

  const { count } = await prisma.post.deleteMany({ // 2. авторизация прямо в запросе
    where: { id: postId, authorId: userId },        //    чужой пост просто не найдётся
  });
  if (count === 0) throw new Error('Можно удалять только свои посты');
}
```

И ещё одно правило: `authorId` при создании поста берётся **из сессии**, а не из формы. Иначе пользователь мог бы подставить чужой id и писать от имени другого человека.

| Что | Где проверяется | Зачем |
|---|---|---|
| Скрыть форму от гостя | `page.tsx` | удобство |
| Скрыть 🗑 у чужих постов | `PostCard.tsx` (`isMine`) | удобство |
| Нельзя писать без входа | `createPost` | **защита** |
| Нельзя удалить чужое | `deletePost` | **защита** |
| Один лайк от одного человека | `@@id` в БД | **защита** на уровне данных |

## 7. Как запустить

```bash
# 1. PostgreSQL (например, через Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres

# 2. Переменные окружения
cp .env.example .env
npx auth secret            # создаст AUTH_SECRET (или: openssl rand -base64 32)

# 3. Зависимости и таблицы
npm install
npm run db:migrate         # применит миграцию prisma/migrations/..._init_auth

# 4. Запуск
npm run dev
```

Открой http://localhost:3000 → «Войти» → введи любое имя (демо-вход).

### Как подключить настоящий вход через Google (необязательно)

1. Открой [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. **Create credentials → OAuth client ID**, тип **Web application**. Если Google попросит, сначала настрой «OAuth consent screen» (тип External, добавь свой email в тестовые пользователи).
3. В поле **Authorized redirect URIs** добавь: `http://localhost:3000/api/auth/callback/google`.
4. Скопируй Client ID и Client Secret в `.env`:
   ```
   AUTH_GOOGLE_ID="....apps.googleusercontent.com"
   AUTH_GOOGLE_SECRET="..."
   ```
5. Перезапусти `npm run dev`. На странице входа появится кнопка «Войти через Google».

> Если `AUTH_GOOGLE_ID` пустой, кнопки Google просто не будет (см. `auth.ts`), и приложение не сломается.

### ⚠️ Демо-вход — только для учёбы

Демо-вход (`AUTH_DEMO_LOGIN=true`) пускает **любого человека под любым именем без пароля**. Он нужен только для того, чтобы проект запускался без настройки Google. В реальном проекте его нужно выключить: `AUTH_DEMO_LOGIN=false`.

### Частые проблемы

- **`MissingSecret`**: не задан `AUTH_SECRET` в `.env`.
- **После входа открывается чужой адрес или вход «не держится»**: проверь переменные `AUTH_URL` / `NEXTAUTH_URL` в окружении. Они должны совпадать с адресом, на котором открыт сайт, или вообще не быть заданы.
- **`redirect_uri_mismatch` от Google**: redirect URI в Google Cloud Console не совпадает с адресом сайта, вплоть до порта и `http`/`https`.

## 8. Структура проекта

```
09-nextauth/
├── auth.ts                          ← ВСЯ настройка Auth.js: провайдеры, адаптер, колбэки
├── types/next-auth.d.ts             ← добавляем user.id в тип сессии
├── app/
│   ├── api/auth/[...nextauth]/route.ts  ← /api/auth/* (вход, выход, колбэк Google)
│   ├── signin/page.tsx              ← своя страница входа (Server Actions signIn)
│   ├── actions/posts.ts             ← createPost / toggleLike / deletePost + проверки
│   ├── page.tsx                     ← auth() + один запрос с author, _count, likes
│   ├── layout.tsx, loading.tsx, error.tsx
├── components/
│   ├── AuthBar.tsx                  ← шапка: «Вы гость / Войти» или аватар + «Выйти»
│   ├── PostForm.tsx                 ← форма (видна только вошедшим)
│   ├── PostList.tsx
│   └── PostCard.tsx                 ← автор, оптимистичный лайк, удаление только своего
├── lib/
│   ├── prisma.ts                    ← синглтон PrismaClient (как в v8)
│   └── types.ts                     ← PostView: пост + автор + лайки «для экрана»
└── prisma/
    ├── schema.prisma                ← User, Post, Like + модели Auth.js
    └── migrations/
```

## 9. Как одна страница узнаёт всё сразу

```ts
const session = await auth();          // кто смотрит (или null)
const rows = await prisma.post.findMany({
  orderBy: { createdAt: 'desc' },
  include: {
    author: { select: { name: true, image: true } },          // JOIN "User"
    _count: { select: { likes: true } },                      // COUNT лайков
    likes:  { where: { userId: userId ?? '__guest__' } },     // есть ли МОЙ лайк
  },
});
```

Дальше «сырые» строки из БД превращаются в простой объект `PostView` с полями `likeCount`, `likedByMe` и `isMine`. Карточке не нужно знать, как устроена база данных.

## 10. Оптимистичный лайк (`useOptimistic`)

```ts
const [like, setOptimisticLike] = useOptimistic(
  { likedByMe: post.likedByMe, likeCount: post.likeCount },
  (state, liked: boolean) => state.likedByMe === liked
    ? state
    : { likedByMe: liked, likeCount: state.likeCount + (liked ? 1 : -1) },
);
```

Сердечко меняется **сразу** после клика, а запрос уходит на сервер в фоне. Когда после `revalidatePath('/')` приходят свежие данные, React заменяет оптимистичное значение настоящим. В редьюсер передаётся **желаемое** состояние (`liked: true/false`), а не команда «переключи». Поэтому повторное применение не испортит счётчик.

## 11. Почему `next` закреплён на 15.3.x

В `package.json` указано `"next": "~15.3.9"`. Причина в том, что в Next.js 15.5 есть известная ошибка: после Server Action с `revalidatePath` состояние `isPending` иногда **навсегда** остаётся `true`, и форма или кнопка «зависает». Мы воспроизвели это в автотестах (в том числе на v8) и на 15.3.9 не воспроизвели. Подробнее: [обсуждение в репозитории Next.js](https://github.com/vercel/next.js/discussions/88767).

Это хороший урок: «последняя версия» не всегда лучшая, а **закреплять версии** зависимостей нужно осознанно.

## 12. Сравнение v8 и v9 в коде

| Операция | v8 | v9 |
|---|---|---|
| Создать пост | `post.create({ data: { title, body } })` | `+ authorId: userId` из сессии, без сессии ошибка |
| Лайк | `post.update({ data: { likes: { increment: 1 } } })` | `like.create` / `like.delete` по ключу `(userId, postId)` |
| Удалить | `post.delete({ where: { id } })` | `post.deleteMany({ where: { id, authorId: userId } })` |
| Прочитать ленту | `post.findMany()` | `+ include: author, _count.likes, мой лайк` |

## 13. Задания для практики

1. **Страница «Мои посты».** Создай `app/my/page.tsx`: если `auth()` вернул `null`, вызови `redirect('/signin')`, иначе покажи только посты с `authorId = session.user.id`.
2. **Middleware.** Вместо проверки в странице защити `/my` через `middleware.ts` (`export { auth as middleware } from '@/auth'` + колбэк `authorized`). Сравни оба подхода.
3. **Редактирование.** Добавь Server Action `updatePost(id, title, body)`. Разрешай его только автору, по образцу `deletePost`.
4. **Атака из DevTools.** Войди как Борис, найди в DevTools запрос Server Action на удаление своего поста и повтори его с id поста Анны. Убедись, что сервер ответил ошибкой. Затем временно убери `authorId` из `where` и посмотри, что изменится. Не забудь вернуть проверку!
5. **Кто лайкнул.** Покажи под постом «Нравится: Анна, Борис» (`include: { likes: { include: { user: true } } }`).
6. **Сессии в базе.** Переключи `session.strategy` на `'database'`, временно выключив демо-вход, и войди через Google. Найди свою сессию в таблице `Session` через `npm run db:studio`, удали её и обнови страницу.
7. **GitHub-вход.** Подключи второй провайдер `GitHub` (`next-auth/providers/github`, переменные `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`).
8. **Роли.** Добавь в `User` поле `role String @default("user")`, а затем роль `admin`, которой можно удалять любые посты. Не забудь передать `role` через колбэки `jwt` и `session`.

## 14. Что дальше

Возможные направления после v9: тесты (Vitest + Playwright), деплой (Vercel + управляемый PostgreSQL), загрузка картинок, real-time обновления ленты (WebSocket / Server-Sent Events).
