export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Status {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Done = 'Done',
}

export interface User {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: User;
  priority: Priority;
  status: Status;
  startDate: string | null; // ISO Date string
  dueDate: string; // ISO Date string
}

export interface CollabUser {
  id: string;
  name: string;
  avatarColor: string;
  currentTaskId: string | null;
}

export interface FilterState {
  status: Status[];
  priority: Priority[];
  assignee: string[]; // User IDs
  dateFrom: string | null;
  dateTo: string | null;
}
