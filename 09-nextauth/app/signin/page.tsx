// Своя страница входа (вместо встроенной страницы Auth.js — так её можно оформить по-своему).
// Server Component: кнопки — это обычные <form> с Server Actions, клиентского JS нет.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { auth, signIn, demoLoginEnabled } from '@/auth';
import styles from './signin.module.css';

export const dynamic = 'force-dynamic';

// Какие провайдеры включены — решает auth.ts по переменным окружения
const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export default async function SignInPage({
  searchParams,
}: {
  // В Next.js 15 searchParams — это Promise
  searchParams: Promise<{ error?: string }>;
}) {
  // Уже вошёл? Тогда тут делать нечего — на главную.
  if (await auth()) redirect('/');

  const { error } = await searchParams;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Вход</h1>
        <p className={styles.hint}>Войдите, чтобы писать посты и ставить лайки</p>

        {error && (
          <p className={styles.error} role="alert">
            Не удалось войти. Имя — минимум 2 символа.
          </p>
        )}

        {googleEnabled && (
          <form
            action={async () => {
              'use server';
              // Запускает OAuth-танец: редирект на Google → обратно на /api/auth/callback/google
              await signIn('google', { redirectTo: '/' });
            }}
          >
            <button type="submit" className={styles.google}>Войти через Google</button>
          </form>
        )}

        {googleEnabled && demoLoginEnabled && <div className={styles.divider}>или</div>}

        {demoLoginEnabled && (
          <form
            className={styles.demo}
            action={async (formData: FormData) => {
              'use server';
              try {
                // Вызывает authorize() из auth.ts с полем name
                await signIn('demo', { name: formData.get('name'), redirectTo: '/' });
              } catch (e) {
                // Неудачный вход → AuthError. Показываем ошибку на этой же странице.
                if (e instanceof AuthError) redirect('/signin?error=demo');
                // ВАЖНО: успешный signIn «бросает» специальную ошибку-редирект.
                // Её нужно пробросить дальше, иначе редирект на главную не случится.
                throw e;
              }
            }}
          >
            <input
              name="name"
              type="text"
              placeholder="Ваше имя (демо-вход без пароля)"
              className={styles.input}
              required
              minLength={2}
              maxLength={40}
            />
            <button type="submit" className={styles.button}>Войти по имени</button>
            <p className={styles.warning}>
              ⚠️ Учебный режим: пароля нет, войти может кто угодно под любым именем.
            </p>
          </form>
        )}

        {!googleEnabled && !demoLoginEnabled && (
          <p className={styles.error}>
            Ни один способ входа не настроен. Заполните AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
            или включите AUTH_DEMO_LOGIN=true в .env
          </p>
        )}

        <Link href="/" className={styles.back}>← Назад к ленте</Link>
      </div>
    </div>
  );
}
