// ═══════════════════════════════════════════════════════════════════════════
// /lab/ssr — SSR (Server-Side Rendering)
// ═══════════════════════════════════════════════════════════════════════════
//
// `force-dynamic` отключает кэширование: страница рендерится заново
// при КАЖДОМ запросе. Именно эту стратегию использует главная страница (/)
// нашей ленты, потому что данные меняются постоянно.
//
// Плюсы: всегда свежие данные, хорошее SEO.
// Минусы: нагрузка на сервер и БД при каждом запросе; пользователь
//         ждёт, пока сервер выполнит запрос (latency).

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../lab.module.css';

export const metadata = { title: 'SSR — Лаборатория рендеринга' };

// Ключевая директива: не кэшировать, рендерить при каждом запросе.
export const dynamic = 'force-dynamic';

export default async function SsrPage() {
  const count = await prisma.post.count();
  const generatedAt = new Date().toLocaleTimeString('ru-RU');

  return (
    <div className={styles.lab}>
      <div className={styles.header}>
        <Link href="/lab" className={styles.back}>← Назад к лаборатории</Link>
        <span className={`${styles.badge} ${styles.badgeSsr}`}>SSR</span>
        <h1 className={styles.title}>Server-Side Rendering</h1>
        <p className={styles.subtitle}>
          Страница пересобирается на сервере при каждом запросе — данные всегда свежие.
        </p>
      </div>

      <div className={styles.snapshot}>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Время рендеринга этого запроса</span>
          <span className={styles.snapshotTime}>{generatedAt}</span>
        </div>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Постов в БД прямо сейчас</span>
          <span className={styles.snapshotValue}>{count}</span>
        </div>
        <div className={styles.snapshotRow}>
          <span className={styles.snapshotLabel}>Стратегия</span>
          <span className={styles.snapshotValue}>SSR (force-dynamic)</span>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
        👉 <strong>Перезагрузи страницу</strong> — время изменится. Оно всегда совпадает
        с часами на браузере (с точностью до задержки сети).
        Добавь пост — сразу увидишь новое число здесь.
      </p>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '20px' }}>
        Сравни с <Link href="/lab/ssg" style={{ color: '#10b981' }}>SSG</Link> (время замерзает)
        {' '}и <Link href="/lab/isr" style={{ color: '#10b981' }}>ISR</Link> (обновляется с задержкой).
      </p>

      <div className={`${styles.explanation} ${styles.explanationSsr}`}>
        <strong>Как это работает в коде:</strong>
        <div className={styles.code}>
          <span className={styles.comment}>// Одна директива — и страница перестаёт кэшироваться.</span>
          {'\n'}
          <span className={styles.keyword}>export const</span>
          {' dynamic = '}
          <span className={styles.string}>&apos;force-dynamic&apos;</span>
          {';'}
          {'\n\n'}
          <span className={styles.comment}>// Та же директива стоит на главной странице ленты (/).</span>
          {'\n'}
          <span className={styles.comment}>// Без неё Next.js при `npm run build` попытался бы</span>
          {'\n'}
          <span className={styles.comment}>// сгенерировать её статически — и упал бы, если нет БД.</span>
          {'\n\n'}
          <span className={styles.keyword}>export default async function</span>
          {' SsrPage() {\n'}
          {'  '}
          <span className={styles.comment}>// Этот запрос выполняется при КАЖДОМ запросе пользователя:</span>
          {'\n  '}
          <span className={styles.keyword}>const</span>
          {' count = '}
          <span className={styles.keyword}>await</span>
          {' prisma.post.count();\n'}
          {'  return <div>...{count}...</div>;\n}'}
        </div>
        <strong>Модель «4 вопроса»:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.7' }}>
          <li><em>Где данные?</em> — PostgreSQL, читаются на каждый HTTP-запрос</li>
          <li><em>Как обновляется экран?</em> — полная замена HTML с сервера при каждом запросе</li>
          <li><em>Где выполняется код?</em> — на сервере, при каждом запросе пользователя</li>
        </ul>
      </div>

      <div className={styles.nav}>
        <Link href="/lab" className={styles.navLink}>Обзор</Link>
        <Link href="/lab/ssg" className={styles.navLink}>SSG</Link>
        <Link href="/lab/isr" className={styles.navLink}>ISR</Link>
        <Link href="/lab/ssr" className={`${styles.navLink} ${styles.navLinkActive}`}>SSR</Link>
        <Link href="/lab/csr" className={styles.navLink}>CSR</Link>
      </div>
    </div>
  );
}
