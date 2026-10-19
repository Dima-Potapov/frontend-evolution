/**
 * <post-list> — Custom Element без Shadow DOM.
 * Получает посты через метод render(posts) — вызывается из main.js.
 * 
 * В отличие от фреймворков, нет автоматической реактивности.
 * Мы сами вызываем render() когда данные изменились.
 * Именно это автоматизируют Vue (Proxy), React (setState), MobX (observable).
 */
import { PostCard } from './post-card.js';

export class PostList extends HTMLElement {
  constructor() {
    super();
    this._posts = [];
  }

  connectedCallback() {
    this._render();
  }

  // Публичный метод — вызывается из main.js когда store изменился.
  // Аналог: в Vue — computed/watch, в React — props + useState.
  setPosts(posts) {
    this._posts = posts;
    this._render();
  }

  _render() {
    if (this._posts.length === 0) {
      this.innerHTML = `
        <div class="post-list-empty">
          <p>Постов пока нет</p>
          <p class="post-list-hint">Напиши первый!</p>
        </div>
        <style>
          .post-list-empty {
            text-align: center; padding: 48px 20px; color: #aaa;
            background: white; border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          }
          .post-list-hint { font-size: 0.875rem; margin-top: 4px; color: #ccc; }
        </style>
      `;
      return;
    }

    this.innerHTML = `
      <ul class="post-list-ul"></ul>
      <style>
        .post-list-ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
      </style>
    `;

    const ul = this.querySelector('.post-list-ul');

    // Создаём <post-card> для каждого поста.
    // Важно: не используем innerHTML для вставки кастомных элементов в цикле
    // (это сбросило бы их внутреннее состояние). Используем createElement + appendChild.
    this._posts.forEach(post => {
      const li = document.createElement('li');
      const card = document.createElement('post-card');
      // setAttribute передаёт данные через атрибуты (только строки!)
      // Альтернатива для объектов: установить свойство напрямую: card.post = post
      card.setAttribute('post-id', post.id);
      card.setAttribute('post-title', post.title);
      card.setAttribute('post-body', post.body);
      card.setAttribute('post-likes', post.likes);
      card.setAttribute('post-date', post.createdAt.toISOString());
      li.appendChild(card);
      ul.appendChild(li);
    });
  }
}

customElements.define('post-list', PostList);
