/**
 * main.js — корневой компонент App и создание экземпляра Vue.
 *
 * Сравнение точек входа:
 *   Vue 2:  new Vue({ el: '#app', store, render: h => h(App) })
 *   Vue 3:  createApp(App).use(store).mount('#app')      ← v04
 *
 * В Vue 2 всё глобально: Vue.component(), Vue.use(), Vue.prototype.$x —
 * это влияет на ВСЕ экземпляры Vue на странице. Vue 3 ввёл изолированные app-инстансы.
 */
var App = {
  name: 'App',

  computed: {
    // mapState — достаём поля из state без this.$store.state.posts.
    // Итоговое computed-свойство: posts() { return this.$store.state.posts }
    ...Vuex.mapState(['posts']),

    // mapGetters — то же для геттеров: this.postsCount, this.totalLikes
    ...Vuex.mapGetters(['postsCount', 'totalLikes']),

    // Обратный хронологический порядок. ADD_POST уже делает unshift,
    // но сортировка по дате гарантирует порядок независимо от реализации мутации.
    // Копия [...] обязательна: sort() мутирует массив, а менять state вне мутации
    // запрещено (strict: true выбросит ошибку).
    sortedPosts: function () {
      return [...this.posts].sort(function (a, b) {
        return b.createdAt.localeCompare(a.createdAt) || b.id - a.id;
      });
    },
  },

  // watch на изменение стора: обновляем заголовок вкладки.
  // Без deep: true watcher реагирует на замену/мутацию массива (unshift, filter),
  // но не на изменение likes внутри поста — для этого нужен deep.
  watch: {
    postsCount: {
      handler: function (count) {
        document.title = count > 0
          ? '(' + count + ') Post Feed — Vue 2'
          : 'Post Feed — Vue 2 Options API';
      },
      immediate: true, // вызвать сразу при создании, а не только при изменении
    },
  },

  created: function () {
    console.log('[App] created — store доступен:', !!this.$store, '| DOM ещё нет:', this.$el === undefined);
  },

  mounted: function () {
    console.log('[App] mounted — DOM готов:', this.$el.tagName);
  },

  template: `
    <div class="app">
      <header class="header">
        <h1>📝 Post Feed</h1>
        <p class="subtitle">Vue 2 (Options API) + Vuex</p>
        <p v-if="postsCount > 0" class="stats">{{ postsCount }} постов · {{ totalLikes }} лайков</p>
      </header>

      <main class="main">
        <post-form></post-form>
        <post-list :posts="sortedPosts"></post-list>
      </main>
    </div>
  `,
};

// Отключаем подсказку «You are running Vue in development mode» в консоли
Vue.config.productionTip = false;

new Vue({
  el: '#app',
  // store в корневом экземпляре → доступен во ВСЕХ потомках как this.$store
  store: store,
  // render-функция: h (createElement) создаёт VNode корневого компонента
  render: function (h) {
    return h(App);
  },
});
