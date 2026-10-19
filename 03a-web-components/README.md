# Версия 3a: Web Components — нативный браузерный стандарт

Та же «Лента постов»: добавить пост, лайкнуть, удалить с подтверждением, пустое состояние, валидация. Но без фреймворка и без сборщика — только браузерные API: **Custom Elements + Shadow DOM + HTML Templates + ES-модули**.

---

## 1. Место в эволюции

```
01 Vanilla JS → 02 jQuery → 03 OOP → [03a Web Components] → 04 Vue → 05 React → ...
```

Это «ответвление» между v03 (OOP) и v04 (Vue).

- **2011** — Google (Алекс Расселл) представил концепцию Web Components на конференции Fronteers.
- **2013** — первые реализации в Chrome (Custom Elements v0, Shadow DOM v0), библиотека Polymer.
- **2016–2020** — стабильные спецификации v1, поддержка во всех современных браузерах.

Идея: дать браузеру **нативный** способ создавать переиспользуемые инкапсулированные компоненты. Vue, React, Angular решают те же задачи — компоненты, изоляция стилей, жизненный цикл — но делают это удобнее и добавляют то, чего в стандарте нет (реактивность, SSR, экосистема).

Главная мысль версии: Vue `<style scoped>`, React-компоненты и Angular-компоненты — это **абстракции** над задачами, которые браузер частично умеет решать сам.

## 2. Что такое Web Components

Это не одна технология, а набор из четырёх стандартов:

| Стандарт | Что делает | Где в проекте |
|---|---|---|
| **Custom Elements** | регистрируем свои HTML-теги: `customElements.define('post-card', PostCard)` | все `js/post-*.js` |
| **Shadow DOM** | изолированное поддерево DOM со своими стилями | `js/post-card.js` |
| **HTML Templates** | инертный HTML (`<template>`) — не рендерится, клонируется для каждого компонента | `js/post-card.js` |
| **HTML Imports** *(устарел)* | подключение HTML-файлов через `<link rel="import">` | **заменён ES-модулями** (`<script type="module">`, `import/export`) |

HTML Imports поддерживал только Chrome, и в 2020 году его удалили. Сегодня компоненты подключаются обычными ES-модулями, как в этом проекте.

## 3. Нативный браузер vs фреймворки

| Концепция | Web Components | Vue | React | Angular |
|---|---|---|---|---|
| Инкапсуляция стилей | Shadow DOM (нативно) | `<style scoped>` (атрибут `data-v-xxx`) | CSS Modules / CSS-in-JS | `ViewEncapsulation` (эмуляция или Shadow DOM) |
| Реактивность | ❌ нет: вызываем `render()` вручную | ✅ Proxy (`ref`, `reactive`) | ✅ `useState` → перерендер | ✅ Zone.js / Signals |
| Шаблоны | `<template>` + `innerHTML` / DOM API | SFC-шаблон с директивами (`v-if`, `v-for`) | JSX | HTML-шаблоны с директивами (`*ngIf`, `@for`) |
| Коммуникация между компонентами | атрибуты/свойства вниз, `CustomEvent` вверх | props вниз, `emit` вверх | props вниз, callbacks вверх | `@Input()` вниз, `@Output()` + `EventEmitter` вверх |
| Жизненный цикл | `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback` | `onMounted`, `onUnmounted`, `watch` | `useEffect` | `ngOnInit`, `ngOnDestroy`, `ngOnChanges` |
| Регистрация компонента | `customElements.define('post-card', PostCard)` — глобально | `app.component()` / локальный `import` | просто `import` | `@Component({ selector: 'app-post-card' })` |

## 4. Lifecycle hooks: Custom Element vs Vue vs React

| Custom Element | Vue (Composition API) | React (hooks) |
|---|---|---|
| `constructor()` | (нет прямого аналога; ближе всего `setup()`) | (нет аналога; тело функции компонента выполняется при каждом рендере) |
| `connectedCallback()` | `onMounted()` | `useEffect(() => {...}, [])` |
| `disconnectedCallback()` | `onUnmounted()` | cleanup-функция: `useEffect(() => () => {...}, [])` |
| `attributeChangedCallback()` | `watch(() => props.x, ...)` | `useEffect(() => {...}, [prop])` |
| `adoptedCallback()` | — | — |

