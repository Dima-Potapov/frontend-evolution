# Версия 5a: React 18 (классовые компоненты) + Redux 4

Та же «Лента постов»: добавить пост, лайкнуть, удалить с подтверждением, пустое состояние, валидация. Но написана она так, как писали React-приложения в **2015–2019 годах**: каждый компонент — **класс** (`extends React.Component`), а данные приложения живут в **классическом Redux** — с константами action types, action creators, reducer-ом, `createStore`, `<Provider>` и `connect()`.

Никаких хуков для бизнес-логики, никакого Redux Toolkit.

---

## Содержание

1. [Место в эволюции](#1-место-в-эволюции)
2. [Почему эта версия важна](#2-почему-эта-версия-важна)
3. [Как запустить](#3-как-запустить)
4. [Структура проекта](#4-структура-проекта)
5. [Архитектура Redux](#5-архитектура-redux)
6. [Поток данных (однонаправленный)](#6-поток-данных-однонаправленный)
7. [connect, mapStateToProps, mapDispatchToProps](#7-connect-mapstatetoprops-mapdispatchtoprops)
8. [Классовые компоненты vs функциональные](#8-классовые-компоненты-vs-функциональные)
9. [Lifecycle-методы](#9-lifecycle-методы)
10. [Проблема `this` и `bind`](#10-проблема-this-и-bind)
11. [Сравнение с v05 (хуки)](#11-сравнение-с-v05-хуки)
12. [Проблема boilerplate в Redux](#12-проблема-boilerplate-в-redux)
13. [Что пришло на смену](#13-что-пришло-на-смену)
14. [Задания для практики](#14-задания-для-практики)
15. [Ключевые концепции](#15-ключевые-концепции)

---

## 1. Место в эволюции

```
01 Vanilla JS → 02 jQuery → 03 OOP → 03a Web Components → 04 Vue
  → [05a React-классы + Redux] → 05 React-хуки → 06 React + TS + Zustand + TanStack Query
  → 07 Next.js → 08 Next.js + Prisma
```

Это «ответвление» **перед** v05: шаг назад во времени. v05 показывает современный React с хуками, а 05a — то, **от чего хуки избавили**. Без этого контекста трудно понять, зачем вообще появились `useState`, `useEffect`, `useSelector` и Redux Toolkit.

| Год | Событие |
|---|---|
| 2013 | Facebook открывает React. Компоненты создаются через `React.createClass({...})` |
| 2014 | Facebook представляет архитектуру **Flux** — однонаправленный поток данных |
| 2015 | React 0.13: поддержка ES6-классов `class X extends React.Component`. Дэн Абрамов и Эндрю Кларк выпускают **Redux** («Flux с одним store и чистыми функциями») |
| 2015–2018 | «Золотой век» React + Redux: почти каждый крупный проект использует `connect()`, actions, reducers, `redux-thunk` / `redux-saga` |
| 2016 | Выходит create-react-app — стандартный способ начать React-проект |
| 2018 | React 16.3: новый Context API, `getDerivedStateFromProps`. Устаревают `componentWillMount` и др. |
| 2019 | React 16.8: **хуки**. react-redux 7.1: `useSelector` / `useDispatch`. Выходит Redux Starter Kit → Redux Toolkit |
| 2022 | React 18: `createRoot`, concurrent rendering. `ReactDOM.render` объявлен устаревшим |
| 2024 | React 19: `ReactDOM.render` **удалён** |

Здесь React 18 (а не 19) — **намеренно**: в 19-й версии `ReactDOM.render` уже нет, а нам важно показать старый API точки входа.

## 2. Почему эта версия важна

1. **Legacy-код повсюду.** Огромное количество работающих продуктов (банки, CRM, админки) написано на классах и `connect()`. Придя на работу, очень вероятно встретишь `class Dashboard extends React.Component` и файлы `actionTypes.js`. Читать такой код — обязательный навык.
2. **Понимание «почему».** Хуки — не «новая мода», а ответ на конкретные боли классов: `bind(this)`, логика, размазанная по lifecycle-методам, HOC-«ад обёрток». Увидев боль — поймёшь лекарство.
3. **Redux — это идеи, а не библиотека.** Однонаправленный поток, иммутабельность, чистые reducer-ы, action как описание события. Эти идеи живут в `useReducer`, Zustand, NgRx (Angular), Pinia/Vuex (Vue), Elm и даже в архитектуре бэкендов (event sourcing).
4. **Error Boundaries до сих пор только классовые.** `componentDidCatch` и `getDerivedStateFromError` не имеют хук-аналогов — даже в React 19 Error Boundary пишется классом (или берётся готовый из `react-error-boundary`).
5. **Собеседования.** Вопросы «чем Component отличается от PureComponent», «что делает connect», «почему reducer должен быть чистым», «что такое HOC» — классика интервью.

## 3. Как запустить

```bash
cd 05a-react-class-redux
npm install
npm run dev       # dev-сервер Vite → http://localhost:5173
npm run build     # production-сборка в dist/
npm run preview   # посмотреть собранную версию
```

> ⚠️ **Ожидаемое предупреждение в консоли (dev-режим):**
> `Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17.`
>
> Это **не ошибка**, а часть учебного материала: мы сознательно используем API React 16/17. В production-сборке (`npm run build`) предупреждения React вырезаются.

> 💡 Установи расширение **Redux DevTools** для браузера: `store/index.js` подключает его автоматически. Во вкладке «Redux» видно каждый action, diff состояния и можно «отматывать время назад» (time-travel debugging).

## 4. Структура проекта

```
05a-react-class-redux/
├── index.html                 ← точка монтирования <div id="root">
├── package.json               ← React 18, Redux 4, react-redux 8, Vite 5
├── vite.config.js
├── .gitignore
└── src/
    ├── main.jsx               ← ReactDOM.render(<Provider store={store}><App/></Provider>)
    ├── App.jsx                ← класс App + connect(mapStateToProps, mapDispatchToProps)
    ├── store/
    │   ├── actions.js         ← константы ADD_POST/LIKE_POST/DELETE_POST + action creators
    │   ├── reducer.js         ← чистая функция (state, action) → newState
    │   └── index.js           ← createStore(reducer, devtools)
    ├── components/
    │   ├── PostForm.jsx       ← класс, this.state = { title, body, errors }, bind в конструкторе
    │   ├── PostList.jsx       ← PureComponent, пустое состояние, map → PostCard
    │   └── PostCard.jsx       ← PureComponent, this.state = { confirmDelete }, стрелки-свойства
    └── styles/
        ├── App.module.css     ← + глобальный сброс через :global(...)
        ├── PostForm.module.css
        ├── PostList.module.css
        └── PostCard.module.css
```

Кто за что отвечает:

| Слой | Файлы | Знает про Redux? |
|---|---|---|
| Store (данные + правила изменения) | `store/*` | это и есть Redux |
| Container (связывает store и UI) | `App.jsx` (через `connect`) | да, только в `mapState`/`mapDispatch` |
| Presentational (только отрисовка) | `PostForm`, `PostList`, `PostCard` | **нет** — получают данные и колбэки через props |

Разделение **Container / Presentational** (статья Дэна Абрамова 2015 года) — главный архитектурный паттерн эпохи. В 2019 году сам автор написал, что с хуками жёстко его соблюдать больше не нужно, но идея «UI-компоненты не знают об источнике данных» осталась полезной.

## 5. Архитектура Redux

Redux строится на **трёх принципах**:

1. **Единственный источник правды** — всё состояние приложения лежит в одном объекте-дереве внутри одного store.
2. **Состояние только для чтения** — изменить его можно лишь отправив action (`dispatch`).
3. **Изменения описываются чистыми функциями** — reducer получает старое состояние и action и возвращает новое.

### 5.1. Actions — «что произошло»

```js
// store/actions.js
export const ADD_POST = 'ADD_POST';
export const LIKE_POST = 'LIKE_POST';
export const DELETE_POST = 'DELETE_POST';

export const addPost = (title, body) => ({
  type: ADD_POST,
  payload: { id: Date.now(), title, body, likes: 0, createdAt: new Date().toISOString() },
});
export const likePost = (id) => ({ type: LIKE_POST, payload: { id } });
export const deletePost = (id) => ({ type: DELETE_POST, payload: { id } });
```

- **Action** — простой объект с обязательным полем `type`. Данные принято класть в `payload` (соглашение Flux Standard Action).
- **Action type** — константа-строка. Зачем константа, если можно написать `'ADD_POST'` прямо в коде? Опечатка в строке молча ничего не сделает, а опечатка в имени переменной упадёт сразу.
- **Action creator** — функция, создающая action. Все «нечистые» вычисления (`Date.now()`, `new Date()`) происходят здесь, чтобы reducer остался чистым.
- `createdAt` хранится **строкой**, а не объектом `Date`: состояние Redux должно быть **сериализуемым** (DevTools, сохранение в localStorage, SSR).

### 5.2. Reducer — «как меняется состояние»

```js
// store/reducer.js
const initialState = { posts: [] };

export function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_POST:
      return { ...state, posts: [action.payload, ...state.posts] };
    case LIKE_POST:
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.payload.id ? { ...p, likes: p.likes + 1 } : p
        ),
      };
    case DELETE_POST:
      return { ...state, posts: state.posts.filter((p) => p.id !== action.payload.id) };
    default:
      return state;
  }
}
```

Правила чистого reducer-а:

| ✅ Можно | ❌ Нельзя |
|---|---|
| `[...arr, item]`, `arr.map()`, `arr.filter()` | `arr.push()`, `arr.splice()`, `arr.sort()` на месте |
| `{ ...obj, field: value }` | `obj.field = value`, `post.likes++` |
| вычислять что-то из `state` и `action` | `Date.now()`, `Math.random()`, `fetch`, `localStorage` |
| `default: return state` | забыть `default` (вернётся `undefined` и состояние сломается) |

**Почему мутация ломает приложение?** `connect()` решает, перерисовывать ли компонент, сравнивая результат `mapStateToProps` **по ссылкам** (`===`). Если сделать `state.posts.push(post)`, массив останется тем же объектом → сравнение скажет «ничего не изменилось» → экран **не обновится**. Это самый частый баг новичков в Redux.

Порядок ленты: новый пост кладётся **в начало** массива (`[action.payload, ...state.posts]`), поэтому список сразу идёт в обратном хронологическом порядке — сортировать в компоненте не нужно.

### 5.3. Store — «где всё хранится»

```js
// store/index.js
import { createStore } from 'redux';
import { reducer } from './reducer';

export const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__?.());
```

API store-а очень маленький:

| Метод | Что делает |
|---|---|
| `store.getState()` | вернуть текущее состояние |
| `store.dispatch(action)` | отправить action → вызвать reducer → сохранить результат → уведомить подписчиков |
| `store.subscribe(listener)` | подписаться на изменения, возвращает функцию отписки |

> ⚠️ В Redux 4.2+ `createStore` помечен как `@deprecated` (в редакторе он будет **зачёркнут**). Это не значит, что он не работает: так авторы мягко подталкивают к Redux Toolkit (`configureStore`). Удалять `createStore` не планируют.

Весь Redux — это **около 100 строк** кода. Упрощённая реализация:

```js
function createStore(reducer) {
  let state = reducer(undefined, { type: '@@INIT' });
  let listeners = [];
  return {
    getState: () => state,
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((l) => l());
    },
    subscribe(l) {
      listeners.push(l);
      return () => { listeners = listeners.filter((x) => x !== l); };
    },
  };
}
```

Сравни с `PostStore extends EventEmitter` из v03: тот же паттерн Observer. Разница в том, **где** живут правила изменения — в методах класса (v03) или в отдельной чистой функции (Redux).

### 5.4. Provider — «как store попадает в React»

```jsx
// main.jsx
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

`<Provider>` кладёт store в **React Context**. Любой компонент ниже, обёрнутый в `connect()`, достаёт store оттуда — без передачи через props на каждом уровне (prop drilling).

## 6. Поток данных (однонаправленный)

```
          ┌───────────────────────────────────────────────────────────┐
          │                                                           │
          ▼                                                           │
   ┌─────────────┐   клик «❤️»    ┌────────────────────┐              │
   │    VIEW     │ ─────────────► │ this.props.onLike  │              │
   │ (PostCard)  │                │      (post.id)     │              │
   └─────────────┘                └─────────┬──────────┘              │
          ▲                                 │ = dispatch(likePost(id))│
          │                                 ▼                         │
          │                       ┌────────────────────┐              │
          │ новые props           │      ACTION        │              │
          │                       │ { type: LIKE_POST, │              │
   ┌──────┴──────┐                │   payload: {id} }  │              │
   │  connect()  │                └─────────┬──────────┘              │
   │ mapStateTo- │                          ▼                         │
   │   Props     │                ┌────────────────────┐              │
   └──────▲──────┘                │      REDUCER       │              │
          │ subscribe             │ (state, action) => │              │
          │                       │      newState      │              │
   ┌──────┴──────┐  новый state   └─────────┬──────────┘              │
   │    STORE    │ ◄──────────────────────── ┘                         │
   └─────────────┘                                                    │
          └───────────────────────────────────────────────────────────┘
```

По шагам — что происходит при лайке:

1. Пользователь кликает «❤️» в `PostCard` → вызывается `this.handleLike`.
2. `handleLike` вызывает `this.props.onLike(post.id)`. Это функция, которую `PostList` получил от `App`, а `App` — от `connect()`.
3. Внутри неё: `dispatch(likePost(id))` → в store уходит `{ type: 'LIKE_POST', payload: { id } }`.
4. Store вызывает `reducer(state, action)` → возвращается **новый** объект state с новым массивом `posts`.
5. Store уведомляет подписчиков. `connect()` вызывает `mapStateToProps(newState)`, видит, что `posts` — новый массив, и перерисовывает `App`.
6. `App` передаёт новые `posts` вниз; `PureComponent`-карточки перерисовываются **только для изменившегося поста**: у остальных объект `post` — та же ссылка.

Данные идут **только в одну сторону**: View → Action → Reducer → Store → View. Компонент никогда не меняет данные напрямую. Отсюда предсказуемость: любое изменение можно найти по action в DevTools.

[v04 Vue] для сравнения: двусторонняя привязка `v-model` и реактивные объекты, которые можно менять напрямую (`post.likes++`). Удобно, но при росте приложения сложнее понять, **кто** поменял данные. Поэтому даже во Vue появились Vuex/Pinia с похожими на Redux идеями.

## 7. connect, mapStateToProps, mapDispatchToProps

```jsx
// App.jsx
class App extends React.Component {
  render() {
    const { posts, addPost, likePost, deletePost } = this.props;
    // ...
  }
}

const mapStateToProps = (state) => ({ posts: state.posts });
const mapDispatchToProps = { addPost, likePost, deletePost };

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

### 7.1. mapStateToProps

- Получает **весь** state и возвращает объект — то, что попадёт в `this.props`.
- Вызывается при **каждом** изменении store, поэтому должен быть быстрым.
- Если результат поверхностно равен прошлому (все поля `===`), компонент **не** перерисуется. Ловушка: `state => ({ posts: state.posts.filter(...) })` каждый раз создаёт новый массив → лишние ререндеры. Для таких случаев в эпоху Redux использовали мемоизированные селекторы — библиотеку **reselect** (`createSelector`).
- Может принимать второй аргумент `ownProps` — props, переданные контейнеру снаружи.

### 7.2. mapDispatchToProps

Две формы. **Объектная** (используется в проекте, рекомендуемая):

```js
const mapDispatchToProps = { addPost, likePost, deletePost };
```

connect сам оборачивает каждый action creator: `(...args) => dispatch(addPost(...args))`.

**Функциональная** (часто встречается в старом коде):

```js
const mapDispatchToProps = (dispatch) => ({
  addPost: (title, body) => dispatch(addPost(title, body)),
  likePost: (id) => dispatch(likePost(id)),
  deletePost: (id) => dispatch(deletePost(id)),
});
// или с хелпером из redux:
// const mapDispatchToProps = (dispatch) => bindActionCreators({ addPost, likePost, deletePost }, dispatch);
```

Если второй аргумент не передать вовсе, connect положит в props сам `dispatch`: `this.props.dispatch(likePost(id))`.

### 7.3. connect — это HOC

**Higher-Order Component (HOC)** — функция, которая принимает компонент и возвращает новый компонент:

```js
const withSomething = (Component) => (props) => <Component {...props} extra="..." />;
```

`connect(mapState, mapDispatch)` возвращает такую функцию, поэтому скобки двойные: `connect(...)(App)`. Возвращённый компонент-обёртка:

1. берёт store из Context (его положил `<Provider>`);
2. подписывается на store (`store.subscribe`);
3. при изменениях вызывает `mapStateToProps` и сравнивает результат с прошлым;
4. рендерит `<App posts={...} addPost={...} ... />`.

Другие известные HOC той эпохи: `withRouter` (React Router ≤5), `withStyles` (Material-UI ≤4), `injectIntl` (react-intl). Проблема: обёртки множатся — `export default withRouter(connect(...)(withStyles(styles)(injectIntl(Component))))` — и в React DevTools получается «wrapper hell»: `<WithRouter><Connect><WithStyles><InjectIntl><Component>`. Хуки решили и это.

## 8. Классовые компоненты vs функциональные

| | Классовый (05a) | Функциональный (05) |
|---|---|---|
| Объявление | `class PostForm extends React.Component` | `function PostForm(props)` |
| Отрисовка | метод `render()` | тело функции возвращает JSX |
| Props | `this.props.onAddPost` | аргумент `props` / деструктуризация `{ onAddPost }` |
| Состояние | `this.state = {...}` в конструкторе, `this.setState()` | `useState()` — по одному на каждое значение |
| Обновление state | **слияние** (merge) с текущим объектом | **замена** значения целиком |
| Побочные эффекты | `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` | `useEffect` |
| Оптимизация | `PureComponent`, `shouldComponentUpdate` | `React.memo`, `useMemo`, `useCallback` |
| Переиспользование логики | HOC, render props, миксины (`createClass`) | кастомные хуки (`usePosts`) |
| `this` | есть, нужен `bind` или стрелки | нет |
| Доступ к Redux | `connect()` | `useSelector`, `useDispatch` |
| Error Boundary | ✅ `componentDidCatch` | ❌ невозможно (только классом) |

### this.setState — особенности

```js
// 1. Слияние: меняем одно поле — остальные сохраняются
this.setState({ title: 'Новый' }); // body и errors остались на месте

// 2. Асинхронность и батчинг: this.state сразу после вызова ещё СТАРЫЙ
this.setState({ title: 'X' });
console.log(this.state.title); // старое значение!

// 3. Если новое значение зависит от старого — функциональная форма
this.setState((prev) => ({ count: prev.count + 1 }));

// 4. Колбэк после применения
this.setState({ title: '' }, () => console.log('применено', this.state.title));

// 5. Слияние ПОВЕРХНОСТНОЕ: вложенные объекты заменяются целиком
this.setState({ errors: { title: '...' } }); // errors.body пропадёт
this.setState((prev) => ({ errors: { ...prev.errors, title: '...' } })); // так правильно
```

В `PostForm.handleChange` используется именно функциональная форма с `...prev.errors`.

### Component vs PureComponent

- `React.Component` перерисовывается **всегда**, когда перерисовывается родитель (или вызван `setState`).
- `React.PureComponent` перед рендером **поверхностно** сравнивает новые props и state со старыми и пропускает рендер, если ничего не изменилось. Это классический аналог `React.memo`.
- Вручную то же самое можно было сделать методом `shouldComponentUpdate(nextProps, nextState) { return nextProps.post !== this.props.post; }`.

`PostList` и `PostCard` здесь — `PureComponent`. Благодаря иммутабельному reducer-у при лайке перерисовывается только одна карточка: у остальных объект `post` не изменился, а функции из `connect` — стабильные ссылки.

## 9. Lifecycle-методы

```
 МОНТИРОВАНИЕ          ОБНОВЛЕНИЕ                        РАЗМОНТИРОВАНИЕ
 ─────────────         ──────────────                    ───────────────
 constructor()         (новые props / setState)          componentWillUnmount()
      │                        │
 getDerivedStateFromProps  getDerivedStateFromProps
      │                        │
   render()            shouldComponentUpdate() ── false → стоп
      │                        │ true
  [DOM обновлён]            render()
      │                        │
 componentDidMount()   getSnapshotBeforeUpdate()
                               │
                          [DOM обновлён]
                               │
                       componentDidUpdate(prevProps, prevState, snapshot)

 ОШИБКИ: static getDerivedStateFromError(), componentDidCatch()
```

Соответствие хукам:

| Lifecycle-метод | Хук-аналог | Пример в проекте |
|---|---|---|
| `constructor` | `useState(initial)` | `PostForm`, `PostCard` |
| `componentDidMount` | `useEffect(fn, [])` | `App` — выставляет `document.title` |
| `componentDidUpdate(prevProps)` | `useEffect(fn, [deps])` | `App` — обновляет title, если изменилось число постов |
| `componentWillUnmount` | функция-cleanup в `useEffect` | — (вызывается у `PostCard` при удалении поста) |
| `shouldComponentUpdate` | `React.memo` | `PureComponent` в `PostList`/`PostCard` |
| `componentDidCatch` | **нет** | — |

Главная претензия к lifecycle-методам: **логика одной фичи размазана по нескольким методам**, а один метод содержит куски разных фич:

```js
componentDidMount() {
  this.updateTitle();                                        // фича «заголовок»
  window.addEventListener('resize', this.onResize);          // фича «размер окна»
  this.timer = setInterval(this.tick, 1000);                 // фича «таймер»
}
componentDidUpdate(prevProps) {
  if (prevProps.posts.length !== this.props.posts.length) this.updateTitle(); // «заголовок» снова
}
componentWillUnmount() {
  window.removeEventListener('resize', this.onResize);       // «размер окна» снова
  clearInterval(this.timer);                                 // «таймер» снова
}
```

С хуками каждая фича — один `useEffect` (или свой кастомный хук), подписка и отписка рядом. Ещё одна ловушка: в `componentDidUpdate` сравнение `prevProps` с текущими props нужно писать **вручную** (у хуков для этого массив зависимостей). Забыл условие — получил бесконечный цикл, если внутри вызывается `setState`.

Устаревшие методы, которые часто встречаются в legacy-коде: `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate`. С React 16.3 они переименованы в `UNSAFE_*` и не дружат с concurrent rendering.

## 10. Проблема `this` и `bind`

```jsx
class PostForm extends React.Component {
  handleChange(event) {
    this.setState({ ... }); // 💥 TypeError: Cannot read properties of undefined (reading 'setState')
  }
  render() {
    return <input onChange={this.handleChange} />; // передали метод БЕЗ привязки к экземпляру
  }
}
```

Почему так: методы класса в JS не привязаны к экземпляру. React вызывает переданную функцию как обычную, а не как `instance.handleChange()`, поэтому `this === undefined` (классы всегда в strict mode).

Три решения, и все они встречаются в реальном коде:

```jsx
// 1. bind в конструкторе (PostForm.jsx) — классика документации React 2015–2018
constructor(props) {
  super(props);
  this.handleChange = this.handleChange.bind(this);
}

// 2. Стрелочная функция как свойство класса (PostCard.jsx) — самый популярный способ позже
handleLike = () => {
  this.props.onLike(this.props.post.id);
};

// 3. Стрелка прямо в JSX — работает, но создаёт новую функцию на каждый рендер
//    (и ломает PureComponent у дочерних компонентов)
<button onClick={() => this.handleLike()} />
```

В функциональных компонентах `this` нет вообще — эта категория багов исчезла вместе с классами.

## 11. Сравнение с v05 (хуки)

Одна и та же функциональность — два подхода.

### Хранилище данных

```js
// v05: src/hooks/usePosts.js — состояние ЛОКАЛЬНОЕ, внутри компонента App
const [posts, dispatch] = useReducer(postsReducer, []);
const likePost = useCallback((id) => dispatch({ type: 'like', id }), []);
```

```js
// v05a: src/store/* — состояние ГЛОБАЛЬНОЕ, вне React
export const store = createStore(reducer);
// ...и связь через <Provider> + connect()
```

`useReducer` — это буквально «Redux внутри одного компонента»: та же сигнатура `(state, action) => newState`, тот же `dispatch`. Идея перекочевала из Redux в ядро React.

### Получение данных в компоненте

```jsx
// v05
export default function App() {
  const { posts, addPost, likePost, removePost } = usePosts();
  return <PostList posts={posts} onLike={likePost} onRemove={removePost} />;
}
```

```jsx
// v05a
class App extends React.Component {
  render() {
    const { posts, likePost, deletePost } = this.props;
    return <PostList posts={posts} onLike={likePost} onDelete={deletePost} />;
  }
}
export default connect((state) => ({ posts: state.posts }), { likePost, deletePost })(App);
```

```jsx
// Современный Redux (react-redux 7.1+) — те же store и reducer, но с хуками
function App() {
  const posts = useSelector((state) => state.posts);
  const dispatch = useDispatch();
  return <PostList posts={posts} onLike={(id) => dispatch(likePost(id))} />;
}
```

### Форма

```jsx
// v05
const [title, setTitle] = useState('');
<input value={title} onChange={(e) => setTitle(e.target.value)} />
```

```jsx
// v05a
this.state = { title: '', body: '', errors: {} };
this.handleChange = this.handleChange.bind(this);
handleChange(e) { this.setState({ [e.target.name]: e.target.value }); }
<input name="title" value={this.state.title} onChange={this.handleChange} />
```

### Сводная таблица

| Аспект | v05 (хуки + useReducer) | v05a (классы + Redux) |
|---|---|---|
| Где state постов | внутри `App` (`useReducer`) | глобальный store вне React |
| Доступ из любого компонента | только через props или Context | через `connect()` на любом уровне |
| DevTools для данных | React DevTools (состояние хука) | Redux DevTools: история action, time-travel |
| Удаление | `window.confirm()` | инлайн-подтверждение через `this.state.confirmDelete` |
| Оптимизация карточек | `React.memo` + `useCallback` | `PureComponent` + стабильные функции из `connect` |
| Файлов для логики данных | 1 (`usePosts.js`) | 3 (`actions.js`, `reducer.js`, `store/index.js`) |
| Строк «служебного» кода | мало | заметно больше (см. boilerplate) |
| Точка входа | `createRoot(...).render(<App/>)` | `ReactDOM.render(<Provider>...</Provider>, root)` |
| Версия React | 19 | 18 (в 19 `ReactDOM.render` удалён) |

### Что изменилось и почему

- **Глобальный store → локальное состояние.** В маленьком приложении глобальный store избыточен. Хуки сделали локальное состояние настолько удобным, что Redux стали брать только тогда, когда он действительно нужен.
- **Классы → функции.** Меньше кода, нет `this`/`bind`, логика фичи в одном месте, переиспользование через кастомные хуки вместо HOC.
- **connect → useSelector.** Нет обёрток-HOC, нет «wrapper hell», данные берутся там, где нужны.
- **Серверные данные ушли из Redux.** В v06 посты загружает TanStack Query, а Zustand хранит только UI-состояние. Раньше в Redux складывали ВСЁ, включая ответы API (с `isLoading`, `error` в каждом слайсе вручную).

## 12. Проблема boilerplate в Redux

**Boilerplate** — шаблонный «служебный» код, который приходится писать снова и снова. Чтобы добавить в классический Redux одну новую операцию (например, «редактировать пост»), нужно тронуть **пять мест**:

```js
// 1. actions.js — константа
export const EDIT_POST = 'EDIT_POST';

// 2. actions.js — action creator
export const editPost = (id, title, body) => ({ type: EDIT_POST, payload: { id, title, body } });

// 3. reducer.js — новый case
case EDIT_POST:
  return {
    ...state,
    posts: state.posts.map((p) =>
      p.id === action.payload.id ? { ...p, title: action.payload.title, body: action.payload.body } : p
    ),
  };

// 4. App.jsx — mapDispatchToProps
const mapDispatchToProps = { addPost, likePost, deletePost, editPost };

// 5. Пробросить через props: App → PostList → PostCard
```

А для **асинхронной** операции (загрузить посты с сервера) классический подход требовал ещё больше:

```js
export const FETCH_POSTS_REQUEST = 'FETCH_POSTS_REQUEST';
export const FETCH_POSTS_SUCCESS = 'FETCH_POSTS_SUCCESS';
export const FETCH_POSTS_FAILURE = 'FETCH_POSTS_FAILURE';

// + middleware redux-thunk
export const fetchPosts = () => async (dispatch) => {
  dispatch({ type: FETCH_POSTS_REQUEST });
  try {
    const res = await fetch('/api/posts');
    dispatch({ type: FETCH_POSTS_SUCCESS, payload: await res.json() });
  } catch (e) {
    dispatch({ type: FETCH_POSTS_FAILURE, error: e.message });
  }
};

// + три case в reducer-е, поля isLoading/error в state, ручное кеширование...
```

Отсюда типичные жалобы:

- **Много файлов на одну фичу:** `actionTypes.js`, `actions.js`, `reducer.js`, `selectors.js`, `sagas.js`, контейнер…
- **Ручная иммутабельность:** глубоко вложенные обновления превращаются в лестницу из `...spread`.
- **Неочевидные ошибки:** случайная мутация, забытый `default`, опечатка в типе.
- **Сложность для новичков:** чтобы понять, что происходит при клике, нужно пройти по 4–5 файлам.

Фраза Дэна Абрамова 2016 года «You Might Not Need Redux» стала мемом: многие проекты тащили Redux туда, где хватило бы `this.state`.

Но boilerplate давал и плюсы: **явность** (каждое изменение — именованное событие), **предсказуемость**, лёгкое тестирование чистых функций, мощный DevTools и единый стиль кода в больших командах.

## 13. Что пришло на смену

### Redux Toolkit (RTK) — официальный современный Redux

Тот же store, тот же поток данных, но без boilerplate:

```js
import { createSlice, configureStore } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: { posts: [] },
  reducers: {
    // Immer внутри: «мутирующий» код безопасно превращается в иммутабельное обновление
    addPost: {
      reducer(state, action) { state.posts.unshift(action.payload); },
      prepare(title, body) {
        return { payload: { id: Date.now(), title, body, likes: 0, createdAt: new Date().toISOString() } };
      },
    },
    likePost(state, action) {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) post.likes += 1;
    },
    deletePost(state, action) {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
  },
});

export const { addPost, likePost, deletePost } = postsSlice.actions; // action creators и types — автоматически
export const store = configureStore({ reducer: postsSlice.reducer }); // DevTools и thunk — из коробки
```

Константы, action creators и switch исчезли; асинхронщину закрывают `createAsyncThunk` и **RTK Query**.

### Другие варианты

| Инструмент | Идея | Где в проекте |
|---|---|---|
| `useState` / `useReducer` | локальное состояние в хуках | v05 |
| **Zustand** | минимальный глобальный store без Provider и boilerplate | v06 (UI-состояние) |
| **TanStack Query** / SWR / RTK Query | серверное состояние: кеш, загрузка, рефетч | v06 |
| **Server Components + Server Actions** | данные на сервере, клиенту — готовый HTML | v07, v08 |
| MobX, Jotai, Recoil, Valtio | реактивные/атомарные альтернативы | — |

## 14. Задания для практики

1. **Редактирование поста.** Добавь операцию `EDIT_POST`, пройдя все пять шагов из раздела про boilerplate. В `PostCard` сделай режим редактирования через `this.state = { editing: false, draftTitle, draftBody }`. Посчитай, сколько файлов и строк пришлось изменить.
2. **Сортировка.** Добавь в state поле `sortOrder: 'newest' | 'mostLiked'`, action `SET_SORT_ORDER` и кнопки-переключатели. Отсортированный список вычисляй в `mapStateToProps`. Затем замени вычисление на мемоизированный селектор из библиотеки `reselect` и объясни, зачем это нужно (подсказка: новый массив на каждый вызов → лишние ререндеры).
3. **combineReducers.** Вынеси посты и настройки интерфейса в два reducer-а (`postsReducer`, `uiReducer`) и объедини их через `combineReducers({ posts, ui })`. Как изменится форма state и `mapStateToProps`?
4. **localStorage через subscribe.** Сохраняй посты в localStorage при каждом изменении (`store.subscribe(() => localStorage.setItem(...))`) и загружай их как `preloadedState` вторым аргументом `createStore`. Почему это нельзя делать внутри reducer-а?
5. **Собственный middleware.** Напиши логгер `const logger = (store) => (next) => (action) => { ... }`, который выводит в консоль action и state до/после, и подключи его через `applyMiddleware`. Затем подключи `redux-thunk` и сделай «отложенное добавление» поста через `setTimeout`.
6. **Error Boundary.** Создай классовый компонент `ErrorBoundary` с `static getDerivedStateFromError` и `componentDidCatch`, оберни им `PostList` и специально брось ошибку в `PostCard` (например, при заголовке «boom»). Попробуй написать то же на хуках и убедись, что это невозможно.
7. **Миграция на хуки (react-redux).** Перепиши `App` в функциональный компонент с `useSelector` и `useDispatch`, оставив классовые `PostForm` и `PostCard`. Классы и хуки спокойно живут в одном приложении — так обычно и мигрируют legacy-проекты, по одному компоненту.
8. **Миграция на Redux Toolkit.** Замени `actions.js` + `reducer.js` одним `createSlice`, а `createStore` на `configureStore`. Сравни количество строк до и после.
9. **createRoot.** Замени `ReactDOM.render` на `createRoot` из `react-dom/client`. Проверь, пропало ли предупреждение в консоли. Почитай, что такое automatic batching в React 18 и почему в «режиме React 17» его нет.
10. **Юнит-тест reducer-а.** Подключи Vitest и напиши тесты на reducer: добавление, лайк, удаление несуществующего id, неизвестный action. Проверь через `Object.freeze(state)`, что reducer ничего не мутирует. Почему чистые функции так легко тестировать?

## 15. Ключевые концепции

| Термин | Кратко |
|---|---|
| **Store** | единственный объект, где хранится всё состояние приложения |
| **Action** | объект `{ type, payload }` — описание того, что произошло |
| **Action type** | строковая константа, идентифицирующая action |
| **Action creator** | функция, возвращающая action |
| **Reducer** | чистая функция `(state, action) => newState` |
| **dispatch** | единственный способ изменить state: отправить action в store |
| **Иммутабельность** | не менять объекты, а создавать новые — основа сравнения по ссылкам |
| **Provider** | компонент, кладущий store в React Context |
| **connect** | HOC, подписывающий компонент на store и передающий данные через props |
| **mapStateToProps** | выбирает нужную часть state для компонента |
| **mapDispatchToProps** | превращает action creators в props-функции, вызывающие dispatch |
| **HOC** | функция «компонент → новый компонент» |
| **Container / Presentational** | разделение на компоненты, знающие о данных, и «глупые» компоненты отрисовки |
| **Классовый компонент** | `class X extends React.Component` с `render()`, `this.props`, `this.state` |
| **setState** | асинхронное поверхностное слияние нового state с текущим |
| **Lifecycle-методы** | `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` и др. |
| **PureComponent** | класс с поверхностным сравнением props/state перед рендером |
| **Boilerplate** | повторяющийся служебный код, главная претензия к классическому Redux |
| **Middleware** | расширение `dispatch` (логирование, асинхронность: redux-thunk, redux-saga) |
| **ReactDOM.render** | старый API монтирования (React ≤17), устарел в 18, удалён в 19 |

---

### Следующий шаг

Дальше — **v05: React 19 + хуки**. Те же идеи (reducer, однонаправленный поток, иммутабельность), но без классов, `this`, `bind`, `connect` и глобального store: состояние живёт в `useReducer` внутри кастомного хука `usePosts`, а эффекты описываются через `useEffect`. Открой оба `App.jsx` рядом и сравни.
