/**
 * Модель данных. В Angular TypeScript обязателен с первого дня —
 * в отличие от React/Vue, где мы «доросли» до него только в v06.
 */
export interface Post {
  id: number;
  title: string;
  body: string;
  likes: number;
  createdAt: string; // ISO-строка
}
