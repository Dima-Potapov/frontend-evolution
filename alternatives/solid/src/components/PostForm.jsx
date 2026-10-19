/*
 * PostForm.jsx — форма создания поста.
 *
 * createSignal возвращает [геттер, сеттер]. ГЛАВНОЕ отличие от useState:
 * title — это ФУНКЦИЯ. Читаем как title(), а не title.
 * Именно вызов геттера внутри JSX/эффекта создаёт подписку.
 *
 * Ловушка для React-разработчика: деструктуризация props или чтение сигнала
 * вне JSX «замораживает» значение — реактивность теряется.
 */
import { createSignal, Show } from 'solid-js';
import { postStore } from '../store';

const MIN = 3;

export default function PostForm() {
  const [title, setTitle] = createSignal('');
  const [body, setBody] = createSignal('');
  const [errors, setErrors] = createSignal({});

  function validate() {
    const e = {};
    const t = title().trim();
    const b = body().trim();
    if (!t) e.title = 'Введите заголовок';
    else if (t.length < MIN) e.title = `Заголовок — минимум ${MIN} символа`;
    if (!b) e.body = 'Введите текст поста';
    else if (b.length < MIN) e.body = `Текст — минимум ${MIN} символа`;
    return e;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    postStore.addPost(title().trim(), body().trim());
    setTitle('');
    setBody('');
  }

  return (
    <form class="form" onSubmit={handleSubmit} noValidate>
      <h2 class="form-heading">Новый пост</h2>

      {/* classList — встроенный способ переключать классы по условию */}
      <input
        class="input"
        classList={{ invalid: !!errors().title }}
        type="text"
        placeholder="Заголовок"
        maxLength={100}
        value={title()}
        // onInput (а не onChange): в Solid события — нативные DOM-события.
        // React «переименовал» input-событие в onChange, Solid — нет.
        onInput={(e) => setTitle(e.currentTarget.value)}
      />
      <Show when={errors().title}>
        <p class="error" role="alert">{errors().title}</p>
      </Show>

      <textarea
        class="input"
        classList={{ invalid: !!errors().body }}
        placeholder="Текст поста..."
        rows={3}
        maxLength={500}
        value={body()}
        onInput={(e) => setBody(e.currentTarget.value)}
      />
      <Show when={errors().body}>
        <p class="error" role="alert">{errors().body}</p>
      </Show>

      <button type="submit" class="submit">Опубликовать</button>
    </form>
  );
}
