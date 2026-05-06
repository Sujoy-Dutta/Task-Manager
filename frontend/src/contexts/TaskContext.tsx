import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Task, TaskFormData } from '../types';
import api, { getApiError } from '../utils/api';
import { useAuth } from './AuthContext';
import { socket } from '../utils/socket';

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask:        (data: TaskFormData) => Promise<void>;
  updateTask:     (id: string, data: TaskFormData) => Promise<void>;
  deleteTask:     (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  refetch:        () => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ data: { tasks: Task[] } }>('/tasks');
      setTasks(data.data.tasks);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.on('task:created', (task: Task) => {
      setTasks((prev) => prev.some((t) => t._id === task._id) ? prev : [task, ...prev]);
    });
    socket.on('task:updated', (task: Task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    });
    socket.on('task:deleted', ({ _id }: { _id: string }) => {
      setTasks((prev) => prev.filter((t) => t._id !== _id));
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.disconnect();
    };
  }, [user]);

  const addTask = useCallback(async (form: TaskFormData) => {
    const { data } = await api.post<{ data: { task: Task } }>('/tasks', {
      ...form, dueDate: form.dueDate || null,
    });
    setTasks((prev) => [data.data.task, ...prev]);
  }, []);

  const updateTask = useCallback(async (id: string, form: TaskFormData) => {
    const { data } = await api.put<{ data: { task: Task } }>(`/tasks/${id}`, {
      ...form, dueDate: form.dueDate || null,
    });
    setTasks((prev) => prev.map((t) => (t._id === id ? data.data.task : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    const { data } = await api.patch<{ data: { task: Task } }>(`/tasks/${id}/toggle`);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.data.task : t)));
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, loading, error, addTask, updateTask, deleteTask, toggleComplete, refetch: fetchTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within <TaskProvider>');
  return ctx;
}
