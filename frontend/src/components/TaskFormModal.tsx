import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskFormData, TaskPriority } from '../types';

interface Props {
  task?: Task | null;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}

const EMPTY: TaskFormData = { title: '', description: '', dueDate: '', priority: 'medium' };
const TODAY = new Date().toISOString().split('T')[0];

export default function TaskFormModal({ task, onClose, onSubmit }: Props) {
  const [form, setForm]   = useState<TaskFormData>(EMPTY);
  const [titleErr, setTitleErr] = useState('');

  useEffect(() => {
    setForm(task
      ? { title: task.title, description: task.description, dueDate: task.dueDate ?? '', priority: task.priority }
      : EMPTY
    );
    setTitleErr('');
  }, [task]);

  function setField<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'title') setTitleErr('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setTitleErr('Title is required.'); return; }
    onSubmit(form);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="t-title">Title *</label>
            <input id="t-title" type="text" placeholder="What needs to be done?"
              value={form.title} onChange={(e) => setField('title', e.target.value)}
              autoFocus maxLength={120} />
            {titleErr && <span className="form-error">{titleErr}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="t-desc">Description</label>
            <textarea id="t-desc" placeholder="Add more details (optional)…" rows={3}
              value={form.description} onChange={(e) => setField('description', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="t-due">Due Date</label>
              <input id="t-due" type="date" min={TODAY}
                value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="t-priority">Priority</label>
              <select id="t-priority" value={form.priority}
                onChange={(e) => setField('priority', e.target.value as TaskPriority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{task ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
