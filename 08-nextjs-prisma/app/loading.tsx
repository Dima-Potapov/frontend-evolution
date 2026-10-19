import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p>Загрузка постов...</p>
    </div>
  );
}