Важные детали:
- В `constructor()` нельзя читать атрибуты и детей элемента — их может ещё не быть. Инициализацию DOM делают в `connectedCallback()` или, как в `<post-card>`, внутри Shadow Root.
- `attributeChangedCallback` срабатывает **только** для атрибутов из `static observedAttributes`.
- `connectedCallback` может вызываться несколько раз (элемент удалили и снова вставили), поэтому обработчики нужно вешать аккуратно или снимать в `disconnectedCallback`.

## 5. Shadow DOM: open vs closed

```js
this.attachShadow({ mode: 'open' });   // element.shadowRoot → ShadowRoot
this.attachShadow({ mode: 'closed' }); // element.shadowRoot → null
```

| | `open` | `closed` |
|---|---|---|
| Доступ снаружи | `card.shadowRoot.querySelector('.title')` работает | `card.shadowRoot === null` |
| DevTools | видно в обоих режимах | видно в обоих режимах |
| Тесты / отладка | удобно | сложно |
| Пример | большинство библиотек (Lit, Shoelace) | нативные `<input>`, `<video>`, `<select>` (внутренняя кнопка play и т.п.) |

**Когда что использовать:**
- **`open`** — почти всегда. Удобно тестировать, проще интегрироваться с другими инструментами.
- **`closed`** — когда внутренности компонента — строго приватная реализация (например, виджет для чужих сайтов). Но это **не защита**: злоумышленник может переопределить `attachShadow` до загрузки вашего скрипта. Это просто сигнал «не трогайте внутренности».

В `closed`-режиме сохраните ссылку на root в приватном поле (`this._shadowRoot = this.attachShadow(...)`), как это уже сделано в `post-card.js`.

## 6. Кастомные события (CustomEvent)

Как компоненты общаются без фреймворка? Данные идут **вниз** через атрибуты/свойства, события — **вверх** через `dispatchEvent`:

```js
// post-card.js — «ребёнок» сообщает о действии
this.dispatchEvent(new CustomEvent('post-like', {
  detail: { id },   // полезная нагрузка
  bubbles: true,    // всплывает к родителям
  composed: true,   // пересекает границу Shadow DOM
}));

// main.js — «родитель» (или любой предок) слушает
document.addEventListener('post-like', (e) => store.likePost(e.detail.id));
```

Без `composed: true` событие из Shadow DOM «застрянет» внутри Shadow Root и до `document` не дойдёт.

Сравнение:

```vue
<!-- Vue: emit -->
<script setup>
const emit = defineEmits(['like']);
emit('like', post.id);
</script>
<PostCard @like="store.likePost" />
```

```tsx
// React: callback-проп
function PostCard({ post, onLike }) {
  return <button onClick={() => onLike(post.id)}>❤️</button>;
}
<PostCard post={post} onLike={likePost} />
```

По сути Vue `emit` — это обёртка над той же идеей, что и `CustomEvent` (только без всплытия по DOM). React вместо событий передаёт функции вниз через props.

## 7. Ограничения Web Components (почему фреймворки всё равно нужны)

- **Нет реактивности.** Изменили данные — надо самому вызвать `postList.setPosts(posts)`. Vue/React делают это автоматически.
- **Нет умного обновления DOM.** `<post-list>` перерисовывает весь список через `innerHTML`; во фреймворках Virtual DOM / компилятор обновляют только изменившиеся узлы.
- **Атрибуты — только строки.** `post-likes="5"` придётся превращать обратно в число, а объекты и массивы передавать через **свойства** (`card.post = post`), а не атрибуты.
- **Server-Side Rendering сложен.** Shadow DOM создаётся JavaScript-ом в браузере; для SSR нужен Declarative Shadow DOM (`<template shadowrootmode="open">`) — относительно новый и ещё мало используемый механизм.
- **Нет экосистемы и DevTools.** Нет аналогов Vue DevTools / React DevTools, роутера, стейт-менеджера «из коробки», готовых паттернов форм.
- **Стили сквозь Shadow DOM — только через CSS-переменные** (они наследуются через границу) и `::part()`. Обычные глобальные селекторы внутрь не проникают — для темизации это и плюс, и минус.
- **Глобальный реестр имён.** Два компонента с одинаковым именем `post-card` на одной странице конфликтуют: второй `customElements.define` выбросит ошибку.

