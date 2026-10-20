'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCategory } from '@/app/types';

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProjects();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Security');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await createProject({
        name,
        category,
        description: description.trim() || undefined,
      });

      setName('');
      setCategory('Security');
      setDescription('');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Възникна грешка при създаването на проекта.');
      setSubmitting(false);
    }
  };

  return (
    <section className="view view--default" id="new-project">
      <header className="view__header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <p className="view__eyebrow" style={{ textAlign: 'center' }}>Workspace</p>
          <h1 className="view__title" style={{ fontSize: '32px', textAlign: 'center' }}>Connect New Project</h1>
          <p className="view__subtitle" style={{ textAlign: 'center' }}>Import a repository to start static analysis and security checks.</p>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div className="table-card" style={{ width: '100%', maxWidth: '640px', padding: 'var(--space-6)' }}>
          
          {error && (
            <div style={{ padding: '10px', marginBottom: '15px', background: 'rgba(255,0,0,0.1)', color: 'red', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%' }}>
            
            <div className="field" style={{ width: '100%' }}>
              <label className="field__label" htmlFor="repo-name">Repository Name / Slug</label>
              <input 
                className="field__input" 
                id="repo-name" 
                type="text" 
                placeholder="e.g. acme/payment-api" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                style={{ width: '100%' }} 
              />
            </div>

            <div className="field" style={{ width: '100%' }}>
              <label className="field__label" htmlFor="repo-category">Category / Ruleset</label>
              <select 
                className="field__input" 
                id="repo-category" 
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                style={{ width: '100%' }}
              >
                <option value="Security">Security</option>
                <option value="Clean Code">Clean Code</option>
                <option value="Performance">Performance</option>
                <option value="Architecture">Architecture</option>
              </select>
            </div>

            <div className="field" style={{ width: '100%' }}>
              <label className="field__label" htmlFor="repo-desc">Description</label>
              <textarea 
                className="field__1input" 
                id="repo-desc" 
                rows={4} 
                placeholder="Brief summary of the repository..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '8px', background: 'inherit', color: 'inherit', border: '1px solid var(--border-color, #ccc)' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', width: '100%' }}>
              <button 
                className="btn btn--primary" 
                type="submit" 
                disabled={submitting}
                style={{ flex: 1, padding: '12px', cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? 'Connecting...' : 'Connect Project'}
              </button>
              <Link className="btn btn--secondary" href="/dashboard" style={{ padding: '12px 24px', textAlign: 'center' }}>
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}