// Route Handler — обычный HTTP-эндпоинт в App Router.
// [...nextauth] — «catch-all»: ловит ВСЕ пути /api/auth/* :
//   /api/auth/signin            — страница входа (встроенная в Auth.js)
//   /api/auth/callback/google   — сюда Google возвращает пользователя
//   /api/auth/signout, /api/auth/session, /api/auth/csrf, ...
// Вся логика — в auth.ts, здесь только «подключение к роутеру».
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
