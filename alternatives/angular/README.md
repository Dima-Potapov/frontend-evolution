# 🅰️ Альтернатива: Angular — фреймворк «всё включено»

> **Лента постов** на [Angular 21](https://angular.dev/): TypeScript с первого дня, классы с декораторами,
> Dependency Injection, сигналы, Reactive Forms и RxJS.
> Если React — это «библиотека для UI, остальное собери сам», то Angular — **готовый завод**:
> роутинг, формы, HTTP, тесты, CLI и правила организации кода идут в одной коробке.

Цвет версии: **`#dd0031`** (фирменный красный Angular).

---

## 📍 Где эта версия на карте проекта

Вспомним четыре вопроса, на которые отвечает каждая версия:

| Вопрос | Ответ Angular |
|---|---|
| Где хранятся данные? | в **сервисе** (`PostService`), который раздаётся через **DI** |
| Как экран узнаёт об изменениях? | **сигналы** (`signal`, `computed`) — та же идея, что в Solid |
| Как описывается интерфейс? | **HTML-шаблоны** с `@if`, `@for`, `{{ }}`, `[prop]`, `(event)` |
| Где выполняется код? | в браузере (SSR есть, но здесь отключён) |

Angular — самый «взрослый» и корпоративный из всех вариантов: его выбирают банки, госсектор,
крупные компании с большими командами, где важнее единые правила, чем свобода выбора.

---

## 🧬 Немного истории (почему Angular «странный»)

| Год | Событие |
|---|---|
| 2010 | **AngularJS** (1.x) — двусторонняя привязка `ng-model`, «магия» `$scope`. Огромная популярность. |
| 2016 | **Angular 2** — полная переписка с нуля на TypeScript. Несовместим с AngularJS → многие ушли на React/Vue. |
| 2016–2022 | Модули `NgModule`, `zone.js`, RxJS везде. Мощно, но много «церемоний». |
| 2022–2023 | Standalone-компоненты (без `NgModule`), **сигналы**, новый control flow `@if/@for`. |
| 2024–2025 | Zoneless (без `zone.js`) по умолчанию, `input()`/`output()`-функции, ускоренная сборка на esbuild/Vite. |

Сегодняшний Angular выглядит заметно проще и ближе к Solid/Vue, чем Angular 2016 года.
В коде этой версии **старые варианты синтаксиса указаны в комментариях** — ты встретишь их в существующих проектах.

> ⚙️ Версия: Angular **21 (LTS)**. Новейший Angular 22 требует Node.js ≥ 22.22, а на машине, где собирался пример, был 22.14.

---

## 🚀 Запуск

```bash
cd alternatives/angular
npm install         # .npmrc уже содержит legacy-peer-deps=true (обход бага npm с peer-зависимостями)
npm start           # = ng serve → http://localhost:4200
npm run build       # = ng build → dist/angular/browser
```

`ng` — это **Angular CLI**: он создаёт проект (`ng new`), генерирует компоненты
(`ng generate component post-card`), собирает, тестирует и обновляет версии (`ng update`).

---

## 📁 Структура

```
alternatives/angular/
├── angular.json                 ← конфигурация CLI (сборка, бюджеты размера)
├── package.json / .npmrc
├── tsconfig*.json               ← TypeScript в строгом режиме
└── src/
    ├── index.html               ← <app-root></app-root>
    ├── main.ts                  ← bootstrapApplication(App, appConfig)
    ├── styles.css               ← глобальные стили
    └── app/
        ├── app.config.ts        ← глобальные провайдеры (DI-настройки приложения)
        ├── app.ts / app.html    ← корневой компонент
        ├── models/post.model.ts ← интерфейс Post
        ├── services/
        │   └── post.service.ts  ← ⭐ состояние + методы (DI, signals, toObservable)
        └── components/
            ├── post-form/       ← ⭐ Reactive Forms + RxJS-автосохранение черновика
            ├── post-list/       ← «глупый» компонент: input() + output() + @for/@empty
            └── post-card/       ← карточка: signal confirmDelete, DatePipe
```

Соглашение Angular: **один компонент — одна папка**, класс в `.ts`, шаблон в `.html`
(для маленьких шаблонов можно писать `template:` прямо в декораторе, как в `post-list.ts`).

---

## 🧱 Компонент = класс + декоратор

```ts
@Component({
  selector: 'app-post-card',      // имя тега в HTML
  imports: [DatePipe],            // что используется в шаблоне
  templateUrl: './post-card.html',
})
export class PostCard {
  readonly post = input.required<Post>();   // входной параметр (props)
  readonly like = output<number>();         // событие наружу
  protected readonly confirmDelete = signal(false);   // локальное состояние
}
```

Декоратор `@Component` — это **метаданные**: класс сам по себе обычный, а декоратор говорит Angular,
как его использовать. Похоже на v03 (классы) и v05a (классовые компоненты React), но экземпляры
создаёт фреймворк, а не ты.

---

## 💉 Dependency Injection — главная особенность

```ts
@Injectable({ providedIn: 'root' })   // один экземпляр на всё приложение
export class PostService { ... }

export class App {
  protected readonly postService = inject(PostService);  // «дай мне PostService»
}
```

**Что это даёт:** компонент не знает, *как* создаётся сервис и *откуда* он берётся.
Он просто просит зависимость — DI-контейнер её находит или создаёт.

Как другие версии решали ту же задачу «как компоненту добраться до store»:

| Версия | Способ |
|---|---|
| v03 OOP | `new PostStore()` в `App.js`, руками передаём в конструкторы View |
| v05a Redux | `<Provider store>` + `connect()` |
| v05b MobX | `import { postStore }` — модуль-синглтон |
| v06 Zustand | `import { useUIStore }` — хук-синглтон |
| **Angular** | **`inject(PostService)` — контейнер DI** |

**Где DI особенно полезен — тесты:**

```ts
TestBed.configureTestingModule({
  providers: [{ provide: PostService, useClass: FakePostService }],
});
```

Подменили сервис — и все компоненты получают фейк, ни одной строки в них не меняя.

Старый синтаксис (встретишь повсюду): `constructor(private postService: PostService) {}`.

---

## 📡 Сигналы — новая реактивность Angular

```ts
private readonly _posts = signal<Post[]>([]);              // значение
readonly posts      = this._posts.asReadonly();            // только чтение наружу
readonly totalLikes = computed(() => this._posts().reduce(...));  // кэшируемое вычисление

this._posts.update(posts => [post, ...posts]);             // изменение
effect(() => document.title = `(${this.postsCount()})`);   // побочный эффект
```

- В шаблоне сигнал читается вызовом: `{{ postService.postsCount() }}` — **как в Solid**.
- Сигналы сравнивают по ссылке, поэтому массив обновляем **иммутабельно** (как в React/Redux).
- Массивов зависимостей нет: `computed` и `effect` сами видят, что прочитано.

### Zone.js и zoneless

До сигналов Angular узнавал об изменениях через **zone.js** — библиотеку, которая «перехватывала»
*все* асинхронные события в браузере (клики, таймеры, запросы) и после каждого запускала проверку
**всего** дерева компонентов. Это работало «магически», но было медленно и непрозрачно.

Этот проект создан как **zoneless** (по умолчанию в новых версиях): обновление экрана запускают
сигналы и события шаблона. Отсюда интересный эффект — обновление DOM происходит **асинхронно**
(в следующем микротаске), а не мгновенно после клика.

---

## 🌊 RxJS — потоки событий

RxJS — библиотека для работы с **потоками** значений во времени (`Observable`). В Angular она встроена
глубоко: `HttpClient`, `Router`, формы возвращают Observable.

В `post-form.ts` из потока изменений формы собрано автосохранение черновика:

```ts
this.form.valueChanges.pipe(
  debounceTime(500),          // подождать паузу в наборе
  map(v => JSON.stringify(v)),
  distinctUntilChanged(),     // пропустить, если ничего не поменялось
  tap(json => localStorage.setItem(DRAFT_KEY, json)),
)
```

Набери текст в форме, подожди полсекунды и перезагрузи страницу — черновик восстановится.

**Сигналы vs RxJS — когда что:**

| | Сигналы | RxJS |
|---|---|---|
| Что это | текущее **значение** | **поток** событий во времени |
| Хорошо для | состояния UI, вычисляемых значений | debounce, отмены запросов, объединения потоков, WebSocket |
| Сложность | низкая | высокая (100+ операторов) |

Мосты между мирами: `toSignal(observable$)` и `toObservable(signal)` (оба есть в коде).

До Angular 16 состояние обычно хранили в `BehaviorSubject` и выводили через `| async`:

```ts
private posts$$ = new BehaviorSubject<Post[]>([]);
posts$ = this.posts$$.asObservable();
// в шаблоне: @for (post of posts$ | async; track post.id)
```

---

## 📝 Reactive Forms — валидация из коробки

```ts
form = this.fb.group({
  title: ['', [Validators.required, Validators.minLength(3)]],
  body:  ['', [Validators.required, Validators.minLength(3)]],
});
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="title" />
```

Модель формы живёт в классе, шаблон к ней привязывается. У каждого поля есть состояние:
`valid`, `invalid`, `touched`, `dirty`, `errors`. Во всех прошлых версиях валидацию мы писали руками;
в React для этого обычно ставят react-hook-form + zod.

Есть ещё **Template-driven forms** (`[(ngModel)]`) — проще, ближе к `v-model` во Vue.

---

## 🧩 Синтаксис шаблонов — шпаргалка

| Синтаксис | Что делает | React | Vue |
|---|---|---|---|
| `{{ expr }}` | вывод значения | `{expr}` | `{{ expr }}` |
| `[value]="expr"` | привязка свойства | `value={expr}` | `:value="expr"` |
| `(click)="fn()"` | событие | `onClick={fn}` | `@click="fn"` |
| `[(ngModel)]="x"` | двусторонняя привязка | — | `v-model="x"` |
| `[class.active]="cond"` | класс по условию | `className={cond ? ...}` | `:class="{ active: cond }"` |
| `@if (c) {} @else {}` | условие | `c ? a : b` | `v-if / v-else` |
| `@for (x of xs; track x.id) {} @empty {}` | список + пустое состояние | `xs.map(...)` + `key` | `v-for` + `:key` |
| `{{ date \| date:'d MMM' }}` | пайп-форматтер | функция | (фильтры Vue 2) |

Старый control flow: `*ngIf="cond"`, `*ngFor="let x of xs; trackBy: fn"` — встретишь во всех проектах до 2024 года.

---

## 🔁 Один и тот же лайк — во всех мирах

```ts
// v05 React:    dispatch({ type: 'LIKE', id })      → reducer → новый массив → перерендер
// v05b MobX:    postStore.likePost(id)              → post.likes++ → observer
// Solid:        setPosts(p => p.id === id, 'likes', l => l + 1)
// Angular:      (like)="postService.likePost($event)"   ← событие из PostCard через PostList
//               → _posts.update(map(...))            → сигнал → обновление шаблона
```

Обрати внимание на путь события в Angular: `PostCard` → `output like` → `PostList` → `output like` → `App`
→ `PostService`. Так сделано намеренно, чтобы показать `input()/output()`. При этом `PostForm`
берёт сервис через DI напрямую — оба подхода нормальны, выбор зависит от того, хотим ли мы,
чтобы компонент знал о сервисе («умный») или нет («глупый», переиспользуемый).

---

## ⚖️ Angular vs React vs Vue

| | Angular | React | Vue |
|---|---|---|---|
| Тип | фреймворк «всё включено» | библиотека UI | прогрессивный фреймворк |
| Язык | TypeScript обязателен | JS/TS | JS/TS |
| Шаблоны | HTML + свой синтаксис | JSX | HTML + директивы / JSX |
| Состояние | сервисы + DI + сигналы | хуки + сторонние сторы | Pinia |
| Формы, HTTP, роутер | встроены | сторонние библиотеки | роутер официальный, остальное — сторонние |
| Порог входа | высокий | средний | низкий |
| Где популярен | enterprise, банки, госсектор | везде, стартапы | Азия, Европа, малые и средние команды |
| Сборка JS (этот проект) | ~187 КБ (53 КБ gzip) | ~165–211 КБ (v05a, v05b) | ~71 КБ (v04) |

---

## 👍 Плюсы и 👎 минусы

**Плюсы**
- Единые правила: в любом Angular-проекте структура и подходы похожи — легко переходить между командами.
- Всё из коробки: роутер, формы, HTTP, i18n, тестирование, CLI, `ng update` для миграций.
- DI делает код тестируемым и модульным.
- Строгий TypeScript везде, включая шаблоны.

**Минусы**
- Много концепций сразу: декораторы, DI, RxJS, пайпы, директивы, провайдеры.
- Больше «церемоний» и кода для простых вещей.
- Исторический багаж: в проектах встречаются и `NgModule`, и `*ngIf`, и `BehaviorSubject`, и сигналы одновременно.
- RxJS сам по себе — отдельная большая тема.

---

## 🏋️ Практические задания

1. **Генератор.** Выполни `npx ng generate component components/post-stats` и вынеси строку статистики в отдельный компонент. Посмотри, какие файлы создал CLI.
2. **Сломать DI.** Убери `providedIn: 'root'` из `PostService` и посмотри на ошибку. Потом добавь `providers: [PostService]` в `@Component` у `App` — и объясни разницу (подсказка: область видимости экземпляра).
3. **Два экземпляра.** Добавь `providers: [PostService]` в `PostForm`. Почему новые посты перестали появляться в списке?
4. **Старый синтаксис.** Перепиши `post-card.html` на `*ngIf` / `ng-template` (нужно импортировать `NgIf`). Сравни читаемость с `@if`.
5. **BehaviorSubject.** Сделай копию `PostService` на `BehaviorSubject` вместо сигналов и выведи посты через `| async`. Что изменилось в шаблоне и компонентах?
6. **Свой валидатор.** Напиши валидатор `noShouting`, запрещающий заголовок целиком ЗАГЛАВНЫМИ буквами, и покажи для него сообщение об ошибке.
7. **Сортировка.** Добавь в сервис `signal<'new' | 'likes'>` и `computed` с отсортированным списком; переключатель — в `App`.
8. **HttpClient.** Подключи `provideHttpClient()` в `app.config.ts` и загрузи стартовые посты с `https://jsonplaceholder.typicode.com/posts?_limit=3`. Покажи «Загрузка…» (подсказка: `toSignal(http.get(...))`).
9. **Свой пайп.** Создай `relativeTime`-пайп («5 минут назад») и замени им `date` в карточке.
10. **Тест с фейком.** Напиши unit-тест для `PostCard` (`ng test`), где `PostService` подменён через `providers`.

---

## 🎯 Ключевые мысли

- Angular — это **готовая архитектура**, а не набор библиотек: многое решено за тебя.
- **DI** — способ получать зависимости, не создавая их самому. Главная идея, которой нет в React/Vue «из коробки».
- **Сигналы** в Angular — та же идея, что в Solid и Vue: точечная реактивность без массивов зависимостей.
- **RxJS** — для потоков событий во времени; для простого состояния сейчас используют сигналы.
- Если понял v03 (классы + store + подписки), то Angular — это v03, где фреймворк сам создаёт классы,
  связывает их через DI и обновляет экран по сигналам.
