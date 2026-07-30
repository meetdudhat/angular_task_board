import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task } from '../../../../core/models/task.model';
import { Column } from '../../../../core/models/board.model';
import { TaskCardComponent } from '../task-card/task-card.component';
import { FilterTasksPipe } from '../../../../core/pipes/filter-tasks.pipe';
import { HighlightDropDirective } from '../../../../shared/directives/highlight-drop.directive';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    TaskCardComponent,
    FilterTasksPipe,
    HighlightDropDirective
  ],
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnComponent {
  @Input({ required: true }) column!: Column;
  @Input() connectedTo: string[] = [];
  @Input() searchQuery = '';

  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() addTask = new EventEmitter<void>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<string>();
  @Output() deleteColumn = new EventEmitter<void>();
  @Output() titleChanged = new EventEmitter<string>();

  // Local state for inline title editing
  isEditingTitle = signal(false);
  editTitle = '';

  startTitleEdit(): void {
    this.editTitle = this.column.title;
    this.isEditingTitle.set(true);
  }

  commitTitleEdit(): void {
    if (this.editTitle.trim() && this.editTitle !== this.column.title) {
      this.titleChanged.emit(this.editTitle.trim());
    }
    this.isEditingTitle.set(false);
  }

  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.commitTitleEdit();
    if (event.key === 'Escape') this.isEditingTitle.set(false);
  }

  // trackBy keeps Angular from re-rendering unchanged cards on every drop
  trackById(_: number, task: Task): string {
    return task.id;
  }
}
