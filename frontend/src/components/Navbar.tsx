import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">
          <img className="brand-logo-img" src="/favicon.svg?v=2" alt="TaskMind" />
        </div>
        TaskMind
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">{initials}</div>
          <span>
            Welcome, <strong>{user?.name?.split(' ')[0]}</strong>
          </span>
        </div>
        <button className="btn-ghost" onClick={logout} title="Sign out">
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  );
}
