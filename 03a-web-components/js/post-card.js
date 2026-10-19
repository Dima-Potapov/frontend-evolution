/**
 * <post-card> — Custom Element С Shadow DOM.
 * 
 * Shadow DOM — это ключевая фича Web Components.
 * Создаёт изолированное поддерево DOM:
 *   - Стили внутри не утекают наружу
 *   - Внешние стили не проникают внутрь (кроме CSS-переменных)
 *   - querySelector из родителя не видит внутреннее содержимое
 * 
 * Это то, что Vue делает через <style scoped>,
 * React через CSS Modules (*.module.css),
 * Angular через ViewEncapsulation.
 * 
 * Но здесь — нативно, без компилятора!
 * 
 * Мы также используем <template> — ещё одну часть стандарта Web Components.
 * <template> содержит инертный HTML (не рендерится, не загружает ресурсы).
 * Клонируем его для каждой карточки — эффективнее чем innerHTML.
 */

// Создаём шаблон один раз для всех экземпляров <post-card>.
// Это оптимизация: парсинг HTML происходит один раз.
const template = document.createElement('template');
template.innerHTML = `
  <style>
    /*
      Стили внутри Shadow DOM.
      Селектор :host — это сам кастомный элемент (<post-card>).
      Эти стили НЕ видны снаружи Shadow Root — полная инкапсуляция!
      
      Сравнение:
        Vue <style scoped>: компилятор добавляет уникальный атрибут [data-v-xxxxx]
        React CSS Modules:  компилятор переименовывает классы в [файл]_[класс]_[хэш]
        Shadow DOM:         браузер изолирует стили нативно, без компилятора
    */
    :host {
      display: block;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      transition: opacity 0.3s, transform 0.3s;
    }

    :host(.deleting) .card {
      opacity: 0.4;
      transform: scale(0.98);
    }

    .body { flex: 1; min-width: 0; }
    .title { font-size: 1rem; font-weight: 600; margin-bottom: 6px; color: #1a1a2e; word-break: break-word; }
    .text { font-size: 0.875rem; color: #555; margin-bottom: 8px; word-break: break-word; }
    .date { font-size: 0.75rem; color: #aaa; }

    .actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }

    .like-btn, .delete-btn {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      font-size: 0.85rem;
      cursor: pointer;
      font-family: inherit;
      transition: border-color 0.15s, color 0.15s;
    }
    .like-btn { min-width: 60px; text-align: center; color: #555; }
    .like-btn:hover { border-color: #f43f5e; color: #f43f5e; }
    .delete-btn:hover { border-color: #ef4444; }
  </style>

  <article class="card">
    <div class="body">
      <h3 class="title"></h3>
      <p class="text"></p>
      <time class="date"></time>
    </div>
    <div class="actions">
      <button class="like-btn">❤️ 0</button>
      <button class="delete-btn">🗑</button>
    </div>
  </article>
`;

export class PostCard extends HTMLElement {
  // observedAttributes: список атрибутов, за которыми следит браузер.
  // При изменении любого из них — вызывается attributeChangedCallback.
  // Аналог: Vue watch, React useEffect([prop]).
  static get observedAttributes() {
    return ['post-id', 'post-title', 'post-body', 'post-likes', 'post-date'];
  }

  constructor() {
    super();
    // attachShadow — создаёт Shadow Root (изолированное DOM-поддерево).
    // mode: 'open' — shadowRoot доступен снаружи через element.shadowRoot
    // mode: 'closed' — shadowRoot недоступен снаружи (как в нативных <input>, <video>)
    this._shadowRoot = this.attachShadow({ mode: 'open' });

    // Клонируем шаблон и вставляем в Shadow DOM
    this._shadowRoot.appendChild(template.content.cloneNode(true));

    // Кешируем ссылки на элементы внутри Shadow DOM
    this._titleEl = this._shadowRoot.querySelector('.title');
    this._textEl = this._shadowRoot.querySelector('.text');
    this._dateEl = this._shadowRoot.querySelector('.date');
    this._likeBtn = this._shadowRoot.querySelector('.like-btn');
    this._deleteBtn = this._shadowRoot.querySelector('.delete-btn');
  }

  connectedCallback() {
    // Вешаем обработчики при вставке в DOM
    this._likeBtn.addEventListener('click', () => {
      const id = Number(this.getAttribute('post-id'));
      // dispatchEvent вверх по дереву — main.js поймает его
      this.dispatchEvent(new CustomEvent('post-like', {
        detail: { id },
        bubbles: true,
        composed: true, // пересекает границу Shadow DOM
      }));
    });

    this._deleteBtn.addEventListener('click', () => {
      if (!window.confirm('Удалить этот пост?')) return;
      const id = Number(this.getAttribute('post-id'));
      this.dispatchEvent(new CustomEvent('post-delete', {
        detail: { id },
        bubbles: true,
        composed: true,
      }));
    });
  }

  // Вызывается браузером при изменении любого из observedAttributes
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'post-title':
        if (this._titleEl) this._titleEl.textContent = newValue;
        break;
      case 'post-body':
        if (this._textEl) this._textEl.textContent = newValue;
        break;
      case 'post-likes':
        if (this._likeBtn) this._likeBtn.textContent = `❤️ ${newValue}`;
        break;
      case 'post-date':
        if (this._dateEl) {
          const date = new Date(newValue);
          this._dateEl.textContent = date.toLocaleString('ru-RU', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          });
          this._dateEl.dateTime = newValue;
        }
        break;
    }
  }
}

customElements.define('post-card', PostCard);
