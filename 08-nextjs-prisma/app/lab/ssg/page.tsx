// ═══════════════════════════════════════════════════════════════════════════
// /lab/ssg — SSG (Static Site Generation)
// ═══════════════════════════════════════════════════════════════════════════
//
// Никакого `export const dynamic` и `export const revalidate` —
// Next.js по умолчанию попытается сгенерировать страницу СТАТИЧЕСКИ.
//
// Запрос к Prisma будет выполнен ОДИН РАЗ — во время `npm run build`.
// Результат сохраняется в HTML-файл. Каждый посетитель получает
// одну и ту же заранее сгенерированную страницу: быстро, дёшево, без БД.
//
// ⚠️ Следствие: пока не пересобрать проект, число постов и время
//    на карточке НЕ ИЗМЕНЯТСЯ, даже если добавить новые посты в ленту.

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../lab.module.css';

export const metadata = { title: 'SSG — Лаборатория рендеринга' };

export default async function SsgPage() {
  // Этот запрос выполняется ТОЛЬКО при npm run build — не при каждом запросе!
  // try/catch — чтобы `npm run build` не падал, если PostgreSQL не запущен.
  // Но учти: SSG «заморозит» именно этот результат (null) до следующей сборки!
  let count: number | null = null;
  try {
    count = await prisma.post.count();
  } catch {
    console.warn('[lab/ssg] БД недоступна во время сборки — страница сохранится без данных');
  }
  const generatedAt = new Date().toLocaleTimeString('ru-RU');

  return (
    <div className={styles.lab}>
      <div className={styles.header}>
        <Link href="/lab" className={styles.back}>← Назад к лаборатории</Link>
        <span className={`${styles.badge} ${styles.badgeSsg}`}>SSG</span>
        <h1 className={styles.title}>Static Site Generation</h1>
        <p className={styles.subtitle}>
          Страница собрана один раз при <code>npm run build</code> и больше не меняется.
        </p>
      </div>

      <div className={styles.devWarning}>
        <strong>⚠️ Нужен production-режим.</strong> В <code>npm run dev</code> Next.js
        не генерирует статику — страница рендерится как SSR при каждом запросе.
        Запусти <code>npm run build &amp;&amp; npm start</code>, чтобы увидеть «замороженное» время.
      </div>

      <div className={styles.snapshot}>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Время генерации</span>
          <span className={styles.snapshotTime}>{generatedAt}</span>
        </div>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Постов в БД на момент сборки</span>
          <span className={styles.snapshotValue}>{count ?? 'БД была недоступна при сборке'}</span>
        </div>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Стратегия</span>
          <span className={styles.snapshotValue}>SSG (static)</span>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
        👉 <strong>Добавь пост в ленте</strong>, вернись сюда и перезагрузи —
        число постов НЕ изменится. Время тоже останется прежним.
        Это и есть SSG: снимок, сделанный при сборке.
      </p>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '20px' }}>
        Чтобы обновить данные, нужно заново запустить <code>npm run build</code>.
        Именно поэтому SSG подходит для блогов и документации, но не для ленты постов.
      </p>

      <div className={`${styles.explanation} ${styles.explanationSsg}`}>
        <strong>Как это работает в коде:</strong>
        <div className={styles.code}>
          <span className={styles.comment}>// Просто async-компонент без каких-либо директив.</span>
          {'\n'}
          <span className={styles.comment}>// Next.js увидит, что у страницы нет динамических данных</span>
          {'\n'}
          <span className={styles.comment}>// (в смысле — нет cookies, headers, searchParams),</span>
          {'\n'}
          <span className={styles.comment}>// и сгенерирует её статически.</span>
          {'\n\n'}
          <span className={styles.keyword}>export default async function</span>
          {' SsgPage() {\n'}
          {'  '}
          <span className={styles.keyword}>const</span>
          {' count = '}
          <span className={styles.keyword}>await</span>
          {' prisma.post.count();\n'}
          {'  '}
          <span className={styles.keyword}>const</span>
          {' time = new Date().toLocaleTimeString('}
          <span className={styles.string}>&apos;ru-RU&apos;</span>
          {');\n'}
          {'  '}
          <span className={styles.comment}>// ↑ Эти строки выполняются при сборке, не при запросе.</span>
          {'\n  return <div>...{count}... {time}...</div>;\n}'}
        </div>
        <strong>Модель «4 вопроса»:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.7' }}>
          <li><em>Где данные?</em> — в PostgreSQL, но читаются один раз при сборке и замораживаются в HTML</li>
          <li><em>Как обновляется экран?</em> — не обновляется до следующей сборки</li>
          <li><em>Где выполняется код?</em> — на сервере, но <strong>во время сборки</strong>, не во время запроса</li>
        </ul>
      </div>

      <div className={styles.nav}>
        <Link href="/lab" className={styles.navLink}>Обзор</Link>
        <Link href="/lab/ssg" className={`${styles.navLink} ${styles.navLinkActive}`}>SSG</Link>
        <Link href="/lab/isr" className={styles.navLink}>ISR</Link>
        <Link href="/lab/ssr" className={styles.navLink}>SSR</Link>
        <Link href="/lab/csr" className={styles.navLink}>CSR</Link>
      </div>
    </div>
  );
}
