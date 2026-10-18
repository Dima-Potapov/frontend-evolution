// ========================================
// ГЛАВНЫЙ СКРИПТ — main.js (ВЕРСИЯ JQUERY)
// ========================================
//
// Это ТО ЖЕ САМОЕ приложение, что в 01-vanilla-js.
// Функционал не изменился: добавить пост, лайкнуть, удалить.
//
// Цель этой версии — показать, ЧЕМ jQuery отличается от чистого JS.
// По ходу файла ты увидишь комментарии вида:
//   [Vanilla JS] так было раньше
//   [jQuery]     вот как теперь
//
// ЧТО ТАКОЕ JQUERY?
// Это библиотека, созданная в 2006 году Джоном Резигом.
// Она решала ОГРОМНУЮ проблему того времени: браузеры (IE, Firefox, Opera)
// работали по-разному, и одинаковый JS-код давал разные результаты.
// jQuery скрывал эти различия за единым удобным API.
//
// Сейчас (2024) браузеры хорошо стандартизированы, и jQuery
// потерял часть своей актуальности. Но он до сих пор используется
// на ~77% всех сайтов в мире (WordPress, старые проекты).
// Понимать jQuery важно для работы с легаси-кодом.
//
// ГЛАВНАЯ МАГИЯ JQUERY: символ $
// $ — это просто псевдоним (алиас) для функции jQuery().
// jQuery('#id') === $('#id') — одно и то же.
// Выглядит загадочно, но это просто короткое имя функции.


// ========================================
// 0. ОБЁРТКА $(document).ready()
// ========================================

/**
 * $(document).ready() — запускает наш код, когда страница полностью загружена.
 *
 * [Vanilla JS]:
 *   Мы подключали скрипт В КОНЦЕ <body>, поэтому не нужна обёртка —
 *   к тому моменту все HTML-элементы уже существуют.
 *
 * [jQuery]:
 *   Традиционный способ — $(document).ready(function() { ... }).
 *   Сокращение: $(function() { ... }) — то же самое, только короче.
 *
 *   Это гарантирует: код выполнится только после того,
 *   как браузер создаст всё DOM-дерево страницы.
 *   Позволяет спокойно размещать <script> в <head>,
 *   не беспокоясь об отсутствии элементов.
 *
 * Мы используем сокращение $(function() { ... }).
 * Всё приложение — внутри этой функции.
 *
 * СТРЕЛОЧНЫЕ ФУНКЦИИ С JQUERY:
 * jQuery передаёт контекст через this внутри обработчиков.
 * Стрелочные функции () => {} НЕ имеют своего this — они берут this из внешней области.
 * Для совместимости со старыми паттернами jQuery лучше использовать
 * ключевое слово function, когда нужен this. Мы покажем это ниже.
 */
