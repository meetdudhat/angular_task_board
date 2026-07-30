import { Injectable, signal, computed } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Board, Column, createColumn } from '../models/board.model';
import { Task, createTask } from '../models/task.model';

const STORAGE_KEY = 'taskflow_board';

// Seed data — gives the board a realistic look on first load
const DEFAULT_BOARD: Board = {
  columns: [
    {
      id: 'col-todo',
      title: 'To Do',
      tasks: [
        createTask({ id: 'task-1', title: 'Set up project structure', description: 'Initialise repo, configure linting and CI pipeline.', priority: 'high', tags: ['setup'], dueDate: '2024-08-10' }),
        createTask({ id: 'task-2', title: 'Design system tokens', description: 'Define colour palette, typography scale and spacing.', priority: 'medium', tags: ['design'], dueDate: '2024-08-15' }),
        createTask({ id: 'task-3', title: 'Write unit tests', description: 'Cover service methods and custom pipe with Jasmine specs.', priority: 'low', tags: ['testing'], dueDate: null })
      ]
    },
    {
      id: 'col-progress',
      title: 'In Progress',
      tasks: [
        createTask({ id: 'task-4', title: 'CDK drag-and-drop', description: 'Wire up cross-column and intra-column reordering with Angular CDK.', priority: 'high', tags: ['angular', 'cdk'], dueDate: '2024-08-12' }),
        createTask({ id: 'task-5', title: 'Reactive forms modal', description: 'Build add/edit card modal using FormBuilder and custom validators.', priority: 'medium', tags: ['forms'], dueDate: null })
      ]
    },
    {
      id: 'col-review',
      title: 'Review',
      tasks: [
        createTask({ id: 'task-6', title: 'Dark mode support', description: 'Implement theme toggling via ThemeService and CSS custom properties.', priority: 'low', tags: ['ui'], dueDate: null })
      ]
    },
    {
      id: 'col-done',
      title: 'Done',
      tasks: [
        createTask({ id: 'task-7', title: 'Initial repo setup', description: 'Angular 17, standalone components, SCSS configured.', priority: 'medium', tags: ['setup'], dueDate: null })
      ]
    }
  ]
};

@Injectable({ providedIn: 'root' })
export class BoardService {
  // Signal holding the entire board state — components react automatically
  private _board = signal<Board>(this.loadFromStorage());

  // Public read-only view of the board
  readonly board = this._board.asReadonly();

  // Derived signal: flat list of all column IDs (needed by CDK connectedTo)
  readonly columnIds = computed(() => this._board().columns.map(c => c.id));

  // ─── Persistence ────────────────────────────────────────────────────────────

  private loadFromStorage(): Board {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_BOARD;
    } catch {
      // Corrupted storage — fall back to defaults
      return DEFAULT_BOARD;
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._board()));
  }

  // ─── Column operations ───────────────────────────────────────────────────────

  addColumn(title: string): void {
    this._board.update(board => ({
      columns: [...board.columns, createColumn(title.trim())]
    }));
    this.save();
  }

  updateColumnTitle(columnId: string, newTitle: string): void {
    this._board.update(board => ({
      columns: board.columns.map(col =>
        col.id === columnId ? { ...col, title: newTitle.trim() } : col
      )
    }));
    this.save();
  }

  deleteColumn(columnId: string): void {
    this._board.update(board => ({
      columns: board.columns.filter(col => col.id !== columnId)
    }));
    this.save();
  }

  // Handles CDK drag events for column reordering
  moveColumn(event: CdkDragDrop<Column[]>): void {
    const cols = [...this._board().columns];
    moveItemInArray(cols, event.previousIndex, event.currentIndex);
    this._board.update(board => ({ ...board, columns: cols }));
    this.save();
  }

  // ─── Task operations ─────────────────────────────────────────────────────────

  addTask(columnId: string, task: Task): void {
    this._board.update(board => ({
      columns: board.columns.map(col =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      )
    }));
    this.save();
  }

  updateTask(columnId: string, updated: Task): void {
    this._board.update(board => ({
      columns: board.columns.map(col =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.map(t => t.id === updated.id ? updated : t) }
          : col
      )
    }));
    this.save();
  }

  deleteTask(columnId: string, taskId: string): void {
    this._board.update(board => ({
      columns: board.columns.map(col =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
          : col
      )
    }));
    this.save();
  }

  // Handles CDK drag events for card reordering within and across columns
  dropTask(event: CdkDragDrop<Task[]>): void {
    const cols = this._board().columns.map(col => ({
      ...col,
      tasks: [...col.tasks]
    }));

    const prevCol = cols.find(c => c.id === event.previousContainer.id);
    const currCol = cols.find(c => c.id === event.container.id);

    if (!prevCol || !currCol) return;

    if (event.previousContainer === event.container) {
      // Same column — just reorder
      moveItemInArray(currCol.tasks, event.previousIndex, event.currentIndex);
    } else {
      // Different column — transfer the card
      transferArrayItem(prevCol.tasks, currCol.tasks, event.previousIndex, event.currentIndex);
    }

    this._board.update(() => ({ columns: cols }));
    this.save();
  }

  resetBoard(): void {
    this._board.set(DEFAULT_BOARD);
    this.save();
  }
}
