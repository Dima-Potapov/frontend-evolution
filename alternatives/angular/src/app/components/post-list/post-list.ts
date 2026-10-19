/**
 * PostList — «глупый» (presentational) компонент.
 *
 * Он НЕ знает про PostService: получает posts через input() и сообщает
 * о действиях через output(). Это осознанный контраст с PostForm,
 * которая берёт сервис через DI напрямую. В реальных проектах так делят
 * компоненты на «умные» (container) и «глупые» (presentational).
 *
 *   input<T>()  — входной параметр (как props в React / props во Vue).
 *                 Это СИГНАЛ: читаем как posts().  [Старый стиль: @Input() posts!: Post[]]
 *   output<T>() — событие наружу (как emit во Vue / колбэк-проп в React).
 *                 [Старый стиль: @Output() like = new EventEmitter<number>()]
 */
import { Component, input, output } from '@angular/core';
import { Post } from '../../models/post.model';
import { PostCard } from '../post-card/post-card';

@Component({
  selector: 'app-post-list',
  imports: [PostCard],
  template: `
    <!-- @for требует track — аналог key в React: по нему Angular понимает, какой элемент какой -->
    @for (post of posts(); track post.id) {
      <app-post-card [post]="post" (like)="like.emit($event)" (remove)="remove.emit($event)" />
    } @empty {
      <div class="empty">
        <p>Постов пока нет 🌱</p>
        <p class="hint">Напишите первый пост в форме выше</p>
      </div>
    }
  `,
  // host — атрибуты самого тега <app-post-list>
  host: { class: 'list' },
})
export class PostList {
  readonly posts = input.required<Post[]>();
  readonly like = output<number>();
  readonly remove = output<number>();
}
