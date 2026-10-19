/**
 * PostForm — форма создания поста на REACTIVE FORMS + немного RxJS.
 *
 * 1) Reactive Forms — встроенный в Angular модуль форм.
 *    Модель формы описывается в КЛАССЕ (FormGroup/FormControl + Validators),
 *    а шаблон к ней лишь «привязывается» через [formGroup] / formControlName.
 *    В React/Vue/Solid мы писали валидацию руками — здесь она из коробки:
 *    Validators.required, Validators.minLength(3), статусы valid/invalid/touched.
 *
 * 2) RxJS — библиотека «потоков событий» (Observable). В Angular она повсюду:
 *    HttpClient, Router, формы. form.valueChanges — это поток значений формы.
 *    Ниже из него собран «автосохранение черновика» в 4 оператора:
 *      debounceTime(500)       — подождать, пока пользователь перестанет печатать
 *      map(...)                — нормализовать значение
 *      distinctUntilChanged()  — не сохранять, если ничего не поменялось
 *      tap(...)                — побочный эффект: запись в localStorage
 *    Сделать то же на useEffect + setTimeout в React — заметно больше кода.
 *
 * 3) toSignal() — мост обратно из RxJS в сигналы, чтобы показать результат в шаблоне.
 *    Подписка снимается автоматически при уничтожении компонента — утечек нет.
 */
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs';
import { PostService } from '../../services/post.service';

const DRAFT_KEY = 'angular-post-draft';
const MIN = 3;

@Component({
  selector: 'app-post-form',
  imports: [ReactiveFormsModule],
  templateUrl: './post-form.html',
})
export class PostForm {
  private readonly postService = inject(PostService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly MIN = MIN;
  // Ошибки показываем только после первой попытки отправки (как в других версиях).
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(MIN)]],
    body: ['', [Validators.required, Validators.minLength(MIN)]],
  });

  // Поток «черновик сохранён в HH:MM:SS» → сигнал для шаблона.
  protected readonly draftSavedAt = toSignal(
    this.form.valueChanges.pipe(
      debounceTime(500),
      map((v) => JSON.stringify({ title: v.title ?? '', body: v.body ?? '' })),
      distinctUntilChanged(),
      tap((json) => localStorage.setItem(DRAFT_KEY, json)),
      map(() => new Date().toLocaleTimeString('ru-RU')),
    ),
    { initialValue: null },
  );

  constructor() {
    // Восстанавливаем черновик после перезагрузки страницы.
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) this.form.setValue(JSON.parse(saved), { emitEvent: false });
  }

  /** Текст ошибки для поля или null. Логика валидации — в Validators, здесь только сообщения. */
  protected errorFor(field: 'title' | 'body'): string | null {
    const control = this.form.controls[field];
    if (!this.submitted() || control.valid) return null;
    const label = field === 'title' ? 'Заголовок' : 'Текст';
    if (control.hasError('required') || !control.value.trim()) {
      return field === 'title' ? 'Введите заголовок' : 'Введите текст поста';
    }
    return `${label} — минимум ${MIN} символа`;
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    const title = this.form.controls.title.value.trim();
    const body = this.form.controls.body.value.trim();
    // Validators.required пропускает строку из пробелов — дополнительно проверяем trim().
    if (this.form.invalid || title.length < MIN || body.length < MIN) return;

    this.postService.addPost(title, body);
    this.form.reset();
    this.submitted.set(false);
    localStorage.removeItem(DRAFT_KEY);
  }
}
