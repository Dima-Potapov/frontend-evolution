/**
 * <post-form> — Custom Element без Shadow DOM (Light DOM).
 * 
 * Почему без Shadow DOM?
 * Форма использует глобальные стили из styles.css — это проще для учебного примера.
 * Shadow DOM нужен когда хочешь ПОЛНУЮ изоляцию (как в <post-card>).
 * 
 * Custom Element lifecycle:
 *   constructor()           — создание экземпляра
 *   connectedCallback()     — элемент добавлен в DOM (аналог Vue mounted / React useEffect)
 *   disconnectedCallback()  — элемент удалён из DOM (аналог Vue unmounted / React useEffect cleanup)
 *   attributeChangedCallback() — изменился атрибут (аналог Vue watch / React useEffect([prop]))
 */
export class PostForm extends HTMLElement {
  constructor() {
    // super() ВСЕГДА первым — требование спецификации Custom Elements
    super();
  }

  connectedCallback() {
    // connectedCallback: вызывается когда элемент вставлен в документ.
    // Здесь можно делать всё что в React делают в useEffect или componentDidMount.
    this._render();
    this._attachListeners();
  }

  disconnectedCallback() {
    // Место для очистки: отписок, таймеров, etc.
    // В этом компоненте нечего чистить, но метод важно знать.
  }

  _render() {
    // innerHTML — самый простой способ создать разметку.
    // Альтернатива: document.createElement() + appendChild() (как в v01).
    // В реальных Web Components часто используют <template> (см. post-card.js).
    this.innerHTML = `
      <form class="post-form" novalidate>
        <h2 class="form-heading">Новый пост</h2>
        <div class="form-error" role="alert" hidden></div>
        <div class="form-field">
          <input
            class="form-input"
            type="text"
            name="title"
            placeholder="Заголовок"
            maxlength="100"
          />
        </div>
        <div class="form-field">
          <textarea
            class="form-textarea"
            name="body"
            placeholder="Текст поста..."
            rows="3"
            maxlength="500"
          ></textarea>
        </div>
        <button type="submit" class="form-button">Опубликовать</button>
      </form>

      <style>
        /* Light DOM стили — область видимости весь документ, не изолированы */
        post-form .post-form {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        post-form .form-heading { font-size: 1rem; font-weight: 600; color: #333; }
        post-form .form-field { display: flex; flex-direction: column; gap: 4px; }
        post-form .form-input,
        post-form .form-textarea {
          width: 100%; padding: 10px 12px;
          border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: 0.9rem; font-family: inherit;
          transition: border-color 0.15s; outline: none; resize: vertical;
        }
        post-form .form-input:focus,
        post-form .form-textarea:focus { border-color: #f59e0b; }
        post-form .form-error {
          font-size: 0.85rem; color: #ef4444;
          padding: 8px 12px; background: #fee2e2; border-radius: 6px;
        }
        post-form .form-button {
          padding: 10px 20px; background: #f59e0b; color: white;
          border: none; border-radius: 8px;
          font-size: 0.9rem; font-weight: 500; align-self: flex-start;
          transition: background 0.15s;
        }
        post-form .form-button:hover { background: #d97706; }
      </style>
    `;
  }

  _attachListeners() {
    const form = this.querySelector('.post-form');
    const errorEl = this.querySelector('.form-error');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = this.querySelector('[name="title"]').value.trim();
      const body = this.querySelector('[name="body"]').value.trim();

      // Валидация
      if (!title || !body) {
        errorEl.textContent = !title ? 'Введите заголовок' : 'Введите текст';
        errorEl.hidden = false;
        return;
      }
      errorEl.hidden = true;

      // Отправляем кастомное событие вверх по DOM-дереву (как emit в Vue).
      // Кастомные события — нативный механизм коммуникации между компонентами.
      // bubbles: true — событие всплывает к родителям (как click, input)
      // composed: true — пересекает границы Shadow DOM
      this.dispatchEvent(new CustomEvent('post-submit', {
        detail: { title, body },
        bubbles: true,
        composed: true,
      }));

      form.reset();
    });
  }
}

// Регистрируем кастомный элемент.
// После этого браузер знает: встретил <post-form> → создай PostForm.
// Имя ОБЯЗАТЕЛЬНО содержит дефис — чтобы не конфликтовать с нативными тегами.
customElements.define('post-form', PostForm);
