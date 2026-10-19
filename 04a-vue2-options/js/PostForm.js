/**
 * <post-form> — форма создания поста. Классический Options API:
 * код разложен по ТИПАМ опций (data / computed / watch / methods / хуки),
 * а не по фичам. Логика «валидация» размазана по data (errors), watch и methods —
 * именно эту проблему решает Composition API в v04 (см. README).
 */
var MIN_LENGTH = 3;

Vue.component('post-form', {
  // ─── data: локальное реактивное состояние ───
  data: function () {
    return {
      title: '',
      body: '',
      // errors — ПУСТОЙ объект. Ключи title/body появятся позже.
      // Это классическая ловушка Vue 2: this.errors.title = '...' НЕ будет
      // реактивным, потому что при создании компонента свойства title не было
      // и defineProperty на него не повесили. Поэтому ниже — this.$set / this.$delete.
      errors: {},
      isSubmitting: false,
    };
  },

  // ─── computed: производные значения, кешируются ───
  computed: {
    hasErrors: function () {
      return Object.keys(this.errors).length > 0;
    },
    bodyLength: function () {
      return this.body.length;
    },
  },

  // ─── watch: реакция на изменения ───
  // Как только пользователь начал исправлять поле — убираем ошибку этого поля.
  watch: {
    title: function () {
      if (this.errors.title) this.$delete(this.errors, 'title'); // Vue.delete — реактивное удаление
    },
    body: function () {
      if (this.errors.body) this.$delete(this.errors, 'body');
    },
  },

  // ─── methods: обработчики и прочие функции ───
  methods: {
    validate: function () {
      var title = this.title.trim();
      var body = this.body.trim();

      if (!title) {
        // this.$set(obj, key, value) ≡ Vue.set — добавляет НОВОЕ реактивное свойство.
        // ❌ this.errors.title = '...' — Vue 2 не заметит, ошибка не появится на экране!
        this.$set(this.errors, 'title', 'Введите заголовок');
      } else if (title.length < MIN_LENGTH) {
        this.$set(this.errors, 'title', 'Заголовок — минимум ' + MIN_LENGTH + ' символа');
      }

      if (!body) {
        this.$set(this.errors, 'body', 'Введите текст поста');
      } else if (body.length < MIN_LENGTH) {
        this.$set(this.errors, 'body', 'Текст — минимум ' + MIN_LENGTH + ' символа');
      }

      return !this.hasErrors;
    },

    handleSubmit: function () {
      if (this.isSubmitting || !this.validate()) return;

      this.isSubmitting = true;
      // dispatch → action (асинхронный, имитирует запрос) → commit → mutation → state.
      // dispatch возвращает Promise — дожидаемся и сбрасываем форму.
      this.$store
        .dispatch('addPost', { title: this.title.trim(), body: this.body.trim() })
        .then(() => {
          // Стрелочная функция сохраняет this компонента.
          // ВНИМАНИЕ: сами опции (data, methods, computed) стрелками писать НЕЛЬЗЯ —
          // Vue привязывает this к экземпляру только для обычных функций.
          this.title = '';
          this.body = '';
          this.errors = {};
          this.isSubmitting = false;
          // $nextTick — дождаться обновления DOM, затем вернуть фокус
          this.$nextTick(() => this.$refs.titleInput.focus());
        });
    },
  },

  // ─── lifecycle hooks ───
  // created: экземпляр создан, data реактивна, но DOM ещё нет ($el недоступен)
  created: function () {
    // Хорошее место для загрузки данных: this.$store.dispatch('fetchPosts')
  },
  // mounted: компонент вставлен в DOM — $refs доступны
  mounted: function () {
    this.$refs.titleInput.focus();
  },

  // @submit.prevent — модификатор события: event.preventDefault() без кода
  // v-model — двусторонняя привязка (value + @input) к полю data
  template: `
    <form class="post-form" novalidate @submit.prevent="handleSubmit">
      <h2 class="post-form__heading">Новый пост</h2>

      <div class="post-form__field">
        <input
          ref="titleInput"
          v-model="title"
          type="text"
          name="title"
          placeholder="Заголовок"
          maxlength="100"
          class="post-form__input"
          :class="{ 'post-form__input--invalid': errors.title }"
          :disabled="isSubmitting"
        />
        <span v-if="errors.title" class="post-form__error" role="alert">{{ errors.title }}</span>
      </div>

      <div class="post-form__field">
        <textarea
          v-model="body"
          name="body"
          placeholder="Текст поста..."
          rows="3"
          maxlength="500"
          class="post-form__textarea"
          :class="{ 'post-form__textarea--invalid': errors.body }"
          :disabled="isSubmitting"
        ></textarea>
        <span v-if="errors.body" class="post-form__error" role="alert">{{ errors.body }}</span>
      </div>

      <div class="post-form__footer">
        <button type="submit" class="post-form__button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Публикация...' : 'Опубликовать' }}
        </button>
        <span class="post-form__counter">{{ bodyLength }}/500</span>
      </div>
    </form>
  `,
});
