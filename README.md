# TaskFlow — Angular Drag & Drop Task Board

A Kanban-style task board built with Angular 17, demonstrating key framework features.

## Features

- **Drag & drop** — reorder tasks within columns and move them across columns using Angular CDK `DragDropModule`. Column reordering also supported.
- **Angular Signals** — board state is managed entirely with `signal()` and `computed()`, keeping the UI reactive without a separate state library.
- **Reactive Forms** — the add/edit modal uses `FormBuilder` with a custom `futureDateValidator` to prevent setting due dates in the past.
- **Custom Pipe** — `FilterTasksPipe` filters tasks by title, description and tags; debounced via RxJS in the board component.
- **Custom Directive** — `HighlightDropDirective` uses `@HostBinding` and `@HostListener` to highlight drop zones on drag enter/exit.
- **Angular Animations** — cards slide in on creation, modals scale-fade in/out, columns animate on add.
- **Dark mode** — `ThemeService` reads the OS preference on first load and persists the choice to `localStorage`.
- **Persistence** — the full board state is serialised to `localStorage` on every change, so it survives page refreshes.
- **OnPush change detection** — `TaskCardComponent` and `ColumnComponent` both use `ChangeDetectionStrategy.OnPush` for better performance.

## Tech stack

| Technology | Usage |
|---|---|
| Angular 17 | Standalone components, no NgModules |
| Angular CDK | `DragDropModule` |
| Angular Signals | Reactive state management |
| Angular Animations | UI transitions |
| RxJS | Debounced search input |
| SCSS | CSS custom-property theming |

## Running locally

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200).
