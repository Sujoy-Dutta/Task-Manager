import { useEffect, useMemo, useReducer, useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Circle, ClipboardList, Loader2, Plus, Search, SortAsc } from 'lucide-react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import { useTasks } from '../contexts/TaskContext';
import { getApiError } from '../utils/api';
import type { Task, TaskFormData } from '../types';

type FilterTab = 'all' | 'active' | 'completed';
type SortKey   = 'createdAt' | 'dueDate' | 'priority' | 'title';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const PAGE_SIZE = 6;

const FILTER_TABS = [
  { key: 'all'       as FilterTab, label: 'All',       Icon: ClipboardList },
  { key: 'active'    as FilterTab, label: 'Active',    Icon: Circle        },
  { key: 'completed' as FilterTab, label: 'Completed', Icon: CheckCircle   },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'createdAt', label: 'Newest first' },
  { value: 'dueDate',   label: 'Due date'     },
  { value: 'priority',  label: 'Priority'     },
  { value: 'title',     label: 'Title A–Z'    },
];

type ViewState  = { filter: FilterTab; search: string; sort: SortKey };
type ViewAction =
  | { type: 'filter'; v: FilterTab }
  | { type: 'search'; v: string }
  | { type: 'sort';   v: SortKey };

function viewReducer(s: ViewState, a: ViewAction): ViewState {
  switch (a.type) {
    case 'filter': return { ...s, filter: a.v };
    case 'search': return { ...s, search: a.v };
    case 'sort':   return { ...s, sort: a.v };
  }
}

const INIT_VIEW: ViewState = { filter: 'all', search: '', sort: 'createdAt' };

export default function DashboardPage() {
  const { tasks, loading, error: fetchError, addTask, updateTask, deleteTask, toggleComplete, refetch } = useTasks();
  const [actionError, setActionError] = useState<string | null>(null);

  async function runAction(fn: () => Promise<void>) {
    setActionError(null);
    try { await fn(); } catch (err) { setActionError(getApiError(err)); }
  }

  const [view, dispatch]  = useReducer(viewReducer, INIT_VIEW);
  const [page, setPage]   = useState(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalOpen,   setModalOpen]   = useState(false);

  // Reset to page 1 whenever filter/search/sort changes
  useEffect(() => { setPage(1); }, [view]);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const overdue   = tasks.filter((t) => t.status === 'active' && t.dueDate && new Date(t.dueDate) < new Date()).length;
    return { total: tasks.length, active: tasks.length - completed, completed, overdue };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const q = view.search.trim().toLowerCase();
    return tasks
      .filter((t) =>
        (view.filter === 'all' || t.status === view.filter) &&
        (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (view.sort === 'dueDate') {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (view.sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (view.sort === 'title')    return a.title.localeCompare(b.title);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, view]);

  const totalPages  = Math.max(1, Math.ceil(visibleTasks.length / PAGE_SIZE));
  const pagedTasks  = visibleTasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openModal  = (task: Task | null = null) => { setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };

  async function handleSubmit(data: TaskFormData) {
    await runAction(async () => {
      editingTask ? await updateTask(editingTask._id, data) : await addTask(data);
      closeModal();
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this task?')) return;
    await runAction(() => deleteTask(id));
  }

  const subtitle = loading
    ? 'Loading…'
    : !tasks.length
      ? 'No tasks yet — create your first one below.'
      : `${stats.active} active · ${stats.completed} completed`;

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main">
        <div className="page-header">
          <h1>My Tasks</h1>
          <p>{subtitle}</p>
        </div>

        {fetchError   && <div className="error-banner"><span>{fetchError}</span><button className="btn-ghost error-banner-action" onClick={refetch}>Retry</button></div>}
        {actionError  && <div className="error-banner"><span>{actionError}</span><button className="btn-icon error-banner-action" onClick={() => setActionError(null)}>✕</button></div>}

        <div className="stats-row">
          {([
            ['Total',     stats.total,     'accent' ],
            ['Active',    stats.active,    'accent' ],
            ['Completed', stats.completed, 'success'],
            ['Overdue',   stats.overdue,   'danger' ],
          ] as const).map(([label, value, cls]) => (
            <div key={label} className="stat-card">
              <span className="stat-card-label">{label}</span>
              <span className={`stat-card-value ${cls}`}>{loading ? '—' : value}</span>
            </div>
          ))}
        </div>

        <div className="toolbar">
          <div className="toolbar-left">
            <div className="filter-tabs">
              {FILTER_TABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  className={`filter-tab ${view.filter === key ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'filter', v: key })}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input
                type="search"
                placeholder="Search tasks…"
                value={view.search}
                onChange={(e) => dispatch({ type: 'search', v: e.target.value })}
              />
            </div>
          </div>
          <div className="sort-row">
            <SortAsc size={14} className="sort-icon" />
            <select
              className="sort-select"
              value={view.sort}
              onChange={(e) => dispatch({ type: 'sort', v: e.target.value as SortKey })}
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <Loader2 size={40} className="spin" />
            <h3>Loading tasks…</h3>
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">
            {tasks.length === 0 ? (
              <><ClipboardList size={52} /><h3>No tasks yet</h3><p>Click + to create your first task.</p></>
            ) : (
              <><AlertTriangle size={52} /><h3>No tasks match</h3><p>Try adjusting your search or filter.</p></>
            )}
          </div>
        ) : (
          <>
            <div className="task-grid">
              {pagedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={openModal}
                  onDelete={handleDelete}
                  onToggle={(id) => runAction(() => toggleComplete(id))}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`page-btn ${n === page ? 'active' : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}

                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <button className="fab" onClick={() => openModal()} title="New task">
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {modalOpen && (
        <TaskFormModal task={editingTask} onClose={closeModal} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
