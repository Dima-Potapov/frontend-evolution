<!--
  ============================================================
   PostForm.vue — форма добавления поста
  ============================================================

  Аналог PostFormView.js из v3 и обработчика submit из v1/v2.

  [v1]: document.getElementById('post-title').value — читаем поле при отправке,
        form.reset() — очищаем.
  [v2]: $('#post-title').val() — то же через jQuery.
  [v3]: класс PostFormView: находит элементы, вешает submit, отдаёт { title, body }.
  [v4]: поля формы СВЯЗАНЫ с переменными через v-model. Мы не ищем элементы
        и не читаем .value из DOM — значение всегда уже лежит в переменной.
-->

<script setup>
import { ref } from 'vue';

/*
 * ── defineEmits — объявляем, какие СОБЫТИЯ компонент умеет отправлять ──
 *
 * Это «исходящая» часть интерфейса компонента (входящая — props, см. PostCard).
 * defineEmits — макрос компилятора: его не нужно импортировать,
 * Vue знает о нём на этапе сборки и убирает при компиляции.
 *
 * Возвращает функцию emit, которой мы «кричим» родителю: emit('add-post', ...).
 *
 * [v3]: в PostFormView был метод onSubmit(handler) — родитель передавал
 *       функцию-обработчик, а форма её вызывала.
 * [v4]: тот же принцип, но родитель подписывается в шаблоне:
 *       <PostForm @add-post="addPost" />
 */
const emit = defineEmits(['add-post']);

/*
 * Состояние формы — два ref'а со строками.
 * Здесь ref обязателен: от значений зависит интерфейс (поле ввода
 * показывает то, что лежит в переменной).
 */
const title = ref('');
const body = ref('');

// Текст ошибки валидации. Пустая строка = ошибки нет.
const error = ref('');

/*
 * handleSubmit — вызывается при отправке формы (см. @submit.prevent в шаблоне).
 *
 * Здесь не нужен event.preventDefault() — это делает модификатор .prevent.
 * Не нужен form.reset() — достаточно обнулить переменные, и v-model
 * сам очистит поля (связь работает в обе стороны).
 */
function handleSubmit() {
  // Внутри <script> обращаемся к ref через .value!
  if (!title.value.trim() || !body.value.trim()) {
    // [v3]: alert(error.message). Здесь показываем ошибку прямо под формой.
    error.value = 'Заполните заголовок и текст поста';
    return;
  }

  // Сообщаем родителю: «пользователь хочет добавить пост, вот данные».
  // Первый аргумент — имя события, остальные — данные (payload).
  // Форма НЕ добавляет пост сама и ничего не знает о сторе —
  // она лишь сообщает о намерении. Решает родитель (App.vue).
  emit('add-post', title.value, body.value);

  // Очищаем форму: v-model увидит изменение и сотрёт текст в полях.
  title.value = '';
  body.value = '';
  error.value = '';
}
</script>

<template>
  <!--
    @submit.prevent="handleSubmit"

    @submit — сокращение v-on:submit. Это директива СОБЫТИЯ, аналог
      form.addEventListener('submit', handleSubmit)   [v1, v3]
      $form.on('submit', handleSubmit)                [v2]
    Vue сам повесит обработчик при создании элемента и сам снимет
    при удалении компонента (утечки памяти исключены).

    .prevent — МОДИФИКАТОР события. Он вызывает event.preventDefault()
      за нас, чтобы браузер не перезагрузил страницу при отправке формы.
      Есть и другие: .stop (stopPropagation), .once (сработать один раз),
      @keyup.enter (только по Enter).
  -->
  <form class="post-form" @submit.prevent="handleSubmit">
    <!--
      v-model="title" — ДВУСТОРОННЯЯ привязка поля к переменной.

      Это синтаксический сахар. Для <input> Vue разворачивает его в:
        <input :value="title" @input="title = $event.target.value">
      то есть:
        • :value  — переменная → поле (изменили title в коде → текст в поле обновился);
        • @input  — поле → переменная (пользователь печатает → title обновляется).

      В v1 мы делали «половину» этого руками: читали input.value при отправке.
      Вторую половину (очистить поле) — через form.reset().
      Теперь достаточно написать title.value = '' — и поле очистится само.

      required из v1–v3 убрали намеренно: проверку делаем сами в handleSubmit,
      чтобы показать собственное сообщение об ошибке.
    -->
    <input
      v-model="title"
      type="text"
      class="form-input"
      placeholder="Заголовок поста"
    >

    <!-- Для <textarea> v-model работает так же, как для input. -->
    <textarea
      v-model="body"
      class="form-textarea"
      placeholder="О чём хотите написать?"
      rows="3"
    ></textarea>

    <!--
      v-show — показать/скрыть элемент через CSS display: none.
      Элемент ВСЕГДА существует в DOM, Vue лишь переключает стиль.

      Сравните с v-if (см. PostList.vue): тот физически удаляет элемент
      из DOM и создаёт заново.

      Когда что выбирать:
        • v-show — элемент часто появляется/исчезает (дешёвое переключение,
          но элемент рисуется сразу, даже если скрыт);
        • v-if  — условие меняется редко или элемент «тяжёлый»
          (не создаём то, что не нужно).

      Ошибка формы может мелькать часто — берём v-show.
      [v1–v3]: аналог classList.toggle('hidden', ...) с классом .hidden { display: none }.
    -->
    <p v-show="error" class="form-error">{{ error }}</p>

    <!-- type="submit" — клик по кнопке (или Enter в поле) отправит форму. -->
    <button type="submit" class="btn btn-primary">
      Опубликовать
    </button>
  </form>
</template>

<style scoped>
/* Стили формы — как в v1–v3, но теперь живут рядом с самой формой. */

.post-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
  outline: none;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  /* В фокусе — зелёная рамка в цвет Vue (в v1–v3 была синевато-фиолетовая). */
  border-color: #42b883;
}

.form-error {
  color: #e53e3e;
  font-size: 0.9rem;
}

.btn-primary {
  background: #667eea;
  color: white;
  align-self: flex-start;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
