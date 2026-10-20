'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAnalyzer } from '@/hooks/useAnalyzer';

function AnalyzerContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = params.id as string;
  const currentAnalysisId = searchParams.get('analysisId'); // Взимаме ID-то от URL адресa

  const [codeContent, setCodeContent] = useState(``);

  const { analyzeCode, fetchAnalyses, fetchAnalysisById, analyses, loading, error } = useAnalyzer();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  // 1. Автоматично зареждане на анализ, ако има 'analysisId' в URL-а
  useEffect(() => {
    if (currentAnalysisId && projectId) {
      fetchAnalysisById(projectId, currentAnalysisId).then((data) => {
        if (data) {
          if (data.code) setCodeContent(data.code);
          setAnalysisResult({ issues: data.issues || [] });
          setShowHistory(false);
        }
      }).catch(err => console.log('Грешка при зареждане от URL:', err));
    }
  }, [currentAnalysisId, projectId]);

  // Изпълнение на нов анализ
  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeContent.trim()) return;

    try {
      const data = await analyzeCode(projectId, codeContent);
      setAnalysisResult(data);
      setShowHistory(false);
      // Махаме query параметъра за нов анализ
      router.push(`/projects/${projectId}/analyzer`);
    } catch (err) {
      console.log('Грешка при анализа:', err);
    }
  };

  // Превключване към историята
  const handleToggleHistory = async () => {
    if (!showHistory) {
      await fetchAnalyses(projectId);
    }
    setShowHistory(!showHistory);
  };

  // 2. При избор на анализ обновяваме URL-а с query параметър
  const handleSelectAnalysis = (analysisId: string) => {
    router.push(`/projects/${projectId}/analyzer?analysisId=${analysisId}`);
  };

  const linesCount = codeContent.split('\n').length;
  const issuesList = analysisResult?.issues || [];

  const stats = {
    critical: issuesList.filter((i: any) => i.severity?.toLowerCase() === 'critical').length,
    high: issuesList.filter((i: any) => i.severity?.toLowerCase() === 'high').length,
    medium: issuesList.filter((i: any) => i.severity?.toLowerCase() === 'medium').length,
    low: issuesList.filter((i: any) => i.severity?.toLowerCase() === 'low').length,
  };

  return (
    <section className="view view--default" id="analyzer" aria-labelledby="analyzer-title">
      <header className="view__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="view__eyebrow">payments-gateway</p>
          <h1 className="view__title" id="analyzer-title">Code Analyzer</h1>
          <p className="view__subtitle">Paste source code to run security, quality and performance rules.</p>
        </div>
        <button 
          className="btn btn--secondary" 
          type="button"
          onClick={handleToggleHistory}
          style={{ height: 'fit-content' }}
        >
          {showHistory ? 'Back to Editor' : 'View History'}
        </button>
      </header>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {showHistory ? (
        <div className="workspace" style={{ display: 'block', background: 'var(--bg-card, #161b22)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>Past Analyses History</h2>
          {loading ? (
            <p style={{ color: '#8b949e' }}>Зареждане на историята...</p>
          ) : analyses.length === 0 ? (
            <p style={{ color: '#8b949e' }}>Няма намерени предишни анализи за този проект.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analyses.map((item, idx) => (
                <li 
                  key={item.id || idx} 
                  onClick={() => handleSelectAnalysis(item.id)}
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '6px', 
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#58a6ff', fontSize: '1rem' }}>
                      Analysis #{analyses.length - idx}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#c9d1d9' }}>
                      Found problems: <strong style={{ color: item.issues_count > 0 ? '#f85149' : '#3fb950' }}>{item.issues_count}</strong>
                    </p>
                    <span style={{ fontSize: '0.85rem', color: '#58a6ff' }}>Click to load &rarr;</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="workspace">
          <form className="editor" onSubmit={handleRunAnalysis}>
            <div className="editor__toolbar">
              <span className="editor__dots" aria-hidden="true"><span /><span /><span /></span>
              <span className="editor__filename">src/server.ts</span>
              <button className="btn btn--sm btn--primary" type="submit" disabled={loading}>
                {loading ? 'Analyzing...' : 'Run analysis'}
              </button>
            </div>
            
            <div className="editor__body">
              <ol className="editor__gutter" aria-hidden="true">
                {codeContent.split('\n').map((_, i) => (
                  <li key={i} />
                ))}
              </ol>
              <label className="visually-hidden" htmlFor="code-input">Source code</label>
              <textarea 
                className="editor__textarea" 
                id="code-input" 
                spellCheck={false} 
                value={codeContent} 
                onChange={(e) => setCodeContent(e.target.value)}
              />
            </div>

            <footer className="editor__status">
              <span>TypeScript</span><span>UTF-8</span><span>{linesCount} lines</span><span style={{ marginLeft: 'auto' }}>Ruleset: OWASP + Core</span>
            </footer>
          </form>

          <aside className="issues" aria-labelledby="issues-title">
            <header className="issues__header">
              <h2 className="issues__title" id="issues-title">Issues</h2>
              <span className="issues__score">
                {analysisResult ? `Found ${issuesList.length} issues` : 'Ready to analyze'}
              </span>
            </header>
            
            <dl className="issues__summary">
              {[
                { sev: 'critical', count: stats.critical },
                { sev: 'high', count: stats.high },
                { sev: 'medium', count: stats.medium },
                { sev: 'low', count: stats.low },
              ].map(({ sev, count }) => (
                <div key={sev} className={`stat stat--${sev}`}>
                  <dd className="stat__value" style={{ margin: 0 }}>{count}</dd>
                  <dt className="stat__label">{sev}</dt>
                </div>
              ))}
            </dl>

            <ul className="issues__list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {issuesList.length === 0 ? (
                <p style={{ color: '#8b949e', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                  {analysisResult ? 'No issues detected! Great job. 🎉' : 'Click "Run analysis" to inspect your code.'}
                </p>
              ) : (
                issuesList.map((i: any, index: number) => (
                  <li key={index} className="issue">
                    <div className="issue__head">
                      <span className={`badge badge--${i.severity?.toLowerCase()}`}>
                        {i.severity ? i.severity[0].toUpperCase() + i.severity.slice(1) : 'Low'}
                      </span>
                      <span className="issue__line">L{i.line || 1}</span>
                    </div>
                    <h3 className="issue__title">{i.message || i.title}</h3>
                    <p className="issue__desc">{i.desc || 'Detected by static code analyzer rule.'}</p>
                    <code className="issue__rule">{i.rule || 'sec/code-quality'}</code>
                  </li>
                ))
              )}
            </ul>
          </aside>
        </div>
      )}
    </section>
  );
}

export default function AnalyzerPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', color: '#fff', textAlign: 'center' }}>Зареждане на анализатора...</div>}>
      <AnalyzerContent />
    </Suspense>
  );
}