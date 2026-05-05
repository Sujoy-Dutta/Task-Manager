import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { getApiError } from '../utils/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormFields = { name: string; email: string; password: string; confirm: string };

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm]     = useState<FormFields>({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<FormFields>>({});

  const set = (k: keyof FormFields) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  function validate(): boolean {
    const errs: Partial<FormFields> = {};
    if (!form.name.trim())              errs.name     = 'Name is required.';
    if (!EMAIL_RE.test(form.email))     errs.email    = 'Enter a valid email.';
    if (form.password.length < 6)       errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) errs.confirm  = 'Passwords do not match.';
    setFieldErrors(errs);
    return !Object.keys(errs).length;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    try {
      await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organising your work today"
      error={error ?? undefined}
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full name</label>
          <input id="name" type="text" placeholder="Jane Doe"
            value={form.name} onChange={set('name')}
            autoComplete="name" autoFocus />
          {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')}
            autoComplete="email" />
          {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={set('password')}
            autoComplete="new-password" />
          {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" placeholder="Repeat your password"
            value={form.confirm} onChange={set('confirm')}
            autoComplete="new-password" />
          {fieldErrors.confirm && <span className="form-error">{fieldErrors.confirm}</span>}
        </div>

        <button type="submit" className="btn-primary btn-full">
          <UserPlus size={15} /> Create account
        </button>
      </form>
    </AuthLayout>
  );
}
