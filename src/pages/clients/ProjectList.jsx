import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListProjects } from '../../hooks/useClients';
import { Icon, ICO, Avatar, StatusBadge } from '../../components/roster';

// Local status definitions that mirror backend values and pick Roster palette colors.
const PROJECT_STATUSES = [
  { id: 'open',        label: 'Open',         color: 'neutral' },
  { id: 'in_progress', label: 'In progress',  color: 'info' },
  { id: 'filled',      label: 'Filled',       color: 'ok' },
  { id: 'closed',      label: 'Closed',       color: 'neutral' },
  { id: 'cancelled',   label: 'Cancelled',    color: 'danger' },
];

export default function ProjectList() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [view, setView] = useState('list');
  const [page, setPage] = useState(1);

  const params = { page, per_page: view === 'list' ? 25 : 200 };
  if (q) params.search = q;
  if (statusF !== 'all') params.status = statusF;

  const { data, isLoading } = useListProjects(params);
  const projects = data?.data || [];
  const pagination = data?.pagination;

  const counts = PROJECT_STATUSES.reduce((acc, s) => {
    acc[s.id] = projects.filter((p) => p.status === s.id).length;
    return acc;
  }, {});

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Project requests</h1>
          <div className="page-sub">
            {pagination?.total ?? projects.length} requirement{(pagination?.total ?? projects.length) === 1 ? '' : 's'}
            {' · '}{(counts.open || 0) + (counts.in_progress || 0)} active
          </div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon d={ICO.download} /> Export</button>
          <button className="btn accent"><Icon d={ICO.plus} /> New requirement</button>
        </div>
      </div>

      <div className="row gap-3" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ width: 280, height: 32, color: 'var(--text)' }}>
          <Icon d={ICO.search} size={12} />
          <input
            className="input"
            style={{ border: 0, padding: 0, height: 'auto', background: 'transparent' }}
            placeholder="Search by title…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <button
            className="chip"
            style={statusF === 'all' ? { background: 'var(--text)', color: '#fff', borderColor: 'var(--text)' } : undefined}
            onClick={() => { setStatusF('all'); setPage(1); }}
          >
            All <span className="num" style={{ opacity: 0.7 }}>{pagination?.total ?? projects.length}</span>
          </button>
          {PROJECT_STATUSES.map((s) => (
            <button
              key={s.id}
              className="chip"
              style={statusF === s.id ? { background: 'var(--text)', color: '#fff', borderColor: 'var(--text)' } : undefined}
              onClick={() => { setStatusF(s.id); setPage(1); }}
            >
              <span className={`dot ${s.color}`} />
              {s.label} <span className="num" style={{ opacity: 0.7 }}>{counts[s.id] || 0}</span>
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div className="role-switch">
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>List</button>
          <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>Pipeline</button>
        </div>
      </div>

      {isLoading ? (
        <div className="empty"><div className="text-sm muted">Loading…</div></div>
      ) : projects.length === 0 ? (
        <div className="empty">
          <Icon d={ICO.projects} size={32} />
          <div className="text-sm bold">No requirements yet</div>
          <div className="text-xs muted">Create one from a client's page to start tracking.</div>
        </div>
      ) : view === 'list' ? (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: '34%' }}>Requirement</th>
                <th>Client</th>
                <th>Billing</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p.id} className="clickable" onClick={() => navigate(`/projects/${p.id}`)}>
                  <td>
                    <div className="col">
                      <span className="bold">{p.title}</span>
                      {p.description && (
                        <span className="text-xs muted ellipsis" style={{ maxWidth: 360 }}>
                          {p.description.slice(0, 80)}{p.description.length > 80 ? '…' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="row gap-2" style={{ alignItems: 'center' }}>
                      <Avatar name={p.company_name || 'Client'} color={i} />
                      <span>{p.company_name || '—'}</span>
                    </div>
                  </td>
                  <td className="mono text-xs">
                    {p.billing_rate
                      ? `${p.billing_currency || ''} ${p.billing_rate} ${p.billing_type ? `· ${p.billing_type}` : ''}`
                      : '—'}
                  </td>
                  <td className="mono text-xs muted">{p.deadline || '—'}</td>
                  <td><StatusBadge status={p.status} statuses={PROJECT_STATUSES} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="pipeline">
          {PROJECT_STATUSES.filter((s) => s.id !== 'cancelled').map((s) => {
            const items = projects.filter((p) => p.status === s.id);
            return (
              <div key={s.id} className="pipeline-col">
                <header>
                  <span className={`dot ${s.color}`} />
                  <span>{s.label}</span>
                  <span className="text-xs muted" style={{ marginLeft: 'auto' }}>{items.length}</span>
                </header>
                <div className="col-body">
                  {items.length === 0 ? (
                    <div className="empty text-xs">No items</div>
                  ) : (
                    items.map((p, i) => (
                      <div key={p.id} className="kanban-card" onClick={() => navigate(`/projects/${p.id}`)}>
                        <div className="row gap-2" style={{ alignItems: 'center', marginBottom: 6 }}>
                          <Avatar name={p.company_name || 'Client'} color={i} />
                          <span className="text-xs muted ellipsis">{p.company_name || '—'}</span>
                          {p.billing_rate && (
                            <span style={{ marginLeft: 'auto' }} className="text-xs muted mono">
                              {p.billing_currency} {p.billing_rate}
                            </span>
                          )}
                        </div>
                        <div className="text-sm bold" style={{ marginBottom: 6 }}>{p.title}</div>
                        {p.deadline && (
                          <div className="text-xs muted">Deadline: {p.deadline}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'list' && pagination && pagination.total_pages > 1 && (
        <div className="row gap-2" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <button className="btn sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="text-xs muted">Page {page} of {pagination.total_pages}</span>
          <button className="btn sm" disabled={page >= pagination.total_pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
