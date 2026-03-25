import { Task, User, Priority, Status } from '../types';
import { addDays, subDays, startOfDay, format } from 'date-fns';

export const USERS: User[] = [
  { id: 'u1', name: 'Alice Cooper', avatarColor: 'bg-red-500' },
  { id: 'u2', name: 'Bob Singer', avatarColor: 'bg-blue-500' },
  { id: 'u3', name: 'Charlie Day', avatarColor: 'bg-green-500' },
  { id: 'u4', name: 'Diana Prince', avatarColor: 'bg-yellow-500' },
  { id: 'u5', name: 'Ethan Hunt', avatarColor: 'bg-purple-500' },
  { id: 'u6', name: 'Fiona Gallagher', avatarColor: 'bg-pink-500' },
];

const PRIORITIES = Object.values(Priority);
const STATUSES = Object.values(Status);

const VERBS = ['Implement', 'Design', 'Refactor', 'Test', 'Review', 'Update', 'Fix', 'Deploy', 'Optimize', 'Document'];
const NOUNS = ['API', 'Database', 'Frontend', 'Backend', 'Auth', 'UI Components', 'Dashboard', 'Payment Gateway', 'Caching', 'Search'];
const SUFFIXES = ['v2', 'Module', 'System', 'Service', 'Integration', 'Flow', 'Pipeline'];

function randomSelection<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomTitle(): string {
  return `${randomSelection(VERBS)} ${randomSelection(NOUNS)} ${randomSelection(SUFFIXES)} ${Math.floor(Math.random() * 100)}`;
}

export function generateSeedData(count: number = 500): Task[] {
  const tasks: Task[] = [];
  const today = startOfDay(new Date());

  for (let i = 0; i < count; i++) {
    const isOverdue = Math.random() < 0.1; // 10% chance
    const isDueToday = Math.random() < 0.05; // 5% chance
    const hasNoStartDate = Math.random() < 0.1; // 10% chance
    
    let dueDate: Date;
    let startDate: Date | null = null;
    
    if (isOverdue) {
      dueDate = subDays(today, Math.floor(Math.random() * 15) + 1); // 1 to 15 days overdue
    } else if (isDueToday) {
      dueDate = today;
    } else {
      dueDate = addDays(today, Math.floor(Math.random() * 30) + 1); // 1 to 30 days in future
    }

    if (!hasNoStartDate) {
      // Start date is before due date, possibly in the past
      startDate = subDays(dueDate, Math.floor(Math.random() * 10) + 1);
    }

    tasks.push({
      id: `task-${i + 1}`,
      title: generateRandomTitle(),
      assignee: randomSelection(USERS),
      priority: randomSelection(PRIORITIES),
      status: randomSelection(STATUSES),
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
    });
  }

  return tasks;
}
