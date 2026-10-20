

export default function Topbar() {
  return (
    <header className="topbar">
      <p className="topbar__breadcrumb">acme / <strong>workspace</strong></p>
      <label className="topbar__search">
        <span className="visually-hidden">Search</span>
        <input className="field__input" type="search" placeholder="Search projects, rules, users..." />
      </label>
      <p className="topbar__status">Scanner online</p>
    </header>
  );
}