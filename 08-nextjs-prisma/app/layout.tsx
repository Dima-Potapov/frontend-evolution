import type { Metadata } from 'next';
import './globals.css';

// Metadata — статичные метаданные страницы (SEO), как в v07
export const metadata: Metadata = {
  title: 'Post Feed v8 — Next.js + Prisma + PostgreSQL',
  description: 'Демо эволюции фронтенда — версия 8: настоящая база данных',
};

// layout.tsx — Server Component, оборачивает все страницы приложения.
// По сравнению с v07 ничего не изменилось: меняется только слой данных.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
