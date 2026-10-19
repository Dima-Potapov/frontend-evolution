/*
 * ============================================================
 *  PostForm.jsx — классовый компонент с ЛОКАЛЬНЫМ state
 * ============================================================
 *
 *  Правило эпохи Redux: в store — данные приложения (посты),
 *  в this.state — временное состояние интерфейса (что набрано в полях, ошибки).
 *  Набранный, но не отправленный текст никому, кроме формы, не интересен.
 *
 *  [v05 хуки]: const [title, setTitle] = useState(''); const [body, setBody] = useState('');
 *  [v05a]:     this.state = { title: '', body: '', errors: {} } — ОДИН объект на весь компонент.
 */
import React from 'react';
import styles from '../styles/PostForm.module.css';

const MIN_LENGTH = 3;

class PostForm extends React.Component {
  constructor(props) {
    // super(props) — обязательно ДО обращения к this (требование JS-классов)
    super(props);
    this.state = { title: '', body: '', errors: {} };

    /*
     * Знаменитый bind — главная «боль» классов.
     * Метод класса, переданный как onChange={this.handleChange}, теряет this:
     * React вызовет его как обычную функцию → this === undefined → TypeError.
     * Решения: bind в конструкторе (как здесь), стрелочная функция-свойство
     * класса (handleChange = (e) => {...}) или стрелка в JSX. Хуки убрали проблему целиком.
     */
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  validate() {
    const title = this.state.title.trim();
    const body = this.state.body.trim();
    const errors = {};

    if (!title) errors.title = 'Введите заголовок';
    else if (title.length < MIN_LENGTH) errors.title = `Заголовок — минимум ${MIN_LENGTH} символа`;

    if (!body) errors.body = 'Введите текст поста';
    else if (body.length < MIN_LENGTH) errors.body = `Текст — минимум ${MIN_LENGTH} символа`;

    return errors;
  }

  handleChange(event) {
    const { name, value } = event.target;
    /*
     * setState СЛИВАЕТ (merge) объект с текущим state — поверхностно.
     * Меняем только одно поле, title/body остаются как были.
     * [v05 хуки]: setter из useState ЗАМЕНЯЕТ значение целиком, никакого merge.
     *
     * Функциональная форма setState(prev => ...) нужна, когда новое значение
     * зависит от старого. Ошибку поля сбрасываем, как только пользователь начал печатать.
     */
    this.setState((prev) => ({
      [name]: value,
      errors: { ...prev.errors, [name]: undefined },
    }));
  }

  handleSubmit(event) {
    event.preventDefault();

    const errors = this.validate();
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    // Колбэк из App — внутри это dispatch(addPost(title, body))
    this.props.onAddPost(this.state.title.trim(), this.state.body.trim());

    // Сбрасываем форму. setState асинхронен (батчится) — нельзя читать this.state сразу после.
    this.setState({ title: '', body: '', errors: {} });
  }

  render() {
    const { title, body, errors } = this.state;

    return (
      <form className={styles.form} onSubmit={this.handleSubmit} noValidate>
        <h2 className={styles.heading}>Новый пост</h2>

        {/* Контролируемые поля: value из this.state, изменения — через handleChange */}
        <input
          className={`${styles.input} ${errors.title ? styles.invalid : ''}`}
          type="text"
          name="title"
          placeholder="Заголовок"
          maxLength={100}
          value={title}
          onChange={this.handleChange}
        />
        {errors.title && <p className={styles.error}>{errors.title}</p>}

        <textarea
          className={`${styles.textarea} ${errors.body ? styles.invalid : ''}`}
          name="body"
          placeholder="Текст поста..."
          rows={3}
          maxLength={500}
          value={body}
          onChange={this.handleChange}
        />
        {errors.body && <p className={styles.error}>{errors.body}</p>}

        <button type="submit" className={styles.button}>
          Опубликовать
        </button>
      </form>
    );
  }
}

export default PostForm;
