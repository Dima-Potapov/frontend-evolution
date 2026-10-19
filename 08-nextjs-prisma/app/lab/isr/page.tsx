// ═══════════════════════════════════════════════════════════════════════════
// /lab/isr — ISR (Incremental Static Regeneration)
// ═══════════════════════════════════════════════════════════════════════════
//
// `revalidate = 30` означает: страница сначала генерируется статически
// (как SSG), но раз в 30 секунд Next.js пересобирает её в фоне.
//
// Алгоритм «stale-while-revalidate»:
//   1. Первый запрос → генерация + сохранение (как SSG).
//   2. Запросы в течение 30 сек → отдаётся кэш (быстро!).
//   3. Через 30 сек следующий запрос → отдаётся старый кэш,
//      а в фоне запускается пересборка с новыми данными.
//   4. Следующий запрос → уже новая версия.
//
// Итого: пользователь может увидеть данные с опозданием до 30 сек,
// зато страница раздаётся так же быстро, как статика.

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../lab.module.css';

export const metadata = { title: 'ISR — Лаборатория рендеринга' };

// Ключевая директива ISR: пересобирать страницу не чаще чем раз в N секунд.
export const revalidate = 30;

export default async function IsrPage() {
  // try/catch — чтобы `npm run build` не падал без PostgreSQL.
  // В отличие от SSG, ISR «вылечится» сам: через 30 сек страница пересоберётся уже с БД.
  let count: number | null = null;
  try {
    count = await prisma.post.count();
  } catch {
    console.warn('[lab/isr] БД недоступна — страница сохранится без данных до следующей ревалидации');
  }
  const generatedAt = new Date().toLocaleTimeString('ru-RU');

  return (
    <div className={styles.lab}>
      <div className={styles.header}>
        <Link href="/lab" className={styles.back}>← Назад к лаборатории</Link>
        <span className={`${styles.badge} ${styles.badgeIsr}`}>ISR</span>
        <h1 className={styles.title}>Incremental Static Regeneration</h1>
        <p className={styles.subtitle}>
          Как SSG, но страница автоматически пересобирается в фоне раз в 30 секунд.
        </p>
      </div>

      <div className={styles.devWarning}>
        <strong>⚠️ Нужен production-режим.</strong> В <code>npm run dev</code>
        {' '}страница рендерится как SSR при каждом запросе, <code>revalidate</code> игнорируется.
        Запусти <code>npm run build &amp;&amp; npm start</code>.
      </div>

      <div className={styles.snapshot}>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Время последней генерации</span>
          <span className={styles.snapshotTime}>{generatedAt}</span>
        </div>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Постов в БД на тот момент</span>
          <span className={styles.snapshotValue}>{count ?? 'БД недоступна'}</span>
        </div>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Интервал ревалидации</span>
          <span className={styles.snapshotValue}>30 сек</span>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
        👉 <strong>Добавь пост в ленте</strong>, вернись сюда.
        Время и число постов обновятся только через ~30 секунд после следующего перехода на эту страницу.
        Это «stale-while-revalidate»: сначала отдаётся старая версия, фоновая пересборка идёт параллельно.
      </p>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
        Сравни с <Link href="/lab/ssg" style={{ color: '#10b981' }}>SSG</Link> (замерзает навсегда)
        {' '}и <Link href="/lab/ssr" style={{ color: '#10b981' }}>SSR</Link> (обновляется на каждый запрос).
        ISR — компромисс между скоростью и свежестью данных.
      </p>

      <div className={`${styles.explanation} ${styles.explanationIsr}`}>
        <strong>Как это работает в коде:</strong>
        <div className={styles.code}>
          <span className={styles.comment}>// Одна строка — полностью меняет поведение страницы.</span>
          {'\n'}
          <span className={styles.keyword}>export const</span>
          {' revalidate = '}
          <span className={styles.string}>30</span>
          {'; '}
          <span className={styles.comment}>// секунды</span>
          {'\n\n'}
          <span className={styles.comment}>// Сам компонент — обычный async Server Component,</span>
          {'\n'}
          <span className={styles.comment}>// Next.js сам разберётся с кэшированием.</span>
          {'\n'}
          <span className={styles.keyword}>export default async function</span>
          {' IsrPage() {\n'}
          {'  '}
          <span className={styles.keyword}>const</span>
          {' count = '}
          <span className={styles.keyword}>await</span>
          {' prisma.post.count();\n'}
          {'  return <div>...{count}...</div>;\n}'}
        </div>
        <strong>Модель «4 вопроса»:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.7' }}>
          <li><em>Где данные?</em> — PostgreSQL, читаются при каждой пересборке (раз в ≥30 сек)</li>
          <li><em>Как обновляется экран?</em> — не сразу, а с задержкой до <code>revalidate</code> секунд</li>
          <li><em>Где выполняется код?</em> — на сервере, фоново, по таймеру</li>
        </ul>
        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#555' }}>
          <strong>Важно:</strong> <code>revalidatePath('/')</code> в Server Action (как в нашей ленте)
          сбрасывает ISR-кэш немедленно — даже раньше, чем истечёт <code>revalidate</code>.
          Поэтому лента работает корректно: после добавления поста страница сразу пересобирается.
          Здесь, в лаборатории, такого action нет — поэтому задержка видна.
        </p>
      </div>

      <div className={styles.nav}>
        <Link href="/lab" className={styles.navLink}>Обзор</Link>
        <Link href="/lab/ssg" className={styles.navLink}>SSG</Link>
        <Link href="/lab/isr" className={`${styles.navLink} ${styles.navLinkActive}`}>ISR</Link>
        <Link href="/lab/ssr" className={styles.navLink}>SSR</Link>
        <Link href="/lab/csr" className={styles.navLink}>CSR</Link>
      </div>
    </div>
  );
}
