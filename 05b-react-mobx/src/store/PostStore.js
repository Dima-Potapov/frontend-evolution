/*
 * ============================================================
 *  PostStore.js — MobX store: обычный ES-класс + makeAutoObservable
 * ============================================================
 *
 *  Сравни с v05a (Redux), где для того же нужно было ТРИ файла:
 *    actions.js  — константы ADD_POST / LIKE_POST / DELETE_POST + action creators
 *    reducer.js  — чистая функция (state, action) => newState со switch
 *    index.js    — createStore(reducer)
 *
 *  В MobX — один класс. Поля = состояние, методы = изменения, геттеры = вычисления.
 *  Это возвращение к ООП из v03-oop (класс PostStore + EventEmitter),
 *  только подписку и уведомления теперь делает MobX — автоматически.
 */
import { makeAutoObservable } from 'mobx';

class PostStore {
  // Обычное поле класса. После makeAutoObservable станет observable:
  // MobX обернёт массив в Proxy и будет знать о КАЖДОМ чтении и изменении.
  posts = [];

  constructor() {
    // makeAutoObservable(this) автоматически размечает весь класс:
    //   поля    (posts)                 → observable — наблюдаемое состояние
    //   методы  (addPost, likePost, ...) → action     — изменения состояния
    //   геттеры (postsCount, totalLikes) → computed   — кэшируемые вычисления
    //
    // Явная альтернатива (то же самое, но вручную):
    //   makeObservable(this, {
    //     posts: observable,
    //     addPost: action, likePost: action, deletePost: action,
    //     postsCount: computed, totalLikes: computed,
    //   });
    //
    // В MobX 4/5 писали декораторы @observable posts = []; — для этого нужен был
    // Babel-плагин. В MobX 6 декораторы не обязательны, хватает этой одной строки.
    makeAutoObservable(this);
  }

  // ---------- ACTIONS: изменяют состояние ----------

  addPost(title, body) {
    // unshift — МУТАЦИЯ массива. В Redux так нельзя:
    //   return { ...state, posts: [newPost, ...state.posts] };
    // В MobX — можно и нужно: Proxy перехватит unshift и уведомит observer-компоненты.
    this.posts.unshift({
      id: Date.now(),
      title,
      body,
      likes: 0,
      createdAt: new Date().toISOString(),
    });
  }

  likePost(id) {
    const post = this.posts.find(p => p.id === id);
    // post.likes++ — прямая мутация вложенного объекта!
    // MobX делает observable глубоко (deep): каждый пост внутри массива — тоже Proxy.
    // Перерисуется ТОЛЬКО карточка этого поста (и счётчики, читающие totalLikes),
    // а не весь список.
    //
    // В Redux (v05a) то же самое выглядело так:
    //   posts: state.posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p)
    if (post) post.likes++;
  }

  deletePost(id) {
    // Присваивание нового массива тоже отслеживается (поле posts — observable).
    // Можно было бы и мутировать: this.posts.splice(index, 1) — MobX поддерживает оба стиля.
    this.posts = this.posts.filter(p => p.id !== id);
  }

  // ---------- COMPUTED: производные значения ----------

  // computed кэшируется: пока posts не меняется, повторные чтения
  // postsCount не запускают геттер заново.
  // Аналог: useMemo в v05/v06, getters во Vuex (v04a), reselect в Redux.
  get postsCount() {
    return this.posts.length;
  }

  // Пересчитывается только когда меняется длина массива или чей-то likes.
  get totalLikes() {
    return this.posts.reduce((sum, p) => sum + p.likes, 0);
  }
}

// Singleton: один экземпляр на всё приложение.
// Компоненты просто импортируют его — без <Provider>, connect() и useContext.
// (Для тестов или SSR store обычно передают через React Context — см. задания в README.)
export const postStore = new PostStore();
