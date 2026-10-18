// TypeScript: описываем форму данных через интерфейс
// Интерфейс vs type-alias: оба работают для объектов,
// но interface легче расширять (extends), type — гибче для union/intersection
export interface Post {
  id: number;
  title: string;
  body: string;
  likes: number;
  createdAt: Date;
}

// Utility type: Pick<T, K> — берёт только нужные поля из интерфейса
// Вместо дублирования: { title: string; body: string }
export type CreatePostDto = Pick<Post, 'title' | 'body'>;

// Для сортировки — string literal union type (TypeScript гарантирует только эти 2 значения)
export type SortOrder = 'newest' | 'mostLiked';
