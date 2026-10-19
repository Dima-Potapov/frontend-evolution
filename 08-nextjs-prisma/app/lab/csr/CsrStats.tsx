'use client';
// ═══════════════════════════════════════════════════════════════════════════
// CsrStats — Client Component: данные загружаются В БРАУЗЕРЕ
// ═══════════════════════════════════════════════════════════════════════════
//
// Порядок событий:
//   1. Сервер отдаёт HTML, где вместо данных — «Загружаю...».
//   2. Браузер скачивает JS, React гидрирует компонент.
//   3. useEffect запускает fetch('/api/lab-stats') → ответ → setState → ререндер.
//
// Это ровно то, что делали v04–v06 (Vite + SPA): данные приходили после загрузки JS.

import { useCallback, useEffect, useState } from 'react';
import styles from '../lab.module.css';

type Stats = { count: number; generatedAt: string };

export default function CsrStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // cache: 'no-store' — не брать ответ из HTTP-кэша браузера, каждый раз идём на сервер.
      const res = await fetch('/api/lab-stats', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect выполняется ТОЛЬКО в браузере, после первой отрисовки.
  // На сервере (при SSR-проходе Client Component) этот код не запускается —
  // поэтому в HTML от сервера будет «Загружаю...».
  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className={styles.snapshot}>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Время ответа API</span>
          <span className={styles.snapshotTime}>
            {isLoading && !stats
              ? 'Загружаю...'
              : stats
                ? new Date(stats.generatedAt).toLocaleTimeString('ru-RU')
                : '—'}
          </span>
        </div>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Постов в БД</span>
          <span className={styles.snapshotValue}>
            {isLoading && !stats ? 'Загружаю...' : stats ? stats.count : '—'}
          </span>
        </div>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Стратегия</span>
          <span className={styles.snapshotValue}>CSR (fetch в useEffect)</span>
        </div>
      </div>

      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '12px' }}>
          Не удалось загрузить данные: {error}
        </p>
      )}

      <button
        type="button"
        onClick={load}
        disabled={isLoading}
        style={{
          padding: '8px 18px',
          border: 'none',
          borderRadius: '8px',
          background: '#10b981',
          color: 'white',
          fontWeight: 600,
          cursor: isLoading ? 'wait' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          marginBottom: '20px',
        }}
      >
        {isLoading ? 'Загружаю...' : '🔄 Обновить'}
      </button>
    </>
  );
}
