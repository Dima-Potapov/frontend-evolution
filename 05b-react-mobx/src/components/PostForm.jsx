/*
 * PostForm.jsx — форма создания поста.
 *
 * Правило MobX-проектов: в store — ДАННЫЕ приложения (посты),
 * в useState — временное UI-состояние (что сейчас набрано в полях, текст ошибки).
 * Набор каждой буквы не должен трогать глобальный store.
 *
 * [v05a Redux]: класс + this.state + this.props.addPost(...) (через connect)
 * [v05b MobX]:  функция + useState + postStore.addPost(...) — прямой вызов метода.
 */
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { postStore } from '../store/PostStore';
import styles from '../styles/PostForm.module.css';

// observer здесь формально не обязателен (форма не читает observable),
// но в MobX-проектах принято оборачивать ВСЕ компоненты, работающие со store:
// если завтра форма начнёт читать postStore.postsCount — она сразу станет реактивной.
const PostForm = observer(function PostForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();

    if (!t) return setError('Введите заголовок');
    if (!b) return setError('Введите текст поста');

    // Прямой вызов метода store. Никаких dispatch({ type: 'ADD_POST', payload }).
    postStore.addPost(t, b);

    setTitle('');
    setBody('');
    setError('');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>Новый пост</h2>

      <input
        className={`${styles.input} ${error && !title.trim() ? styles.invalid : ''}`}
        type="text"
        placeholder="Заголовок"
        maxLength={100}
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        className={`${styles.textarea} ${error && title.trim() && !body.trim() ? styles.invalid : ''}`}
        placeholder="Текст поста..."
        rows={3}
        maxLength={500}
        value={body}
        onChange={e => setBody(e.target.value)}
      />

      {error && <p className={styles.error} role="alert">{error}</p>}

      <button type="submit" className={styles.button}>Опубликовать</button>
    </form>
  );
});

export default PostForm;
