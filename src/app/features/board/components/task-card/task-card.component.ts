import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger, transition, style, animate, state
} from '@angular/animations';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  // OnPush — only re-renders when the @Input reference changes, not on every parent cycle
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('cardSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-6px)' }))
      ])
    ])
  ]
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input() columnId!: string;

  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();

  get priorityClass(): string {
    return `priority-${this.task.priority}`;
  }

  get isOverdue(): boolean {
    if (!this.task.dueDate) return false;
    return new Date(this.task.dueDate) < new Date();
  }

  get formattedDueDate(): string {
    if (!this.task.dueDate) return '';
    const d = new Date(this.task.dueDate);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation(); // don't bubble to the edit click handler
    this.delete.emit(this.task.id);
  }
}
