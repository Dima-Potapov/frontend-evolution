/**
 * main.js — точка входа. Связывает Store и Custom Elements.
 * 
 * В фреймворках эту роль играют:
 *   Vue:   createApp(App).mount('#app')
 *   React: createRoot(root).render(<App />)
 * 
 * Здесь: создаём store, слушаем его события,
 * вручную обновляем компоненты — то, что фреймворки делают автоматически.
 */

// Импортируем компоненты — это регистрирует их через customElements.define()
import './post-form.js';
import './post-list.js';
import './post-card.js';
import { PostStore } from './PostStore.js';

// Создаём единственный инстанс store
const store = new PostStore();

// Получаем ссылки на кастомные элементы (они уже в HTML через index.html)
const postList = document.querySelector('post-list');

// Подписываемся на изменения store
// Когда данные меняются — вручную обновляем компонент списка.
// Это то, что Vue/React делают автоматически через реактивность/setState.
store.on('change', (posts) => {
  postList.setPosts(posts);
});

// Начальный рендер (store пустой — покажет empty state)
postList.setPosts(store.posts);

// Слушаем кастомные события от компонентов.
// Они всплывают до document через bubbles: true + composed: true.
// Это аналог props-колбэков в React (onSubmit, onLike, onDelete)
// или emit в Vue.

document.addEventListener('post-submit', (e) => {
  const { title, body } = e.detail;
  store.addPost(title, body);
});

document.addEventListener('post-like', (e) => {
  store.likePost(e.detail.id);
});

document.addEventListener('post-delete', (e) => {
  store.deletePost(e.detail.id);
});
