'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCategory } from '@/app/types';

function EditProjectContent() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { projects, updateProject, loading: projectsLoading } = useProjects();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Security');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Попълваме данните от съществуващия списък с проекти, без да правим ненужни заявки
  useEffect(() => {
    if (projects.length > 0) {
      const currentProject = projects.find((p) => p.id === projectId);
      if (currentProject) {
        setName(currentProject.name);
        setCategory(currentProject.category);
        setDescription(currentProject.description || '');
      } else {
        setError('Проектът не е намерен.');
      }
    }
  }, [projects, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await updateProject(projectId, {
        name,
        category,
        description: description.trim() || undefined,
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Възникна грешка при обновяването на проекта.');
    } finally {
      
      setSubmitting(false);
    }
  };

  if (projectsLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>Loading project data...</div>;
  }

  return (
    <section className="view view--default" id="edit-project">
      <header className="view__header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <p className="view__eyebrow" style={{ textAlign: 'center' }}>Workspace</p>
          <h1 className="view__title" style={{ fontSize: '32px', textAlign: 'center' }}>Edit Project</h1>
          <p className="view__subtitle" style={{ textAlign: 'center' }}>Update repository settings and ruleset category.</p>
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
                className="field__input" 
                id="repo-desc" 
                rows={4} 
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
                {submitting ? 'Saving...' : 'Save Changes'}
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

export default function EditProjectPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>Loading editor...</div>}>
      <EditProjectContent />
    </Suspense>
  );
}