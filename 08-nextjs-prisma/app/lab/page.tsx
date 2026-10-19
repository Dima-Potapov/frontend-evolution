// ═══════════════════════════════════════════════════════════════════════════
// /lab — Обзорная страница лаборатории рендеринга
// ═══════════════════════════════════════════════════════════════════════════
//
// Эта страница сама по себе — SSG (нет баз, нет динамических данных),
// поэтому никаких директив не нужно.

import Link from 'next/link';
import styles from './lab.module.css';

export const metadata = {
  title: 'Лаборатория рендеринга — v8',
};

const strategies = [
  {
    href: '/lab/ssg',
    badge: 'SSG',
    badgeClass: styles.badgeSsg,
    title: 'Static Site Generation',
    desc: 'Страница строится ОДИН РАЗ при npm run build. Время на карточке — время сборки, оно не меняется.',
  },
  {
    href: '/lab/isr',
    badge: 'ISR',
    badgeClass: styles.badgeIsr,
    title: 'Incremental Static Regeneration',
    desc: 'Страница тоже строится при сборке, но раз в 30 секунд пересобирается в фоне. Время обновляется само.',
  },
  {
    href: '/lab/ssr',
    badge: 'SSR',
    badgeClass: styles.badgeSsr,
    title: 'Server-Side Rendering',
    desc: 'Страница пересобирается на КАЖДЫЙ запрос. Время на карточке всегда совпадает с часами браузера.',
  },
  {
    href: '/lab/csr',
    badge: 'CSR',
    badgeClass: styles.badgeCsr,
    title: 'Client-Side Rendering',
    desc: 'Браузер получает пустую «скорлупу», потом сам запрашивает данные через fetch. Видно мигание "Загружаю...".',
  },
];

export default function LabPage() {
  return (
    <div className={styles.lab}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>← Назад к ленте постов</Link>
        <h1 className={styles.title}>🔬 Лаборатория рендеринга</h1>
        <p className={styles.subtitle}>
          Четыре страницы с одними и теми же данными — но каждая получает их по-своему.
          Главный инструмент: смотри на время в карточке и перезагружай страницу.
        </p>
      </div>

      <div className={styles.devWarning}>
        <strong>⚠️ Запускай только в production-режиме!</strong>
        <br />
        В <code>npm run dev</code> все страницы ведут себя как SSR — разницы не видно.
        Чтобы увидеть настоящее поведение:
        <br />
        <code>npm run build &amp;&amp; npm start</code>
      </div>

      <div className={styles.grid}>
        {strategies.map((s) => (
          <Link key={s.href} href={s.href} className={styles.card}>
            <span className={`${styles.badge} ${s.badgeClass}`}>{s.badge}</span>
            <div className={styles.cardTitle}>{s.title}</div>
            <div className={styles.cardDesc}>{s.desc}</div>
            <span className={styles.cardArrow}>Открыть →</span>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
        Ключевой вопрос: где и когда рендерится страница?
      </h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
        <thead>
          <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
            <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Стратегия</th>
            <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Где</th>
            <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Когда</th>
            <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Типичный сценарий</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>SSG</td>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>сервер</td>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>один раз при&nbsp;сборке</td>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>блог, лендинг, документация</td>
          </tr>
          <tr>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>ISR</td>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>сервер</td>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>при сборке + фон раз в N&nbsp;сек</td>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>каталог, статистика, новости</td>
          </tr>
          <tr>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>SSR</td>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>сервер</td>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>на каждый запрос</td>
            <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>лента, личный кабинет, поиск</td>
          </tr>
          <tr>
            <td style={{ padding: '9px 12px', fontWeight: 600 }}>CSR</td>
            <td style={{ padding: '9px 12px' }}>браузер</td>
            <td style={{ padding: '9px 12px' }}>после загрузки JS</td>
            <td style={{ padding: '9px 12px' }}>дашборды, интерактивные виджеты</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
