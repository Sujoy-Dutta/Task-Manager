import { Calendar, Check, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

function formatDueDate(dateStr: string): { label: string; cls: string } {
  if (!dateStr) return { label: 'No due date', cls: '' };
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);

  const label = due.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: due.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  if (diffDays < 0) return { label: `${label} (overdue)`, cls: 'overdue' };
  if (diffDays <= 2) return { label: `${label} (soon)`, cls: 'due-soon' };
  return { label, cls: '' };
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const { label: dueLabel, cls: dueCls } = formatDueDate(task.dueDate);

  return (
    <div className={`task-card priority-${task.priority} ${isCompleted ? 'completed' : ''}`}>
      <div className="task-card-header">
        <button
          className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
          onClick={() => onToggle(task.id)}
          title={isCompleted ? 'Mark as active' : 'Mark as completed'}
        >
          {isCompleted && <Check size={11} strokeWidth={3} />}
        </button>

        <div className="task-title-block">
          <p className="task-title">{task.title}</p>
        </div>

        <div className="task-card-actions">
          <button
            className="btn-icon"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            <Pencil size={14} />
          </button>
          <button
            className="btn-icon"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-meta">
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <span className={`badge badge-${task.status}`}>{task.status}</span>
        </div>
        {task.dueDate && (
          <div className={`task-due ${dueCls}`}>
            <Calendar size={12} />
            {dueLabel}
          </div>
        )}
      </div>
    </div>
  );
}
