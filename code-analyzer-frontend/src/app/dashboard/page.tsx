'use client';

import React from 'react';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';

export default function DashboardPage() {
  const { projects, loading, error, deleteProject } = useProjects();

  // Преобразува категориите от бекенда към CSS-friendly формат за класовете
  const getCategoryClass = (cat: string) => {
    switch (cat) {
      case 'Security': return 'security';
      case 'Clean Code': return 'clean-code';
      case 'Performance': return 'performance';
      case 'Architecture': return 'architecture';
      default: return 'security';
    }
  };

  return (
    <section className="view view--default projects" id="projects">
      <header className="view__header">
        <div>
          <p className="view__eyebrow">Dashboard</p>
          <h1 className="view__title">Projects</h1>
          <p className="view__subtitle">
            {projects.length} {projects.length === 1 ? 'repository' : 'repositories'} connected.
          </p>
        </div>
        <Link className="btn btn--primary" href="/projects/new">+ New project</Link>
      </header>
      
      {loading && <p style={{ padding: '2rem 0', color: '#fff' }}>Зареждане на проектите...</p>}
      {error && <p style={{ color: 'var(--color-danger, red)', padding: '1rem 0' }}>{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#fff' }}>
          <p style={{ marginBottom: '1rem' }}>You haven't added any projects yet.</p>
          <Link className="btn btn--primary" href="/projects/new">Add your first project</Link>
        </div>
      )}

      <ul className="project-grid">
        {projects.map((p) => {
          const categoryClass = getCategoryClass(p.category);
          return (
            <li key={p.id} style={{ display: 'contents' }}>
              <article className="project-card" data-category={categoryClass}>
                <header className="project-card__head">
                  <div>
                    <h2 className="project-card__title">{p.name}</h2>
                    {/* Owner ID е премахнат напълно тук */}
                  </div>
                  {/* Тук вече подаваме правилно генерирания CSS клас за цвят */}
                  <span className={`badge badge--${categoryClass}`}>{p.category}</span>
                </header>
                <p className="project-card__desc">{p.description || 'Няма въведено описание за този проект.'}</p>
                <dl className="project-card__meta">
                  <div><dt className="visually-hidden">Created</dt><dd style={{ margin: 0 }}>{new Date(p.created_at).toLocaleDateString()}</dd></div>
                </dl>
                <footer className="project-card__actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link className="btn btn--sm" href={`/projects/${p.id}/analyzer`}>Open Analyzer</Link>
                  <Link className="btn btn--sm btn--secondary" href={`/projects/edit/${p.id}`}>Edit</Link>
                  <button 
                    className="btn btn--sm btn--danger" 
                    type="button"
                    onClick={() => deleteProject(p.id)}
                  >
                    Delete
                  </button>
                </footer>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}