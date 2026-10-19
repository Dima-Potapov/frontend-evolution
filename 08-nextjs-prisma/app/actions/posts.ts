'use server';
// Server Actions — функции, которые выполняются ТОЛЬКО на сервере.
// Архитектура та же, что в v07; меняется лишь «внутренность»: вместо
// мутаций массива в globalThis — SQL-запросы к PostgreSQL через Prisma.

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export interface PostFormState {
  error?: string;
  success?: boolean;
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();

  if (!title) return { error: 'Введите заголовок' };
  if (!body) return { error: 'Введите текст' };

  // В v07: store.posts.unshift({ id: store.nextId++, title, body, likes: 0, createdAt: ... })
  // В v08: SQL INSERT INTO "Post" ("title", "body") VALUES ($1, $2);
  //        id, likes и createdAt БД заполнит сама (@default в schema.prisma)
  await prisma.post.create({ data: { title, body } });

  revalidatePath('/');
  return { success: true };
}

export async function likePost(id: number): Promise<void> {
  // В v07: const post = store.posts.find(p => p.id === id); post.likes += 1;
  //        «прочитать → изменить → записать» — при параллельных запросах
  //        (несколько инстансов) возможна гонка (race condition) и потеря лайков.
  // В v08: SQL UPDATE "Post" SET "likes" = "likes" + 1 WHERE "id" = $1;
  //        { increment: 1 } — АТОМАРНАЯ операция на стороне БД: гонки нет.
  await prisma.post.update({
    where: { id },
    data: { likes: { increment: 1 } },
  });

  revalidatePath('/');
}

export async function deletePost(id: number): Promise<void> {
  // В v07: store.posts = store.posts.filter(p => p.id !== id);
  // В v08: SQL DELETE FROM "Post" WHERE "id" = $1;
  await prisma.post.delete({ where: { id } });

  revalidatePath('/');
}
