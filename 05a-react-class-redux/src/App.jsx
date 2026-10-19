/*
 * ============================================================
 *  App.jsx — корневой КЛАССОВЫЙ компонент, подключённый к Redux
 * ============================================================
 *
 *  [v05 хуки]:  function App() { const { posts, addPost } = usePosts(); ... }
 *  [v05a]:      class App extends React.Component { render() { this.props... } }
 *               + connect(mapStateToProps, mapDispatchToProps)(App)
 *
 *  App сам НЕ знает про Redux: он просто получает posts и функции через this.props.
 *  Всё «знание» о store сосредоточено в двух функциях внизу файла и в connect().
 *  Поэтому App легко протестировать: передал props руками — и всё.
 */
import React from 'react';
import { connect } from 'react-redux';
import { addPost, likePost, deletePost } from './store/actions';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import styles from './styles/App.module.css';

class App extends React.Component {
  /*
   * Lifecycle-методы — аналоги useEffect из v05:
   *   componentDidMount   ≈ useEffect(() => {...}, [])
   *   componentDidUpdate  ≈ useEffect(() => {...}, [deps]) — но сравнивать deps надо ВРУЧНУЮ
   */
  componentDidMount() {
    this.updateTitle();
  }

  componentDidUpdate(prevProps) {
    // Без этой проверки title обновлялся бы при любом изменении props
    if (prevProps.posts.length !== this.props.posts.length) {
      this.updateTitle();
    }
  }

  updateTitle() {
    const count = this.props.posts.length;
    document.title = count > 0 ? `(${count}) Лента постов` : 'Лента постов — React + Redux';
  }

  // render() — единственный обязательный метод класса. Должен быть чистым, как функция-компонент.
  render() {
    // Эти props «вколол» connect(): posts — из mapStateToProps, функции — из mapDispatchToProps
    const { posts, addPost, likePost, deletePost } = this.props;
    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

    return (
      <div className={styles.app}>
        <h1 className={styles.title}>📝 Лента постов</h1>
        <p className={styles.subtitle}>React (классовые компоненты) + Redux</p>

        {/* addPost(title, body) уже обёрнут в dispatch — PostForm даже не знает, что есть Redux */}
        <PostForm onAddPost={addPost} />

        {posts.length > 0 && (
          <p className={styles.stats}>
            Постов: {posts.length} · Лайков всего: {totalLikes}
          </p>
        )}

        {/* Новые посты уже сверху: reducer кладёт их в начало массива */}
        <PostList posts={posts} onLike={likePost} onDelete={deletePost} />
      </div>
    );
  }
}

/*
 * mapStateToProps — «какую часть state нужна компоненту».
 * Вызывается при КАЖДОМ изменении store. Если результат поверхностно равен
 * предыдущему (posts === старый posts) — App НЕ перерисуется.
 * [v05 хуки / современный Redux]: const posts = useSelector(state => state.posts);
 */
const mapStateToProps = (state) => ({
  posts: state.posts,
});

/*
 * mapDispatchToProps в «объектной» форме: connect сам превратит каждый action creator
 * в функцию (...args) => dispatch(addPost(...args)).
 * Полная (функциональная) форма выглядела бы так:
 *   const mapDispatchToProps = (dispatch) => ({
 *     addPost: (title, body) => dispatch(addPost(title, body)),
 *     likePost: (id) => dispatch(likePost(id)),
 *     deletePost: (id) => dispatch(deletePost(id)),
 *   });
 * [современный Redux]: const dispatch = useDispatch(); dispatch(addPost(title, body));
 */
const mapDispatchToProps = { addPost, likePost, deletePost };

/*
 * connect — Higher-Order Component (HOC): функция, которая принимает компонент
 * и возвращает НОВЫЙ компонент-обёртку. Обёртка подписывается на store,
 * вызывает map-функции и передаёт результат в App как props.
 * connect(...) возвращает функцию → (App) → ConnectedApp. Отсюда двойные скобки.
 */
export default connect(mapStateToProps, mapDispatchToProps)(App);
