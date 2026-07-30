// Represents a single task card on the board
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  dueDate: string | null; // ISO date string e.g. '2024-08-15'
  createdAt: string;      // ISO timestamp
}

// Factory — keeps creation logic in one place so components stay clean
export function createTask(partial: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    dueDate: null,
    createdAt: new Date().toISOString(),
    ...partial
  };
}
