/*
 * ============================================================
 *  PostCard.jsx — карточка поста, классовый компонент
 * ============================================================
 *
 *  Локальный state = { confirmDelete: false } — режим «точно удалить?».
 *  Это чистое UI-состояние одной карточки, ему не место в Redux store.
 *
 *  [v05 хуки]: подтверждение через window.confirm() внутри функции.
 *  [v05a]:     подтверждение прямо в карточке: «Удалить» → «Подтвердить» / «Отмена».
 *              Хороший повод показать this.state и setState в деле.
 */
import React from 'react';
import styles from '../styles/PostCard.module.css';

class PostCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { confirmDelete: false };
  }

  /*
   * Альтернатива bind: стрелочные функции как СВОЙСТВА класса (class fields).
   * Стрелка берёт this из окружения — экземпляра класса, поэтому bind не нужен.
   * В PostForm мы показали bind в конструкторе — здесь второй распространённый способ.
   */
  handleLike = () => {
    this.props.onLike(this.props.post.id);
  };

  askDelete = () => {
    this.setState({ confirmDelete: true });
  };

  cancelDelete = () => {
    this.setState({ confirmDelete: false });
  };

  confirmDelete = () => {
    // После dispatch карточка исчезнет из списка и будет размонтирована (componentWillUnmount)
    this.props.onDelete(this.props.post.id);
  };

  render() {
    const { post } = this.props;
    const { confirmDelete } = this.state;

    const dateStr = new Date(post.createdAt).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <article className={`${styles.card} ${confirmDelete ? styles.confirming : ''}`}>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.body}>{post.body}</p>
        <time className={styles.date} dateTime={post.createdAt}>
          {dateStr}
        </time>

        <div className={styles.actions}>
          {/* Условный рендер — тот же тернарный оператор, что в функциональных компонентах */}
          {confirmDelete ? (
            <>
              <span className={styles.question}>Удалить этот пост?</span>
              <button type="button" className={styles.danger} onClick={this.confirmDelete}>
                Подтвердить
              </button>
              <button type="button" className={styles.secondary} onClick={this.cancelDelete}>
                Отмена
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`${styles.like} ${post.likes > 0 ? styles.liked : ''}`}
                onClick={this.handleLike}
              >
                ❤️ {post.likes}
              </button>
              <button type="button" className={styles.delete} onClick={this.askDelete}>
                🗑️ Удалить
              </button>
            </>
          )}
        </div>
      </article>
    );
  }
}

export default PostCard;
