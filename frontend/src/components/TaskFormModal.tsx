import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskFormData, TaskPriority } from '../types';

interface TaskFormModalProps {
  task?: Task | null;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}

const EMPTY: TaskFormData = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
};

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function TaskFormModal({ task, onClose, onSubmit }: TaskFormModalProps) {
  const [form, setForm] = useState<TaskFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [task]);

  function set<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required.';
    if (form.title.trim().length > 120) newErrors.title = 'Title must be under 120 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              autoFocus
              maxLength={120}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              placeholder="Add more details (optional)…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                value={form.dueDate}
                min={todayStr()}
                onChange={(e) => set('dueDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) => set('priority', e.target.value as TaskPriority)}
                className="sort-select"
                style={{ width: '100%' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
