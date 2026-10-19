/**
 * PostCard — карточка одного поста.
 *
 * Локальное UI-состояние confirmDelete — обычный signal внутри компонента
 * (как useState в React или this.state в классах v05a).
 *
 * DatePipe ( {{ value | date:'...' }} ) — «пайпы» Angular: функции-форматтеры
 * прямо в шаблоне. Встроенные: date, currency, uppercase, json, async и др.
 */
import { Component, computed, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  imports: [DatePipe],
  templateUrl: './post-card.html',
})
export class PostCard {
  readonly post = input.required<Post>();
  readonly like = output<number>();
  readonly remove = output<number>();

  protected readonly confirmDelete = signal(false);
  protected readonly isLiked = computed(() => this.post().likes > 0);

  protected confirm(): void {
    this.remove.emit(this.post().id);
  }
}
