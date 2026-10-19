// ═══════════════════════════════════════════════════════════════════════════
// GET /api/lab-stats — JSON-эндпоинт для страницы /lab/csr
// ═══════════════════════════════════════════════════════════════════════════
//
// Route Handler (App Router) — аналог Express-роута внутри Next.js:
// файл route.ts + экспорт функций с именами HTTP-методов (GET, POST, ...).
//
// Зачем он нужен: при CSR браузер сначала получает «пустую скорлупу»,
// а потом САМ запрашивает данные через fetch('/api/lab-stats').
// Server Component (как на /lab/ssr) мог бы прочитать БД напрямую,
// но клиентский код в браузере к Prisma доступа не имеет — нужен HTTP API.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Без этой строки Next.js 15 может закэшировать GET-обработчик
// как статический файл при `npm run build` (тот же SSG, только для JSON).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await prisma.post.count();
    return NextResponse.json({
      count,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[api/lab-stats] Ошибка БД:', error);
    return NextResponse.json(
      { error: 'База данных недоступна' },
      { status: 503 },
    );
  }
}
