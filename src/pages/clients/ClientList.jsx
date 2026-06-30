import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useListClients } from '../../hooks/useClients';
import { Icon, ICO, Avatar } from '../../components/roster';

export default function ClientList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table');

  const params = { page, per_page: 20 };
  if (search) params.search = search;

  const { data, isLoading } = useListClients(params);
  const clients = data?.data || [];
  const pagination = data?.pagination;

  const totalProjects = clients.reduce((s, c) => s + (Number(c.project_count) || 0), 0);

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Clients</h1>
          <div className="page-sub">
            {pagination?.total ?? clients.length} active client{(pagination?.total ?? clients.length) === 1 ? '' : 's'}
            {' · '}{totalProjects} project{totalProjects === 1 ? '' : 's'} on this page
          </div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon d={ICO.download} /> Export</button>
          <button className="btn accent" onClick={() => navigate('/clients/add')}>
            <Icon d={ICO.plus} /> Add client
          </button>
        </div>
      </div>

      <div className="row gap-3" style={{ alignItems: 'center' }}>
        <div className="search-box" style={{ width: 280, height: 32, color: 'var(--text)' }}>
          <Icon d={ICO.search} size={12} />
          <input
            className="input"
            style={{ border: 0, padding: 0, height: 'auto', background: 'transparent' }}
            placeholder="Search clients…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className="btn"><Icon d={ICO.filter} /> Filters</button>
        <div style={{ flex: 1 }} />
        <div className="role-switch">
          <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
          <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>Cards</button>
        </div>
      </div>

      {isLoading ? (
        <div className="empty"><div className="text-sm muted">Loading clients…</div></div>
      ) : clients.length === 0 ? (
        <div className="empty">
          <Icon d={ICO.clients} size={32} />
          <div className="text-sm bold">No clients yet</div>
          <div className="text-xs muted">Add your first client to start tracking requirements.</div>
        </div>
      ) : view === 'table' ? (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Client</th>
                <th>Industry</th>
                <th>Primary contact</th>
                <th>Email</th>
                <th className="right">Projects</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={c.id} className="clickable" onClick={() => navigate(`/clients/${c.id}`)}>
                  <td>
                    <div className="row gap-2" style={{ alignItems: 'center' }}>
                      <Avatar name={c.company_name} color={i} />
                      <Link to={`/clients/${c.id}`} className="bold" onClick={(e) => e.stopPropagation()}>
                        {c.company_name}
                      </Link>
                    </div>
                  </td>
                  <td className="muted">{c.industry || '—'}</td>
                  <td className="muted">{c.contact_person || '—'}</td>
                  <td className="muted">{c.email || '—'}</td>
                  <td className="right num">{c.project_count ?? 0}</td>
                  <td className="mono text-xs muted">{c.created_at ? c.created_at.slice(0, 10) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid-3">
          {clients.map((c, i) => (
            <button
              key={c.id}
              className="card"
              style={{ textAlign: 'left', padding: 16, cursor: 'pointer' }}
              onClick={() => navigate(`/clients/${c.id}`)}
            >
              <div className="row gap-3" style={{ alignItems: 'center', marginBottom: 12 }}>
                <Avatar name={c.company_name} color={i} size="lg" />
                <div className="col" style={{ minWidth: 0 }}>
                  <div className="bold ellipsis">{c.company_name}</div>
                  <div className="text-xs muted ellipsis">{c.industry || '—'}</div>
                </div>
              </div>
              <div className="row gap-4" style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div className="col">
                  <div className="text-xs muted">Contact</div>
                  <div className="text-sm bold ellipsis" style={{ maxWidth: 160 }}>{c.contact_person || '—'}</div>
                </div>
                <div className="col" style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
                  <div className="text-xs muted">Projects</div>
                  <div className="num bold">{c.project_count ?? 0}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className="row gap-2" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <button className="btn sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="text-xs muted">Page {page} of {pagination.total_pages}</span>
          <button className="btn sm" disabled={page >= pagination.total_pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
