/*
 * PostList.jsx — «глупый» (presentational) классовый компонент.
 *
 * Своего state нет, всё приходит через this.props. Классический Redux-паттерн тех лет:
 *   • Container-компоненты (App + connect) знают про store;
 *   • Presentational-компоненты (PostList, PostCard) просто рисуют props.
 *
 * React.PureComponent вместо React.Component — классовый аналог React.memo из v05:
 * компонент не перерисуется, если props поверхностно не изменились
 * (тот же массив posts, те же функции onLike/onDelete — connect даёт стабильные ссылки).
 */
import React from 'react';
import PostCard from './PostCard';
import styles from '../styles/PostList.module.css';

class PostList extends React.PureComponent {
  render() {
    const { posts, onLike, onDelete } = this.props;

    if (posts.length === 0) {
      return (
        <div className={styles.empty}>
          <p>Постов пока нет</p>
          <p className={styles.hint}>Напиши первый!</p>
        </div>
      );
    }

    return (
      <ul className={styles.list}>
        {posts.map((post) => (
          // key — по id, а не по индексу: иначе при удалении state карточек
          // (confirmDelete) «переехал» бы на соседний пост
          <li key={post.id}>
            <PostCard post={post} onLike={onLike} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    );
  }
}

export default PostList;
