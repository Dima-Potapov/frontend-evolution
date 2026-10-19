/**
 * App — корневой компонент.
 *
 * Компонент в Angular = КЛАСС + ДЕКОРАТОР @Component с метаданными:
 *   selector    — имя тега (<app-root> в index.html)
 *   imports     — какие компоненты используются в шаблоне (standalone-компоненты, Angular 14+)
 *   templateUrl — HTML-шаблон в отдельном файле
 *
 * Похоже на v03 (OOP-классы) и v05a (классовые компоненты React),
 * но экземпляры класса создаёт и связывает сам фреймворк через DI.
 */
import { Component, effect, inject } from '@angular/core';
import { PostService } from './services/post.service';
import { PostForm } from './components/post-form/post-form';
import { PostList } from './components/post-list/post-list';

@Component({
  selector: 'app-root',
  imports: [PostForm, PostList],
  templateUrl: './app.html',
})
export class App {
  // inject() — получить зависимость из DI-контейнера.
  // (Старый стиль: constructor(private postService: PostService) {} — тоже работает.)
  protected readonly postService = inject(PostService);

  constructor() {
    // effect() перезапускается, когда меняется любой сигнал, прочитанный внутри.
    // Массив зависимостей не нужен — как createEffect в Solid.
    effect(() => {
      document.title = `(${this.postService.postsCount()}) Лента постов — Angular`;
    });
  }
}
