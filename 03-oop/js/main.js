/*
 * ============================================================
 *  main.js — ТОЧКА ВХОДА (entry point)
 * ============================================================
 *
 *  Этот файл подключён в index.html так:
 *    <script type="module" src="js/main.js"></script>
 *
 *  type="module" меняет многое «под капотом»:
 *   1. Можно использовать import / export.
 *   2. Код автоматически в строгом режиме ('use strict').
 *   3. Переменные верхнего уровня НЕ попадают в window —
 *      у каждого модуля своя область видимости.
 *      (В v1/v2 `let posts = []` на верхнем уровне обычного скрипта
 *       был доступен всем скриптам страницы — это источник конфликтов.)
 *   4. Модуль выполняется ОТЛОЖЕННО (как defer): когда HTML уже разобран.
 *      Поэтому здесь не нужен ни DOMContentLoaded, ни $(document).ready из v2.
 *   5. Модуль выполняется один раз, даже если его импортируют из 10 мест.
 *
 *  Задача main.js — только СОБРАТЬ приложение из деталей (композиция)
 *  и запустить его. Никакой бизнес-логики здесь нет.
 *  Аналог в будущих версиях: main.js во Vue (createApp(App).mount('#app'))
 *  и main.jsx / index.tsx в React (createRoot(...).render(<App />)).
 */

/*
 * import { Имя } from './путь.js'
 *  - фигурные скобки = «именованный импорт»: берём то, что экспортировано как export class Имя.
 *  - расширение .js в браузере ОБЯЗАТЕЛЬНО (сборщики вроде Vite позже разрешат его опускать).
 *  - путь относительный к ЭТОМУ файлу.
 *
 * Браузер, встретив import, сам скачает нужные файлы (во вкладке Network
 * DevTools вы увидите отдельный запрос на каждый модуль).
 * Обратите внимание: EventEmitter.js и Post.js здесь не импортируются —
 * их подтянет PostStore.js, который от них зависит. Получается граф зависимостей.
 */
import { PostStore } from './PostStore.js';
import { PostView } from './PostView.js';
import { PostFormView } from './PostFormView.js';
import { App } from './App.js';

// 1. Находим DOM-элементы — ЕДИНСТВЕННОЕ место, где мы знаем об id из HTML.
//    Если в разметке поменяется id, править придётся только тут.
const form = document.getElementById('post-form');
const postsContainer = document.getElementById('posts-container');
const emptyMessage = document.getElementById('empty-message');

// 2. Создаём детали. Каждая получает ровно то, что ей нужно, — не больше.
//    new ClassName(...) под капотом:
//      а) создаёт пустой объект, связанный с ClassName.prototype;
//      б) вызывает constructor с this = этот объект;
//      в) возвращает объект.
const store = new PostStore();
const postView = new PostView(postsContainer, emptyMessage);
const formView = new PostFormView(form);

// 3. Собираем приложение (внедряем зависимости) и запускаем.
const app = new App({ store, postView, formView });
app.start();

/*
 * Хотите поиграть в консоли? Модульные переменные в window не попадают,
 * поэтому `store` в консоли будет не определён. Для отладки можно
 * ВРЕМЕННО раскомментировать строку ниже и написать в консоли:
 *   store.add('Из консоли', 'Привет!')
 * — и увидеть, как экран обновится сам благодаря подписке на 'change'.
 */
// window.store = store;
