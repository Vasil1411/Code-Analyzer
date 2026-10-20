import React from 'react';

const code = `import express from 'express'
import { db } from './db'

const app = express()
const API_KEY = 'sk_live_51HxQ2eZvKYlo2C'

app.get('/users', async (req, res) => {
  const id = req.query.id
  const rows = await db.query(
    "SELECT * FROM users WHERE id = " + id
  )
  res.send(rows)
})

app.get('/report', async (req, res) => {
  const users = await db.all('users')
  for (const u of users) {
    u.orders = await db.find('orders', u.id)
  }
  res.json(users)
})

app.listen(3000)`;

const flagged = [5, 10, 18];

const issues = [
  { sev: 'critical', title: 'SQL injection via string concatenation', desc: 'User-controlled req.query.id is concatenated into a raw SQL query.', line: 10, rule: 'sec/no-raw-sql' },
  { sev: 'high', title: 'Hard-coded secret detected', desc: 'Live API key committed to source. Move to an environment variable.', line: 5, rule: 'sec/no-hardcoded-secrets' },
  { sev: 'medium', title: 'N+1 query inside loop', desc: 'Awaiting db.find per user. Batch with a single JOIN or IN query.', line: 18, rule: 'perf/no-await-in-loop' },
  { sev: 'low', title: 'Missing explicit return type', desc: 'Function endpoint handler lacks an explicit TypeScript return type annotation.', line: 7, rule: 'style/explicit-module-boundary-types' },
];

export default function AnalyzerPage() {
  return (
    <section className="view view--default" id="analyzer" aria-labelledby="analyzer-title">
      <header className="view__header">
        <div>
          <p className="view__eyebrow">payments-gateway</p>
          <h1 className="view__title" id="analyzer-title">Code Analyzer</h1>
          <p className="view__subtitle">Paste source code to run security, quality and performance rules.</p>
        </div>
      </header>

      <div className="workspace">
        <form className="editor" action="#analyzer">
          <div className="editor__toolbar">
            <span className="editor__dots" aria-hidden="true"><span /><span /><span /></span>
            <span className="editor__filename">src/server.ts</span>
            <button className="btn btn--sm btn--primary" type="submit">Run analysis</button>
          </div>
          <div className="editor__body">
            <ol className="editor__gutter" aria-hidden="true">
              {code.split('\n').map((_, i) => (
                <li key={i} className={flagged.includes(i + 1) ? 'is-flagged' : undefined} />
              ))}
            </ol>
            <label className="visually-hidden" htmlFor="code-input">Source code</label>
            <textarea className="editor__textarea" id="code-input" spellCheck={false} defaultValue={code} />
          </div>
          <footer className="editor__status">
            <span>TypeScript</span><span>UTF-8</span><span>23 lines</span><span style={{ marginLeft: 'auto' }}>Ruleset: OWASP + Core</span>
          </footer>
        </form>

        <aside className="issues" aria-labelledby="issues-title">
          <header className="issues__header">
            <h2 className="issues__title" id="issues-title">Issues</h2>
            <span className="issues__score">Risk score 72/100</span>
          </header>
          
          <dl className="issues__summary">
            {[
              { sev: 'critical', count: 1 },
              { sev: 'high', count: 1 },
              { sev: 'medium', count: 2 },
              { sev: 'low', count: 1 },
            ].map(({ sev, count }) => (
              <div key={sev} className={`stat stat--${sev}`}>
                <dd className="stat__value" style={{ margin: 0 }}>{count}</dd>
                <dt className="stat__label">{sev}</dt>
              </div>
            ))}
          </dl>

          <ul className="issues__list">
            {issues.map((i) => (
              <li key={i.rule} className="issue">
                <div className="issue__head">
                  <span className={`badge badge--${i.sev}`}>{i.sev[0].toUpperCase() + i.sev.slice(1)}</span>
                  <span className="issue__line">L{i.line}</span>
                </div>
                <h3 className="issue__title">{i.title}</h3>
                <p className="issue__desc">{i.desc}</p>
                <code className="issue__rule">{i.rule}</code>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}