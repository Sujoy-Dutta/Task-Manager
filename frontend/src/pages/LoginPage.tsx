import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { getApiError } from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) return;
    setError(null);
    try {
      await login({ email: form.email, password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      error={error ?? undefined}
      footer={<>Don&apos;t have an account? <Link to="/signup">Create one for free</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')}
            autoComplete="email" autoFocus />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="••••••••"
            value={form.password} onChange={set('password')}
            autoComplete="current-password" />
        </div>

        <button type="submit" className="btn-primary btn-full">
          <LogIn size={15} /> Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
