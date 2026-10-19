'use client';

import { useActionState, useEffect, useRef } from 'react';
// Форма почти как в v08. Отличие v09: её видит только вошедший пользователь,
// а Server Action createPost дополнительно проверяет сессию (гость получит ошибку).
// Тип PostFormState экспортируется рядом с самим Server Action.
import { createPost, type PostFormState } from '@/app/actions/posts';
import styles from './PostForm.module.css';

const initialState: PostFormState = {};

export default function PostForm() {
  // useActionState (React 19) — связывает Server Action с формой (как в v07)
  const [state, action, isPending] = useActionState(createPost, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Зависимость — весь объект state: Server Action каждый раз возвращает новый объект,
  // поэтому форма сбросится и после нескольких успешных постов подряд
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
          name="title"
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
