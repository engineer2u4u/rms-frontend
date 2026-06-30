import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../api/admin';
import { Icon, ICO, Avatar } from '../../components/roster';

const STAT_CARDS = [
  { key: 'total_tenants',    label: 'Total tenants',    color: 'blue',   icon: ICO.clients },
  { key: 'active_tenants',   label: 'Active',           color: 'green',  icon: ICO.check },
  { key: 'inactive_tenants', label: 'Inactive',         color: 'orange', icon: ICO.x },
  { key: 'total_users',      label: 'Total users',      color: 'cyan',   icon: ICO.user },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
  });

  return (
    <div className="col gap-5">
      <div className="page-head">
        <div>
          <h1 className="page-title">Platform overview</h1>
          <div className="page-sub">Snapshot of all tenant activity and adoption.</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {STAT_CARDS.map((s) => (
          <div key={s.key} className="stat-color">
            <div className="top">
              <span className="icon-bubble" style={{ background: `var(--grad-${s.color})` }}>
                <Icon d={s.icon} size={16} stroke="#fff" sw={2} />
              </span>
            </div>
            <div className="value">{data?.[s.key] ?? '—'}</div>
            <div className="label-row"><span>{s.label}</span></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
        {/* Left column: new + plans */}
        <div className="col gap-4">
          <div className="card">
            <div className="card-head">
              <Icon d={ICO.spark} />
              <div className="card-title">New (last 30 days)</div>
            </div>
            <div className="card-body">
              <div className="num bold" style={{ fontSize: 30, letterSpacing: '-.02em' }}>
                {data?.new_tenants_30d ?? '—'}
              </div>
              <div className="text-xs muted" style={{ marginTop: 2 }}>tenants signed up</div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">By plan</div></div>
            <div className="card-body col gap-2">
              {data?.plan_counts && Object.keys(data.plan_counts).length > 0 ? (
                Object.entries(data.plan_counts).map(([plan, count]) => (
                  <div key={plan} className="row" style={{ alignItems: 'center', padding: '6px 0' }}>
                    <span className="badge neutral"><span className="dot" />{plan}</span>
                    <span style={{ flex: 1 }} />
                    <span className="num bold">{count}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm muted">No tenants yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: recent tenants */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Recent tenants</div>
            <button
              className="btn sm ghost"
              style={{ marginLeft: 'auto' }}
              onClick={() => navigate('/admin/tenants')}
            >
              View all <Icon d={ICO.arrow} size={11} />
            </button>
          </div>
          <div className="table-wrap" style={{ border: 0, borderRadius: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th className="right">Users</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="muted text-sm" style={{ textAlign: 'center', padding: 20 }}>Loading…</td></tr>
                ) : !data?.recent_tenants?.length ? (
                  <tr><td colSpan={4} className="muted text-sm" style={{ textAlign: 'center', padding: 20 }}>No tenants yet</td></tr>
                ) : (
                  data.recent_tenants.map((t, i) => (
                    <tr key={t.id} className="clickable" onClick={() => navigate(`/admin/tenants/${t.id}`)}>
                      <td>
                        <div className="row gap-2" style={{ alignItems: 'center' }}>
                          <Avatar name={t.name} color={i} />
                          <div className="col">
                            <span className="bold">{t.name}</span>
                            <span className="text-xs muted">{t.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge neutral"><span className="dot" />{t.plan}</span></td>
                      <td className="right num">{t.user_count}</td>
                      <td>
                        <span className={`badge ${t.is_active ? 'ok' : 'danger'}`}>
                          <span className="dot" />
                          {t.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
