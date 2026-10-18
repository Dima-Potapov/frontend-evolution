/**
 * ============================================================
 *  PostFormView.js — ОТОБРАЖЕНИЕ формы добавления поста
 * ============================================================
 *
 * Отдельный класс для формы: у неё своя ответственность
 * (прочитать поля, очистить их, сообщить «отправили!»).
 * Принцип единственной ответственности (буква S в SOLID):
 * «у класса должна быть одна причина для изменения».
 * Поменяется дизайн формы — правим только этот файл.
 */

export class PostFormView {
  #form;
  #titleInput;
  #bodyInput;

  /**
   * @param {HTMLFormElement} form — элемент <form>
   *
   * Поля ищем ВНУТРИ формы (form.querySelector), а не во всём документе.
   * Так класс работает с любой формой нужной структуры.
   */
  constructor(form) {
    this.#form = form;
    this.#titleInput = form.querySelector('#post-title');
    this.#bodyInput = form.querySelector('#post-body');
  }

  /**
   * onSubmit — подписать контроллер на отправку формы.
   * @param {(data: {title: string, body: string}) => void} handler
   */
  onSubmit(handler) {
    this.#form.addEventListener('submit', (event) => {
      // Отменяем стандартное поведение формы: перезагрузку страницы.
      // Без этого все посты пропали бы (они хранятся только в памяти).
      event.preventDefault();

      // Передаём контроллеру ДАННЫЕ, а не DOM-элементы.
      // Контроллеру не нужно знать, что заголовок лежит в <input id="post-title">.
      handler({
        title: this.#titleInput.value,
        body: this.#bodyInput.value,
      });
    });
  }

  /** Очистить форму и вернуть фокус в поле заголовка. */
  reset() {
    // form.reset() — встроенный метод: возвращает все поля к начальным значениям.
    this.#form.reset();
    // focus() — ставит курсор в поле, чтобы сразу писать следующий пост.
    this.#titleInput.focus();
  }
}
