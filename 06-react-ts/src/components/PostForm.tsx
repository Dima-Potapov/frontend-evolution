import { useState, type FormEvent } from 'react';
import { useCreatePost } from '../hooks/usePosts';
import type { CreatePostDto } from '../types/post';
import styles from './PostForm.module.css';

// TypeScript: явно типизируем начальное состояние формы
const INITIAL_FORM: CreatePostDto = { title: '', body: '' };

export default function PostForm() {
  const [form, setForm] = useState<CreatePostDto>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<CreatePostDto>>({});

  // useMutation возвращает:
  //   mutate / mutateAsync — функция для вызова мутации
  //   isPending — true пока запрос выполняется
  //   isError, error — ошибка
  const { mutate: createPost, isPending } = useCreatePost();

  // TypeScript: FormEvent<HTMLFormElement> — точный тип события формы
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Валидация
    const newErrors: Partial<CreatePostDto> = {};
    if (!form.title.trim()) newErrors.title = 'Введите заголовок';
    if (!form.body.trim()) newErrors.body = 'Введите текст';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // mutate() вызывает postsApi.createPost(form)
    // После успеха: onSuccess в хуке инвалидирует кеш → автоматический рефетч
    createPost(
      { title: form.title.trim(), body: form.body.trim() },
      {
        // onSuccess/onError можно передавать и здесь (локально)
        onSuccess: () => setForm(INITIAL_FORM),
      }
    );
  }

  // Обработчик изменения полей — TypeScript: keyof CreatePostDto
  function handleChange(field: keyof CreatePostDto, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.heading}>Новый пост</h2>

      <div className={styles.field}>
        <input
          type="text"
          placeholder="Заголовок"
          value={form.title}
          onChange={e => handleChange('title', e.target.value)}
          className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
          disabled={isPending}
          maxLength={100}
        />
        {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
      </div>

      <div className={styles.field}>
        <textarea
          placeholder="Текст поста..."
          value={form.body}
          onChange={e => handleChange('body', e.target.value)}
          className={`${styles.textarea} ${errors.body ? styles.inputError : ''}`}
          disabled={isPending}
          rows={3}
          maxLength={500}
        />
        {errors.body && <span className={styles.errorMsg}>{errors.body}</span>}
      </div>

      <button type="submit" className={styles.button} disabled={isPending}>
        {/* isPending показывает состояние запроса к "серверу" */}
        {isPending ? 'Публикация...' : 'Опубликовать'}
      </button>
    </form>
  );
}
