// Расширение типов Auth.js (module augmentation в TypeScript).
// По умолчанию session.user = { name?, email?, image? } — без id.
// Мы добавили id в callbacks.session (auth.ts) и сообщаем об этом TypeScript.
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
}
