/*
 * ============================================================
 *  PostForm.jsx — форма добавления поста
 * ============================================================
 *
 *  Здесь главное — УПРАВЛЯЕМЫЕ компоненты (controlled components)
 *  и хук useState.
 *
 *  [v1–v3]: значение поля жило в DOM; мы читали input.value при отправке.
 *  [v4]:    v-model — двусторонняя привязка, Vue синхронизирует сам.
 *  [v5]:    в React двусторонней привязки НЕТ. Связь собирается из двух
 *           половинок вручную: value={title} + onChange={...}.
 *           Ровно то, во что Vue «разворачивает» v-model, — только руками.
 */

import { useState } from 'react';
import styles from './PostForm.module.css';

/*
 * Props приходят первым аргументом функции — одним объектом.
 * Деструктурируем сразу в параметрах: ({ onAddPost }) вместо (props) и props.onAddPost.
 * [v4]: const emit = defineEmits(['add-post']) — объявление интерфейса компонента.
 * [v5]: интерфейс — просто параметры функции. Типизировать их будем в v6 (TypeScript).
 */
export default function PostForm({ onAddPost }) {
  /*
   * ── useState — локальное состояние компонента ──
   * const [значение, функцияИзменения] = useState(начальноеЗначение);
   *
   * Возвращается массив из двух элементов, мы деструктурируем его и сами даём имена.
   * Соглашение: [что-то, setЧтоТо].
   *
   * [v4]: const title = ref('') и title.value = 'новое'.
   * [v5]: читаем просто title, меняем ТОЛЬКО через setTitle('новое').
   *       Присвоение title = 'новое' ничего не сделает: React об этом не узнает.
   *
   * Важно: setTitle НЕ меняет title сразу! Он планирует ре-рендер, и новое значение
   * появится в переменной title только при следующем вызове функции PostForm.
   *   setTitle('abc'); console.log(title); // всё ещё старое значение
   * Каждый рендер видит свой «снимок» состояния (snapshot).
   */
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  /*
   * Обработчик отправки.
   * event — это SyntheticEvent: обёртка React над родным событием браузера
   * с тем же интерфейсом (preventDefault, target...), одинаково работающая во всех браузерах.
   * Под капотом React не вешает обработчик на каждую форму, а слушает события
   * на корне (#root) и сам раздаёт их компонентам. Это ДЕЛЕГИРОВАНИЕ событий —
   * то самое, что мы писали руками в v2 (.on) и v3 (closest), только автоматически.
   */
  function handleSubmit(event) {
    // В React нет модификатора .prevent из Vue — вызываем руками, как в v1–v3.
    event.preventDefault();

    try {
      onAddPost(title, body); // сообщаем родителю — как emit('add-post') в v4
      // Очищаем поля: состояние → '' → React перерисует input с value="".
      setTitle('');
      setBody('');
      setError('');
    } catch (err) {
      // usePosts бросил ошибку валидации — показываем её под формой (как в v4).
      setError(err.message);
    }
  }

  return (
    /*
     * onSubmit={handleSubmit} — передаём саму функцию, БЕЗ скобок.
     * onSubmit={handleSubmit()} вызвал бы её сразу при рендере — частая ошибка.
     * Имена событий в camelCase: onSubmit, onClick, onChange (в HTML — onsubmit).
     */
    <form className={styles.form} onSubmit={handleSubmit}>
      {/*
        УПРАВЛЯЕМОЕ поле:
          value={title}  — значение поля ВСЕГДА берётся из состояния;
          onChange={...} — при каждом нажатии клавиши записываем новое значение в состояние.

        Цикл: ввод символа → onChange → setTitle → ре-рендер → input получает новый value.
        «Источник истины» — состояние React, а не DOM.

        Если оставить value без onChange, поле станет «замороженным»: печатать
        не получится, React каждый раз вернёт старое значение (и предупредит в консоли).

        ⚠️ onChange в React срабатывает на КАЖДЫЙ ввод символа (как событие input в браузере),
        а не при потере фокуса, как родной change. Исторически сложившееся имя.

        e.target.value — текущий текст поля; e.target — сам DOM-элемент <input>.
      */}
      <input
        type="text"
        className={styles.input}
        placeholder="Заголовок поста"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Для textarea в React тоже value, а не текст между тегами, как в HTML. */}
      <textarea
        className={styles.textarea}
        placeholder="О чём хотите написать?"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      {/*
        Условный рендер: если error пустая строка (ложное значение), абзаца не будет в DOM.
        Это аналог v-if, а не v-show: элемент создаётся и удаляется.
        Аналога v-show в React нет. Если нужно, пишут style={{ display: error ? 'block' : 'none' }}.
        (Двойные фигурные скобки: внешние — «здесь JS», внутренние — объект стилей.)
      */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Общий глобальный .btn + локальный модульный класс — склеиваем строки шаблоном. */}
      <button type="submit" className={`btn ${styles.primary}`}>
        Опубликовать
      </button>
    </form>
  );
}
