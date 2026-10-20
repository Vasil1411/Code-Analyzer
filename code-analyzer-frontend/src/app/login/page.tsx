'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await login(email, password);
    
    window.location.href = '/dashboard';
  } catch (err: any) {
    setError(err.message || 'Грешка при влизане в системата');
    setLoading(false);
  }
};

  return (
    <main className="app__main" style={{ margin: '0 auto', maxWidth: '600px', padding: '4rem 1rem' }}>
      <header className="view__header" style={{ marginBottom: '2rem' }}>
        <div>
          <p className="view__eyebrow">Access</p>
          <h1 className="view__title">Sign In</h1>
          <p className="view__subtitle">Log in to continue analyzing your projects.</p>
        </div>
      </header>
      <div className="auth">
        <article className="auth-card" style={{ width: '100%' }}>
          <header className="auth-card__header">
            <h2 className="auth-card__title">Welcome back</h2>
            <p className="auth-card__subtitle">Enter your credentials below.</p>
          </header>

          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <form className="auth-card__form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">Email</span>
              <input 
                className="field__input" 
                type="email" 
                placeholder="you@company.dev" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </label>
            <label className="field">
              <span className="field__label">Password</span>
              <input 
                className="field__input" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </label>
            <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="auth-card__footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            Don't have an account? <a href="/register">Register</a>
          </p>
        </article>
      </div>
    </main>
  );
}