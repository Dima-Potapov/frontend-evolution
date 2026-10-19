'use server';
// Server Actions — функции, которые выполняются ТОЛЬКО на сервере.
//
// Главное правило v09: «НИКОГДА НЕ ДОВЕРЯЙ КЛИЕНТУ».
// Server Action — это по сути публичный HTTP-эндпоинт. Его можно вызвать
// напрямую (curl, DevTools), даже если кнопку мы спрятали в интерфейсе.
// Поэтому КАЖДОЕ действие само проверяет:
//   1) аутентификацию — «кто ты?»          → auth()
//   2) авторизацию   — «тебе это можно?»  → например, «ты автор поста?»

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export interface PostFormState {
  error?: string;
  success?: boolean;
}

// Маленький помощник: id текущего пользователя или null (гость)
async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const userId = await currentUserId();
  if (!userId) return { error: 'Войдите, чтобы публиковать посты' };

  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();

  if (!title) return { error: 'Введите заголовок' };
  if (title.length < 3) return { error: 'Заголовок — минимум 3 символа' };
  if (!body) return { error: 'Введите текст' };
  if (body.length < 3) return { error: 'Текст — минимум 3 символа' };

  // authorId берём ИЗ СЕССИИ, а не из формы: иначе любой мог бы
  // подставить чужой id и писать от имени другого человека.
  await prisma.post.create({ data: { title, body, authorId: userId } });

  revalidatePath('/');
  return { success: true };
}

export async function toggleLike(postId: number): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('Войдите, чтобы ставить лайки');

  // В v08 лайк был просто числом: likes = likes + 1 (можно лайкать бесконечно).
  // В v09 лайк — это СТРОКА в таблице Like (userId, postId) — связь N:M.
  // Составной первичный ключ @@id([userId, postId]) гарантирует на уровне БД:
  // один пользователь — максимум один лайк на пост.
  const key = { userId_postId: { userId, postId } };
  const existing = await prisma.like.findUnique({ where: key });

  if (existing) {
    await prisma.like.delete({ where: key }); // повторный клик — снять лайк
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }

  revalidatePath('/');
}

export async function deletePost(postId: number): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('Войдите, чтобы удалять посты');

  // Авторизация прямо в запросе: удаляем, только если authorId совпадает.
  // SQL: DELETE FROM "Post" WHERE "id" = $1 AND "authorId" = $2;
  // Чужой пост просто не найдётся → count = 0.
  const { count } = await prisma.post.deleteMany({
    where: { id: postId, authorId: userId },
  });
  if (count === 0) throw new Error('Можно удалять только свои посты');

  // Лайки этого поста удалятся сами: onDelete: Cascade в schema.prisma
  revalidatePath('/');
}
