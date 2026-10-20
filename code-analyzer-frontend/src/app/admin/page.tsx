
const users = [
  { id: 'USR-1042', name: 'Maya Chen', email: 'maya.chen@acme.dev', role: 'Admin', created: '2024-01-14' },
  { id: 'USR-1043', name: 'Jonas Weber', email: 'jonas.weber@acme.dev', role: 'Developer', created: '2024-02-03' },
  { id: 'USR-1044', name: 'Priya Natarajan', email: 'priya.n@acme.dev', role: 'Developer', created: '2024-02-21' },
  { id: 'USR-1045', name: 'Diego Alvarez', email: 'diego.alvarez@acme.dev', role: 'Developer', created: '2024-03-09' },
  { id: 'USR-1046', name: 'Amara Okafor', email: 'amara.okafor@acme.dev', role: 'Admin', created: '2024-04-17' },
  { id: 'USR-1047', name: 'Lukas Novak', email: 'lukas.novak@acme.dev', role: 'Developer', created: '2024-05-02' },
  { id: 'USR-1048', name: 'Sofia Rossi', email: 'sofia.rossi@acme.dev', role: 'Developer', created: '2024-06-11' },
];

const initials = (name: string) => name.split(' ').map((part) => part[0]).join('');

export default function AdminPage() {
  return (
    <section className="view view--default" id="admin" aria-labelledby="admin-title">
      <header className="view__header">
        <div>
          <p className="view__eyebrow">Administration</p>
          <h1 className="view__title" id="admin-title">Admin Panel</h1>
          <p className="view__subtitle">Manage everyone registered on the platform.</p>
        </div>
        <a className="btn btn--secondary" href="#auth">Invite user</a>
      </header>

      <div className="stats-row">
        <article className="kpi">
          <p className="kpi__label">Total users</p>
          <p className="kpi__value">248</p>
          <p className="kpi__delta">+12 this month</p>
        </article>
        <article className="kpi">
          <p className="kpi__label">Admins</p>
          <p className="kpi__value">9</p>
          <p className="kpi__delta">No change</p>
        </article>
        <article className="kpi">
          <p className="kpi__label">Scans this week</p>
          <p className="kpi__value">1,382</p>
          <p className="kpi__delta">+18%</p>
        </article>
      </div>

      <div className="table-card">
        <header className="table-card__header">
          <h2 className="table-card__title">Registered users</h2>
          <span className="data-table__mono">{users.length} of 248</span>
        </header>

        <div className="table-card__scroll">
          <table className="data-table">
            <caption className="visually-hidden">All registered platform users</caption>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">User</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="data-table__id">{u.id}</td>
                  <td>
                    <span className="data-table__user">
                      <span className="data-table__avatar">{initials(u.name)}</span>
                      {u.name}
                    </span>
                  </td>
                  <td className="data-table__mono">{u.email}</td>
                  <td>
                    <span className={`badge badge--${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="data-table__mono">
                    <time dateTime={u.created}>{u.created}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="table-card__footer">
          <span>Page 1 of 31</span>
          <span>Sorted by creation date</span>
        </footer>
      </div>
    </section>
  );
}