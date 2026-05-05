import type { Task, User } from '../types';

const TASKS_KEY = 'taskflow_tasks';
const USERS_KEY = 'taskflow_users';
const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';



export function saveSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}



export function getUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}



export function getTasks(): Task[] {
  const raw = localStorage.getItem(TASKS_KEY);
  return raw ? (JSON.parse(raw) as Task[]) : [];
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getTasksByUser(userId: string): Task[] {
  return getTasks().filter((t) => t.userId === userId);
}
