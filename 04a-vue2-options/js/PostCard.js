/**
 * <post-card> — карточка поста.
 *
 * Здесь показан АЛЬТЕРНАТИВНЫЙ способ работы со стором — хелперы
 * Vuex.mapActions / Vuex.mapMutations вместо this.$store.dispatch(...).
 * (В .vue-файлах со сборщиком пишут: import { mapActions } from 'vuex')
 *
 * Локальное состояние confirmDelete живёт в data() — подтверждение удаления
 * касается только этой карточки, глобальному стору знать о нём незачем.
 */
Vue.component('post-card', {
  // props — входные данные от родителя (<post-list>).
  // Объектный синтаксис позволяет задать тип и обязательность —
  // Vue 2 выведет предупреждение в консоль, если передать не то.
  props: {
    post: {
      type: Object,
      required: true,
    },
  },

  // data — ОБЯЗАТЕЛЬНО функция в компонентах: каждая карточка получает
  // СВОЙ объект состояния. Если бы data был объектом — все карточки
  // делили бы один confirmDelete на всех.
  data: function () {
    return {
      confirmDelete: false,
    };
  },

  computed: {
    formattedDate: function () {
      return new Date(this.post.createdAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },

  methods: {
    // mapActions «подмешивает» методы в компонент:
    //   this.likePost(id)   ≡ this.$store.dispatch('likePost', id)
    //   this.deletePost(id) ≡ this.$store.dispatch('deletePost', id)
    // Spread (...) работает в браузере нативно; в 2016 году для этого нужен был Babel.
    ...Vuex.mapActions(['likePost', 'deletePost']),

    // Для сравнения, mapMutations выглядел бы так (вызов мутации напрямую, минуя action):
    //   ...Vuex.mapMutations({ like: 'LIKE_POST' })  →  this.like(id) ≡ this.$store.commit('LIKE_POST', id)

    askDelete: function () {
      this.confirmDelete = true;
    },
    cancelDelete: function () {
      this.confirmDelete = false;
    },
    confirmRemove: function () {
      this.deletePost(this.post.id);
    },
  },

  // beforeDestroy — Vue 2 (в Vue 3 переименован в beforeUnmount).
  // Здесь чистили бы таймеры и подписки.
  beforeDestroy: function () {
    // console.log('[post-card] beforeDestroy', this.post.id);
  },

  // template — строка; компилируется в render-функцию прямо в браузере
  // (поэтому нужна полная сборка vue.js с компилятором).
  // Ограничение Vue 2: у шаблона должен быть РОВНО ОДИН корневой элемент.
  // В Vue 3 появились фрагменты — несколько корней разрешены.
  template: `
    <article class="post-card" :class="{ 'post-card--confirming': confirmDelete }">
      <h3 class="post-card__title">{{ post.title }}</h3>
      <p class="post-card__body">{{ post.body }}</p>
      <time class="post-card__date" :datetime="post.createdAt">{{ formattedDate }}</time>

      <div class="post-card__actions">
        <template v-if="!confirmDelete">
          <button class="post-card__btn post-card__btn--like" @click="likePost(post.id)">
            ❤️ {{ post.likes }}
          </button>
          <button class="post-card__btn post-card__btn--delete" @click="askDelete">
            🗑 Удалить
          </button>
        </template>

        <template v-else>
          <span class="post-card__confirm-text">Удалить этот пост?</span>
          <button class="post-card__btn post-card__btn--danger" @click="confirmRemove">Да, удалить</button>
          <button class="post-card__btn" @click="cancelDelete">Отмена</button>
        </template>
      </div>
    </article>
  `,
});
