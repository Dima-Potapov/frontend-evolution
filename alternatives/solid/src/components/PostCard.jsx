/*
 * PostCard.jsx — карточка одного поста.
 *
 * Открой консоль и нажми «лайк» несколько раз: сообщение
 * «PostCard(...) выполнен» появится только при СОЗДАНИИ карточки.
 * При лайке функция не вызывается заново — меняется лишь текстовый узел с числом.
 *
 *   [v05 React]  лайк → перерендер PostCard (и всех родителей без memo)
 *   [v05b MobX]  лайк → перерендер только PostCard (observer)
 *   [Solid]      лайк → обновление одного текстового узла, PostCard не вызывается
 *
 * ВАЖНО: props.post.likes читаем ВНУТРИ JSX. Если написать
 *   const { post } = props; const likes = post.likes;
 * то likes «застынет» — классическая ошибка новичков в Solid.
 */
import { createSignal, Show } from 'solid-js';
import { postStore } from '../store';

export default function PostCard(props) {
  const [confirmDelete, setConfirmDelete] = createSignal(false);
  console.log(`[Solid] PostCard("${props.post.title}") выполнен — один раз на карточку`);

  const dateStr = () =>
    new Date(props.post.createdAt).toLocaleString('ru-RU', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  return (
    <article class="card" classList={{ confirming: confirmDelete() }}>
      <h2 class="card-title">{props.post.title}</h2>
      <p class="card-body">{props.post.body}</p>
      <time class="card-meta" dateTime={props.post.createdAt}>{dateStr()}</time>

      <div class="actions">
        <Show
          when={confirmDelete()}
          fallback={
            <>
              <button
                type="button"
                class="btn btn-like"
                classList={{ liked: props.post.likes > 0 }}
                onClick={() => postStore.likePost(props.post.id)}
              >
                ❤️ {props.post.likes}
              </button>
              <button type="button" class="btn btn-delete" onClick={() => setConfirmDelete(true)}>
                🗑️ Удалить
              </button>
            </>
          }
        >
          <span class="question">Удалить этот пост?</span>
          <button type="button" class="btn btn-danger" onClick={() => postStore.deletePost(props.post.id)}>
            Подтвердить
          </button>
          <button type="button" class="btn" onClick={() => setConfirmDelete(false)}>
            Отмена
          </button>
        </Show>
      </div>
    </article>
  );
}
