export default function NewProjectPage() {
  return (
    <section className="view view--default" id="new-project">
      {/* Центрираме заглавието и текста чрез flex-column & align-items: center */}
      <header className="view__header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <p className="view__eyebrow" style={{ textAlign: 'center' }}>Workspace</p>
          <h1 className="view__title" style={{ fontSize: '32px', textAlign: 'center' }}>Connect New Project</h1>
          <p className="view__subtitle" style={{ textAlign: 'center' }}>Import a repository to start static analysis and security checks.</p>
        </div>
      </header>

      {/* Центрирана форма */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div className="table-card" style={{ width: '100%', maxWidth: '640px', padding: 'var(--space-6)' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%' }}>
            
            <div className="field" style={{ width: '100%' }}>
              <label className="field__label" htmlFor="repo-name">Repository Name / Slug</label>
              <input className="field__input" id="repo-name" type="text" placeholder="e.g. acme/payment-api" required style={{ width: '100%' }} />
            </div>

            <div className="field" style={{ width: '100%' }}>
              <label className="field__label" htmlFor="repo-category">Category / Ruleset</label>
              <select className="field__input" id="repo-category" defaultValue="security" style={{ width: '100%' }}>
                <option value="security">Security</option>
                <option value="clean-code">Clean Code</option>
                <option value="performance">Performance</option>
              </select>
            </div>

            <div className="field" style={{ width: '100%' }}>
              <label className="field__label" htmlFor="repo-desc">Description</label>
              <textarea className="field__input" id="repo-desc" rows={4} placeholder="Brief summary of the repository..." style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', width: '100%' }}>
              <button className="btn btn--primary" type="submit" style={{ flex: 1, padding: '12px' }}>Connect Project</button>
              <a className="btn btn--secondary" href="/dashboard" style={{ padding: '12px 24px', textAlign: 'center' }}>Cancel</a>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}