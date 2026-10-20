'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; 

function Icon({ d }: { d: string }) {
  return (
    <svg className="nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function Sidebar() {
  const { user, isAdmin, logout, loading } = useAuth();

  return (
    <aside className="sidebar">
      <Link className="brand" href="/dashboard">
        <span className="brand__mark">{'</>'}</span>
        <span className="brand__name">SaaS Code Analyzer<small>Static analysis platform</small></span>
      </Link>
      
      <nav className="nav" aria-label="Primary">
        <p className="nav__label">Workspace</p>
        <ul className="nav__list">
          
          {/* 1. Видимо за ВСИЧКИ логнати потребители (Developer & Admin) */}
          {user && (
            <>
              <li>
                <Link className="nav__link" href="/dashboard">
                  <Icon d="M3 7h7l2 2h9v10H3z" />Projects
                </Link>
              </li>
              
            </>
          )}

          {/* 2. Видимо САМО за ADMIN */}
          {isAdmin && (
            <li>
              <Link className="nav__link" href="/admin">
                <Icon d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />Admin Panel
              </Link>
            </li>
          )}

          {/* 3. Видимо САМО ако потребителят НЕ Е логнат (Гости) */}
          {!user && !loading && (
            <>
              <li>
                <Link className="nav__link" href="/login">
                  <Icon d="M15 3h4v18h-4M10 17l5-5-5-5M15 12H3" />Sign in
                </Link>
              </li>
              <li>
                <Link className="nav__link" href="/register">
                  <Icon d="M15 3h4v18h-4M10 17l5-5-5-5M15 12H3" />Register
                </Link>
              </li>
            </>
          )}

        </ul>
      </nav>

      {/* 4. Динамичен профил и бутон за изход (Показва се само при логнат потребител) */}
      {user && (
        <div className="profile">
          <span className="profile__avatar">
            {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
          </span>
          <div className="profile__info">
            <p className="profile__name" style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            <p className="profile__role" style={{ textTransform: 'capitalize' }}>{user.role}</p>
          </div>
          <button 
            onClick={logout} 
            className="profile__logout" 
            aria-label="Log out" 
            title="Log out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Icon d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9" />
          </button>
        </div>
      )}
    </aside>
  );
}