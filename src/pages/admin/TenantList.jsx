import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listTenants, toggleTenant, getAiUsage } from '../../api/admin';
import { Icon, ICO, Avatar } from '../../components/roster';

export default function TenantList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants', search, page],
    queryFn: () => listTenants({ search, page, per_page: 20 }),
  });

  // Pull all-tenants usage in one shot so the column doesn't fan out per row.
  const { data: usageMap = {} } = useQuery({
    queryKey: ['admin-ai-usage-all'],
    queryFn: () => getAiUsage(),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTenant,
    onSuccess: (res) => {
      toast.success(res.message || 'Tenant updated');
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const tenants = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Tenants</h1>
          <div className="page-sub">
            {pagination?.total ?? tenants.length} organization{(pagination?.total ?? tenants.length) === 1 ? '' : 's'}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn accent" onClick={() => navigate('/admin/tenants/create')}>
            <Icon d={ICO.plus} /> Add tenant
          </button>
        </div>
      </div>

      <div className="row gap-3" style={{ alignItems: 'center' }}>
        <div
          className="search-box"
          style={{ flex: 1, maxWidth: 520, height: 44, padding: '0 14px', color: 'var(--text)', fontSize: 14 }}
        >
          <Icon d={ICO.search} size={16} />
          <input
            className="input"
            style={{ border: 0, padding: 0, height: 'auto', background: 'transparent', fontSize: 14 }}
            placeholder="Search tenants by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="empty"><div className="text-sm muted">Loading…</div></div>
      ) : tenants.length === 0 ? (
        <div className="empty">
          <Icon d={ICO.clients} size={32} />
          <div className="text-sm bold">No tenants yet</div>
          <div className="text-xs muted">Create the first tenant to get started.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Organization</th>
                <th>Email</th>
                <th>Plan</th>
                <th>AI</th>
                <th className="right">AI usage</th>
                <th className="right">Users</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t, i) => (
                <tr key={t.id} className="clickable" onClick={() => navigate(`/admin/tenants/${t.id}`)}>
                  <td>
                    <div className="row gap-2" style={{ alignItems: 'center' }}>
                      <Avatar name={t.name} color={i} />
                      <span className="bold">{t.name}</span>
                    </div>
                  </td>
                  <td className="muted">{t.email}</td>
                  <td>
                    <span className="badge neutral">
                      <span className="dot" />{t.plan}
                    </span>
                  </td>
                  <td>
                    {t.ai_enabled
                      ? <span className="badge accent"><span className="dot" />On</span>
                      : <span className="badge neutral"><span className="dot" />Off</span>}
                  </td>
                  <td className="right num">
                    {(() => {
                      const u = usageMap[t.id];
                      if (!u || !Number(u.total_tokens)) return <span className="muted">—</span>;
                      const tokens = Number(u.total_tokens);
                      const cost = Number(u.cost_usd);
                      const display =
                        tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : tokens;
                      return (
                        <span title={`${tokens.toLocaleString()} tokens · ${u.calls} calls`}>
                          {display} <span className="muted">· ${cost.toFixed(2)}</span>
                        </span>
                      );
                    })()}
                  </td>
                  <td className="right num">{t.user_count}</td>
                  <td>
                    <span className={`badge ${t.is_active ? 'ok' : 'danger'}`}>
                      <span className="dot" />
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="right" onClick={(e) => e.stopPropagation()}>
                    <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="btn ghost"
                        style={{ width: 28, padding: 0, justifyContent: 'center' }}
                        title="Edit"
                        onClick={() => navigate(`/admin/tenants/${t.id}`)}
                      >
                        <Icon d={ICO.edit} />
                      </button>
                      <button
                        className="btn ghost"
                        style={{
                          width: 28,
                          padding: 0,
                          justifyContent: 'center',
                          color: t.is_active ? 'var(--danger)' : 'var(--ok)',
                        }}
                        title={t.is_active ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleMutation.mutate(t.id)}
                      >
                        <Icon d={t.is_active ? ICO.x : ICO.check} />
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
