// Те же типы, что в v06 — для сравнения архитектур
export interface Post {
  id: number;
  title: string;
  body: string;
  likes: number;
  createdAt: Date;
}

// Используется как тип возвращаемого значения Server Action для формы
export interface PostFormState {
  error?: string;
  success?: boolean;
}
