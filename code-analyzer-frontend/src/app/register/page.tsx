'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/userService';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await userService.register({ email, password, role });
      // След успешна регистрация пращаме потребителя към лог ин
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Грешка при регистрация');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app__main" style={{ margin: '0 auto', maxWidth: '600px', padding: '4rem 1rem' }}>
      <header className="view__header" style={{ marginBottom: '2rem' }}>
        <div>
          <p className="view__eyebrow">Access</p>
          <h1 className="view__title">Registration</h1>
          <p className="view__subtitle">Create a new platform account.</p>
        </div>
      </header>
      <div className="auth">
        <article className="auth-card auth-card--accent" style={{ width: '100%' }}>
          <header className="auth-card__header">
            <h2 className="auth-card__title">Create account</h2>
            <p className="auth-card__subtitle">Start scanning in under a minute.</p>
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
                placeholder="At least 6 characters" 
                minLength={6} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </label>
            <label className="field">
              <span className="field__label">Role</span>
              <select 
                className="field__input" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="btn btn--secondary btn--block" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="auth-card__footer" style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </article>
      </div>
    </main>
  );
}