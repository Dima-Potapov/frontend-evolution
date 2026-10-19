import { EventEmitter } from './EventEmitter.js';

/**
 * PostStore — единственный источник правды для данных постов.
 * Тот же паттерн что в v03, но теперь компоненты — это Custom Elements.
 * 
 * Сравнение с фреймворками:
 *   v03 OOP:    store.on('change', () => view.render())
 *   v04 Vue:    ref() / reactive() — автоматически отслеживает зависимости
 *   v05 React:  useState() — перерендер при каждом setState
 *   v06 Zustand: create((set) => ({...})) — минимальный store
 * 
 * Здесь: вручную уведомляем компоненты через EventEmitter.
 */
export class PostStore extends EventEmitter {
  constructor() {
    super();
    this._posts = [];
    this._nextId = 1;
  }

  get posts() {
    return [...this._posts]; // возвращаем копию (immutability)
  }

  addPost(title, body) {
    const post = {
      id: this._nextId++,
      title,
      body,
      likes: 0,
      createdAt: new Date(),
    };
    this._posts = [...this._posts, post];
    this.emit('change', this.posts);
  }

  likePost(id) {
    this._posts = this._posts.map(p =>
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    );
    this.emit('change', this.posts);
  }

  deletePost(id) {
    this._posts = this._posts.filter(p => p.id !== id);
    this.emit('change', this.posts);
  }
}
