# 04 — Vue 3 + Vite: «Лента постов»

Та же «Лента постов», что и в версиях 01–03: добавить пост, лайкнуть, удалить (с подтверждением), заглушка «Постов пока нет». Но теперь на **Vue 3** с **Composition API** (`<script setup>`), однофайловыми компонентами (`.vue`) и сборщиком **Vite**.

> Подзаголовок теперь **зелёный** (`#42b883`) — это фирменный цвет Vue. Так сразу видно, какая версия открыта.

---

### Немного истории

- **2013–2014.** Эван Ю (Evan You) работал в Google над прототипами на AngularJS. Angular был мощным, но тяжёлым: модули, DI, сложные концепции. Эван захотел взять из него лучшее — **декларативные шаблоны и привязку данных** — и сделать лёгкую библиотеку. В феврале 2014 вышел Vue.js.
- **2016 — Vue 2.** Virtual DOM, компоненты, Options API (`data`, `methods`, `computed`). Vue становится одним из трёх главных фреймворков (вместе с React и Angular).
- **2020 — Vue 3.** Переписан на TypeScript, реактивность построена на `Proxy`, появился **Composition API**. С 2022 года Vue 3 — версия по умолчанию.
- Тот же автор создал **Vite** — быстрый сборщик, который сейчас используют и в React-проектах.

Почему Vue любят новички: шаблоны очень похожи на обычный HTML, а реактивность «просто работает» — меняешь данные, экран обновляется сам.

---

### Что такое реактивность (кратко)

В v3 мы делали реактивность **руками**: Store после каждого изменения вызывал `emit('change')`, а App подписывался и вызывал `render()`.

Во Vue это встроено:

```js
const posts = ref([]);     // реактивная «коробка»
posts.value.unshift(post); // изменили — Vue сам обновит экран
```

Под капотом `ref` оборачивает значение в **Proxy** — объект JavaScript, который перехватывает чтение и запись:

1. **track (отслеживание).** Когда компонент при отрисовке *читает* `posts.value`, Vue запоминает: «этот компонент зависит от `posts`».
2. **trigger (запуск).** Когда кто-то *записывает* в `posts` (или в `post.likes`), Proxy это замечает, и Vue перерисовывает только зависимые компоненты.
3. **Virtual DOM.** Перерисовка создаёт лёгкое JS-описание разметки; Vue сравнивает его с предыдущим и меняет в настоящем DOM **только отличия**.

Итог: простота подхода «нарисую всё заново» (как `render()` в v3) плюс скорость точечных правок (как в v1).

---

### Что такое SFC и почему это удобно

**SFC (Single File Component)** — однофайловый компонент `.vue`, в котором всё про один кусок интерфейса:

```vue
<script setup>  // логика: данные, функции
</script>

<template>      <!-- разметка с директивами Vue -->
</template>

<style scoped>  /* стили только для этого компонента */
</style>
```

- **Разделение по смыслу, а не по технологиям.** Раньше «форма» была размазана по `index.html`, `style.css` и `main.js`. Теперь вся форма — в `PostForm.vue`.
- **Изоляция стилей.** `scoped` добавляет элементам уникальный атрибут (`data-v-3f2a1b9c`) и дописывает его к селекторам. Стили одного компонента не ломают другой.
- **Компиляция заранее.** Vite превращает `.vue` в обычный JS и CSS ещё до того, как код попадёт в браузер.

---

### Как запустить

