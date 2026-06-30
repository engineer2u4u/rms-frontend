import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListContracts } from '../../hooks/useContracts';
import { Icon, ICO, StatusBadge } from '../../components/roster';

const CONTRACT_STATUSES = [
  { id: 'draft',     label: 'Draft',     color: 'neutral' },
  { id: 'sent',      label: 'Sent',      color: 'info' },
  { id: 'viewed',    label: 'Viewed',    color: 'accent' },
  { id: 'signed',    label: 'Signed',    color: 'ok' },
  { id: 'expired',   label: 'Expired',   color: 'warn' },
  { id: 'cancelled', label: 'Cancelled', color: 'danger' },
];

export default function ContractList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');

  const params = { page, per_page: 20 };
  if (search) params.search = search;
  if (statusF !== 'all') params.status = statusF;

  const { data, isLoading } = useListContracts(params);
  const contracts = data?.data || [];
  const pagination = data?.pagination;

  const counts = CONTRACT_STATUSES.reduce((acc, s) => {
    acc[s.id] = contracts.filter((c) => c.status === s.id).length;
    return acc;
  }, {});

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Contracts</h1>
          <div className="page-sub">
            {pagination?.total ?? contracts.length} contract{(pagination?.total ?? contracts.length) === 1 ? '' : 's'}
            {' · '}{counts.signed || 0} signed on this page
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate('/contracts/templates')}>
            <Icon d={ICO.doc} /> Templates
          </button>
          <button className="btn accent" onClick={() => navigate('/contracts/create')}>
            <Icon d={ICO.plus} /> New contract
          </button>
        </div>
      </div>

      <div className="row gap-3" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ width: 280, height: 32, color: 'var(--text)' }}>
          <Icon d={ICO.search} size={12} />
          <input
            className="input"
            style={{ border: 0, padding: 0, height: 'auto', background: 'transparent' }}
            placeholder="Search contracts…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <button
            className="chip"
            style={statusF === 'all' ? { background: 'var(--text)', color: '#fff', borderColor: 'var(--text)' } : undefined}
            onClick={() => { setStatusF('all'); setPage(1); }}
          >
            All
          </button>
          {CONTRACT_STATUSES.map((s) => (
            <button
              key={s.id}
              className="chip"
              style={statusF === s.id ? { background: 'var(--text)', color: '#fff', borderColor: 'var(--text)' } : undefined}
              onClick={() => { setStatusF(s.id); setPage(1); }}
            >
              <span className={`dot ${s.color}`} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="empty"><div className="text-sm muted">Loading…</div></div>
      ) : contracts.length === 0 ? (
        <div className="empty">
          <Icon d={ICO.doc} size={32} />
          <div className="text-sm bold">No contracts yet</div>
          <div className="text-xs muted">Create one to send for signing.</div>
          <button className="btn accent" style={{ marginTop: 8 }} onClick={() => navigate('/contracts/create')}>
            <Icon d={ICO.plus} /> New contract
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: '34%' }}>Title</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Signed</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => navigate(`/contracts/${c.id}`)}>
                  <td>
                    <div className="col">
                      <span className="bold">{c.title}</span>
                      {c.recipient_type && (
                        <span className="text-xs muted">to {c.recipient_type}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="col">
                      <span>{c.recipient_name || '—'}</span>
                      {c.recipient_email && <span className="text-xs muted">{c.recipient_email}</span>}
                    </div>
                  </td>
                  <td><StatusBadge status={c.status} statuses={CONTRACT_STATUSES} /></td>
                  <td className="mono text-xs muted">
                    {c.sent_at ? new Date(c.sent_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="mono text-xs muted">
                    {c.signed_at ? new Date(c.signed_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
