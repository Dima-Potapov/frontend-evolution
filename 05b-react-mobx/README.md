# Версия 5b: React 18 + MobX 6 (Observable State)

Та же «Лента постов»: добавить пост, лайкнуть, удалить с подтверждением, пустое состояние, валидация формы. Но состояние приложения теперь живёт в **MobX** — библиотеке реактивного состояния, где store — это обычный ES-класс, а изменения делаются **прямыми мутациями**: `post.likes++`.

```
... → 05 React (хуки) → 05a React (классы) + Redux → [05b React + MobX] → 06 React + TS → ...
```

Цвет версии — фиолетовый `#a78bfa`.

---

## Содержание

1. [Что такое MobX и его философия](#1-что-такое-mobx-и-его-философия)
2. [Как запустить](#2-как-запустить)
3. [Структура проекта](#3-структура-проекта)
4. [Архитектура: class PostStore + makeAutoObservable](#4-архитектура-class-poststore--makeautoobservable)
5. [Ключевые концепции: Observable, Computed, Action, Reaction, observer()](#5-ключевые-концепции)
6. [Почему в MobX можно мутировать state](#6-почему-в-mobx-можно-мутировать-state)
7. [observer(): когда компонент перерисовывается](#7-observer-когда-компонент-перерисовывается)
8. [Granular reactivity — точечные перерисовки](#8-granular-reactivity--точечные-перерисовки)
9. [Сравнение с Redux (v05a)](#9-сравнение-с-redux-v05a)
10. [Сравнение с React-хуками (v05)](#10-сравнение-с-react-хуками-v05)
11. [Store vs локальный useState](#11-store-vs-локальный-usestate)
12. [Недостатки и подводные камни MobX](#12-недостатки-и-подводные-камни-mobx)
13. [Когда что выбирать](#13-когда-что-выбирать)
14. [Задания для практики](#14-задания-для-практики)
15. [Дорожка к следующей версии](#15-дорожка-к-следующей-версии)

---

## 1. Что такое MobX и его философия

**MobX** — библиотека управления состоянием, созданная Мишелем Вестстрейтом (Michel Weststrate) в 2015 году — в том же году, что и Redux. Две библиотеки предложили **противоположные** ответы на один вопрос: «как хранить общее состояние React-приложения?»

| | Redux | MobX |
|---|---|---|
| Вдохновение | функциональное программирование, Elm, Flux | ООП, реактивное программирование, электронные таблицы (Excel) |
| Состояние | иммутабельное дерево | мутируемые observable-объекты |
| Изменения | `dispatch(action)` → reducer возвращает новый state | прямой вызов метода: `store.likePost(id)` |
| Подписки | ручные: `connect` / `useSelector` | автоматические: observer «видит», что читает компонент |

### Главная идея — «как Excel»

Девиз MobX: **«Всё, что может быть выведено из состояния, должно выводиться автоматически»**.

Представь таблицу Excel:
- в ячейке `A1` число `5` — это **observable** (исходное состояние);
- в `B1` формула `=A1*2` — это **computed** (производное значение);
- диаграмма, построенная по `B1`, — это **reaction** (побочный эффект, например перерисовка UI).

Ты меняешь `A1` — Excel сам пересчитывает `B1` и перерисовывает диаграмму. Ты не пишешь «после изменения A1 обнови B1». MobX делает то же самое для JavaScript-объектов и React-компонентов.

### MobX = ООП + реактивность

В v03-oop мы писали класс `PostStore extends EventEmitter` и **вручную** вызывали `this.emit('change')` после каждого изменения, а `App` вручную подписывался и перерисовывал представления.

MobX берёт ту же ООП-модель (класс с полями и методами), но **убирает ручную подписку**:

```js
// v03-oop — вручную
addPost(post) {
  this.posts.push(post);
  this.emit('change');          // не забыть!
}
store.on('change', () => view.render());

// v05b MobX — автоматически
addPost(title, body) {
  this.posts.unshift({ ... });  // MobX сам знает, кто читал posts
}
const PostList = observer(() => /* читает postStore.posts */);
```

### Где используется

MobX применяют Microsoft (Outlook Web), Battlefield 1 (интерфейс игры), Coinbase, Jenkins (Blue Ocean), Mendix и многие другие. В русскоязычном сообществе MobX особенно популярен — многие команды выбирают его как «Redux без бойлерплейта».

---

## 2. Как запустить

Нужен Node.js 18+.

```bash
cd 05b-react-mobx
npm install
npm run dev       # http://localhost:5173
```

Production-сборка и её просмотр:

```bash
npm run build     # → dist/
npm run preview   # http://localhost:4173
```

Зависимости:

| Пакет | Зачем |
|---|---|
| `react`, `react-dom` 18 | UI; `createRoot` из React 18 |
| `mobx` 6 | реактивное ядро: `makeAutoObservable`, `observable`, `computed`, `autorun`, `reaction` |
| `mobx-react-lite` 4 | мост между MobX и **функциональными** компонентами: `observer()`, `useLocalObservable()` |
| `vite` + `@vitejs/plugin-react` | сборщик, тот же что в v05/v05a |

> Почему `mobx-react-lite`, а не `mobx-react`? Полный пакет `mobx-react` дополнительно поддерживает классовые компоненты и legacy `Provider`/`inject`. Для функциональных компонентов «lite»-версия меньше и проще. Классовые компоненты мы уже разобрали в v05a.

> Babel-плагинов для декораторов **не нужно**: в MobX 6 вся разметка делается функцией `makeAutoObservable(this)` на обычном JavaScript.

---

## 3. Структура проекта

```
05b-react-mobx/
├── index.html               ← <div id="root">, подключение /src/main.jsx
├── package.json             ← mobx, mobx-react-lite, react 18, vite
├── vite.config.js           ← плагин react() — и всё, никаких Babel-декораторов
├── .gitignore               ← node_modules/, dist/
├── README.md
└── src/
    ├── main.jsx             ← createRoot(...).render(<App />) — БЕЗ <Provider>
    ├── App.jsx              ← observer(App): заголовок, статистика (computed)
    ├── store/
    │   └── PostStore.js     ← class PostStore + makeAutoObservable, singleton postStore
    ├── components/
    │   ├── PostForm.jsx     ← observer + useState для полей формы и ошибки
    │   ├── PostList.jsx     ← observer: читает postStore.posts, empty state
    │   └── PostCard.jsx     ← observer + useState для confirmDelete
    └── styles/
        ├── App.module.css   ← глобальный reset через :global + фиолетовый subtitle
        ├── PostForm.module.css
        ├── PostList.module.css
        └── PostCard.module.css
```

Сравни количество «инфраструктурных» файлов состояния:

| Версия | Файлы состояния |
|---|---|
| v05 (хуки) | `reducer` внутри `App.jsx` |
| v05a (Redux) | `store/actions.js` + `store/reducer.js` + `store/index.js` + `connect()` в компонентах + `<Provider>` |
| **v05b (MobX)** | **`store/PostStore.js`** — и всё |

---

## 4. Архитектура: class PostStore + makeAutoObservable

```js
// src/store/PostStore.js
import { makeAutoObservable } from 'mobx';

class PostStore {
  posts = [];                       // observable

  constructor() {
    makeAutoObservable(this);       // вся магия — здесь
  }

  addPost(title, body) {            // action
    this.posts.unshift({ id: Date.now(), title, body, likes: 0,
                         createdAt: new Date().toISOString() });
  }

  likePost(id) {                    // action
    const post = this.posts.find(p => p.id === id);
    if (post) post.likes++;         // прямая мутация!
  }

  deletePost(id) {                  // action
    this.posts = this.posts.filter(p => p.id !== id);
  }

  get postsCount() {                // computed
    return this.posts.length;
  }

  get totalLikes() {                // computed
    return this.posts.reduce((sum, p) => sum + p.likes, 0);
  }
}

export const postStore = new PostStore();   // singleton
```

### Что делает makeAutoObservable

`makeAutoObservable(this)` проходит по всем членам экземпляра и прототипа и размечает их по правилу:

| Член класса | Становится | Пример |
|---|---|---|
| поле | `observable` (глубокий) | `posts` |
| геттер `get x()` | `computed` | `postsCount`, `totalLikes` |
| метод | `action` (автоматически батчит изменения) | `addPost`, `likePost`, `deletePost` |
| генератор `*fn()` | `flow` (асинхронный action) | — |

Явная форма того же самого — `makeObservable` со схемой. Её используют, когда нужен точный контроль или класс наследуется:

```js
import { makeObservable, observable, action, computed } from 'mobx';

constructor() {
  makeObservable(this, {
    posts: observable,
    addPost: action,
    likePost: action,
    deletePost: action,
    postsCount: computed,
    totalLikes: computed,
  });
}
```

Можно исключить член из разметки или уточнить её:

```js
makeAutoObservable(this, {
  api: false,              // не делать observable (например, HTTP-клиент)
  posts: observable.shallow, // следить только за самим массивом, не за полями постов
}, { autoBind: true });    // привязать this у методов — можно передавать postStore.likePost как колбэк
```

### Исторический экскурс: декораторы

В MobX 4/5 (2017–2020) тот же store писали так:

```js
class PostStore {
  @observable posts = [];
  @action addPost(title, body) { ... }
  @computed get postsCount() { ... }
}
```

Это требовало Babel-плагина `@babel/plugin-proposal-decorators` и ломалось при смене стандарта декораторов. MobX 6 (2020) сделал декораторы **необязательными** — одна строка `makeAutoObservable(this)` заменяет их все. В этом проекте декораторов нет.

### Singleton: почему без Provider

`export const postStore = new PostStore()` — модуль ES выполняется один раз, значит экземпляр один на всё приложение. Компоненты импортируют его напрямую:

```js
import { postStore } from '../store/PostStore';
```

Плюс: ноль обёрток. Минус: такой store сложнее подменить в тестах и невозможно создать «по экземпляру на запрос» при SSR. Для таких случаев store передают через React Context (см. задание 5).

---

## 5. Ключевые концепции

MobX строится на четырёх понятиях. Вся остальная библиотека — их комбинации.

```
   Action ──изменяет──► Observable ──пересчитывает──► Computed
                            │                            │
                            └──────────уведомляет────────┴──► Reaction (observer, autorun)
```

### 5.1 Observable — наблюдаемое состояние

Значение, за чтением и изменением которого следит MobX. Объекты, массивы, `Map`, `Set` оборачиваются в `Proxy`.

```js
import { observable } from 'mobx';

const todo = observable({ title: 'Учить MobX', done: false });
todo.done = true;            // MobX знает об этом изменении
```

В нашем store observable — `posts` и **каждый пост внутри** (observable глубокий по умолчанию).

### 5.2 Computed — производные значения

Чистая функция от observable. Ключевые свойства:

- **кэшируется**: повторное чтение без изменений зависимостей не вызывает функцию снова;
- **ленивый**: если никто не читает computed, он не вычисляется;
- **точные зависимости**: пересчитывается только при изменении того, что реально прочитал.

```js
get totalLikes() {
  console.log('пересчёт totalLikes');
  return this.posts.reduce((sum, p) => sum + p.likes, 0);
}
```

Попробуй добавить `console.log` и поднабрать текст в форме — пересчёта не будет: форма не меняет `posts`.

Аналоги: `useMemo` (v05/v06), `computed` во Vue 3, getters во Vuex (v04a), `reselect` для Redux.

### 5.3 Action — изменение состояния

Функция, которая меняет observable. Action:

- **батчит** изменения: несколько мутаций внутри одного action → одна перерисовка;
- делает изменения **явными**: в строгом режиме MobX предупредит о мутации вне action.

```js
import { configure } from 'mobx';
configure({ enforceActions: 'always' }); // ругаться на мутации вне action
```

С `makeAutoObservable` все методы класса уже actions, поэтому `postStore.likePost(id)` из компонента — корректно, а `postStore.posts[0].likes++` прямо в onClick — нарушение (MobX выдаст предупреждение в консоль).

### 5.4 Reaction — побочные эффекты

Код, который автоматически перезапускается при изменении прочитанных observable.

```js
import { autorun, reaction, when } from 'mobx';

// autorun — запускается сразу и при каждом изменении того, что прочитал
autorun(() => {
  document.title = `Постов: ${postStore.postsCount}`;
});

// reaction — разделяет «что отслеживать» и «что делать»
reaction(
  () => postStore.totalLikes,                       // выражение-трекер
  (likes, prev) => console.log(`Лайков: ${prev} → ${likes}`), // эффект
);

// when — один раз, когда условие станет истинным
when(() => postStore.totalLikes >= 10, () => alert('🎉 10 лайков!'));
```

Аналоги: `useEffect` с зависимостями (React), `watch`/`watchEffect` (Vue).

### 5.5 observer() — компонент как reaction

`observer` из `mobx-react-lite` превращает функциональный компонент в **reaction**: во время рендера MobX записывает, какие observable были прочитаны, и при изменении любого из них перерисовывает компонент.

```jsx
import { observer } from 'mobx-react-lite';

const PostList = observer(function PostList() {
  return postStore.posts.map(post => <PostCard key={post.id} post={post} />);
});
```

Подробнее — в разделе 7.

---

## 6. Почему в MobX можно мутировать state

В v05 и v05a главное правило было: **никогда не мутируй state**. Почему же здесь `post.likes++` работает?

### Как React и Redux узнают об изменениях

React и Redux сравнивают **ссылки**:

```js
// Redux / useReducer
const prev = state.posts[0];
const next = newState.posts[0];
prev === next   // true → «ничего не изменилось», перерисовки нет
```

Если мутировать объект, ссылка останется той же → React/`connect`/`PureComponent` решат, что изменений нет → UI не обновится. Поэтому в Redux приходится копировать:

```js
case LIKE_POST:
  return {
    ...state,
    posts: state.posts.map(p =>
      p.id === action.payload ? { ...p, likes: p.likes + 1 } : p
    ),
  };
```

### Как MobX узнаёт об изменениях

MobX **не сравнивает** ссылки. Он перехватывает операции через JavaScript `Proxy`:

```js
// Упрощённая модель того, что делает MobX
const post = new Proxy(rawPost, {
  get(target, key) {
    trackRead(currentObserver, target, key);   // «компонент X читал post.likes»
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    notifyObservers(target, key);              // «post.likes изменился → перерисовать X»
    return true;
  },
});
```

Поэтому `post.likes++` — это `get` (запись зависимости) + `set` (уведомление). MobX точно знает, **какое поле какого объекта** изменилось и **какие компоненты** его читали.

Ровно так же работает реактивность Vue 3 (`reactive()` на Proxy) — MobX и Vue очень близки по духу. Vue 2 (v04a) использовал `Object.defineProperty`, и у него были ограничения (`$set`, `$delete`); MobX 4 тоже, а с MobX 5 — Proxy.

### Мутация vs замена — оба стиля работают

```js
// Мутация (точечное уведомление)
this.posts.unshift(newPost);
this.posts.splice(index, 1);
post.likes++;

// Замена ссылки (уведомление о том, что поле posts получило новое значение)
this.posts = this.posts.filter(p => p.id !== id);
```

В `PostStore` специально показаны оба: `addPost`/`likePost` мутируют, `deletePost` присваивает новый массив.

### Ловушка: деструктуризация «отрывает» реактивность

```jsx
// ❌ значение likes прочитано ОДИН раз вне observer-рендера
const { likes } = postStore.posts[0];
const Likes = observer(() => <span>{likes}</span>);   // не обновится

// ✅ читаем observable ВНУТРИ рендера observer-компонента
const Likes = observer(() => <span>{postStore.posts[0].likes}</span>);
```

Правило: **разыменовывай observable как можно позже** — внутри компонента, который должен на них реагировать.


---

## 7. observer(): когда компонент перерисовывается

### Как это работает

1. React вызывает рендер компонента, обёрнутого в `observer`.
2. MobX включает «запись»: каждое чтение observable (`postStore.posts`, `post.likes`) регистрируется как зависимость **этого** компонента.
3. Рендер закончен — список зависимостей зафиксирован.
4. Когда action меняет одну из зависимостей, MobX планирует перерисовку **только** этого компонента.
5. При следующем рендере зависимости собираются заново (они могут меняться — например, из-за условий `if`).

### Правила перерисовки observer-компонента

Компонент перерисуется, если:
- изменилось observable-значение, **прочитанное во время последнего рендера**;
- изменились его props (как у любого компонента; `observer` также включает поведение `React.memo` — поверхностное сравнение props);
- изменился его локальный state (`useState`) или контекст.

Компонент **не** перерисуется, если:
- изменилось observable, которое он не читал;
- родитель перерисовался, но props не изменились (благодаря встроенному `memo`).

### Разбор нашего приложения

| Компонент | Что читает во время рендера | Когда перерисовывается |
|---|---|---|
| `App` | `postStore.postsCount`, `postStore.totalLikes` | добавление/удаление поста, любой лайк |
| `PostForm` | ничего из store (только `useState`) | только при вводе в свои поля |
| `PostList` | `postStore.posts.length`, элементы массива | добавление/удаление поста. **Не при лайке!** |
| `PostCard` | `post.title`, `post.body`, `post.likes`, `post.createdAt` | лайк **именно этого** поста, свой `confirmDelete` |

Убедиться можно через React DevTools → ⚙️ → «Highlight updates when components render»: при лайке подсвечиваются только одна карточка и шапка `App`.

### Что будет без observer

```jsx
// ❌ забыли observer
function PostCard({ post }) {
  return <button onClick={() => postStore.likePost(post.id)}>❤️ {post.likes}</button>;
}
```

Клик сработает, `post.likes` в store увеличится, но **кнопка не обновится**: React ничего не знает о MobX, а ссылка на `post` не изменилась. Это самая частая ошибка новичков в MobX. Правило: **любой компонент, читающий observable, должен быть observer**.

### Почему `observer(function PostCard() {...})`, а не стрелка

Именованная функция даёт компоненту имя `PostCard` в React DevTools и сообщениях об ошибках. Со стрелкой `observer(() => ...)` в DevTools будет безымянный компонент.

### Альтернатива: `<Observer>` для кусочка разметки

Если не хочется оборачивать весь компонент, можно сделать реактивным только участок:

```jsx
import { Observer } from 'mobx-react-lite';

function Header() {
  return (
    <header>
      <h1>Лента</h1>
      <Observer>{() => <span>Лайков: {postStore.totalLikes}</span>}</Observer>
    </header>
  );
}
```

---

## 8. Granular reactivity — точечные перерисовки

**Granular (fine-grained) reactivity** — перерисовывается минимально возможная часть UI, а не всё дерево от точки изменения.

### Сценарий: лайк третьего поста из 100

**v05 (useReducer в App):**
1. `dispatch({ type: 'LIKE', id })` → reducer возвращает новый массив `posts`.
2. `App` перерисовывается (у него изменился state).
3. `PostList` перерисовывается (новый prop `posts`).
4. Все 100 `PostCard` вызывают рендер — если нет `React.memo`. С `memo` — сравнивают props, и реально перерисуется одна карточка, но 99 сравнений всё равно будут.

**v05a (Redux + connect):**
1. `dispatch(likePost(id))` → reducer → новый state.
2. `connect` у `App` вызывает `mapStateToProps`, сравнивает результат → `posts` новый → перерисовка `App`.
3. `PostList` (`PureComponent`) получает новый массив → перерисовка.
4. 100 `PostCard` (`PureComponent`) сравнивают props, 1 перерисовывается.

**v05b (MobX):**
1. `postStore.likePost(id)` → `post.likes++`.
2. MobX знает: `post#3.likes` читали `PostCard#3` и computed `totalLikes`.
3. `totalLikes` пересчитывается → его читает `App` → `App` перерисовывается.
4. `PostCard#3` перерисовывается.
5. `PostList` и остальные 99 карточек **даже не вызываются** — ни рендера, ни сравнения props.

```
             v05 / v05a                          v05b MobX
        App ✱                               App ✱ (из-за totalLikes)
         └─ PostList ✱                       └─ PostList ·
              ├─ PostCard · (memo)                ├─ PostCard ·
              ├─ PostCard · (memo)                ├─ PostCard ·
              ├─ PostCard ✱                       ├─ PostCard ✱
              └─ ... 97 сравнений                 └─ ... 0 работы
```

✱ — рендер, · — пропущено.

### Как ещё сузить перерисовки

Если бы мы хотели, чтобы лайк не трогал даже `App`, статистику можно вынести в отдельный маленький observer-компонент `<Stats />`. Тогда `App` будет читать только `postsCount` (для условия) — или вообще ничего. Это и есть приём MobX: **дробить компоненты так, чтобы каждый читал минимум observable**. Совет из документации MobX: «разыменовывай значения как можно позже» (dereference values late).

### Сравнение с другими

| Подход | Гранулярность из коробки |
|---|---|
| React `useState`/`useReducer` | компонент-владелец state и всё его поддерево (без `memo`) |
| Redux + `connect`/`useSelector` | компоненты, у которых изменился результат селектора |
| Zustand (v06) | компоненты, у которых изменился результат селектора |
| **MobX** | компоненты, читавшие **конкретное изменённое поле** |
| Vue 3, Solid, Svelte 5 (runes), Angular Signals | то же, что MobX: fine-grained реактивность |

---

## 9. Сравнение с Redux (v05a)

### Одна операция — два мира

**Лайк поста в Redux (v05a)** — 4 места в коде:

```js
// 1. store/actions.js
export const LIKE_POST = 'LIKE_POST';
export const likePost = id => ({ type: LIKE_POST, payload: id });

// 2. store/reducer.js
case LIKE_POST:
  return {
    ...state,
    posts: state.posts.map(p =>
      p.id === action.payload ? { ...p, likes: p.likes + 1 } : p
    ),
  };

// 3. App.jsx
const mapDispatchToProps = { likePost };
export default connect(mapStateToProps, mapDispatchToProps)(App);

// 4. PostCard.jsx (через props от App → PostList → PostCard)
<button onClick={() => this.props.onLike(post.id)}>
```

**Лайк поста в MobX (v05b)** — 2 места:

```js
// 1. store/PostStore.js
likePost(id) {
  const post = this.posts.find(p => p.id === id);
  if (post) post.likes++;
}

// 2. PostCard.jsx
<button onClick={() => postStore.likePost(post.id)}>
```

### Таблица сравнения

| Критерий | Redux 4 (v05a) | MobX 6 (v05b) |
|---|---|---|
| Парадигма | функциональная, «state как значение» | ООП + реактивная, «state как живой объект» |
| Структура store | одно дерево + reducers | любые классы, можно несколько store |
| Изменение state | только через `dispatch(action)` → чистый reducer | вызов метода-action, прямая мутация |
| Иммутабельность | обязательна (spread, `map`, `filter`) | не нужна |
| Boilerplate | константы + action creators + reducer + connect | класс + `makeAutoObservable` |
| Подключение к React | `<Provider>` + `connect`/`useSelector` | `observer()` + импорт store |
| Подписка | ручная: что выбрать в `mapStateToProps` | автоматическая: что прочитал при рендере |
| Производные данные | `reselect` (мемоизированные селекторы) | `get` — computed из коробки |
| Асинхронность | middleware: `redux-thunk`, `redux-saga` | обычный `async` метод + `runInAction` / `flow` |
| Предсказуемость | очень высокая: action-лог, чистые функции | ниже: изменения «где угодно» в actions |
| DevTools | Redux DevTools: time-travel, лог actions | `mobx-devtools`, `spy`, `trace` — скромнее |
| Производительность | хорошая при правильных селекторах и `memo` | отличная «по умолчанию» благодаря granular reactivity |
| Порог входа | концепций много, но они явные | концепций мало, но есть «магия» |
| Размер (min+gzip) | redux ~2 КБ + react-redux ~5 КБ | mobx ~17 КБ + mobx-react-lite ~2 КБ |

### Асинхронность: пример

Загрузка постов с сервера.

**Redux + thunk:**

```js
export const fetchPosts = () => async dispatch => {
  dispatch({ type: 'FETCH_START' });
  try {
    const posts = await api.getPosts();
    dispatch({ type: 'FETCH_SUCCESS', payload: posts });
  } catch (e) {
    dispatch({ type: 'FETCH_ERROR', payload: e.message });
  }
};
// + три case в reducer
```

**MobX:**

```js
import { runInAction } from 'mobx';

async fetchPosts() {
  this.isLoading = true;
  try {
    const posts = await api.getPosts();
    // после await мы уже вне исходного action — оборачиваем мутацию
    runInAction(() => {
      this.posts = posts;
      this.isLoading = false;
    });
  } catch (e) {
    runInAction(() => {
      this.error = e.message;
      this.isLoading = false;
    });
  }
}
```

Или через генератор `flow` (с `makeAutoObservable` генераторы становятся flow автоматически):

```js
*fetchPosts() {
  this.isLoading = true;
  this.posts = yield api.getPosts();   // мутации после yield — внутри action
  this.isLoading = false;
}
```

### А как же Redux Toolkit?

Современный Redux (RTK, 2019+) сильно сократил бойлерплейт и даже разрешил «мутировать» в reducers — через библиотеку **Immer**, которая тоже использует Proxy:

```js
const postsSlice = createSlice({
  name: 'posts',
  initialState: [],
  reducers: {
    likePost(state, action) {
      const post = state.find(p => p.id === action.payload);
      post.likes++;            // выглядит как MobX!
    },
  },
});
```

Разница: Immer создаёт **новый иммутабельный объект** из твоих «мутаций», а MobX действительно **мутирует** объект и уведомляет подписчиков. Подписка в RTK по-прежнему через селекторы, а не автоматическая.

---

## 10. Сравнение с React-хуками (v05)

### useReducer — это «Redux внутри компонента»

В v05 state жил в `App` через `useReducer`:

```jsx
function App() {
  const [posts, dispatch] = useReducer(postsReducer, []);
  // ...
  return <PostList posts={posts} onLike={id => dispatch({ type: 'LIKE', id })} />;
}
```

Это та же модель, что Redux: action-объекты, чистый reducer, иммутабельные обновления. Отличие только в том, что state привязан к компоненту, а не к глобальному store.

### Главное отличие: где живёт состояние

| | Хуки (v05) | MobX (v05b) |
|---|---|---|
| Где живёт state | **внутри React** — в fiber компонента `App` | **вне React** — в обычном JS-объекте `postStore` |
| Кто владеет state | компонент; умрёт компонент — умрёт state | модуль; store существует даже без UI |
| Как данные доходят до детей | props (prop drilling) или Context | прямой импорт store |
| Кто решает, что перерисовать | React: изменился state → рендер поддерева | MobX: изменилось поле → рендер его читателей |
| Работа вне компонентов | невозможна (хуки только в компонентах) | `postStore.addPost()` можно вызвать из консоли, теста, WebSocket-обработчика |
| Логика | размазана по reducer и обработчикам | собрана в классе store |

В MobX **React — просто «вид»**. Компонент не управляет данными, он их **наблюдает**. Это возвращение к классическому разделению **Model / View** из v03-oop.

Эксперимент: открой DevTools и выполни в консоли (после добавления `window.postStore = postStore` в `PostStore.js`):

```js
postStore.addPost('Из консоли', 'React даже не знает, откуда пришёл этот пост');
postStore.posts[0].likes = 100;  // MobX предупредит о мутации вне action, но UI обновится
```

С `useReducer` так сделать нельзя: state заперт внутри компонента.

### Сравнение кода PostCard

```jsx
// v05 — хуки, данные и колбэки через props
function PostCard({ post, onLike, onDelete }) {
  return <button onClick={() => onLike(post.id)}>❤️ {post.likes}</button>;
}

// v05a — класс, props от connect()
class PostCard extends React.PureComponent {
  render() {
    return <button onClick={() => this.props.onLike(this.props.post.id)}>❤️ {this.props.post.likes}</button>;
  }
}

// v05b — observer, прямой вызов store
const PostCard = observer(function PostCard({ post }) {
  return <button onClick={() => postStore.likePost(post.id)}>❤️ {post.likes}</button>;
});
```

### useLocalObservable — MobX внутри компонента

Если нужно сложное **локальное** состояние с computed, `mobx-react-lite` даёт аналог `useState` на MobX:

```jsx
import { useLocalObservable, observer } from 'mobx-react-lite';

const PostForm = observer(function PostForm() {
  const form = useLocalObservable(() => ({
    title: '',
    body: '',
    get isValid() { return this.title.trim() && this.body.trim(); },
    setTitle(v) { this.title = v; },
  }));
  return <input value={form.title} onChange={e => form.setTitle(e.target.value)} />;
});
```

В нашем проекте для формы используется обычный `useState` — его достаточно (см. раздел 11).

---

## 11. Store vs локальный useState

MobX не отменяет `useState`. Правило разделения:

| В MobX store | В `useState` |
|---|---|
| данные предметной области (посты, пользователь, корзина) | временное состояние UI |
| то, что нужно нескольким компонентам | то, что нужно одному компоненту |
| то, что должно пережить размонтирование компонента | то, что можно потерять при размонтировании |

В нашем проекте:

- `postStore.posts` — store: список нужен `App` (статистика), `PostList` (рендер), `PostCard` (лайк/удаление).
- `title`, `body`, `error` в `PostForm` — `useState`: набор текста интересен только форме. Если бы каждая буква шла в глобальный store, это было бы «загрязнение» модели черновиками.
- `confirmDelete` в `PostCard` — `useState`: «я сейчас спрашиваю, удалить ли» — состояние конкретной карточки.

Такое же разделение было в v05a (Redux store + `this.state` в классах) и в v06 (TanStack Query/Zustand + `useState`).

---

## 12. Недостатки и подводные камни MobX

MobX удобен, но у удобства есть цена.

### «Магия»

Изменения отслеживаются неявно. Глядя на `post.likes++`, нельзя сказать, какие компоненты перерисуются. В Redux цепочка `dispatch → reducer → selector → компонент` видна в коде; в MobX её строит рантайм.

### Сложнее дебажить

- Нет полноценного time-travel и лога действий «из коробки», как в Redux DevTools.
- Ответ на вопрос «почему компонент перерисовался?» требует инструментов:

```js
import { trace, spy } from 'mobx';

// внутри observer-компонента: вывести в консоль, какое observable вызвало рендер
trace();

// глобальный лог всех событий MobX (actions, изменения, reactions)
spy(event => console.log(event));
```

- В консоли observable выглядят как `Proxy`. Чтобы увидеть «чистые» данные — `toJS(postStore.posts)`.

### Менее предсказуемо

- State можно менять из любого метода любого store — без дисциплины код превращается в «спагетти мутаций».
- Включай строгий режим `configure({ enforceActions: 'always' })` и держи все изменения внутри actions.

### Типичные ошибки

| Ошибка | Симптом | Решение |
|---|---|---|
| Забыли `observer()` | данные в store меняются, UI нет | оборачивать все компоненты, читающие store |
| Деструктуризация вне рендера | компонент «застыл» со старым значением | читать observable внутри рендера |
| Мутация после `await` | предупреждение «Since strict-mode is enabled...» | `runInAction` или `flow` |
| Передали observable в стороннюю библиотеку | библиотека не видит изменений / ломается на Proxy | передавать `toJS(value)` или `slice()` |
| Потеря `this` у метода-колбэка | `Cannot read properties of undefined` | стрелка в JSX или `makeAutoObservable(this, {}, { autoBind: true })` |
| Reaction без очистки | утечки памяти, дубли эффектов | сохранять disposer: `const dispose = autorun(...)`; вызвать `dispose()` |

### Экосистема

Redux имеет огромную экосистему (RTK Query, saga, persist, бесконечное число туториалов). У MobX её меньше, а вакансий с MobX — заметно меньше, чем с Redux/RTK (хотя в русскоязычных компаниях MobX встречается часто).

---

## 13. Когда что выбирать

| Ситуация | Выбор |
|---|---|
| Маленькое приложение, state в 1–2 компонентах | `useState` / `useReducer` (v05) |
| Серверные данные (загрузка, кэш, refetch) | TanStack Query / RTK Query (v06) |
| Простой глобальный UI-state | Zustand (v06), Context |
| Большая команда, важна строгая предсказуемость и аудит изменений | Redux Toolkit |
| Сложная доменная модель: много связанных сущностей, вычисляемых полей, OOP-мышление | **MobX** |
| Высоконагруженный UI с частыми точечными обновлениями (таблицы, редакторы, дашборды) | **MobX** (или сигналы) |
| Команда пришла из Vue / Angular / backend-ООП | **MobX** покажется естественным |

Правило большого пальца: **Redux — когда важнее контроль, MobX — когда важнее скорость разработки и производительность «из коробки».**

---

## 14. Задания для практики

1. **Сортировка через computed.** Добавь в store поле `sortBy = 'newest'` (`'newest' | 'popular'`), action `setSortBy(value)` и computed `get sortedPosts()`. Сделай переключатель над списком. Убедись (через `console.log` в геттере), что сортировка не пересчитывается при наборе текста в форме.

2. **Компонент `<Stats />`.** Вынеси строку «Постов: N · Лайков: M» из `App` в отдельный observer-компонент. Включи в React DevTools подсветку рендеров и сравни: перерисовывается ли теперь `App` при лайке? Объясни результат.

3. **Сохранение в localStorage через reaction.** Добавь в конструктор store:
   ```js
   reaction(() => toJS(this.posts), posts => localStorage.setItem('posts', JSON.stringify(posts)));
   ```
   и загрузку из `localStorage` при старте. Почему `toJS` нужен внутри выражения-трекера?

4. **Асинхронная загрузка.** Добавь метод `async fetchPosts()`, который через `setTimeout`-промис «загружает» 3 поста, и поля `isLoading`, `error`. Сначала забудь `runInAction` — прочитай предупреждение MobX в консоли. Затем перепиши через `runInAction`, а потом через генератор `*fetchPosts()` (flow).

5. **Store через React Context.** Создай `StoreContext`, `<StoreProvider>` и хук `useStore()`. Перепиши компоненты, чтобы они получали store из контекста, а не импортом. Напиши тест (Vitest + Testing Library), в котором каждый тест создаёт **свой** `new PostStore()`. Зачем это нужно для SSR?

6. **Класс Post с собственным поведением.** Сделай отдельный класс `Post` с `makeAutoObservable`, методом `like()` и computed `get isPopular()` (≥ 5 лайков). Store хранит `new Post(...)`, а `PostCard` вызывает `post.like()`. Подсвечивай популярные посты. Сравни с v03-oop (`Post.js`).

7. **Отладка с trace и spy.** Вставь `trace()` в `PostCard` и `PostList`, полайкай посты и запиши в README-заметку, какие компоненты и почему реагировали. Затем подключи `spy` и выведи лог всех actions — получится «бедный аналог» Redux DevTools.

8. **Строгий режим.** Включи `configure({ enforceActions: 'always' })` в `main.jsx` и попробуй в `onClick` написать `post.likes++` вместо `postStore.likePost(post.id)`. Что выведет MobX? Почему это правило полезно в команде?

9. **Undo для удаления.** Храни последний удалённый пост в store (`lastDeleted`) и покажи кнопку «Отменить» на 5 секунд. Используй `when` или `setTimeout` + action для очистки.

10. **Тот же store без React.** Создай `console-demo.js`, импортируй `postStore`, подпишись через `autorun` на `postsCount` и `totalLikes` и вызови несколько actions (`node console-demo.js` с `"type": "module"`). Убедись, что MobX работает полностью вне React.

---

## 15. Дорожка к следующей версии

Мы прошли три способа хранить состояние в React:

| Версия | Подход | Ключевая идея |
|---|---|---|
| v05 | хуки + `useReducer` | state внутри компонента, иммутабельность |
| v05a | классы + Redux | глобальный иммутабельный store, actions/reducers |
| **v05b** | **MobX** | **глобальный мутируемый observable store, автоматические подписки** |

Чего всем трём версиям не хватает:

- **типов**: ничто не мешает вызвать `postStore.likePost('abc')` или опечататься в `post.lieks`;
- **работы с сервером**: все данные живут в памяти браузера, нет загрузки, кэша, ретраев.

Следующая версия — **v06 React + TypeScript + TanStack Query + Zustand**:

- **TypeScript** — интерфейс `Post`, типизированные store и компоненты. (MobX отлично дружит с TS: `makeAutoObservable` выводит типы автоматически.)
- **TanStack Query** — серверное состояние отделяется от клиентского: загрузка, кэширование, инвалидация после мутаций.
- **Zustand** — минималистичный клиентский store на хуках: без классов и Proxy, но тоже без Provider и бойлерплейта. Интересно сравнить его с MobX: оба «анти-Redux», но Zustand снова иммутабелен и работает через селекторы.

Дальше по дорожке идут v07 (Next.js, состояние на сервере), v08 (Prisma + PostgreSQL, настоящая база данных) и v09 (Auth.js: пользователи и вход через Google).
