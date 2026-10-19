/**
 * store.js — Vuex 3 Store (для Vue 2).
 *
 * Vuex — официальный стейт-менеджер Vue 2, построенный по мотивам Flux/Redux:
 *
 *   Компонент ──dispatch──► ACTION ──commit──► MUTATION ──изменяет──► STATE
 *       ▲                  (async ок)         (только sync)              │
 *       └──────────────────── реактивный ре-рендер ◄─────────────────────┘
 *
 * Сравнение:
 *   v04 (Vue 3):  composable usePostStore() с ref() — без мутаций и экшенов
 *   v05a (Redux): reducer (чистая функция) + action creators, иммутабельные обновления
 *   Vuex:         мутации МЕНЯЮТ state напрямую (state.posts.push) — Vue отследит это сам
 */

// Vue.use(Vuex) — установка плагина. При подключении через CDN Vuex делает это
// автоматически, если найдёт глобальный Vue; явный вызов безопасен и нагляден.
Vue.use(Vuex);

// Имитация задержки сети — чтобы показать, зачем нужны асинхронные actions
function fakeNetwork(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

// Глобальная переменная store — её подхватит main.js (без модулей — только глобалы)
var store = new Vuex.Store({
  // strict: true — в dev-режиме Vuex выбросит ошибку, если state изменили
  // НЕ через мутацию (например, this.$store.state.posts = [] в компоненте).
  // В production выключают: глубокий watcher по всему state дорог.
  strict: true,

  // ─────────────────────────────── STATE ───────────────────────────────
  // Единое дерево состояния. Vue 2 делает его реактивным через Object.defineProperty:
  // для КАЖДОГО свойства создаётся пара getter/setter. Поэтому ВСЕ поля, которые
  // понадобятся, нужно объявить заранее (см. ограничения реактивности в README).
  state: {
    posts: [],
    nextId: 1,
  },

  // ────────────────────────────── GETTERS ──────────────────────────────
  // «computed для стора»: кешируются и пересчитываются только при изменении зависимостей.
  getters: {
    postsCount: function (state) {
      return state.posts.length;
    },
    totalLikes: function (state) {
      return state.posts.reduce(function (sum, p) { return sum + p.likes; }, 0);
    },
  },

  // ───────────────────────────── MUTATIONS ─────────────────────────────
  // ЕДИНСТВЕННОЕ место, где можно менять state. Правила:
  //   1) только СИНХРОННЫЙ код — иначе Vue DevTools не сможет записать
  //      «снимок до/после» и time-travel debugging сломается;
  //   2) имена в UPPER_SNAKE_CASE — традиция из Flux (как типы экшенов в Redux).
  // Вызываются через store.commit('ИМЯ', payload).
  mutations: {
    ADD_POST: function (state, payload) {
      var post = {
        id: state.nextId,
        title: payload.title,
        body: payload.body,
        likes: 0,
        createdAt: new Date().toISOString(),
      };
      state.nextId++;
      // unshift — новые посты сверху.
      // Vue 2 не умеет перехватывать вызовы методов массива через defineProperty,
      // поэтому ПАТЧИТ методы push/pop/shift/unshift/splice/sort/reverse
      // у реактивных массивов. Вызов unshift → Vue узнаёт об изменении.
      state.posts.unshift(post);
    },

    LIKE_POST: function (state, id) {
      var post = state.posts.find(function (p) { return p.id === id; });
      // post.likes уже существует (объявлено в ADD_POST) → у него есть setter → реактивно.
      // А вот post.views = 1 (НОВОЕ свойство) Vue 2 НЕ заметит — понадобился бы
      // Vue.set(post, 'views', 1). В Vue 3 (Proxy) работает и то, и другое.
      if (post) post.likes++;
    },

    DELETE_POST: function (state, id) {
      // Замена массива целиком — setter свойства posts срабатывает → реактивно.
      // ❌ Так в Vue 2 НЕЛЬЗЯ: state.posts[index] = newPost или state.posts.length = 0 —
      //    изменения по индексу и длине defineProperty не отслеживает.
      // ✅ Можно: splice(index, 1), Vue.set(state.posts, index, value) или filter, как здесь.
      state.posts = state.posts.filter(function (p) { return p.id !== id; });
    },
  },

  // ────────────────────────────── ACTIONS ──────────────────────────────
  // Бизнес-логика и ПОБОЧНЫЕ ЭФФЕКТЫ (запросы к API, таймеры). Могут быть асинхронными.
  // НЕ меняют state сами — только вызывают commit. Вызываются через store.dispatch().
  // dispatch всегда возвращает Promise → в компоненте можно сделать .then() / await.
  actions: {
    // Асинхронный action: «отправляем на сервер», потом коммитим.
    addPost: function (context, payload) {
      // context = { state, getters, commit, dispatch, rootState }
      return fakeNetwork(300).then(function () {
        context.commit('ADD_POST', payload);
      });
    },

    // Синхронные actions: можно было бы вызывать commit прямо из компонента,
    // но единообразно «компоненты → только dispatch» проще поддерживать:
    // завтра лайк начнёт ходить на сервер — компоненты менять не придётся.
    likePost: function (context, id) {
      context.commit('LIKE_POST', id);
    },

    deletePost: function (context, id) {
      context.commit('DELETE_POST', id);
    },
  },
});
