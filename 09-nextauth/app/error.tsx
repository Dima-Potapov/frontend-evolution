'use client';
// error.tsx — Error Boundary для сегмента App Router (обязательно Client Component)

import { useEffect } from 'react';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Типичная ошибка (с v08): PostgreSQL не запущен или DATABASE_URL неверный.
  // В v07 такой ошибки быть не могло — «база» жила в памяти процесса.
  // Теперь у нас внешняя зависимость, и её недоступность нужно объяснить пользователю.
  const message = error.message.toLowerCase();
  const isDbError =
    message.includes('connect') ||
    message.includes('database') ||
    message.includes('prisma');

  return (
    <div className={styles.container}>
      <p className={styles.title}>⚠️ Что-то пошло не так</p>
      {isDbError && (
        <p className={styles.hint}>
          💡 Убедись, что PostgreSQL запущен и DATABASE_URL в .env настроен правильно
        </p>
      )}
      <p className={styles.message}>{error.message}</p>
      <button className={styles.button} onClick={reset}>
        Попробовать снова
      </button>
    </div>
  );
}
