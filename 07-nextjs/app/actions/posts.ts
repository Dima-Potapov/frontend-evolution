'use server';
// 'use server' в начале файла = ВСЕ экспортируемые функции — Server Actions.
// Server Action — асинхронная функция, которая выполняется ТОЛЬКО на сервере,
// но может вызываться из Client Component как обычная JS-функция.
// Next.js автоматически создаёт HTTP-endpoint под капотом.

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import type { PostFormState } from '@/lib/types';

// createPost используется с useActionState — поэтому сигнатура:
// (prevState: PostFormState, formData: FormData) => Promise<PostFormState>
// prevState — предыдущий state (нужен useActionState, игнорируем здесь)
// formData — данные формы (как в нативном <form action="...">)
export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const title = (formData.get('title') as string | null)?.trim() ?? '';
  const body = (formData.get('body') as string | null)?.trim() ?? '';

  // Валидация на сервере (всегда нужна, даже если есть на клиенте)
  if (!title) return { error: 'Введите заголовок' };
  if (!body) return { error: 'Введите текст' };

  // Имитируем задержку (как настоящий запрос к БД)
  await new Promise(r => setTimeout(r, 300));

  db.posts.push({
    id: db.nextId++,
    title,
    body,
    likes: 0,
    createdAt: new Date(),
  });

  // revalidatePath('/') — инвалидирует кеш Next.js для главной страницы.
  // Next.js перерендерит page.tsx с актуальными данными.
  // Аналог queryClient.invalidateQueries(['posts']) из v06!
  revalidatePath('/');
  return { success: true };
}

// likePost и deletePost вызываются через useTransition (не через form action),
// поэтому не нужен параметр prevState
export async function likePost(id: number): Promise<void> {
  await new Promise(r => setTimeout(r, 150));
  const post = db.posts.find(p => p.id === id);
  if (!post) return;
  post.likes += 1;
  revalidatePath('/');
}

export async function deletePost(id: number): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
  db.posts = db.posts.filter(p => p.id !== id);
  revalidatePath('/');
}