$(function () {

  // ========================================
  // 1. ХРАНИЛИЩЕ ДАННЫХ (не изменилось)
  // ========================================

  /**
   * Данные хранятся точно так же — в массиве.
   * jQuery не трогает данные, только DOM.
   * Архитектура данных (посты, счётчик ID) идентична vanilla-версии.
   */
  let posts = [];
  let nextId = 1;


  // ========================================
  // 2. ВЫБОР ЭЛЕМЕНТОВ: $ vs document.querySelector
  // ========================================

  /**
   * [Vanilla JS]:
   *   const postForm = document.getElementById('post-form');
   *   const postsContainer = document.getElementById('posts-container');
   *
   * [jQuery]:
   *   const $postForm = $('#post-form');
   *   const $postsContainer = $('#posts-container');
   *
   * $() принимает CSS-селектор и возвращает jQuery-объект —
   * специальную обёртку над найденными DOM-элементами.
   *
   * '#post-form' — ID-селектор (как в CSS: #идентификатор)
   * '.post-card' — класс-селектор (как в CSS: .класс)
   * 'button' — тег-селектор
   * '#form input[type="text"]' — составные селекторы тоже работают!
   *
   * СОГЛАШЕНИЕ: переменные с $ в начале — это jQuery-объекты.
   * Обычная переменная: let el = document.getElementById('...')
   * jQuery-переменная: let $el = $('#...')
   * Это не обязательное правило, но распространённая конвенция.
   * Помогает сразу понять, что перед тобой — jQuery или DOM-элемент.
   *
   * Разница между jQuery-объектом и DOM-элементом:
   *   $postForm — jQuery-объект. Имеет методы: .val(), .on(), .text() и т.д.
   *   $postForm[0] — сырой DOM-элемент. Такой же, как из getElementById.
   *   $postForm.get(0) — то же самое, другой синтаксис.
   */
  const $postForm = $('#post-form');         // [Vanilla JS]: document.getElementById('post-form')
  const $titleInput = $('#post-title');      // [Vanilla JS]: document.getElementById('post-title')
  const $bodyInput = $('#post-body');        // [Vanilla JS]: document.getElementById('post-body')
  const $postsContainer = $('#posts-container'); // [Vanilla JS]: document.getElementById('posts-container')
  const $emptyMessage = $('#empty-message'); // [Vanilla JS]: document.getElementById('empty-message')


  // ========================================
  // 3. ФУНКЦИИ
  // ========================================

  /**
   * createPostHtml — создаёт HTML-строку карточки поста.
   *
   * [Vanilla JS]:
   *   Мы создавали DOM-элементы по одному через createElement,
   *   задавали className, dataset, textContent и собирали дерево через appendChild.
   *   Это называется "императивный" подход: описываем ШАГ ЗА ШАГОМ что делать.
   *
   * [jQuery]:
   *   Популярный паттерн — писать HTML как строку (шаблон),
   *   а потом вставлять её целиком. Это "декларативный" подход:
   *   описываем РЕЗУЛЬТАТ, а не шаги.
   *
   *   Плюс: более читабельно, видна структура HTML.
   *   Минус: нужно следить за безопасностью — XSS!
   *
   * @param {object} post — объект поста { id, title, body, likes }
   * @returns {string} — строка с HTML карточки
   */
  function createPostHtml(post) {
    /**
     * БЕЗОПАСНОСТЬ (XSS-защита):
     * Мы не можем вставить post.title и post.body напрямую в HTML-строку!
     *
     * Если пользователь ввёл: <script>document.cookie = document.cookie</script>
     * И мы вставим это в innerHTML — браузер ВЫПОЛНИТ скрипт. Это XSS-атака!
     *
     * Решение: экранировать опасные символы через вспомогательную функцию.
     * < → &lt;   > → &gt;   " → &quot;   & → &amp;
     * После этого браузер отобразит их КАК ТЕКСТ, а не выполнит как код.
     *
     * Альтернатива jQuery: $('<h2>').text(post.title) — тоже безопасно,
     * потому что .text() использует textContent под капотом.
     * Мы покажем оба подхода.
     */
    const safeTitle = escapeHtml(post.title);
    const safeBody = escapeHtml(post.body);

    /**
     * Шаблонная строка HTML.
     * data-id="${post.id}" — сохраняем ID в data-атрибуте (как в vanilla-версии).
     * Обрати внимание на структуру: это читабельно как HTML!
     * В vanilla-версии мы бы написали 20+ строк createElement/appendChild
     * для той же структуры.
     */
    return `
      <div class="post-card" data-id="${post.id}">
        <h2>${safeTitle}</h2>
        <p>${safeBody}</p>
        <div class="post-actions">
          <button class="btn btn-like ${post.likes > 0 ? 'liked' : ''}">
            ❤️ ${post.likes}
          </button>
          <button class="btn btn-delete">
            🗑️ Удалить
          </button>
        </div>
      </div>
    `;
  }

  /**
   * escapeHtml — экранирует опасные HTML-символы.
   *
   * Это стандартная утилита для защиты от XSS.
   * jQuery сам не предоставляет такую функцию,
   * поэтому пишем её вручную (или используем библиотеки).
   *
   * Хитрый трюк: создаём временный <div>, вставляем текст через .text()
   * (безопасно, через textContent), потом читаем .html() (innerHTML),
   * в котором символы уже экранированы браузером.
   *
   * @param {string} str — исходная строка
   * @returns {string} — безопасная строка с экранированными символами
   */
  function escapeHtml(str) {
    return $('<div>').text(str).html();
    /**
     * Разбор:
     * $('<div>') — создаёт jQuery-объект <div> (не на странице, просто в памяти)
     * .text(str) — задаёт текст через textContent (безопасно)
     * .html() — читает innerHTML: браузер уже экранировал спецсимволы
     *
     * Пример: escapeHtml('<script>alert(1)</script>')
     *   → '&lt;script&gt;alert(1)&lt;/script&gt;'
     */
  }

  /**
   * updateEmptyMessage — показывает или прячет сообщение "Нет постов".
   *
   * [Vanilla JS]:
   *   if (posts.length === 0) {
   *     emptyMessage.classList.remove('hidden');
   *   } else {
   *     emptyMessage.classList.add('hidden');
   *   }
   *
   * [jQuery]:
   *   .toggleClass(name, boolean) — добавляет класс если boolean=false, убирает если true.
   *   Короче, чем if/else с отдельными addClass/removeClass.
   */
  function updateEmptyMessage() {
    /**
     * .toggleClass(className, switch) — переключает класс:
     *   switch = true → добавить класс
     *   switch = false → убрать класс
     *
     * posts.length > 0 → есть посты → скрыть сообщение (hidden = true)
     * posts.length === 0 → нет постов → показать сообщение (hidden = false)
     *
     * [Vanilla JS]: classList.add('hidden') / classList.remove('hidden')
     */
    $emptyMessage.toggleClass('hidden', posts.length > 0);
  }


  // ========================================
  // 4. ОБРАБОТЧИКИ СОБЫТИЙ: .on() vs addEventListener
  // ========================================

  /**
   * ОБРАБОТКА ФОРМЫ: событие submit
   *
   * [Vanilla JS]:
   *   postForm.addEventListener('submit', function(event) { ... });
   *
   * [jQuery]:
   *   $postForm.on('submit', function(event) { ... });
   *
   * .on(eventName, handler) — универсальный метод подписки на событие в jQuery.
   * Аналог addEventListener.
   *
   * Также существуют сокращения:
   *   $el.click(fn) === $el.on('click', fn)
   *   $el.submit(fn) === $el.on('submit', fn)
   *   Но .on() предпочтительнее — он универсален и поддерживает делегирование.
   */
  $postForm.on('submit', function (event) {
    /**
     * event.preventDefault() — здесь без изменений.
     * Объект event в jQuery немного отличается от нативного,
     * но для base-методов (preventDefault, stopPropagation) всё работает одинаково.
     * jQuery нормализует объект события для кросс-браузерной совместимости.
     */
    event.preventDefault();

    /**
     * Получаем значения из полей.
     *
     * [Vanilla JS]: titleInput.value.trim()
     * [jQuery]: $titleInput.val().trim()
     *
     * .val() — jQuery-метод для чтения и записи значений форм:
     *   $input.val()        → читает значение (аналог .value)
     *   $input.val('текст') → записывает значение (аналог .value = 'текст')
     *
     * Он универсален: работает для input, textarea, select и других элементов форм.
     */
    const title = $titleInput.val().trim();
    const body = $bodyInput.val().trim();

    // Валидация — без изменений
    if (!title || !body) {
      return;
    }

    // Создаём объект поста — без изменений
    const newPost = {
      id: nextId++,
      title: title,
      body: body,
      likes: 0,
    };

    // Добавляем пост в массив — без изменений
    posts.push(newPost);

    /**
     * Добавляем карточку поста на страницу.
     *
     * [Vanilla JS]:
     *   const postElement = createPostElement(newPost); // DOM-элемент
     *   postsContainer.prepend(postElement);
     *
     * [jQuery]:
     *   const html = createPostHtml(newPost); // HTML-строка
     *   $postsContainer.prepend(html);
     *
     * .prepend(content) — добавляет контент В НАЧАЛО выбранного элемента.
     * jQuery сам преобразует HTML-строку в DOM-элементы.
     *
     * Другие методы вставки jQuery:
     *   .prepend()  — вставить В НАЧАЛО (внутрь элемента)
     *   .append()   — вставить В КОНЕЦ  (внутрь элемента)
     *   .before()   — вставить ДО элемента (снаружи)
     *   .after()    — вставить ПОСЛЕ элемента (снаружи)
     *
     * Эти методы удобнее запомнить, потому что названия говорят сами за себя.
     */
    const postHtml = createPostHtml(newPost);
    $postsContainer.prepend(postHtml);

    /**
     * Сбрасываем форму.
     *
     * [Vanilla JS]: postForm.reset()
     * [jQuery]: $postForm[0].reset()
     *
     * Почему $postForm[0]?
     * jQuery-объект — это "обёртка" над DOM-элементом.
     * Метод reset() — нативный метод DOM-элемента, не jQuery-метод.
     * $postForm[0] — извлекаем сырой DOM-элемент из jQuery-обёртки.
     * Можно также: $postForm.get(0).reset() — то же самое, другой синтаксис.
     *
     * Альтернатива: очистить поля вручную через jQuery:
     *   $titleInput.val('');
     *   $bodyInput.val('');
     */
    $postForm[0].reset();

    /**
     * Ставим фокус.
     *
     * [Vanilla JS]: titleInput.focus()
     * [jQuery]: $titleInput.focus()
     *
     * Вот тут jQuery не короче — но читается одинаково хорошо.
     * jQuery метод .focus() без аргументов — аналог нативного .focus().
     * С аргументом .focus(handler) — это событие (ловит фокус).
     */
    $titleInput.focus();

    updateEmptyMessage();
  });


  // ========================================
  // ДЕЛЕГИРОВАНИЕ СОБЫТИЙ (EVENT DELEGATION)
  // ========================================
  //
  // Это одна из самых важных концепций в jQuery (и вообще в JS).
  //
  // Проблема:
  // Карточки постов создаются ДИНАМИЧЕСКИ — их нет в HTML при загрузке страницы.
  // Если мы напишем $('.btn-like').on('click', ...) прямо сейчас —
  // jQuery найдёт 0 кнопок (их ещё нет!) и ничего не привяжет.
  // Будущие кнопки не получат обработчик.
  //
  // Решение в Vanilla JS (версия 01):
  // Мы добавляли addEventListener на КАЖДУЮ кнопку при создании элемента.
  // Это работает, но каждый пост создаёт 2 новых слушателя событий.
  // При 100 постах — 200 слушателей.
  //
  // Решение в jQuery — EVENT DELEGATION (делегирование событий):
  // Вместо привязки к дочерним элементам, привязываем к РОДИТЕЛЮ,
  // который уже существует (postsContainer).
  // Родитель "поймает" событие, всплывшее от дочернего элемента.
  //
  // КАК РАБОТАЕТ ВСПЛЫТИЕ СОБЫТИЙ (EVENT BUBBLING):
  // Когда ты кликаешь на кнопку, браузер генерирует событие.
  // Оно "всплывает" вверх по DOM-дереву:
  //   button → div.post-actions → div.post-card → div#posts-container → body → html → document
  // На каждом уровне можно поймать это событие.
  //
  // Делегирование использует всплытие:
  // Мы ставим ОДИН обработчик на postsContainer,
  // который ловит события от ВСЕХ дочерних кнопок (даже будущих!).
  //
  // Синтаксис jQuery:
  // $(родитель).on('событие', 'дочерний-селектор', обработчик)
  //
  // jQuery проверит: event.target совпадает с селектором?
  // Только тогда вызовет обработчик.

  /**
   * Обработка кнопки "Лайк" через делегирование.
   *
   * $postsContainer — родитель, который всегда существует.
   * 'click' — тип события.
   * '.btn-like' — фильтр: только клики по элементам с классом btn-like.
   *
   * [Vanilla JS]:
   *   Мы добавляли likeBtn.addEventListener('click', ...) при создании каждой кнопки.
   *   Итого N постов = N обработчиков.
   *
   * [jQuery делегирование]:
   *   ОДИН обработчик на postsContainer. Всегда. Для всех будущих постов тоже.
   *   Это эффективнее по памяти и производительности.
   */
  $postsContainer.on('click', '.btn-like', function () {
    /**
     * Внутри обработчика this — это DOM-элемент, по которому кликнули.
     * (Именно поэтому здесь function, а не стрелочная функция:
     *  стрелочная взяла бы this из внешней области, где this — это window или undefined).
     *
     * $(this) — оборачиваем в jQuery, чтобы использовать jQuery-методы.
     *
     * .closest('.post-card') — ищем ближайшего предка с классом post-card.
     * Поднимаемся вверх по DOM-дереву: button → div.post-actions → div.post-card ✓
     *
     * [Vanilla JS]: кнопка знала ID через замыкание (post.id в addEventListener).
     * [jQuery]: нам нужно "найти" ID через DOM.
     */
    const $card = $(this).closest('.post-card');

    /**
     * .data('id') — читает data-атрибут data-id элемента.
     *
     * [Vanilla JS]: cardElement.dataset.id (строка!)
     * [jQuery]: $card.data('id') — jQuery автоматически конвертирует типы!
     *
     * Если data-id="5", то:
     *   dataset.id === "5" (строка)
     *   .data('id') === 5 (число! jQuery сделал parseInt автоматически)
     *
     * Это удобно: не нужно писать parseInt(cardElement.dataset.id, 10).
     * Но нужно знать об этом различии во избежание путаницы.
     */
    const postId = $card.data('id');

    // Находим пост в массиве
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Увеличиваем лайки
    post.likes += 1;

    /**
     * Обновляем текст кнопки.
     *
     * [Vanilla JS]: likeBtn.textContent = `❤️ ${post.likes}`
     * [jQuery]: $(this).text(`❤️ ${post.likes}`)
     *
     * .text(value) — задаёт текстовое содержимое (аналог textContent).
     * .text() без аргументов — читает текст (аналог .textContent).
     *
     * Важно: .text() экранирует HTML, .html() — нет.
     * Для пользовательских данных используй .text().
     */
    $(this).text(`❤️ ${post.likes}`);

    /**
     * Добавляем класс для визуального изменения.
     *
     * [Vanilla JS]: likeBtn.classList.add('liked')
     * [jQuery]: $(this).addClass('liked')
     *
     * .addClass() — добавляет CSS-класс. Если уже есть — не дублирует.
     * .removeClass() — убирает класс.
     * .toggleClass() — переключает (есть → убрать, нет → добавить).
     * .hasClass() — проверяет наличие класса (возвращает boolean).
     */
    $(this).addClass('liked');
  });

  /**
   * Обработка кнопки "Удалить" — тоже через делегирование.
   *
   * Тот же паттерн: один родительский обработчик ловит все клики по .btn-delete.
   */
  $postsContainer.on('click', '.btn-delete', function () {
    const confirmed = confirm('Удалить этот пост?');
    if (!confirmed) return;

    // Находим карточку-родителя
    const $card = $(this).closest('.post-card');
    const postId = $card.data('id');

    // Убираем пост из массива (как в vanilla-версии)
    posts = posts.filter(p => p.id !== postId);

    /**
     * Удаляем карточку из DOM.
     *
     * [Vanilla JS]:
     *   const cardElement = postsContainer.querySelector(`[data-id="${postId}"]`);
     *   cardElement.remove();
     *
     * [jQuery]:
     *   $card.remove()
     *
     * Мы уже нашли $card выше через .closest(), поэтому просто удаляем её.
     * Не нужен отдельный querySelector!
     *
     * .remove() — полностью удаляет элемент из DOM вместе с дочерними.
     *
     * БОНУС JQUERY: есть ещё .detach() — удаляет из DOM, но сохраняет
     * привязанные обработчики. Полезно если планируешь вернуть элемент обратно.
     * .remove() — удаляет насовсем (обработчики тоже уходят).
     */
    $card.remove();

    updateEmptyMessage();
  });


  // ========================================
  // 5. ИНИЦИАЛИЗАЦИЯ
  // ========================================

  // При загрузке постов нет — показываем "пустую" заглушку
  updateEmptyMessage();

}); // Конец $(function() { ... })


