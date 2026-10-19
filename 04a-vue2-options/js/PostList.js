/**
 * <post-list> — «глупый» (presentational) компонент: получает посты через props,
 * ничего не знает о Vuex. Сравни с <post-card>, который сам ходит в стор.
 */
Vue.component('post-list', {
  props: {
    posts: {
      type: Array,
      required: true,
    },
  },

  computed: {
    isEmpty: function () {
      return this.posts.length === 0;
    },
  },

  // Корневой элемент один — <div>. v-if/v-else внутри него.
  // <transition-group> — встроенный компонент Vue для анимации списков.
  // В Vue 2 он рендерит обёртку (tag="ul"); :key обязателен для каждого элемента.
  template: `
    <div>
      <div v-if="isEmpty" class="post-list__empty">
        <p>Постов пока нет</p>
        <p class="post-list__hint">Напиши первый!</p>
      </div>

      <transition-group v-else name="post" tag="ul" class="post-list">
        <li v-for="post in posts" :key="post.id">
          <post-card :post="post"></post-card>
        </li>
      </transition-group>
    </div>
  `,
});
