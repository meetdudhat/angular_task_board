import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../models/task.model';

/**
 * FilterTasksPipe
 * Usage: tasks | filterTasks : searchQuery
 * Filters by title, description and tags — case-insensitive.
 * Pure pipe so Angular only re-runs it when inputs actually change.
 */
@Pipe({
  name: 'filterTasks',
  standalone: true,
  pure: true
})
export class FilterTasksPipe implements PipeTransform {
  transform(tasks: Task[], query: string): Task[] {
    if (!query || query.trim() === '') return tasks;

    const lower = query.toLowerCase().trim();

    return tasks.filter(task =>
      task.title.toLowerCase().includes(lower) ||
      task.description.toLowerCase().includes(lower) ||
      task.tags.some(tag => tag.toLowerCase().includes(lower))
    );
  }
}