// ========================================
// ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ JQUERY (справочник)
// ========================================
//
// Мы использовали основные, но jQuery предлагает намного больше.
// Вот что пригодится в реальных проектах:
//
// ПОИСК ЭЛЕМЕНТОВ:
//   $('selector')      — по CSS-селектору
//   $el.find('sel')    — найти внутри элемента
//   $el.closest('sel') — найти ближайшего предка
//   $el.parent()       — прямой родитель
//   $el.children()     — прямые дочерние
//   $el.siblings()     — соседние элементы
//
// ИЗМЕНЕНИЕ СОДЕРЖИМОГО:
//   .text()            — текстовое содержимое (безопасно)
//   .html()            — HTML-содержимое (осторожно с XSS!)
//   .val()             — значение поля формы
//   .attr('name')      — читает атрибут
//   .attr('name', v)   — задаёт атрибут
//   .data('key')       — читает data-атрибут (с конвертацией типов)
//
// СТИЛИ И КЛАССЫ:
//   .addClass()        — добавить класс
//   .removeClass()     — убрать класс
//   .toggleClass()     — переключить класс
//   .hasClass()        — проверить наличие класса
//   .css('prop', v)    — задать CSS-свойство напрямую
//   .hide()            — display: none
//   .show()            — отменить display: none
//   .toggle()          — переключить видимость
//
// ВСТАВКА В DOM:
//   .prepend()         — в начало (внутрь)
//   .append()          — в конец (внутрь)
//   .before()          — перед элементом (снаружи)
//   .after()           — после элемента (снаружи)
//   .remove()          — удалить
//   .empty()           — очистить содержимое
//
// СОБЫТИЯ:
//   .on(event, fn)           — добавить обработчик
//   .on(event, sel, fn)      — делегирование
//   .off(event)              — удалить обработчик
//   .trigger(event)          — программно вызвать событие
//
// AJAX (работа с сервером):
//   $.ajax({...})    — универсальный запрос
//   $.get(url, fn)   — GET-запрос
//   $.post(url, d, fn) — POST-запрос
//   $.getJSON(url, fn) — GET + парсинг JSON
//   (В React-эпоху это заменил fetch и axios)
//
// ЧТО ИЗМЕНИТСЯ В СЛЕДУЮЩЕЙ ВЕРСИИ (03-oop)?
// Мы перепишем то же приложение, используя ООП-подход:
// Классы (class), инкапсуляция данных и методов.
// Ни jQuery, ни vanilla-JS — а чистая архитектура.
// ========================================
