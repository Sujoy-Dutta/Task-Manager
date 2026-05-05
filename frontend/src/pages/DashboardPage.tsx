import { useMemo, useState } from 'react';
import {
  CheckCircle,
  Circle,
  ClipboardList,
  Plus,
  Search,
  SortAsc,
  AlertTriangle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import { useTasks } from '../contexts/TaskContext';
import type { Task, TaskFormData } from '../types';

type FilterTab = 'all' | 'active' | 'completed';
type SortKey = 'createdAt' | 'dueDate' | 'priority' | 'title';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function DashboardPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const active = total - completed;
    const overdue = tasks.filter(
      (t) => t.status === 'active' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    return { total, completed, active, overdue };
  }, [tasks]);

  const filtered = useMemo(() => {
    let list = [...tasks];

    if (filter !== 'all') {
      list = list.filter((t) => t.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      switch (sortKey) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        case 'priority':
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }, [tasks, filter, search, sortKey]);

  function openCreate() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function handleSubmit(data: TaskFormData) {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setModalOpen(false);
    setEditingTask(null);
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this task?')) {
      deleteTask(id);
    }
  }

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main">
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            My Tasks
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {stats.total === 0
              ? 'No tasks yet — create your first one below.'
              : `${stats.active} active · ${stats.completed} completed`}
          </p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-card-label">Total</span>
            <span className="stat-card-value accent">{stats.total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Active</span>
            <span className="stat-card-value" style={{ color: 'var(--accent)' }}>
              {stats.active}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Completed</span>
            <span className="stat-card-value success">{stats.completed}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Overdue</span>
            <span className="stat-card-value danger">{stats.overdue}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            {/* Filter tabs */}
            <div className="filter-tabs">
              {(['all', 'active', 'completed'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`filter-tab ${filter === tab ? 'active' : ''}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab === 'all' && <ClipboardList size={13} />}
                  {tab === 'active' && <Circle size={13} />}
                  {tab === 'completed' && <CheckCircle size={13} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input
                type="search"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <SortAsc size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              className="sort-select"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="createdAt">Newest first</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>

        {/* Task grid / empty state */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            {tasks.length === 0 ? (
              <>
                <ClipboardList size={52} />
                <h3>No tasks yet</h3>
                <p>Click the + button to create your first task.</p>
              </>
            ) : (
              <>
                <AlertTriangle size={52} />
                <h3>No tasks match</h3>
                <p>Try adjusting your search or filter.</p>
              </>
            )}
          </div>
        ) : (
          <div className="task-grid">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggle={toggleComplete}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button className="fab" onClick={openCreate} title="New task">
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* Modal */}
      {modalOpen && (
        <TaskFormModal
          task={editingTask}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
