/**
 * PostService — единый источник правды о постах.
 *
 * Это СЕРВИС + DEPENDENCY INJECTION (DI) — визитная карточка Angular.
 *
 *  @Injectable({ providedIn: 'root' }) говорит Angular:
 *  «создай ОДИН экземпляр этого класса на всё приложение и отдавай его
 *   каждому, кто попросит через inject(PostService)».
 *
 * Сравни, как разные версии решают задачу «как компоненту добраться до store»:
 *   [v03 OOP]     new PostStore() в App.js и передача в конструкторы вручную
 *   [v05a Redux]  <Provider store={store}> + connect()
 *   [v05b MobX]   import { postStore } — обычный модуль-синглтон
 *   [v06 Zustand] import { useUIStore } — хук-синглтон
 *   [Angular]     inject(PostService) — контейнер DI сам создаёт и раздаёт экземпляр
 *
 * Плюс DI: в тестах можно подменить сервис фейком одной строкой
 * (providers: [{ provide: PostService, useClass: FakePostService }]),
 * не трогая компоненты.
 *
 * Состояние хранится в СИГНАЛАХ (Angular 16+). Это та же идея, что в Solid:
 * signal() — значение + подписчики, computed() — кэшируемое вычисление.
 */
import { Injectable, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  // private + writable: менять посты можно ТОЛЬКО через методы сервиса.
  private readonly _posts = signal<Post[]>([]);

  // Наружу — только чтение (как геттер в MobX-store или state в Pinia).
  readonly posts = this._posts.asReadonly();
  readonly postsCount = computed(() => this._posts().length);
  readonly totalLikes = computed(() => this._posts().reduce((sum, p) => sum + p.likes, 0));

  // Мост в мир RxJS: тот же поток данных как Observable.
  // До Angular 16 ВСЁ состояние обычно жило в BehaviorSubject — см. README.
  readonly posts$ = toObservable(this._posts);

  addPost(title: string, body: string): void {
    const post: Post = { id: Date.now(), title, body, likes: 0, createdAt: new Date().toISOString() };
    // update() получает прошлое значение. Сигналы Angular сравнивают по ссылке,
    // поэтому — как в React/Redux — создаём НОВЫЙ массив, а не мутируем старый.
    this._posts.update((posts) => [post, ...posts]);
  }

  likePost(id: number): void {
    this._posts.update((posts) => posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  }

  deletePost(id: number): void {
    this._posts.update((posts) => posts.filter((p) => p.id !== id));
  }
}
