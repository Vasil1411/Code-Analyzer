import React from 'react';

const projects = [
  { title: 'payments-gateway', repo: 'acme/payments-gateway', cat: 'security', label: 'Security', desc: 'Scans for injection vectors, leaked secrets and weak crypto across the Stripe integration layer.', issues: 14, files: 312, scan: '2h ago' },
  { title: 'web-dashboard', repo: 'acme/web-dashboard', cat: 'clean-code', label: 'Clean Code', desc: 'Enforces naming, complexity and duplication rules on the React front-end monorepo.', issues: 38, files: 1204, scan: '5h ago' },
  { title: 'search-indexer', repo: 'acme/search-indexer', cat: 'performance', label: 'Performance', desc: 'Profiles hot paths and N+1 queries in the Elasticsearch ingestion workers.', issues: 7, files: 186, scan: '1d ago' },
  { title: 'auth-service', repo: 'acme/auth-service', cat: 'security', label: 'Security', desc: 'OAuth2 and session handling audit with JWT validation and rate-limit checks.', issues: 3, files: 94, scan: '3d ago' },
  { title: 'mobile-api', repo: 'acme/mobile-api', cat: 'performance', label: 'Performance', desc: 'Measures payload sizes, cache headers and cold-start latency for the GraphQL edge.', issues: 21, files: 408, scan: '6h ago' },
  { title: 'billing-core', repo: 'acme/billing-core', cat: 'clean-code', label: 'Clean Code', desc: 'Legacy refactor tracking: dead code, cyclomatic complexity and test coverage gaps.', issues: 56, files: 731, scan: '12m ago' },
];

export default function DashboardPage() {
  return (
    <section className="view view--default projects" id="projects">
      <header className="view__header">
        <div>
          <p className="view__eyebrow">Dashboard</p>
          <h1 className="view__title">Projects</h1>
          <p className="view__subtitle">6 repositories connected, 139 open issues across all scans.</p>
        </div>
        <a className="btn btn--primary" href="/projects/new">+ New analysis</a>
      </header>
      
      <ul className="project-grid">
        {projects.map((p) => (
          <li key={p.title} style={{ display: 'contents' }}>
            <article className="project-card" data-category={p.cat}>
              <header className="project-card__head">
                <div>
                  <h2 className="project-card__title">{p.title}</h2>
                  <p className="project-card__repo">{p.repo}</p>
                </div>
                <span className={`badge badge--${p.cat}`}>{p.label}</span>
              </header>
              <p className="project-card__desc">{p.desc}</p>
              <dl className="project-card__meta">
                <div><dt className="visually-hidden">Issues</dt><dd style={{ margin: 0 }}><strong>{p.issues}</strong> issues</dd></div>
                <div><dt className="visually-hidden">Files</dt><dd style={{ margin: 0 }}><strong>{p.files}</strong> files</dd></div>
                <div><dt className="visually-hidden">Last scan</dt><dd style={{ margin: 0 }}>{p.scan}</dd></div>
              </dl>
              <footer className="project-card__actions">
                <a className="btn btn--sm" href="/analyzer">View</a>
                <button className="btn btn--sm btn--danger" type="button">Delete</button>
              </footer>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}