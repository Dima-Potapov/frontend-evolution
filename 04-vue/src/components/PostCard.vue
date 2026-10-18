<!--
  ============================================================
   PostCard.vue — карточка ОДНОГО поста
  ============================================================

  Аналог приватного метода #createCard из PostView (v3)
  и функции createPostElement из v1.

  [v3]: ~25 строк: createElement('div'), className, dataset.id, textContent,
        append(...), classList.toggle('liked', ...), плюс помощник #el.
  [v4]: просто пишем разметку и подставляем данные через {{ }} и :class.
-->

<script setup>
/*
 * ── defineProps — ВХОДНЫЕ данные компонента ──
 *
 * Props («свойства») — то, что родитель передаёт ребёнку:
 *   <PostCard :post="post" />
 * Это как аргументы функции: компонент = функция (props) → разметка.
 *
 * Здесь подробная форма с валидацией:
 *   type: Object    — в режиме разработки Vue предупредит в консоли,
 *                     если передать не объект;
 *   required: true  — предупредит, если проп забыли передать.
 *
 * defineProps — макрос компилятора (как defineEmits): импортировать не нужно.
 * Возвращает объект props, доступный только для ЧТЕНИЯ.
 *
 * ⚠️ Менять props внутри ребёнка нельзя (props.post = ... → предупреждение).
 * Данные принадлежат родителю; ребёнок может только попросить их изменить
 * через emit. Это «однонаправленный поток данных» — та же идея, что в v3:
 * View не меняла Store, а сообщала контроллеру о клике.
 *
 * [v3]: конструктор PostView(container, emptyMessage) — тоже «входные данные»,
 *       но передавались они руками через new.
 */
const props = defineProps({
  post: { type: Object, required: true },
});

/*
 * ── defineEmits — ИСХОДЯЩИЕ события ──
 *
 * Карточка умеет сообщать о двух действиях: like и remove.
 * Вместе defineProps и defineEmits образуют ИНТЕРФЕЙС компонента:
 * «что я принимаю» и «о чём я сообщаю». Глядя на эти две строки,
 * можно использовать компонент, не читая остальной код.
 *
 * ── emit vs onDelete из v3 ──
 * [v3]: родитель передавал функцию: postView.onDelete((id) => ...),
 *       а View сама вешала обработчик на контейнер и вызывала handler(id).
 * [v4]: ребёнок «кричит» emit('remove', id), родитель «слушает»
 *       в шаблоне: <PostCard @remove="..." />. Связь объявляется в разметке,
 *       а подпиской и отпиской управляет Vue.
 */
const emit = defineEmits(['like', 'remove']);

/*
 * Удаление с подтверждением.
 * confirm() — забота интерфейса, поэтому он здесь, а не в сторе.
 * [v3]: этот confirm жил в App.js (контроллере).
 *
 * props.post.id — в <script> к пропсам обращаемся через объект props.
 */
function handleRemove() {
  if (confirm('Удалить этот пост?')) {
    emit('remove', props.post.id);
  }
}
</script>

<template>
  <!--
    Корневой элемент карточки.
    data-id больше НЕ нужен! В v3 он был нужен, чтобы делегированный
    обработчик понял, по какой карточке кликнули. Здесь каждая карточка —
    отдельный экземпляр компонента и сама знает свой post.id.
  -->
  <article class="post-card">
    <!--
      {{ post.title }} — интерполяция. Текст автоматически экранируется
      (как textContent), так что <script> в заголовке отобразится буквами,
      а не выполнится. Для вставки HTML есть v-html — но с ним осторожно (XSS).
    -->
    <h2>{{ post.title }}</h2>
    <p>{{ post.body }}</p>

    <div class="post-actions">
      <!--
        @click="emit('like', post.id)" — обработчик клика прямо в разметке.
        Аналог button.addEventListener('click', ...) — но вешать и снимать
        обработчик Vue будет сам.

        :class="{ liked: post.likes > 0 }" — ДИНАМИЧЕСКИЙ класс.
        Синтаксис-объект: { имяКласса: условие }. Класс liked будет добавлен,
        когда условие истинно. Обычный class="btn btn-like" остаётся
        и объединяется с динамическим.
        [v3]: likeBtn.classList.toggle('liked', post.likes > 0).

        {{ post.likes }} — когда likePost() в сторе сделает post.likes++,
        Vue обновит ТОЛЬКО этот текстовый узел и класс кнопки.
        Не перерисовывается ни список, ни даже вся карточка (в v3 —
        перерисовывалась вся лента!).
      -->
      <button
        type="button"
        class="btn btn-like"
        :class="{ liked: post.likes > 0 }"
        @click="emit('like', post.id)"
      >
        ❤️ {{ post.likes }}
      </button>

      <!-- Здесь логики больше (confirm), поэтому вызываем функцию из <script>. -->
      <button type="button" class="btn btn-delete" @click="handleRemove">
        🗑️ Удалить
      </button>
    </div>
  </article>
</template>

<!--
  ── <style scoped> — изолированные стили ──

  Без scoped эти правила были бы глобальными (как style.css в v1–v3):
  селектор .post-card h2 задел бы ЛЮБОЙ h2 внутри любого .post-card на сайте,
  а класс .btn-like из другого компонента мог бы случайно «перебить» наш.

  Как работает scoped под капотом:
   1) Vue добавляет каждому элементу ЭТОГО компонента уникальный атрибут:
        <article class="post-card" data-v-3f2a1b9c>
   2) И переписывает каждый селектор, добавляя этот атрибут:
        .post-card h2  →  .post-card h2[data-v-3f2a1b9c]
   Хеш (3f2a1b9c) свой у каждого компонента, поэтому стили не пересекаются.
   Откройте DevTools (F12 → Elements) и посмотрите на эти атрибуты сами!

  Это похоже на CSS Modules (в React-мире), где классы переименовываются
  в уникальные (post-card → PostCard_post-card__x7Yz). Идея одна —
  изоляция, реализация разная: Vue — атрибуты, CSS Modules — имена классов.

  Нюанс: scoped-стили родителя действуют на КОРНЕВОЙ элемент дочернего
  компонента (чтобы родитель мог управлять раскладкой), но не глубже.
-->
<style scoped>
.post-card {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  /* Анимация появления — как в v1–v3. (Во Vue есть и встроенный
     компонент <Transition> для анимаций появления/исчезновения — см. задания в README.) */
  animation: fadeIn 0.3s ease;
}

/* Имена @keyframes в scoped-стилях Vue тоже делает уникальными. */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-card h2 {
  font-size: 1.15rem;
  color: #1a202c;
  margin-bottom: 8px;
}

.post-card p {
  color: #4a5568;
  margin-bottom: 16px;
  line-height: 1.7;
  /* pre-wrap — сохраняем переносы строк, которые пользователь ввёл в textarea */
  white-space: pre-wrap;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.btn-like {
  background: #fff0f0;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  font-size: 0.85rem;
  padding: 6px 12px;
}

.btn-like:hover,
.btn-like.liked {
  background: #fed7d7;
}

.btn-delete {
  background: #fff;
  color: #718096;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  padding: 6px 12px;
}

.btn-delete:hover {
  background: #fff5f5;
  color: #e53e3e;
  border-color: #fed7d7;
}
</style>
