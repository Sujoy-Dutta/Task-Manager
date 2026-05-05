import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  error?: string;
  footer: ReactNode;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, error, footer, children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <img src="/favicon.svg" alt="TaskMind" width={20} height={20} />
          </div>
          <span className="auth-logo-text">TaskMind</span>
        </div>

        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {children}
        <p className="auth-footer">{footer}</p>
      </div>
    </div>
  );
}
