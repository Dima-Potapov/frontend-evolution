import type { Post, CreatePostDto } from '../types/post';

// Имитируем задержку сети (как настоящий HTTP-запрос)
const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// "База данных" в памяти — имитация сервера
// В реальном приложении здесь был бы fetch('/api/posts')
let posts: Post[] = [];
let nextId = 1;

// TypeScript: явные возвращаемые типы функций (Promise<Post[]> и т.д.)
// Это "контракт" API — потребитель точно знает, что получит
export const postsApi = {
  // GET /posts — получить все посты
  async getPosts(): Promise<Post[]> {
    await delay(600); // имитируем сетевую задержку
    // Возвращаем копию массива (immutability)
    return [...posts];
  },

  // POST /posts — создать пост
  async createPost(data: CreatePostDto): Promise<Post> {
    await delay(400);
    const post: Post = {
      id: nextId++,
      ...data,
      likes: 0,
      createdAt: new Date(),
    };
    posts = [...posts, post];
    return post;
  },

  // PATCH /posts/:id/like — лайкнуть пост
  async likePost(id: number): Promise<Post> {
    await delay(200);
    const found = posts.find(p => p.id === id);
    if (!found) throw new Error(`Post ${id} not found`);
    posts = posts.map(p => (p.id === id ? { ...p, likes: p.likes + 1 } : p));
    // TypeScript: non-null assertion (!) — говорим "точно не undefined"
    return posts.find(p => p.id === id)!;
  },

  // DELETE /posts/:id — удалить пост
  async deletePost(id: number): Promise<void> {
    await delay(300);
    posts = posts.filter(p => p.id !== id);
  },
};
