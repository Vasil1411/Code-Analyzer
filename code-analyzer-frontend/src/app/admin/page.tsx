'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { User } from '@/app/types/user';

const initials = (email: string) => {
  const namePart = email.split('@')[0];
  return namePart.slice(0, 2).toUpperCase();
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getAllUsers()
      .then((res) => {
        setUsers(res.users || []);
      })
      .catch((err) => {
        setError(err.message || 'Грешка при зареждане на потребителите. Увери се, че си влязъл като Admin.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const adminCount = users.filter((u) => u.role?.toLowerCase() === 'admin').length;

  return (
    <section className="view view--default" id="admin" aria-labelledby="admin-title">
      <header className="view__header">
        <div>
          <p className="view__eyebrow">Administration</p>
          <h1 className="view__title" id="admin-title">Admin Panel</h1>
          <p className="view__subtitle">Manage everyone registered on the platform.</p>
        </div>
        <a className="btn btn--secondary" href="#auth">Invite user</a>
      </header>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      <div className="stats-row">
        <article className="kpi">
          <p className="kpi__label">Total users</p>
          <p className="kpi__value">{users.length}</p>
          <p className="kpi__delta">Real-time DB sync</p>
        </article>
        <article className="kpi">
          <p className="kpi__label">Admins</p>
          <p className="kpi__value">{adminCount}</p>
          <p className="kpi__delta">Active roles</p>
        </article>
        <article className="kpi">
          <p className="kpi__label">Scans this week</p>
          <p className="kpi__value">1,382</p>
          <p className="kpi__delta">+18%</p>
        </article>
      </div>

      <div className="table-card">
        <header className="table-card__header">
          <h2 className="table-card__title">Registered users</h2>
          <span className="data-table__mono">{users.length} total</span>
        </header>

        <div className="table-card__scroll">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#8b949e' }}>Зареждане на потребителите от базата данни...</p>
          ) : (
            <table className="data-table">
              <caption className="visually-hidden">All registered platform users</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="data-table__id">{u.id.slice(0, 8)}...</td>
                    <td>
                      <span className="data-table__user">
                        <span className="data-table__avatar">{initials(u.email)}</span>
                        {u.email}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${u.role?.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="data-table__mono">
                      <time dateTime={u.created_at}>{new Date(u.created_at).toLocaleDateString()}</time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <footer className="table-card__footer">
         
          <span>Secured via JWT Admin Token</span>
        </footer>
      </div>
    </section>
  );
}