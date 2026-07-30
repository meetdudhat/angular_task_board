import { Task } from './task.model';

// A column holds an ordered list of tasks
export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

// The full board state — just an array of columns
export interface Board {
  columns: Column[];
}

export function createColumn(title: string): Column {
  return {
    id: crypto.randomUUID(),
    title,
    tasks: []
  };
}
