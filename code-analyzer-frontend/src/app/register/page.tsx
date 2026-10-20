import React from 'react';

export default function RegisterPage() {
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
          <form className="auth-card__form" action="/dashboard">
            <label className="field"><span className="field__label">Email</span><input className="field__input" type="email" placeholder="you@company.dev" required /></label>
            <label className="field"><span className="field__label">Password</span><input className="field__input" type="password" placeholder="At least 8 characters" minLength={8} required /></label>
            <label className="field"><span className="field__label">Role</span>
              <select className="field__input" defaultValue="developer"><option value="developer">Developer</option><option value="admin">Admin</option></select>
            </label>
            <button className="btn btn--secondary btn--block" type="submit">Register</button>
          </form>
          <p className="auth-card__footer">By registering you agree to the <a href="/auth/register">Terms</a>.</p>
          <p className="auth-card__footer" style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account? <a href="/auth/login">Sign in</a>
          </p>
        </article>
      </div>
    </main>
  );
}