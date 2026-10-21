'use client';

import React, { useState, useEffect } from 'react';
import { adminService} from '@/services/adminService';
import { User } from '@/app/types/user';
import { Invitation } from '@/app/types/invitation';

const initials = (email: string) => {
  const namePart = email.split('@')[0];
  return namePart.slice(0, 2).toUpperCase();
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal for delete confirmation
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Modal for inviting user
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [usersRes, invitesRes] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllInvitations(),
      ]);
      setUsers(usersRes.users || []);
      setInvitations(invitesRes.invitations || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data. Make sure you are logged in as an Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(userToDelete.id);
    setError(null);
    try {
      await adminService.deleteUser(userToDelete.id);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Error deleting user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole.toLowerCase() === 'admin' ? 'developer' : 'admin';
    setActionLoading(userId);
    setError(null);
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err: any) {
      setError(err.message || 'Error updating user role.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccessMsg(null);

    try {
      const res = await adminService.sendInvitation(inviteEmail, inviteRole);
      setInviteSuccessMsg(res.message);
      setInviteEmail('');
      setInviteRole('developer');
      fetchData();
    } catch (err: any) {
      setInviteError(err.message || 'Error sending invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  const adminCount = users.filter((u) => u.role?.toLowerCase() === 'admin').length;
  const pendingInvitesCount = invitations.filter((i) => i.status === 'pending').length;

  return (
    <section className="view view--default" id="admin" aria-labelledby="admin-title">
      <header className="view__header">
        <div>
          <p className="view__eyebrow">Administration</p>
          <h1 className="view__title" id="admin-title">Admin Panel</h1>
          <p className="view__subtitle">Manage registered users and team invitations.</p>
        </div>
        <button className="btn btn--secondary" onClick={() => {
          setIsInviteOpen(true);
          setInviteSuccessMsg(null);
          setInviteError(null);
        }}>
          Invite user
        </button>
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
          <p className="kpi__label">Pending Invitations</p>
          <p className="kpi__value">{pendingInvitesCount}</p>
          <p className="kpi__delta">Awaiting signup</p>
        </article>
      </div>

      {/* REGISTERED USERS TABLE */}
      <div className="table-card" style={{ marginBottom: '2rem' }}>
        <header className="table-card__header">
          <h2 className="table-card__title">Registered users</h2>
          <span className="data-table__mono">{users.length} total</span>
        </header>

        <div className="table-card__scroll">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#8b949e' }}>Loading users...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Created</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
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
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn--small btn--secondary"
                          disabled={actionLoading === u.id}
                          onClick={() => handleToggleRole(u.id, u.role)}
                        >
                          {actionLoading === u.id ? '...' : `Make ${u.role?.toLowerCase() === 'admin' ? 'Developer' : 'Admin'}`}
                        </button>
                        <button
                          className="btn btn--small"
                          style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                          disabled={actionLoading === u.id}
                          onClick={() => setUserToDelete(u)}
                        >
                          {actionLoading === u.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SENT INVITATIONS TABLE */}
      <div className="table-card">
        <header className="table-card__header">
          <h2 className="table-card__title">Sent Invitations</h2>
          <span className="data-table__mono">{invitations.length} total</span>
        </header>

        <div className="table-card__scroll">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#8b949e' }}>Loading invitations...</p>
          ) : invitations.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#8b949e' }}>No invitations sent yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Invited Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Expires At</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.email}</td>
                    <td>
                      <span className={`badge badge--${inv.role?.toLowerCase()}`}>
                        {inv.role}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        background: inv.status === 'pending' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        color: inv.status === 'pending' ? '#eab308' : '#22c55e',
                        border: `1px solid ${inv.status === 'pending' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="data-table__mono">
                      {new Date(inv.expires_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* INVITE USER MODAL */}
      {isInviteOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '2rem',
            width: '440px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            color: '#c9d1d9'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Invite team member</h3>
            <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Send a secure tokenized invitation for platform access.
            </p>

            {inviteError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.85rem' }}>
                {inviteError}
              </div>
            )}

            {inviteSuccessMsg && (
              <div style={{ padding: '10px 12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '6px', marginBottom: '1rem', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                {inviteSuccessMsg}
              </div>
            )}

            <form onSubmit={handleInviteSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#8b949e' }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    color: '#c9d1d9',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#8b949e' }}>
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    color: '#c9d1d9',
                    outline: 'none'
                  }}
                >
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={inviteLoading}
                  style={{ background: '#238636', color: '#fff', border: 'none' }}
                >
                  {inviteLoading ? 'Sending...' : 'Send invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '2rem',
            width: '400px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            color: '#c9d1d9'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#f85149' }}>Confirm Deletion</h3>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete user <strong>{userToDelete.email}</strong> and all their associated projects?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn btn--secondary"
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{ background: '#f85149', color: '#fff', border: 'none' }}
                onClick={confirmDeleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}