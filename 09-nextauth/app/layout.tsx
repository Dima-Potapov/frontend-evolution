import type { Metadata } from 'next';
import './globals.css';

// Metadata — статичные метаданные страницы (SEO), как в v07
export const metadata: Metadata = {
  title: 'Post Feed v9 — Next.js + Auth.js + Prisma',
  description: 'Демо эволюции фронтенда — версия 9: пользователи и вход через Google',
};

// layout.tsx — Server Component, оборачивает все страницы приложения.
// По сравнению с v08 ничего не изменилось: сессию читаем прямо в страницах через auth().
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