Нужен установленный [Node.js](https://nodejs.org/) (версия 18 или новее).

```bash
cd 04-vue
npm install     # скачать зависимости (vue, vite) в папку node_modules
npm run dev     # запустить dev-сервер
```

Откройте адрес, который покажет Vite (обычно `http://localhost:5173`).

Сборка для публикации: `npm run build` → готовые файлы появятся в папке `dist/`.

> ⚠️ Открыть `index.html` двойным кликом **не получится**: браузер не умеет читать `.vue`-файлы. Нужен Vite.

---

### Структура проекта

```
04-vue/
├── index.html               — почти пустой: только <div id="app">
├── package.json             — зависимости и скрипты dev/build
├── vite.config.js           — настройки сборщика + плагин для .vue
└── src/
    ├── main.js              — точка входа: createApp(App).mount('#app')
    ├── style.css            — глобальные стили (сброс, body, .btn)
    ├── App.vue              — корневой компонент, владеет данными
    ├── stores/
    │   └── usePostStore.js  — composable: ref([]), computed, add/like/remove
    └── components/
        ├── PostForm.vue     — форма (v-model, @submit.prevent, emit)
        ├── PostList.vue     — список (v-for + :key, v-if / v-else)
        └── PostCard.vue     — карточка (defineProps, emit, :class, scoped)
```

### Схема компонентов

```
                    ┌──────────────────────────────┐
                    │           App.vue            │
                    │  usePostStore() → posts,     │
                    │  addPost, likePost, removePost│
                    └──────┬────────────────┬──────┘
          @add-post ▲      │                │  :posts ▼   ▲ @like / @remove
                    │      ▼                ▼             │
            ┌───────┴───────────┐   ┌───────────────────┴──┐
            │   PostForm.vue    │   │     PostList.vue     │
            │ v-model, emit     │   │ v-for, v-if / v-else │
            └───────────────────┘   └──────────┬───────────┘
                                     :post ▼   │   ▲ @like / @remove (id)
                                    ┌──────────┴───────────┐
                                    │   PostCard.vue  × N  │
                                    │ defineProps, emit    │
                                    └──────────────────────┘
```

Правило: **props — вниз, события — вверх.** Данные хранит и меняет только `App.vue` (через стор). Дети показывают данные и сообщают о действиях пользователя.

---

### Сравнение версий

| | v1: Vanilla JS | v2: jQuery | v3: ООП (классы) | **v4: Vue 3** |
|---|---|---|---|---|
| Где разметка | `index.html` + `createElement` | `index.html` + HTML-строки | `index.html` + `createElement` в классе | **шаблоны `<template>` в `.vue`** |
| Хранение данных | глобальный `let posts` | глобальный `let posts` | `PostStore` с `#posts` | **`ref([])` в composable** |
| Обновление экрана | вручную `render()` после каждого изменения | вручную `render()` | автоматически через `EventEmitter` + подписку | **автоматически (реактивность)** |
| Перерисовка | вся лента / точечно руками | вся лента | вся лента | **только изменившиеся узлы (Virtual DOM)** |
| Обработка событий | `addEventListener` | `.on()`, делегирование | делегирование + `closest` + `dataset.id` | **`@click`, `@submit.prevent`** |
| Поля формы | `input.value`, `form.reset()` | `.val()` | `PostFormView` | **`v-model`** |
| Показ/скрытие | `classList.toggle('hidden')` | `.toggle()` | `classList.toggle('hidden')` | **`v-if` / `v-show`** |
| Защита от XSS | `textContent` | `escapeHtml()` | `textContent` | **`{{ }}` экранирует сам** |
| Стили | один глобальный `style.css` | один глобальный | один глобальный | **`<style scoped>` у каждого компонента** |
| Сборка | не нужна | не нужна | не нужна (но нужен сервер) | **Vite** |

---

### Что больше НЕ нужно писать (по сравнению с v3)

| Было в v3 | Стало в v4 |
|---|---|
| `EventEmitter.js` (~100 строк): `on`, `emit`, подписчики | **не нужен** — реактивность Vue |
| `store.#notify()` после каждого изменения | **не нужен** — Proxy сам замечает изменения |
| `store.on('change', posts => view.render(posts))` | **не нужен** — компонент сам зависит от `posts` |
| `render()` с `replaceChildren()` | **`v-for`** в шаблоне |
| `#createCard()` + помощник `#el()` (`createElement`, `textContent`, `append`) | **разметка в `<template>`** |
| Делегирование: `closest('.btn-like')`, `dataset.id`, `Number(...)` | **`@click="emit('like', post.id)"`** |
| `.bind(this)` или стрелки ради `this` | **нет `this`** вообще (Composition API) |
| `document.getElementById(...)` в `main.js` | **не нужно** — Vue сам создаёт элементы |
| `app.start()` — первая отрисовка вручную | **`mount()`** рисует сам |
| `form.reset()`, `input.value` | **`v-model`** + `title.value = ''` |

Но **идеи остались те же**: хранилище отдельно от интерфейса, однонаправленный поток данных, компоненты не знают друг о друге. Vue просто автоматизировал «провода», которые в v3 мы прокладывали руками.

---

### Ключевые концепции — где смотреть в коде

| Концепция | Файл |
|---|---|
| `createApp().mount()` vs CDN vs `new Vue()` | `src/main.js` |
| SFC: `<template>`, `<script setup>`, `<style scoped>` | `src/App.vue` |
| `ref()`, `.value`, почему в шаблоне `.value` не нужен | `src/stores/usePostStore.js`, `src/App.vue` |
| `computed()` и кеширование | `src/stores/usePostStore.js` |
| `v-for` + `:key`, Virtual DOM patching | `src/components/PostList.vue` |
| `v-if` / `v-else` | `src/components/PostList.vue` |
| `v-show` | `src/components/PostForm.vue` |
| `v-model` = `:value` + `@input` | `src/components/PostForm.vue` |
| `@submit.prevent`, `@click` | `src/components/PostForm.vue`, `PostCard.vue` |
| `defineProps`, `defineEmits`, `emit` | `src/components/PostCard.vue` |
| `<style scoped>` под капотом | `src/components/PostCard.vue` |

---

### Задания для практики

1. **Фильтр через `computed`.** Добавьте в `App.vue` поле поиска (`v-model="search"`) и `computed`-список `filteredPosts`, который оставляет только посты, где заголовок содержит строку поиска. Передайте в `PostList` его вместо `posts`. Убедитесь: пока вы не меняете поиск или посты, `computed` не пересчитывается (добавьте внутрь `console.log`).
2. **Анимация через `<Transition>`.** Замените `<div class="posts-container">` в `PostList.vue` на `<TransitionGroup name="post" tag="div" class="posts-container">` и опишите классы `.post-enter-from`, `.post-leave-to`, `.post-enter-active`, `.post-leave-active`. Добейтесь, чтобы карточки плавно исчезали при удалении (CSS-анимация `fadeIn` так не умеет — элемент удаляется мгновенно).
3. **Сохранение в `localStorage`.** В `usePostStore.js` при создании читайте посты из `localStorage.getItem('posts')`, а сохранение сделайте через `watchEffect(() => localStorage.setItem('posts', JSON.stringify(posts.value)))`. Подумайте: почему `watchEffect` сам понимает, когда сработать? Не забудьте восстановить `nextId`.
4. **Один пользователь — один лайк.** Добавьте посту поле `liked: false`. Повторный клик по ❤️ должен снимать лайк (`likes--`), а кнопка — подсвечиваться по `post.liked`, а не по `likes > 0`.
5. **Со звёздочкой.** Вынесите `const posts = ref([])` за пределы функции `usePostStore` и вызовите стор прямо в `PostCard.vue`. Что изменилось? Почему так получился «глобальный стор» и чем это хорошо и плохо?

---

### Что дальше: v5 — React

В следующей версии та же лента на **React**. Сравните:

- вместо шаблонов — **JSX** (разметка прямо в JavaScript);
- вместо `ref` — хук **`useState`**, а данные **нельзя мутировать**: вместо `post.likes++` придётся создавать новый объект `{ ...post, likes: post.likes + 1 }`;
- вместо `computed` — `useMemo` (или просто вычисление при каждом рендере);
- вместо `emit` — родитель передаёт ребёнку **функции-колбэки** через props (`onLike`, `onRemove`) — очень похоже на `onDelete` из v3!
