import styles from './loading.module.css';

// loading.tsx — специальный файл Next.js App Router
// Автоматически оборачивает page.tsx в <Suspense fallback={<Loading />}>
// Показывается пока page.tsx (async Server Component) ещё загружает данные.
//
// В v05/v06 мы сами управляли isLoading через TanStack Query.
// Здесь Next.js делает это автоматически через React Suspense.
export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p>Загрузка постов...</p>
    </div>
  );
}
