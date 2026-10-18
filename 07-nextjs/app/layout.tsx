import type { Metadata } from 'next';
import './globals.css';

// Metadata — статичные метаданные страницы (SEO)
// Next.js автоматически рендерит <title> и <meta> теги
// В v05/v06 мы делали это через useEffect + document.title = ...
export const metadata: Metadata = {
  title: 'Post Feed v7 — Next.js',
  description: 'Демо эволюции фронтенда — версия 7: Next.js App Router',
};

// layout.tsx — Server Component по умолчанию
// Оборачивает ВСЕ страницы приложения (как App.vue или App.tsx)
// НО: layout НЕ перерендеривается при навигации между страницами (в отличие от page.tsx)
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
