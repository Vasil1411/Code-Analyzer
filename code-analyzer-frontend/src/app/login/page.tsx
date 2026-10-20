import React from 'react';

export default function LoginPage() {
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
          <form className="auth-card__form" action="/dashboard">
            <label className="field"><span className="field__label">Email</span><input className="field__input" type="email" placeholder="you@company.dev" required /></label>
            <label className="field"><span className="field__label">Password</span><input className="field__input" type="password" placeholder="••••••••" required /></label>
            <label className="field"><span className="field__label">Role</span>
              <select className="field__input" defaultValue="developer"><option value="developer">Developer</option><option value="admin">Admin</option></select>
            </label>
            <div className="auth-card__row">
              <label className="auth-card__check"><input type="checkbox" />Remember me</label>
              <a href="/auth/login">Forgot password?</a>
            </div>
            <button className="btn btn--primary btn--block" type="submit">Log in</button>
          </form>
          <p className="auth-card__footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            Don't have an account? <a href="/auth/register">Register</a>
          </p>
        </article>
      </div>
    </main>
  );
}