# Версия 4a: Vue 2 + Options API + Vuex 3

Та же «Лента постов»: добавить пост, лайкнуть, удалить с подтверждением, пустое состояние, валидация. Но написанная так, как писали Vue-приложения в **2016–2020 годах**: Vue 2, Options API (`data`, `computed`, `watch`, `methods`, хуки жизненного цикла) и централизованный стор **Vuex 3**.

Это «ответвление» перед v04 (Vue 3 + Composition API): чтобы понять, **зачем** Vue 3 всё поменял, полезно сначала увидеть, как было раньше.

```
01 Vanilla → 02 jQuery → 03 OOP → 03a Web Components → [04a Vue 2] → 04 Vue 3 → 05a React classes → 05 React hooks → ...
```

---

## Содержание

1. [Историческая перспектива](#1-историческая-перспектива)
2. [Как запустить](#2-как-запустить)
3. [Почему CDN, а не сборщик](#3-почему-cdn-а-не-сборщик)
4. [Структура проекта](#4-структура-проекта)
5. [Options API: все секции](#5-options-api-все-секции)
6. [Хуки жизненного цикла](#6-хуки-жизненного-цикла)
7. [Шаблоны и директивы](#7-шаблоны-и-директивы)
8. [Vuex: архитектура](#8-vuex-архитектура)
9. [dispatch vs commit](#9-dispatch-vs-commit)
10. [Хелперы mapState / mapGetters / mapMutations / mapActions](#10-хелперы-mapstate--mapgetters--mapmutations--mapactions)
11. [Реактивность Vue 2: Object.defineProperty](#11-реактивность-vue-2-objectdefineproperty)
12. [Ограничения реактивности Vue 2](#12-ограничения-реактивности-vue-2)
13. [Vue 3: Proxy и почему ограничения исчезли](#13-vue-3-proxy-и-почему-ограничения-исчезли)
14. [Options API vs Composition API](#14-options-api-vs-composition-api)
15. [Сравнение с v04 (Vue 3)](#15-сравнение-с-v04-vue-3)
16. [Vuex → Pinia: почему сменили стейт-менеджер](#16-vuex--pinia-почему-сменили-стейт-менеджер)
17. [Частые ошибки в Vue 2](#17-частые-ошибки-в-vue-2)
18. [Задания для практики](#18-задания-для-практики)
19. [Дорожка к v04: что изменилось](#19-дорожка-к-v04-что-изменилось)

---

## 1. Историческая перспектива

| Год | Событие |
|---|---|
| **2014** | Эван Ю (бывший инженер Google Creative Lab) выпускает Vue 0.x как «лёгкую альтернативу AngularJS» |
| **2015** | Vue 1.0 «Evangelion». Laravel начинает рекомендовать Vue — первый всплеск популярности |
| **2016, сентябрь** | **Vue 2.0** «Ghost in the Shell»: Virtual DOM, render-функции, SSR. Вместе с ним — **Vuex 2** |
| **2017** | Vuex 3 (для Vue 2.x), Nuxt.js 1.0, Vue становится одним из самых звёздных проектов GitHub |
| **2018–2019** | Расцвет экосистемы: Vuetify, Element UI, Quasar, Vue CLI 3. Начинается работа над Vue 3 и RFC по Composition API (вызвавший бурные споры в сообществе) |
| **2020, сентябрь** | **Vue 3.0** «One Piece»: Proxy-реактивность, Composition API, фрагменты, Teleport, TypeScript «из коробки» |
| **2021** | Vite 2 становится стандартом для Vue 3. Pinia набирает популярность |
| **2022, февраль** | Vue 3 становится версией по умолчанию (`npm install vue` ставит 3.x). **Pinia** — официальный рекомендуемый стор |
| **2022, июль** | **Vue 2.7 «Naruto»** — последний минорный релиз: бэкпорт Composition API и `<script setup>` для плавной миграции |
| **2023, 31 декабря** | **End of Life Vue 2**: больше нет исправлений, даже для уязвимостей (кроме платной поддержки) |

**Почему всё ещё стоит знать Vue 2?**
- Огромное количество работающих проектов (особенно корпоративных и на Laravel) всё ещё на Vue 2 — их поддерживают и мигрируют.
- Options API **никуда не делся**: в Vue 3 он полностью поддерживается, многие команды продолжают его использовать.
- Ограничения реактивности Vue 2 отлично объясняют, *почему* Vue 3 устроен именно так.

## 2. Как запустить

Никаких `npm install` и сборки. Нужен только любой локальный HTTP-сервер:

```bash
cd 04a-vue2-options

# Вариант 1: Python
python3 -m http.server 3000

# Вариант 2: npx
npx serve .

# Вариант 3: VS Code → расширение Live Server → правый клик по index.html → «Open with Live Server»
```

Открой http://localhost:3000.

> Технически этот проект откроется и двойным кликом по `index.html` (`file://`), потому что скрипты обычные, а не ES-модули. Но привычка запускать через сервер правильная: в v03a (ES-модули) `file://` уже не работает.

Нужен интернет: Vue и Vuex загружаются с CDN unpkg.com.

**Совет:** установи расширение **Vue.js devtools (legacy)** для Chrome/Firefox — новые devtools v7 поддерживают только Vue 3. Во вкладке «Vuex» видно каждую мутацию и можно «путешествовать во времени» (time-travel).

## 3. Почему CDN, а не сборщик

Vue 2 можно собрать тремя способами:

| Способ | Плюсы | Минусы |
|---|---|---|
| **CDN** (этот проект) | ноль настройки, работает сразу, видно «голый» Vue | нет `.vue`-файлов, нет `<style scoped>`, шаблоны компилируются в браузере |
| **Vue CLI** (webpack) | стандарт эпохи Vue 2, `.vue`-файлы | Vue CLI в режиме поддержки, медленный dev-сервер, сотни зависимостей |
| **Vite + `@vitejs/plugin-vue2`** | быстро | работает только с Vue 2.7+, плагин тоже в конце жизненного цикла |

Мы выбрали CDN: проект учебный, Vue 2 больше не развивается, и любая сборочная цепочка для него — это устаревшие пакеты с предупреждениями `npm audit`. К тому же CDN-подход — это **именно то, как Vue завоёвывал популярность**: «подключи один `<script>` к существующей странице на jQuery — и постепенно переписывай».

Версии закреплены точно:

```html
<script src="https://unpkg.com/vue@2.7.16/dist/vue.js"></script>
<script src="https://unpkg.com/vuex@3.6.2/dist/vuex.js"></script>
```

Важные детали:
- **`vue.js` — полная сборка с компилятором шаблонов.** Наши шаблоны — строки в опции `template`, их нужно компилировать в render-функции прямо в браузере. Runtime-only сборка (`vue.runtime.js`) на ~30% меньше, но понимает только render-функции; в проектах со сборщиком шаблоны из `.vue` компилирует `vue-loader` заранее.
- **`vue.js` vs `vue.min.js`**: dev-сборка выводит подробные предупреждения в консоль (неверные props, мутации вне стора). Для production — `.min.js`.
- **Vue 2.7 — это всё ещё Vue 2**: реактивность на `Object.defineProperty`, те же ограничения. Composition API в 2.7 есть, но мы его сознательно **не используем**.

## 4. Структура проекта

```
04a-vue2-options/
├── index.html        ← подключает Vue 2 + Vuex 3 с CDN и наши скрипты (порядок важен!)
├── styles.css        ← все стили (BEM-префиксы вместо <style scoped>), цвет #06b6d4
├── js/
│   ├── store.js      ← new Vuex.Store({ state, getters, mutations, actions })
│   ├── PostCard.js   ← Vue.component('post-card'): props, data (confirmDelete), mapActions
│   ├── PostList.js   ← Vue.component('post-list'): presentational, <transition-group>
│   ├── PostForm.js   ← Vue.component('post-form'): v-model, watch, $set/$delete, $refs, created/mounted
│   └── main.js       ← корневой App (mapState, mapGetters, watch) + new Vue({ store, render })
└── README.md
```

Почему нет `import`/`export`? Скрипты подключены обычными `<script>` — общаются через **глобальные переменные** (`Vue`, `Vuex`, `store`) и **глобальную регистрацию** компонентов `Vue.component(...)`. Поэтому порядок в `index.html` критичен: `store.js` → компоненты → `main.js`.

Поток данных:

```
<post-form> ──$store.dispatch('addPost')──┐
<post-card> ──mapActions: likePost────────┼──► ACTIONS ──commit──► MUTATIONS ──► STATE
<post-card> ──mapActions: deletePost──────┘                                        │
                                                                                   ▼
App (mapState: posts → computed sortedPosts) ──props──► <post-list> ──props──► <post-card>
```

## 5. Options API: все секции

В Options API компонент — это **объект с опциями**. Каждая опция отвечает за свой «тип» кода.

### `data` — локальное реактивное состояние

```js
data: function () {
  return {
    title: '',
    body: '',
    errors: {},
    isSubmitting: false,
  };
},
```

- В компонентах `data` **обязательно функция**: каждый экземпляр получает свой объект. Если написать `data: { confirmDelete: false }`, все карточки делили бы одно состояние (Vue 2 выдаст предупреждение).
- Всё, что вернул `data`, доступно как `this.title` и в шаблоне как `{{ title }}`.
- Все поля нужно объявить **заранее** (см. [раздел 12](#12-ограничения-реактивности-vue-2)).

### `props` — входные данные от родителя

```js
props: {
  post: { type: Object, required: true },
},
```

Можно короче — `props: ['post']`, но объектная форма даёт проверку типов в dev-режиме. Props **нельзя менять** внутри компонента (`this.post = ...` → предупреждение): данные текут сверху вниз.

### `computed` — вычисляемые свойства

```js
computed: {
  hasErrors: function () {
    return Object.keys(this.errors).length > 0;
  },
  formattedDate: function () {
    return new Date(this.post.createdAt).toLocaleString('ru-RU', { ... });
  },
},
```

- **Кешируются**: пересчитываются только когда изменились реактивные зависимости. Метод в шаблоне `{{ format() }}` вызывается при каждом ре-рендере, computed — нет.
- Используются как свойства, без скобок: `this.hasErrors`, `{{ formattedDate }}`.
- Можно сделать «записываемым» через `{ get() {...}, set(v) {...} }` — полезно для `v-model` со стором.

### `watch` — реакция на изменения

```js
watch: {
  title: function (newVal, oldVal) {
    if (this.errors.title) this.$delete(this.errors, 'title');
  },
  postsCount: {
    handler: function (count) { document.title = '(' + count + ') Post Feed'; },
    immediate: true, // вызвать сразу, а не только при первом изменении
    // deep: true,   // следить за вложенными изменениями объекта/массива
  },
  // Можно следить за путём: '$store.state.posts': function (posts) { ... }
},
```

**computed или watch?** Если нужно *получить значение* — computed. Если нужно *сделать что-то* (побочный эффект: запрос, `document.title`, `localStorage`) — watch.

### `methods` — функции компонента

```js
methods: {
  handleSubmit: function () { ... },
  ...Vuex.mapActions(['likePost', 'deletePost']),
},
```

Vue автоматически привязывает `this` в методах к экземпляру компонента.

> ⚠️ **Никогда не пиши опции стрелочными функциями**: `data: () => ({...})` ещё работает (если не используешь `this`), но `methods: { save: () => this.title }` сломается — у стрелки нет своего `this`, и он не будет указывать на компонент. А вот **внутри** методов стрелки как раз полезны: `.then(() => { this.title = '' })`.

### Прочие опции

| Опция | Для чего | Пример |
|---|---|---|
| `name` | имя в devtools и для рекурсии | `name: 'App'` |
| `template` | строка-шаблон | см. все компоненты |
| `components` | локальная регистрация | `components: { PostCard }` |
| `filters` | форматирование в шаблоне `{{ date \| format }}` | **удалены в Vue 3** |
| `mixins` | переиспользование опций | см. [раздел 14](#14-options-api-vs-composition-api) |
| `emits` | — | **появилась только в Vue 3** |

### `this` — всё в одном месте

В Options API всё доступно через `this`: `this.title` (data), `this.post` (props), `this.hasErrors` (computed), `this.handleSubmit()` (methods), а также служебные свойства с `$`:

| Свойство | Что это |
|---|---|
| `this.$store` | Vuex-стор (из корневого `new Vue({ store })`) |
| `this.$refs` | ссылки на DOM-элементы с `ref="..."` (доступны после `mounted`) |
| `this.$el` | корневой DOM-элемент компонента |
| `this.$emit('event', data)` | отправить событие родителю |
| `this.$set` / `this.$delete` | реактивно добавить/удалить свойство (только Vue 2!) |
| `this.$nextTick(cb)` | выполнить после обновления DOM |
| `this.$parent`, `this.$children`, `this.$root` | навигация по дереву (`$children` удалён в Vue 3) |

## 6. Хуки жизненного цикла

```
new Vue / создание компонента
        │
   beforeCreate   ← ещё нет ни data, ни computed
        │
     created      ← data реактивна, $store доступен, DOM ещё НЕТ → загрузка данных
        │
   beforeMount    ← шаблон скомпилирован, но не вставлен
        │
     mounted      ← DOM готов, $refs доступны → фокус, сторонние библиотеки, замеры
        │
  ┌─────┴──────┐
beforeUpdate  updated   ← при каждом ре-рендере из-за изменения данных
  └─────┬──────┘
        │
  beforeDestroy   ← компонент ещё работает → отписки, clearInterval
        │
    destroyed     ← всё отвязано
```

В проекте:
- `App.created` / `App.mounted` — логируют в консоль момент создания и монтирования (открой DevTools → Console);
- `PostForm.mounted` — ставит фокус в поле заголовка через `this.$refs.titleInput.focus()`;
- `PostCard.beforeDestroy` — место для очистки ресурсов.

Соответствие хуков:

| Vue 2 (Options) | Vue 3 (Options) | Vue 3 (Composition) | React (hooks) |
|---|---|---|---|
| `beforeCreate` / `created` | то же | сам `setup()` / тело `<script setup>` | тело функции компонента |
| `mounted` | `mounted` | `onMounted()` | `useEffect(() => {}, [])` |
| `updated` | `updated` | `onUpdated()` | `useEffect(() => {})` |
| `beforeDestroy` | **`beforeUnmount`** | `onBeforeUnmount()` | cleanup в `useEffect` |
| `destroyed` | **`unmounted`** | `onUnmounted()` | cleanup в `useEffect` |

## 7. Шаблоны и директивы

Шаблоны Vue 2 и Vue 3 почти одинаковы:

| Синтаксис | Что делает | Где в проекте |
|---|---|---|
| `{{ post.title }}` | интерполяция (экранирует HTML) | `PostCard.js` |
| `:class="{ 'x--active': flag }"` | `v-bind` — привязка атрибута | `PostCard.js`, `PostForm.js` |
| `@click="likePost(post.id)"` | `v-on` — обработчик события | `PostCard.js` |
| `@submit.prevent` | модификатор: `preventDefault()` без кода | `PostForm.js` |
| `v-model="title"` | двусторонняя привязка `:value` + `@input` | `PostForm.js` |
| `v-if` / `v-else` | условный рендер | `PostList.js`, `PostCard.js` |
| `v-for="post in posts" :key="post.id"` | список | `PostList.js` |
| `<template v-if>` | группировка без лишнего DOM-элемента | `PostCard.js` |
| `ref="titleInput"` | ссылка в `this.$refs` | `PostForm.js` |
| `<transition-group>` | анимация входа/выхода элементов | `PostList.js` |

**Отличия шаблонов Vue 2 от Vue 3:**
- **Один корневой элемент.** В Vue 2 шаблон компонента обязан иметь ровно один корень — поэтому `PostList` обёрнут в лишний `<div>`. В Vue 3 появились фрагменты: несколько корней разрешены.
- **`v-model` на компоненте** в Vue 2 = `:value` + `@input`; в Vue 3 = `:modelValue` + `@update:modelValue` (плюс можно несколько `v-model:title`, `v-model:body`). В Vue 2 для этого был модификатор `.sync`.
- **Классы анимации:** в Vue 2 `.post-enter`, в Vue 3 переименован в `.post-enter-from`.
- **Приоритет `v-if` и `v-for`** на одном элементе: в Vue 2 `v-for` важнее, в Vue 3 — `v-if`. (Совет для обеих версий: не смешивай их на одном элементе.)
- **Фильтры** `{{ date | formatDate }}` есть только в Vue 2; в Vue 3 вместо них — методы или computed.


## 8. Vuex: архитектура

**Vuex** — официальный стейт-менеджер Vue 2, вдохновлённый Flux и Redux. Одно глобальное хранилище, изменения только по строгим правилам.

```
           ┌──────────── dispatch('addPost') ────────────┐
           │                                             ▼
   ┌───────────────┐                           ┌──────────────────┐
   │   Компонент   │                           │     ACTIONS      │  async ✅, API, setTimeout
   │ (Vue component)│                          │  addPost({commit})│
   └───────────────┘                           └────────┬─────────┘
           ▲                                            │ commit('ADD_POST')
           │ ре-рендер                                  ▼
   ┌───────────────┐      изменяет (sync)     ┌──────────────────┐
   │     STATE     │ ◄─────────────────────── │    MUTATIONS     │  только sync, логируются devtools
   │  { posts: [] }│                          │ ADD_POST(state,p)│
   └───────┬───────┘                          └──────────────────┘
           │
           ▼
   ┌───────────────┐
   │    GETTERS    │  postsCount, totalLikes — «computed стора»
   └───────────────┘
```

Наш стор (`js/store.js`):

```js
var store = new Vuex.Store({
  strict: true,
  state: { posts: [], nextId: 1 },
  getters: {
    postsCount: (state) => state.posts.length,
    totalLikes: (state) => state.posts.reduce((s, p) => s + p.likes, 0),
  },
  mutations: {
    ADD_POST(state, payload) { state.posts.unshift({ id: state.nextId++, likes: 0, ... }); },
    LIKE_POST(state, id) { const p = state.posts.find(p => p.id === id); if (p) p.likes++; },
    DELETE_POST(state, id) { state.posts = state.posts.filter(p => p.id !== id); },
  },
  actions: {
    addPost({ commit }, payload) { return fakeNetwork(300).then(() => commit('ADD_POST', payload)); },
    likePost({ commit }, id) { commit('LIKE_POST', id); },
    deletePost({ commit }, id) { commit('DELETE_POST', id); },
  },
});
```

### Четыре части стора

| Часть | Аналог в компоненте | Правила |
|---|---|---|
| `state` | `data` | единый источник правды; читаем `this.$store.state.posts` |
| `getters` | `computed` | кешируются; `this.$store.getters.totalLikes` |
| `mutations` | — | **единственный** способ изменить state; **только синхронно**; `commit('ИМЯ', payload)` |
| `actions` | `methods` | бизнес-логика, асинхронность, могут вызывать несколько мутаций; `dispatch('имя', payload)`; всегда возвращают Promise |

### Почему мутации обязаны быть синхронными?

Vue devtools записывает **снимок state до и после** каждой мутации — это даёт time-travel debugging. Если мутация асинхронная:

```js
// ❌ ПЛОХО
mutations: {
  ADD_POST(state, payload) {
    setTimeout(() => state.posts.push(payload), 300); // devtools зафиксирует «ничего не изменилось»
  },
}
```

devtools запишет мутацию, а изменение state произойдёт позже — «вне протокола». Отладка превращается в гадание. Поэтому асинхронность выносится в **actions**, а мутации остаются мгновенными и предсказуемыми.

### Мутации Vuex vs reducer Redux (v05a)

```js
// Vuex — мутируем напрямую, реактивность сама всё заметит
LIKE_POST(state, id) { state.posts.find(p => p.id === id).likes++; }

// Redux — чистая функция, возвращаем НОВЫЙ state (иммутабельно)
case LIKE_POST:
  return { ...state, posts: state.posts.map(p => p.id === action.id ? { ...p, likes: p.likes + 1 } : p) };
```

Идея одна (изменения state только через описанные операции), но реализация противоположная: Vuex опирается на мутабельную реактивность Vue, Redux — на сравнение ссылок.

### `strict: true`

В нашем сторе включён строгий режим: если изменить state в обход мутации (например, `this.$store.state.posts = []` прямо в компоненте), Vuex выбросит ошибку `[vuex] do not mutate vuex store state outside mutation handlers`. Именно поэтому в `App.sortedPosts` массив сначала копируется (`[...this.posts].sort(...)`): `sort()` мутирует массив на месте. В production строгий режим выключают — он делает глубокий watch всего дерева и замедляет приложение.

### Модули

Для больших приложений стор делят на модули с пространствами имён:

```js
const posts = { namespaced: true, state: {...}, mutations: {...}, actions: {...} };
new Vuex.Store({ modules: { posts, auth, ui } });

this.$store.dispatch('posts/addPost', payload);
...Vuex.mapActions('posts', ['addPost'])
```

Строки вида `'posts/addPost'` — одна из главных болей Vuex: опечатку не поймает ни редактор, ни TypeScript.

## 9. dispatch vs commit

| | `this.$store.commit('LIKE_POST', id)` | `this.$store.dispatch('likePost', id)` |
|---|---|---|
| Что вызывает | мутацию | action |
| Синхронность | только синхронно | может быть асинхронным |
| Возвращает | `undefined` | `Promise` |
| Можно вызвать из | компонента или action | компонента или другого action |
| Видно в devtools | как мутация | как action (+ его мутации) |

**Когда что использовать:**
- **`dispatch`** — по умолчанию из компонентов. Даже если action сейчас просто вызывает `commit`, завтра туда добавится запрос к API — и компоненты менять не придётся. Так сделано в нашем проекте: компоненты **никогда** не вызывают `commit` напрямую.
- **`commit`** — внутри actions, а из компонентов — только для тривиальных синхронных изменений UI-состояния (переключить флаг), если в команде так принято.
- **Ожидание результата:** `dispatch` возвращает Promise, поэтому `PostForm` дожидается окончания `addPost` и только потом очищает форму:

```js
this.$store.dispatch('addPost', { title, body }).then(() => {
  this.title = '';
  this.body = '';
});
```

## 10. Хелперы mapState / mapGetters / mapMutations / mapActions

Писать `this.$store.state.posts` и `this.$store.dispatch('likePost', id)` утомительно. Хелперы генерируют computed-свойства и методы:

```js
// main.js (App) — в computed
computed: {
  ...Vuex.mapState(['posts']),                      // this.posts       ≡ this.$store.state.posts
  ...Vuex.mapGetters(['postsCount', 'totalLikes']), // this.postsCount  ≡ this.$store.getters.postsCount
}

// PostCard.js — в methods
methods: {
  ...Vuex.mapActions(['likePost', 'deletePost']),   // this.likePost(id) ≡ this.$store.dispatch('likePost', id)
  // ...Vuex.mapMutations({ like: 'LIKE_POST' }),   // this.like(id)     ≡ this.$store.commit('LIKE_POST', id)
}
```

Варианты записи:

```js
Vuex.mapState(['posts'])                                  // массив: имена совпадают
Vuex.mapState({ allPosts: 'posts' })                      // объект: переименование
Vuex.mapState({ firstPost: (state) => state.posts[0] })   // функция: вычисление
```

В проекте **намеренно показаны оба стиля**: `PostForm` использует `this.$store.dispatch(...)` напрямую, а `App` и `PostCard` — хелперы. Хелперы — это сахар; под капотом то же самое.

> Spread `...` в объекте — синтаксис ES2018. В эпоху Vue 2 для этого нужен был Babel (`babel-plugin-transform-object-rest-spread`); современные браузеры понимают его нативно, поэтому в нашем CDN-варианте всё работает без сборки.

## 11. Реактивность Vue 2: Object.defineProperty

Как Vue узнаёт, что `post.likes++` изменило данные, и нужно перерисовать карточку?

При создании компонента Vue 2 **обходит все свойства** объекта из `data()` (и рекурсивно вложенные) и превращает каждое в пару getter/setter с помощью `Object.defineProperty`:

```js
// Упрощённая версия того, что Vue 2 делает с каждым свойством
function defineReactive(obj, key) {
  let value = obj[key];
  const dep = new Dep(); // список «подписчиков» этого свойства

  Object.defineProperty(obj, key, {
    get() {
      dep.depend();       // track: «текущий рендер/computed зависит от меня»
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      value = newValue;
      dep.notify();       // trigger: «все подписчики — пересчитайтесь»
    },
  });
}

const post = { title: 'Привет', likes: 0 };
defineReactive(post, 'title');
defineReactive(post, 'likes');
```

Цикл реактивности:
1. Компонент рендерится и **читает** `post.likes` → срабатывает getter → компонент записан в подписчики.
2. Мутация `LIKE_POST` делает `post.likes++` → срабатывает setter → `dep.notify()`.
3. Vue ставит перерисовку компонента в очередь и выполняет её асинхронно (в следующем микротаске — поэтому существует `$nextTick`).

Убедиться можно в консоли браузера:

```js
const vm = document.querySelector('.app').__vue__;
Object.getOwnPropertyDescriptor(vm.$store.state, 'posts');
// → { get: ƒ reactiveGetter(), set: ƒ reactiveSetter(), ... }
vm.$store.state.posts.__ob__; // Observer — служебный объект реактивности Vue 2
```

**Массивы** — особый случай. Перехватить `push` через `defineProperty` невозможно, поэтому Vue 2 **подменяет прототип** реактивных массивов: методы `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse` обёрнуты так, что после выполнения вызывают `notify()`. Именно поэтому `state.posts.unshift(post)` в мутации `ADD_POST` реактивен.

## 12. Ограничения реактивности Vue 2

`Object.defineProperty` работает **только с уже существующими свойствами**. Отсюда классические «грабли» Vue 2:

### 1) Добавление нового свойства объекту

```js
data() { return { errors: {} }; }

// ❌ Не реактивно: свойства title не было при создании → нет getter/setter
this.errors.title = 'Введите заголовок';   // данные изменились, экран — нет!

// ✅ Vue.set / this.$set
this.$set(this.errors, 'title', 'Введите заголовок');

// ✅ Или заменить объект целиком (setter свойства errors сработает)
this.errors = { ...this.errors, title: 'Введите заголовок' };
```

Именно так сделано в `PostForm.js`: объект `errors` изначально пустой, ошибки добавляются через `this.$set`, удаляются через `this.$delete`. **Попробуй заменить `$set` на присваивание** — ошибки валидации перестанут появляться (это задание 1).

### 2) Удаление свойства

```js
// ❌ delete this.errors.title  — Vue не узнает
// ✅ this.$delete(this.errors, 'title')   (≡ Vue.delete)
```

### 3) Изменение элемента массива по индексу

```js
// ❌ Не реактивно
state.posts[0] = updatedPost;

// ✅ Реактивно
Vue.set(state.posts, 0, updatedPost);
state.posts.splice(0, 1, updatedPost);
```

> Почему так? Технически `defineProperty` можно повесить и на индексы массива, но Эван Ю отказался от этого из соображений производительности: массивы бывают огромными, а индексы постоянно сдвигаются.

### 4) Изменение длины массива

```js
// ❌ state.posts.length = 0
// ✅ state.posts.splice(0)  или  state.posts = []
```

### 5) Объявляй всё заранее

```js
// ✅ Хорошая практика Vue 2: все поля — в data(), даже если пока пустые
data() { return { user: null, errors: {}, selectedId: null }; }
```

Поэтому в `store.js` у поста сразу есть `likes: 0`, а в state — `nextId: 1`.

### 6) Map, Set и производительность

- `Map` и `Set` в Vue 2 **не реактивны** вообще.
- Реактивность создаётся **сразу и рекурсивно** для всего `data()`: огромный объект (например, 10 000 строк из API) «конвертируется» целиком ещё до первого рендера. Для данных только для чтения в Vue 2 используют `Object.freeze(bigList)` — Vue пропускает замороженные объекты.

## 13. Vue 3: Proxy и почему ограничения исчезли

Vue 3 вместо `defineProperty` использует ES2015 **`Proxy`** — обёртку, перехватывающую **любые** операции с объектом:

```js
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) { track(obj, key); return obj[key]; },
    set(obj, key, value) { obj[key] = value; trigger(obj, key); return true; },
    deleteProperty(obj, key) { delete obj[key]; trigger(obj, key); return true; },
  });
}
```

| Операция | Vue 2 (`defineProperty`) | Vue 3 (`Proxy`) |
|---|---|---|
| `obj.newProp = 1` | ❌ нужен `Vue.set` | ✅ работает |
| `delete obj.prop` | ❌ нужен `Vue.delete` | ✅ работает |
| `arr[0] = x` | ❌ нужен `Vue.set` / `splice` | ✅ работает |
| `arr.length = 0` | ❌ | ✅ |
| `Map`, `Set`, `WeakMap` | ❌ | ✅ |
| Когда создаётся реактивность | сразу, рекурсивно для всего объекта | лениво — при первом обращении к вложенному объекту |
| Поддержка IE11 | ✅ | ❌ (Proxy нельзя заполифиллить — одна из причин, почему Vue 3 долго не мог стать стандартом в корпорациях) |

`Vue.set` и `Vue.delete` в Vue 3 **удалены** — они просто не нужны.

## 14. Options API vs Composition API

### Организация кода: по типу опции vs по фиче

Представь компонент с тремя фичами: **форма** (поля), **валидация** (ошибки), **отправка** (состояние загрузки).

**Options API** — код разложен по «ящикам» с типами:

```js
export default {
  data() {
    return {
      title: '', body: '',        // 🟦 форма
      errors: {},                 // 🟥 валидация
      isSubmitting: false,        // 🟩 отправка
    };
  },
  computed: {
    bodyLength() {...},           // 🟦 форма
    hasErrors() {...},            // 🟥 валидация
  },
  watch: {
    title() {...},                // 🟥 валидация
    body() {...},                 // 🟥 валидация
  },
  methods: {
    validate() {...},             // 🟥 валидация
    handleSubmit() {...},         // 🟩 отправка + 🟥 + 🟦
  },
  mounted() {...},                // 🟦 форма
};
```

Логика одной фичи (🟥 валидация) **размазана** по четырём секциям. Пока компонент на 100 строк — это удобно и наглядно. На 500 строк приходится постоянно прыгать вверх-вниз.

**Composition API** (v04) — код сгруппирован по фичам:

```js
// <script setup>
// 🟦 форма
const title = ref('');
const body = ref('');
const bodyLength = computed(() => body.value.length);

// 🟥 валидация — можно целиком вынести в composable useValidation()
const errors = reactive({});
const hasErrors = computed(() => Object.keys(errors).length > 0);
watch(title, () => delete errors.title);   // Proxy: delete работает!
function validate() {...}

// 🟩 отправка
const isSubmitting = ref(false);
async function handleSubmit() {...}
```

### Переиспользование логики: mixins vs composables

В Options API общую логику выносили в **миксины**:

```js
const validationMixin = {
  data() { return { errors: {} }; },
  methods: { validate() {...} },
};
Vue.component('post-form', { mixins: [validationMixin, submitMixin], ... });
```

Проблемы миксинов:
- **Неясное происхождение:** в шаблоне видно `errors` — из какого миксина оно пришло? Из компонента?
- **Конфликты имён:** два миксина с `data.loading` молча перезапишут друг друга.
- **Неявные зависимости:** миксин рассчитывает, что в компоненте есть `this.title`.

Composables (`usePostStore()` в v04) решают всё это: явный импорт, явный возврат `const { errors, validate } = useValidation()`, переименование при деструктуризации.

### Сводная таблица

| | Options API | Composition API |
|---|---|---|
| Организация | по типу опции | по фиче |
| Порог входа | ниже: понятная структура «заполни секции» | выше: `ref`, `.value`, `reactive`, замыкания |
| `this` | везде | нет (кроме совместимости) |
| Переиспользование | mixins (проблемные) | composables |
| TypeScript | слабая типизация `this` (нужен `Vue.extend`, декораторы) | отличный вывод типов |
| Крупные компоненты | превращаются в «простыню» | масштабируются лучше |
| Доступен в | Vue 2 и Vue 3 | Vue 3 и Vue 2.7 (бэкпорт) |

**Вывод:** Options API не «плохой» — он отлично подходит для небольших и средних компонентов, и Vue 3 его полностью поддерживает. Composition API появился ради **крупных** компонентов, переиспользования логики и TypeScript.

## 15. Сравнение с v04 (Vue 3)

| Аспект | v04a (этот проект) | v04 |
|---|---|---|
| Vue | 2.7 | 3.5 |
| API компонентов | Options API | Composition API, `<script setup>` |
| Реактивность | `Object.defineProperty` | `Proxy` |
| Сборка | нет (CDN) | Vite |
| Формат компонентов | `Vue.component('post-card', { template: \`...\` })` | однофайловые `PostCard.vue` |
| Регистрация | глобальная (`Vue.component`) | локальная (`import PostCard from ...`) |
| Стили | глобальный CSS с BEM-префиксами | `<style scoped>` |
| Состояние | глобальный Vuex-стор, доступ через `this.$store` | composable `usePostStore()` с `ref` в `App.vue`, данные детям через props |
| Изменение данных | `dispatch` → action → `commit` → mutation | прямой вызов функции `addPost()` / `likePost()` |
| Коммуникация с детьми | `PostCard` сам вызывает actions стора | `PostCard` делает `emit('like')`, родитель обрабатывает |
| Корневой элемент шаблона | ровно один | можно несколько (фрагменты) |
| Точка входа | `new Vue({ el, store, render })` | `createApp(App).mount('#app')` |

Одно и то же действие «лайк»:

```js
// v04a — Vue 2 + Vuex
methods: { ...Vuex.mapActions(['likePost']) }
// шаблон: @click="likePost(post.id)"  → action → commit('LIKE_POST') → state.posts[i].likes++

// v04 — Vue 3 + composable
const { likePost } = usePostStore();
// PostCard: emit('like', post.id)  → App: @like="likePost"  → post.likes++
```

## 16. Vuex → Pinia: почему сменили стейт-менеджер

**Pinia** (произносится «пиния», исп. «ананас») начиналась в 2019 году как эксперимент Эдуардо Сан Мартина Морота — «каким был бы Vuex 5». В 2022 году Pinia стала **официальным рекомендуемым стором Vue**, а Vuex перешёл в режим поддержки. Vuex 5 так и не вышел — им фактически стала Pinia.

Тот же стор на Pinia:

```js
import { defineStore } from 'pinia';

export const usePostStore = defineStore('posts', {
  state: () => ({ posts: [], nextId: 1 }),
  getters: {
    totalLikes: (state) => state.posts.reduce((s, p) => s + p.likes, 0),
  },
  actions: {
    async addPost(payload) {          // ← мутаций НЕТ, actions меняют state напрямую
      await fakeNetwork(300);
      this.posts.unshift({ id: this.nextId++, likes: 0, ...payload });
    },
    likePost(id) {
      const p = this.posts.find((p) => p.id === id);
      if (p) p.likes++;
    },
  },
});

// в компоненте
const store = usePostStore();
store.likePost(post.id);               // ← просто вызов метода, без строк 'likePost'
```

Что изменилось и почему:

| Vuex 3 | Pinia | Почему лучше |
|---|---|---|
| `mutations` + `actions` | только `actions` | мутации были церемонией: devtools Pinia и так отслеживает изменения |
| `commit('LIKE_POST')`, `dispatch('posts/addPost')` | `store.likePost()` | никаких «магических строк»: опечатку поймает редактор и TypeScript |
| один большой стор + `modules` + `namespaced` | много маленьких сторов `defineStore('posts')` | модульность «из коробки», tree-shaking неиспользуемых сторов |
| типизация через сложные обёртки | полный вывод типов TypeScript | Pinia написана на TS с самого начала |
| `mapState`, `mapActions` | `storeToRefs(store)` или прямое обращение | хелперы остались (для Options API), но они больше не обязательны |
| ~10 KB | ~1.5 KB | меньше бандл |

**А что в v04?** В нашей v04 нет ни Vuex, ни Pinia: состояние живёт в composable `usePostStore()` с `ref([])`. Это идейная основа Pinia — «состояние + функции-действия в одной функции». Pinia добавляет к этой идее DevTools, единый экземпляр стора на всё приложение, SSR и плагины. Переход Vuex → composable → Pinia — это ровно та эволюция, которую прошла экосистема Vue.

## 17. Частые ошибки в Vue 2

| Ошибка | Что происходит | Как правильно |
|---|---|---|
| `this.errors.title = '...'` для нового ключа | данные есть, на экране ничего | `this.$set(this.errors, 'title', '...')` |
| `this.items[0] = x` | экран не обновился | `this.$set(this.items, 0, x)` или `splice` |
| `data: { count: 0 }` в компоненте | все экземпляры делят состояние + предупреждение | `data() { return { count: 0 }; }` |
| `methods: { save: () => this.title }` | `this` — не компонент (`undefined`/`window`) | обычная функция `save() { ... }` |
| асинхронный код в мутации | devtools показывает неверное состояние | асинхронность — в actions |
| `this.$store.state.posts = []` в компоненте | в strict-режиме ошибка, иначе — тихий беспорядок | через `commit` |
| два корневых элемента в `template` | ошибка компиляции «Component template should contain exactly one root element» | обернуть в `<div>` |
| `this.$refs.input` в `created` | `undefined` — DOM ещё нет | использовать в `mounted` или после `$nextTick` |
| `props` меняются внутри ребёнка | предупреждение «Avoid mutating a prop directly» | `$emit` родителю или локальная копия в `data` |

## 18. Задания для практики

1. **Сломай реактивность нарочно.** В `PostForm.js` замени `this.$set(this.errors, 'title', '...')` на `this.errors.title = '...'` и нажми «Опубликовать» с пустой формой. Почему ошибка не появилась? Выведи `this.errors` в консоль — данные там есть! Почини тремя разными способами: `$set`, замена объекта целиком, объявление `errors: { title: '', body: '' }` в `data`.
2. **Счётчик просмотров через `Vue.set`.** Добавь мутацию `VIEW_POST(state, id)`, которая добавляет посту **новое** свойство `views` (не объявленное в `ADD_POST`). Сначала напиши `post.views = 1`, убедись, что счётчик в карточке не обновляется, затем исправь через `Vue.set(post, 'views', ...)`.
3. **Сортировка и getter с параметром.** Добавь в state поле `sortBy: 'newest' | 'popular'`, мутацию `SET_SORT` и getter `sortedPosts`. Сделай переключатель в `App` через `mapState` + `mapMutations`. Бонус: getter, возвращающий функцию `getPostById: (state) => (id) => ...`.
4. **Persist в localStorage через Vuex-плагин.** Напиши плагин `store => store.subscribe((mutation, state) => localStorage.setItem(...))` и подключи через `plugins: [persistPlugin]`. Загружай сохранённые посты при создании стора. Сравни с `watch` в Vue 3 (v04).
5. **Модуль с namespace.** Перенеси посты в модуль `posts` с `namespaced: true`. Исправь все `dispatch('posts/...')` и хелперы `mapActions('posts', [...])`. Ощути, сколько строк нужно поменять и как легко опечататься.
6. **Миксин vs composable.** Вынеси валидацию (`errors`, `validate`, `watch`) в миксин `validationMixin` и подключи через `mixins: [...]`. Затем добавь в компонент своё поле `errors` — что произойдёт? Напиши в комментарии, чем composable `useValidation()` из Vue 3 лучше.
7. **Фильтр Vue 2.** Объяви глобальный фильтр `Vue.filter('date', value => ...)` и используй в `PostCard`: `{{ post.createdAt | date }}`. Затем перепиши через computed — именно так придётся сделать при миграции на Vue 3, где фильтры удалены.
8. **`.sync` и кастомный `v-model`.** Сделай компонент `<char-counter v-model="body">` (в Vue 2 это `value` + `$emit('input', ...)`). Сравни с Vue 3, где `modelValue` + `update:modelValue`.
9. **Миграция на Composition API внутри Vue 2.7.** Перепиши `PostCard` через `setup()` (в Vue 2.7 это доступно!), используя `ref` и `computed` из глобального `Vue`. Что стало проще, а что сложнее без `this`?
10. **Pinia.** Подключи Pinia с CDN (`pinia@2` поддерживает Vue 2.7 через `PiniaVuePlugin`) и перепиши `store.js` без мутаций. Сравни количество строк и удобство вызовов.

## 19. Дорожка к v04: что изменилось

Что нужно сделать, чтобы превратить этот проект в v04 (Vue 3 + Composition API + Vite):

| Шаг | Vue 2 (было) | Vue 3 (стало) |
|---|---|---|
| 1. Инструменты | `<script>` с CDN | `npm create vite@latest -- --template vue` |
| 2. Точка входа | `new Vue({ el: '#app', store, render: h => h(App) })` | `createApp(App).mount('#app')` |
| 3. Компоненты | `Vue.component('post-card', { template: \`...\` })` | файлы `PostCard.vue` с `<template>`, `<script setup>`, `<style scoped>` |
| 4. Регистрация | глобальная | `import PostCard from './PostCard.vue'` |
| 5. Состояние компонента | `data() { return { title: '' } }` | `const title = ref('')` |
| 6. Вычисляемые | `computed: { hasErrors() {...} }` | `const hasErrors = computed(() => ...)` |
| 7. Наблюдатели | `watch: { title() {...} }` | `watch(title, () => ...)` |
| 8. Хуки | `mounted() {...}`, `beforeDestroy` | `onMounted(() => ...)`, `onBeforeUnmount` |
| 9. Реактивные «хаки» | `this.$set`, `this.$delete` | обычные присваивание и `delete` |
| 10. Стор | Vuex: state / getters / mutations / actions | composable `usePostStore()` (или Pinia) |
| 11. События детей | `this.$emit('like')` без объявления | `defineEmits(['like'])` |
| 12. Шаблон | один корневой элемент | фрагменты: несколько корней |
| 13. Анимации | `.post-enter` | `.post-enter-from` |
| 14. Фильтры | `{{ date \| format }}` | методы / computed |

Официальный инструмент миграции — **migration build** (`@vue/compat`): Vue 3, который ведёт себя как Vue 2 и выводит предупреждения о каждой устаревшей конструкции. Крупные проекты мигрируют постепенно: Vue 2.6 → Vue 2.7 (+ Composition API) → `@vue/compat` → Vue 3.

Дальше по эволюции — **v04**: тот же функционал на Vue 3 с `<script setup>`. Открой оба проекта рядом и сравни `PostForm.js` с `PostForm.vue` — разница в организации кода станет очевидной.
