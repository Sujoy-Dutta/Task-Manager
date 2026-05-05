import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Task, TaskFormData } from '../types';
import { generateId } from '../utils/auth';
import { getTasks, getTasksByUser, saveTasks } from '../utils/storage';
import { useAuth } from './AuthContext';

interface TaskContextValue {
  tasks: Task[];
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, data: Partial<TaskFormData & { status: Task['status'] }>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (user) {
      setTasks(getTasksByUser(user.id));
    } else {
      setTasks([]);
    }
  }, [user]);

  const persistUpdate = useCallback((updatedUserTasks: Task[]) => {
    if (!user) return;
    const allTasks = getTasks();
    const others = allTasks.filter((t) => t.userId !== user.id);
    saveTasks([...others, ...updatedUserTasks]);
    setTasks(updatedUserTasks);
  }, [user]);

  const addTask = useCallback((data: TaskFormData) => {
    if (!user) return;
    const now = new Date().toISOString();
    const newTask: Task = {
      id: generateId(),
      userId: user.id,
      title: data.title.trim(),
      description: data.description.trim(),
      dueDate: data.dueDate,
      priority: data.priority,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...tasks, newTask];
    persistUpdate(updated);
  }, [user, tasks, persistUpdate]);

  const updateTask = useCallback(
    (id: string, data: Partial<TaskFormData & { status: Task['status'] }>) => {
      const updated = tasks.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      );
      persistUpdate(updated);
    },
    [tasks, persistUpdate]
  );

  const deleteTask = useCallback(
    (id: string) => {
      persistUpdate(tasks.filter((t) => t.id !== id));
    },
    [tasks, persistUpdate]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      const updated = tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'completed' ? 'active' : ('completed' as Task['status']),
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      persistUpdate(updated);
    },
    [tasks, persistUpdate]
  );

  const value = useMemo<TaskContextValue>(
    () => ({ tasks, addTask, updateTask, deleteTask, toggleComplete }),
    [tasks, addTask, updateTask, deleteTask, toggleComplete]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within <TaskProvider>');
  return ctx;
}
