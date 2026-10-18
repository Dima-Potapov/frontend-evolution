'use client';
// 'use client' — граница между серверным и клиентским деревом.
// Всё ниже этой границы выполняется в браузере (как обычный React).

import { useActionState, useEffect, useRef } from 'react';
import { createPost } from '@/app/actions/posts';
import type { PostFormState } from '@/lib/types';
import styles from './PostForm.module.css';

const initialState: PostFormState = {};

export default function PostForm() {
  // useActionState (React 19) — связывает Server Action с формой.
  // Возвращает:
  //   state    — последний результат, возвращённый Server Action
  //   action   — обёрнутый action для <form action={action}>
  //   isPending — true пока сервер обрабатывает запрос
  //
  // Прогрессивное улучшение: форма работает даже без JS (нативный <form>)!
  const [state, action, isPending] = useActionState(createPost, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Сбрасываем форму после успешного создания.
  // Зависимость — весь объект state, а не state.success:
  // Server Action каждый раз возвращает НОВЫЙ объект, поэтому эффект
  // сработает и после второго, третьего... успешного поста подряд
  // (state.success остаётся true, и по нему эффект бы не перезапустился).
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className={styles.form}>
      <h2 className={styles.heading}>Новый пост</h2>

      {state.error && (
        <p className={styles.errorMsg} role="alert">{state.error}</p>
      )}

      <div className={styles.field}>
        <input
          name="title"          // name — ключ в FormData (без value/onChange!)
          type="text"
          placeholder="Заголовок"
          className={styles.input}
          disabled={isPending}
          maxLength={100}
          required
        />
      </div>

      <div className={styles.field}>
        <textarea
          name="body"
          placeholder="Текст поста..."
          className={styles.textarea}
          disabled={isPending}
          rows={3}
          maxLength={500}
          required
        />
      </div>

      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? 'Публикация...' : 'Опубликовать'}
      </button>
    </form>
  );
}
