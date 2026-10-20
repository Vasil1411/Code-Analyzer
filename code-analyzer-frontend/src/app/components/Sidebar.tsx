import Link from 'next/link';

function Icon({ d }: { d: string }) {
  return (
    <svg className="nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link className="brand" href="/dashboard">
        <span className="brand__mark">{'</>'}</span>
        <span className="brand__name">SaaS Code Analyzer<small>Static analysis platform</small></span>
      </Link>
      <nav className="nav" aria-label="Primary">
        <p className="nav__label">Workspace</p>
        <ul className="nav__list">
          <li><Link className="nav__link" href="/dashboard"><Icon d="M3 7h7l2 2h9v10H3z" />Projects<span className="nav__count">6</span></Link></li>
          <li><Link className="nav__link" href="/analyzer"><Icon d="M8 6l-6 6 6 6M16 6l6 6-6 6" />Analyzer</Link></li>
          <li><Link className="nav__link" href="/admin"><Icon d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />Admin Panel</Link></li>
          <li><Link className="nav__link" href="/login"><Icon d="M15 3h4v18h-4M10 17l5-5-5-5M15 12H3" />Sign in</Link></li>
          <li><Link className="nav__link" href="/register"><Icon d="M15 3h4v18h-4M10 17l5-5-5-5M15 12H3" />Register</Link></li>

        </ul>
      </nav>
      <div className="profile">
        <span className="profile__avatar">MC</span>
        <div className="profile__info">
          <p className="profile__name">Maya Chen</p>
          <p className="profile__role">Admin</p>
        </div>
        <Link className="profile__logout" href="/auth/login" aria-label="Log out" title="Log out">
          <Icon d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9" />
        </Link>
      </div>
    </aside>
  );
}