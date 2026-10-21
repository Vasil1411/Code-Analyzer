'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { userService } from '@/services/userService';

// 1. Изнасяме цялата логика в отделен вътрешен компонент
function RegisterContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setError('Access denied: Registration requires a valid invitation link.');
      setLoading(false);
      return;
    }

    userService.verifyInviteToken(token)
      .then((res) => {
        setEmail(res.email);
        setRole(res.role);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Invalid or expired invitation token.');
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setRegistering(true);

    try {
      await userService.registerByInvite({ token, password });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <main className="app__main" style={{ textAlign: 'center', padding: '6rem 1rem', color: '#8b949e' }}>
        Verifying invitation token...
      </main>
    );
  }

  if (error && !email) {
    return (
      <main className="app__main" style={{ margin: '0 auto', maxWidth: '500px', padding: '4rem 1rem' }}>
        <div style={{ padding: '2rem', background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', textAlign: 'center', color: '#f85149' }}>
          <h2>Invitation Required</h2>
          <p style={{ marginTop: '1rem', color: '#8b949e' }}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app__main" style={{ margin: '0 auto', maxWidth: '600px', padding: '4rem 1rem' }}>
      <header className="view__header" style={{ marginBottom: '2rem' }}>
        <div>
          <p className="view__eyebrow">Enterprise Access</p>
          <h1 className="view__title">Complete Registration</h1>
          <p className="view__subtitle">
            You are invited to join as <strong style={{ textTransform: 'uppercase', color: '#58a6ff' }}>{role}</strong>.
          </p>
        </div>
      </header>
      <div className="auth">
        <article className="auth-card auth-card--accent" style={{ width: '100%' }}>
          <header className="auth-card__header">
            <h2 className="auth-card__title">Set your password</h2>
            <p className="auth-card__subtitle">Secure your workspace account.</p>
          </header>

          {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

          <form className="auth-card__form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">Email (Locked by invitation)</span>
              <input 
                className="field__input" 
                type="email" 
                value={email}
                disabled
                style={{ background: '#0d1117', color: '#8b949e', cursor: 'not-allowed' }}
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

            <button className="btn btn--secondary btn--block" type="submit" disabled={registering}>
              {registering ? 'Creating account...' : 'Create Account'}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: '#8b949e' }}>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}