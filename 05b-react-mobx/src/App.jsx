/*
 * App.jsx — корневой компонент, обёрнутый в observer().
 *
 * [v05a Redux]: class App + connect(mapStateToProps, mapDispatchToProps)(App)
 *               — данные и колбэки приходят через props.
 * [v05b MobX]:  observer(App) + прямое чтение postStore.postsCount.
 *               Никаких props-колбэков вниз: дочерние компоненты сами вызывают
 *               методы store.
 */
import { observer } from 'mobx-react-lite';
import { postStore } from './store/PostStore';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import styles from './styles/App.module.css';

// observer() запоминает, какие observable были прочитаны во время рендера
// (здесь: postStore.postsCount и postStore.totalLikes), и перерисовывает App
// ТОЛЬКО при изменении этих значений.
// Сам App НЕ читает postStore.posts напрямую — поэтому лайк перерисует App
// лишь потому, что изменился totalLikes, а добавление текста в форму — вообще нет.
const App = observer(function App() {
  const { postsCount, totalLikes } = postStore; // computed-геттеры, кэшируются MobX

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>📝 Лента постов</h1>
      <p className={styles.subtitle}>React + MobX (Observable State)</p>

      <PostForm />

      {postsCount > 0 && (
        <p className={styles.stats}>
          Постов: {postsCount} · Лайков: {totalLikes}
        </p>
      )}

      <PostList />
    </div>
  );
});

export default App;
