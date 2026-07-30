import {
  Component, inject, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDropList, CdkDrag, CdkDragDrop
} from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate } from '@angular/animations';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BoardService } from '../../../../core/services/board.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { Column } from '../../../../core/models/board.model';
import { Task } from '../../../../core/models/task.model';
import { ColumnComponent } from '../column/column.component';
import { TaskModalComponent } from '../task-modal/task-modal.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    ColumnComponent,
    TaskModalComponent
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-6px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class BoardComponent implements OnInit {
  private boardService = inject(BoardService);
  private themeService = inject(ThemeService);

  // ── Reactive board data ───────────────────────────────────────────────────
  readonly board = this.boardService.board;
  readonly columnIds = this.boardService.columnIds;
  readonly isDark = this.themeService.isDark;

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery = signal('');
  private searchInput$ = new Subject<string>();

  // ── Modal state ───────────────────────────────────────────────────────────
  showModal = signal(false);
  activeColumnId = signal<string | null>(null);
  editingTask = signal<Task | null>(null);

  // ── New column form ───────────────────────────────────────────────────────
  showAddColumn = signal(false);
  newColumnTitle = '';

  constructor() {
    // Debounce the search so filtering doesn't fire on every keystroke
    this.searchInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe(q => this.searchQuery.set(q));
  }

  ngOnInit(): void {}

  onSearchInput(event: Event): void {
    this.searchInput$.next((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchInput$.next('');
  }

  // ── Column actions ────────────────────────────────────────────────────────

  addColumn(): void {
    const title = this.newColumnTitle.trim();
    if (!title) return;
    this.boardService.addColumn(title);
    this.newColumnTitle = '';
    this.showAddColumn.set(false);
  }

  onColumnTitleChanged(columnId: string, newTitle: string): void {
    this.boardService.updateColumnTitle(columnId, newTitle);
  }

  deleteColumn(columnId: string): void {
    if (!confirm('Delete this column and all its tasks?')) return;
    this.boardService.deleteColumn(columnId);
  }

  onColumnDrop(event: CdkDragDrop<Column[]>): void {
    this.boardService.moveColumn(event);
  }

  // ── Task actions ──────────────────────────────────────────────────────────

  openAddModal(columnId: string): void {
    this.editingTask.set(null);
    this.activeColumnId.set(columnId);
    this.showModal.set(true);
  }

  openEditModal(task: Task, columnId: string): void {
    this.editingTask.set(task);
    this.activeColumnId.set(columnId);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTask.set(null);
    this.activeColumnId.set(null);
  }

  onTaskSaved(task: Task): void {
    const colId = this.activeColumnId();
    if (!colId) return;

    if (this.editingTask()) {
      this.boardService.updateTask(colId, task);
    } else {
      this.boardService.addTask(colId, task);
    }
    this.closeModal();
  }

  onTaskDeleted(columnId: string, taskId: string): void {
    this.boardService.deleteTask(columnId, taskId);
  }

  onTaskDropped(event: CdkDragDrop<Task[]>): void {
    this.boardService.dropTask(event);
  }

  resetBoard(): void {
    if (!confirm('Reset the board to the default demo data? This cannot be undone.')) return;
    this.boardService.resetBoard();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  // Used by trackBy in the template for CDK column drag
  trackByColumnId(_: number, col: Column): string {
    return col.id;
  }
}
