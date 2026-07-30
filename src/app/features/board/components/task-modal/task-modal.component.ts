import {
  Component, Input, Output, EventEmitter, OnInit, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl
} from '@angular/forms';
import {
  trigger, transition, style, animate
} from '@angular/animations';
import { Task, createTask, Priority } from '../../../../core/models/task.model';

// Custom validator: due date cannot be set in the past
function futureDateValidator(control: AbstractControl) {
  if (!control.value) return null; // optional field — null is fine
  const selected = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today ? { pastDate: true } : null;
}

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss'],
  animations: [
    trigger('modalEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(-12px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(-12px)' }))
      ])
    ]),
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TaskModalComponent implements OnInit {
  @Input() task: Task | null = null;       // null = create mode, Task = edit mode
  @Input() columnId!: string;
  @Output() save = new EventEmitter<Task>();
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  priorities: Priority[] = ['low', 'medium', 'high'];
  tagInput = '';

  get isEditMode(): boolean { return !!this.task; }
  get tagsArray(): string[] { return this.form.get('tags')?.value ?? []; }

  ngOnInit(): void {
    // Pre-fill form when editing, use empty defaults when creating
    this.form = this.fb.group({
      title: [this.task?.title ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      description: [this.task?.description ?? '', Validators.maxLength(300)],
      priority: [this.task?.priority ?? 'medium', Validators.required],
      dueDate: [this.task?.dueDate ?? '', futureDateValidator],
      tags: [this.task?.tags ?? []]
    });
  }

  addTag(): void {
    const tag = this.tagInput.trim().toLowerCase();
    if (!tag) return;
    const current: string[] = this.form.get('tags')!.value;
    if (!current.includes(tag) && current.length < 5) {
      this.form.patchValue({ tags: [...current, tag] });
    }
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    const current: string[] = this.form.get('tags')!.value;
    this.form.patchValue({ tags: current.filter(t => t !== tag) });
  }

  onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const saved: Task = this.task
      ? { ...this.task, ...formValue }               // edit — spread over existing
      : createTask(formValue);                        // create — generate new id/timestamp

    this.save.emit(saved);
  }

  onBackdropClick(event: MouseEvent): void {
    // Only close if the backdrop itself was clicked, not a child element
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
