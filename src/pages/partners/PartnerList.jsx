import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListPartners, useDeletePartner } from '../../hooks/usePartners';
import { Icon, ICO, Avatar } from '../../components/roster';

export default function PartnerList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const params = { page, per_page: 20 };
  if (search) params.search = search;

  const { data, isLoading } = useListPartners(params);
  const deleteMutation = useDeletePartner();

  const partners = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Delete partner "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Resource partners</h1>
          <div className="page-sub">
            {pagination?.total ?? partners.length} partner{(pagination?.total ?? partners.length) === 1 ? '' : 's'} in your network
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate('/partners/connections')}>
            <Icon d={ICO.link} /> Connections
          </button>
          <button className="btn accent" onClick={() => navigate('/partners/add')}>
            <Icon d={ICO.plus} /> Add partner
          </button>
        </div>
      </div>

      <div className="row gap-3" style={{ alignItems: 'center' }}>
        <div className="search-box" style={{ width: 280, height: 32, color: 'var(--text)' }}>
          <Icon d={ICO.search} size={12} />
          <input
            className="input"
            style={{ border: 0, padding: 0, height: 'auto', background: 'transparent' }}
            placeholder="Search partners…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className="btn"><Icon d={ICO.filter} /> Filters</button>
      </div>

      {isLoading ? (
        <div className="empty"><div className="text-sm muted">Loading…</div></div>
      ) : partners.length === 0 ? (
        <div className="empty">
          <Icon d={ICO.user} size={32} />
          <div className="text-sm bold">No partners yet</div>
          <div className="text-xs muted">Add a resource partner to start building your network.</div>
          <button className="btn accent" style={{ marginTop: 8 }} onClick={() => navigate('/partners/add')}>
            <Icon d={ICO.plus} /> Add partner
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Specialization</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p, i) => (
                <tr key={p.id} className="clickable" onClick={() => navigate(`/partners/${p.id}`)}>
                  <td>
                    <div className="row gap-2" style={{ alignItems: 'center' }}>
                      <Avatar name={p.company_name} color={i} />
                      <span className="bold">{p.company_name}</span>
                    </div>
                  </td>
                  <td className="muted">{p.contact_person || '—'}</td>
                  <td className="muted">{p.email || '—'}</td>
                  <td className="muted">{p.specialization || '—'}</td>
                  <td className="right" onClick={(e) => e.stopPropagation()}>
                    <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="btn ghost"
                        style={{ width: 28, padding: 0, justifyContent: 'center' }}
                        onClick={() => navigate(`/partners/${p.id}/edit`)}
                        title="Edit"
                      >
                        <Icon d={ICO.edit} />
                      </button>
                      <button
                        className="btn ghost"
                        style={{ width: 28, padding: 0, justifyContent: 'center', color: 'var(--danger)' }}
                        onClick={(e) => handleDelete(e, p.id, p.company_name)}
                        title="Delete"
                      >
                        <Icon d={ICO.x} />
                      </button>
                    </div>
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
