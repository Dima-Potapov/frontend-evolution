// ═══════════════════════════════════════════════════════════════════════════
// /lab/csr — CSR (Client-Side Rendering)
// ═══════════════════════════════════════════════════════════════════════════
//
// Сама страница — Server Component БЕЗ запросов к БД, поэтому Next.js
// соберёт её статически (как SSG): «скорлупа» с заголовками и пояснениями.
// Данные загружает Client Component <CsrStats /> — в браузере, через fetch.
//
// Плюсы: простой хостинг скорлупы (CDN), данные всегда свежие, кнопка «Обновить»
//        без перезагрузки страницы.
// Минусы: пользователь видит «Загружаю...», поисковик без JS не увидит данных,
//         лишний сетевой запрос после загрузки страницы.

import Link from 'next/link';
import CsrStats from './CsrStats';
import styles from '../lab.module.css';

export const metadata = { title: 'CSR — Лаборатория рендеринга' };

export default function CsrPage() {
  return (
    <div className={styles.lab}>
      <div className={styles.header}>
        <Link href="/lab" className={styles.back}>← Назад к лаборатории</Link>
        <span className={`${styles.badge} ${styles.badgeCsr}`}>CSR</span>
        <h1 className={styles.title}>Client-Side Rendering</h1>
        <p className={styles.subtitle}>
          Сервер отдаёт «скорлупу», а данные браузер запрашивает сам — через <code>fetch</code>.
        </p>
      </div>

      <CsrStats />

      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
        👉 <strong>Перезагрузи страницу</strong> — на мгновение мелькнёт «Загружаю...».
        Нажми «Обновить» — данные придут заново <em>без перезагрузки</em> страницы.
        Открой DevTools → Network: увидишь отдельный запрос <code>/api/lab-stats</code>.
      </p>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '20px' }}>
        Эксперимент: DevTools → ⋮ → Run command → «Disable JavaScript» и перезагрузи.
        Данных не будет вовсе — только «Загружаю...». Так страницу видит поисковик без JS.
        Сравни с <Link href="/lab/ssr" style={{ color: '#10b981' }}>SSR</Link>, где число уже в HTML.
      </p>

      <div className={`${styles.explanation} ${styles.explanationCsr}`}>
        <strong>Как это работает в коде:</strong>
        <div className={styles.code}>
          <span className={styles.string}>&apos;use client&apos;</span>
          {'; '}
          <span className={styles.comment}>// CsrStats.tsx — код уходит в браузер</span>
          {'\n\n'}
          <span className={styles.keyword}>const</span>
          {' [stats, setStats] = useState(null);\n\n'}
          {'useEffect(() => {\n'}
          {'  '}
          <span className={styles.comment}>// Выполняется только в браузере, после первой отрисовки</span>
          {'\n  fetch('}
          <span className={styles.string}>&apos;/api/lab-stats&apos;</span>
          {', { cache: '}
          <span className={styles.string}>&apos;no-store&apos;</span>
          {' })\n'}
          {'    .then(res => res.json())\n'}
          {'    .then(setStats);\n'}
          {'}, []);\n\n'}
          <span className={styles.comment}>// app/api/lab-stats/route.ts — HTTP API на сервере</span>
          {'\n'}
          <span className={styles.keyword}>export async function</span>
          {' GET() {\n  '}
          <span className={styles.keyword}>const</span>
          {' count = '}
          <span className={styles.keyword}>await</span>
          {' prisma.post.count();\n'}
          {'  return NextResponse.json({ count, generatedAt });\n}'}
        </div>
        <strong>Модель «4 вопроса»:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.7' }}>
          <li><em>Где данные?</em> — PostgreSQL → JSON API → состояние React в браузере (<code>useState</code>)</li>
          <li><em>Как обновляется экран?</em> — React перерисовывает компонент после ответа <code>fetch</code>, без перезагрузки</li>
          <li><em>Где выполняется код?</em> — скорлупа собрана на сервере при сборке, загрузка данных — в браузере</li>
        </ul>
      </div>

      <div className={styles.nav}>
        <Link href="/lab" className={styles.navLink}>Обзор</Link>
        <Link href="/lab/ssg" className={styles.navLink}>SSG</Link>
        <Link href="/lab/isr" className={styles.navLink}>ISR</Link>
        <Link href="/lab/ssr" className={styles.navLink}>SSR</Link>
        <Link href="/lab/csr" className={`${styles.navLink} ${styles.navLinkActive}`}>CSR</Link>
      </div>
    </div>
  );
}