Где Web Components реально хороши: **дизайн-системы и виджеты, которые должны работать в любом фреймворке** (Shoelace, Material Web, Salesforce Lightning, GitHub `<relative-time>`). Библиотека **Lit** добавляет поверх стандарта реактивные свойства и декларативные шаблоны.

## 8. Как запустить

ES-модули (`<script type="module">`) **не работают через `file://`** — браузер блокирует их политикой CORS. Нужен любой локальный сервер:

```bash
# Вариант 1: VS Code Live Server (расширение) — правый клик по index.html → «Open with Live Server»

# Вариант 2: Python
python3 -m http.server 3000

# Вариант 3: npx
npx serve .
```

Затем открой http://localhost:3000. Никаких `npm install` и сборки не нужно.

## 9. Структура проекта

```
03a-web-components/
├── index.html          ← разметка с <post-form> и <post-list>, подключение js/main.js как модуля
├── styles.css          ← глобальные стили (Light DOM): reset, шапка, layout, янтарный подзаголовок
└── js/
    ├── EventEmitter.js ← тот же Observer, что в v03-oop (преемственность)
    ├── PostStore.js    ← хранилище постов: addPost / likePost / deletePost, событие 'change'
    ├── post-form.js    ← <post-form>: Light DOM, валидация, CustomEvent 'post-submit'
    ├── post-list.js    ← <post-list>: пустое состояние, создаёт <post-card> через createElement
    ├── post-card.js    ← <post-card>: Shadow DOM + <template>, observedAttributes, события like/delete
    └── main.js         ← точка входа: создаёт store, связывает его с компонентами и событиями
```

Поток данных:

```
<post-form> ──post-submit──┐
<post-card> ──post-like────┼──► document (main.js) ──► PostStore ──'change'──► <post-list>.setPosts()
<post-card> ──post-delete──┘                                                    └──► новые <post-card>
```

## 10. Задания для практики

1. **`<post-stats>`.** Создай компонент, показывающий число постов и общее количество лайков. Подпиши его на `store.on('change', ...)` в `main.js`.
2. **CSS-переменные для темизации.** Замени цвета внутри Shadow DOM `<post-card>` на `var(--card-bg, white)`, `var(--card-text, #1a1a2e)` и задай их снаружи в `styles.css` — убедись, что переменные «пробивают» Shadow DOM, а обычные селекторы — нет.
3. **Атрибут `theme="dark"`.** Добавь `<post-card theme="dark">` и стили через `:host([theme="dark"]) .card { ... }`.
4. **`mode: 'closed'`.** Поменяй режим Shadow DOM в `post-card.js` и выполни в консоли `document.querySelector('post-card').shadowRoot`. Что изменилось? Почему компонент всё ещё работает?
5. **Слоты (`<slot>`).** Добавь в шаблон `<slot name="footer"></slot>` и передай в карточку свой контент: `<span slot="footer">Автор: Дима</span>`. Сравни со слотами Vue и `children` в React.
6. **`adoptedCallback`.** Реализуй этот хук и вызови его, перенеся элемент в `<iframe>` через `iframe.contentDocument.adoptNode(card)`. Когда этот хук нужен на практике?
7. **Размер бандла.** Сравни суммарный размер JS этой версии (без сжатия, `ls -l js/`) с production-сборкой v04 (Vue: `npm run build`, папка `dist/`). Сколько килобайт «стоит» фреймворк и что ты получаешь взамен?

## 11. Следующий шаг

Дальше — **v04a-vue2-options**: Vue 2 с Options API и Vuex. Посмотрим, как Vue решает проблемы Web Components:
- **реактивность** — `data()` и `computed` вместо ручного `render()`;
- **шаблоны с директивами** — `v-for`, `v-if`, `v-model` вместо `innerHTML` и `createElement`;
- **централизованный стор** — Vuex вместо самописного `PostStore` на EventEmitter;
- **SSR и экосистема** — Nuxt, Vue Router, Vue DevTools.
