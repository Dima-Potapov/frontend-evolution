// AuthBar — Server Component: сам читает сессию на сервере.
// Ни строчки клиентского JS: «Выйти» — обычная <form> с Server Action.
import Link from 'next/link';
import { auth, signOut } from '@/auth';
import styles from './AuthBar.module.css';

export default async function AuthBar() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className={styles.bar}>
        <span className={styles.muted}>Вы гость</span>
        <Link href="/signin" className={styles.button}>Войти</Link>
      </div>
    );
  }

  const { name, image } = session.user;

  return (
    <div className={styles.bar}>
      <span className={styles.user}>
        {image ? (
          // Аватар приходит с googleusercontent.com — обычный <img>,
          // чтобы не настраивать домены для next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className={styles.avatar} />
        ) : (
          <span className={styles.avatarFallback}>{name?.[0]?.toUpperCase() ?? '?'}</span>
        )}
        <span className={styles.name}>{name}</span>
      </span>

      <form
        action={async () => {
          'use server';
          // signOut удаляет cookie сессии и перенаправляет на главную
          await signOut({ redirectTo: '/' });
        }}
      >
        <button type="submit" className={styles.button}>Выйти</button>
      </form>
    </div>
  );
}
