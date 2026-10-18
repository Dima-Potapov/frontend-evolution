'use client'; // Error Boundary ДОЛЖЕН быть Client Component (React требует)

import { useEffect } from 'react';
import styles from './error.module.css';

// error.tsx — специальный файл Next.js App Router
// Автоматически оборачивает page.tsx в React Error Boundary.
// Ловит ошибки выброшенные в page.tsx (включая серверные).
//
// Props: error — пойманная ошибка, reset — функция для повторной попытки
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // В реальном приложении: отправляем в Sentry / логгер
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <p className={styles.title}>⚠️ Что-то пошло не так</p>
      <p className={styles.message}>{error.message}</p>
      <button className={styles.button} onClick={reset}>
        Попробовать снова
      </button>
    </div>
  );
}
