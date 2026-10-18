/**
 * ============================================================
 *  PostView.js — ОТОБРАЖЕНИЕ ленты постов (слой представления)
 * ============================================================
 *
 * Этот класс отвечает ТОЛЬКО за DOM: нарисовать посты и сообщить
 * «пользователь кликнул лайк у поста №5». Что делать с этим кликом,
 * решает не он, а контроллер (App). Данные он не меняет.
 *
 * [v1]: функции createPostElement, renderPosts, updateEmptyMessage
 *       лежали в одном файле вперемешку с логикой данных.
 * [v2]: то же самое, только через jQuery.
 * [v3]: весь код, работающий с DOM ленты, собран в одном классе.
 *
 * Мы снова используем ЧИСТЫЙ JavaScript, без jQuery: современные
 * браузеры умеют querySelector, closest, classList, dataset.
 *
 * 💡 В Vue (04) и React (05) роль View возьмут на себя КОМПОНЕНТЫ.
 * Каждый компонент — это, по сути, такой же класс/функция «данные → разметка».
 */

export class PostView {
  // Приватные ссылки на DOM-элементы. Ищем их ОДИН раз в конструкторе.
  #container;
  #emptyMessage;

  /**
   * @param {HTMLElement} container — куда рисовать посты
   * @param {HTMLElement} emptyMessage — заглушка «постов нет»
   *
   * Элементы передаются СНАРУЖИ, а не ищутся внутри по id.
   * Так класс не привязан к конкретной странице: можно создать
   * две ленты на одной странице, передав разные контейнеры.
   * (Этот приём называется «внедрение зависимостей».)
   */
  constructor(container, emptyMessage) {
    this.#container = container;
    this.#emptyMessage = emptyMessage;
  }

  /**
   * render — перерисовать ВСЮ ленту по массиву постов.
   *
   * [v1]: при лайке мы точечно меняли текст одной кнопки.
   * [v3]: при любом изменении стираем всё и рисуем заново.
   *
   * Почему так? Это проще и НАДЁЖНЕЕ: экран всегда точно совпадает
   * с данными, рассинхронизация невозможна. Цена — лишняя работа
   * браузера (для 1000 постов было бы медленно).
   *
   * 💡 Именно эту проблему решают Vue и React: программист пишет
   * «рисую всё заново», а фреймворк сравнивает старый и новый результат
   * (Virtual DOM) и меняет в настоящем DOM только то, что отличается.
   * Получаем простоту полной перерисовки и скорость точечных правок.
   *
   * @param {Post[]} posts — массив объектов Post
   */
  render(posts) {
    // replaceChildren() без аргументов удаляет всех детей контейнера.
    // Современная и безопасная замена container.innerHTML = ''.
    this.#container.replaceChildren();

    // Для каждого поста создаём карточку и добавляем в контейнер.
    // this.#createCard — вызов приватного метода этого же класса.
    posts.forEach((post) => {
      this.#container.append(this.#createCard(post));
    });

    // classList.toggle(класс, условие): добавит класс, если условие true,
    // и уберёт, если false. Аналог jQuery-метода .toggleClass() из v2.
    // Постов больше нуля → прячем заглушку.
    this.#emptyMessage.classList.toggle('hidden', posts.length > 0);
  }

  /**
   * onLike / onDelete — «подписка» контроллера на действия пользователя.
   *
   * Используем ДЕЛЕГИРОВАНИЕ событий (как в v2 через $container.on(...)):
   * один обработчик на контейнере вместо обработчика на каждой кнопке.
   * Это особенно важно здесь, потому что render() пересоздаёт кнопки
   * при каждом изменении: обработчики на старых кнопках пропадали бы.
   *
   * @param {(id: number) => void} handler — функция контроллера,
   *        которая получит id поста.
   */
  onLike(handler) {
    this.#container.addEventListener('click', (event) => {
      // event.target — элемент, по которому реально кликнули
      // (может быть сама кнопка или, например, эмодзи внутри неё).
      // closest('.btn-like') — ищет вверх по дереву ближайшую кнопку лайка,
      // начиная с самого элемента. Если клик был не по лайку — вернёт null.
      const button = event.target.closest('.btn-like');
      if (!button) return;

      // #getPostId — достаём id поста из data-атрибута карточки.
      handler(this.#getPostId(button));
    });
  }

  onDelete(handler) {
    this.#container.addEventListener('click', (event) => {
      const button = event.target.closest('.btn-delete');
      if (!button) return;
      handler(this.#getPostId(button));
    });
  }

  /**
   * #getPostId — найти карточку поста и прочитать её data-id.
   *
   * dataset.id всегда возвращает СТРОКУ ("5"), а id в модели — число (5).
   * Number(...) приводит строку к числу, иначе сравнение 5 === "5" было бы false.
   * [v2]: jQuery-метод .data('id') делал это преобразование сам.
   */
  #getPostId(element) {
    const card = element.closest('.post-card');
    return Number(card.dataset.id);
  }

  /**
   * #createCard — создать DOM-элемент одной карточки.
   *
   * Создаём элементы через createElement + textContent (как в v1),
   * а не HTML-строкой (как в v2). textContent всегда вставляет ТЕКСТ,
   * поэтому XSS невозможен и функция escapeHtml не нужна.
   *
   * Чтобы не повторять три строки на каждый элемент,
   * используем маленький помощник #el (см. ниже).
   */
  #createCard(post) {
    const card = this.#el('div', 'post-card');
    // data-id на карточке: по нему делегированный обработчик узнает пост.
    card.dataset.id = post.id;

    // post.title — это ГЕТТЕР класса Post: выглядит как поле, работает как метод.
    const title = this.#el('h2', '', post.title);
    const body = this.#el('p', '', post.body);

    const actions = this.#el('div', 'post-actions');

    // Шаблонная строка `...${}` подставляет число лайков в текст.
    const likeBtn = this.#el('button', 'btn btn-like', `❤️ ${post.likes}`);
    // Есть хотя бы один лайк → подсвечиваем кнопку классом liked.
    likeBtn.classList.toggle('liked', post.likes > 0);

    const deleteBtn = this.#el('button', 'btn btn-delete', '🗑️ Удалить');

    // append умеет принимать несколько элементов сразу
    // (старый appendChild — только по одному).
    actions.append(likeBtn, deleteBtn);
    card.append(title, body, actions);

    return card;
  }

  /**
   * #el — маленький помощник «создай элемент».
   * @param {string} tag — имя тега ('div', 'h2'...)
   * @param {string} className — CSS-классы (может быть пустой строкой)
   * @param {string} text — текстовое содержимое (необязательно)
   *
   * text = '' — значение ПАРАМЕТРА ПО УМОЛЧАНИЮ: если третий аргумент
   * не передали, будет пустая строка, а не undefined.
   */
  #el(tag, className, text = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
}
