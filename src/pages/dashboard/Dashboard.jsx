import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { getDashboard } from '../../api/analytics';
import { Icon, ICO, Avatar } from '../../components/roster';

// Backend project statuses (open|in_progress|filled|closed|cancelled) → badge color
const PROJECT_STATUS_COLOR = {
  open:        'neutral',
  in_progress: 'info',
  filled:      'ok',
  closed:      'neutral',
  cancelled:   'danger',
};
const PROJECT_STATUS_LABEL = {
  open:        'Open',
  in_progress: 'In progress',
  filled:      'Filled',
  closed:      'Closed',
  cancelled:   'Cancelled',
};

const ASSIGNMENT_STATUS_COLOR = {
  shortlisted:  'neutral',
  submitted:    'info',
  interviewing: 'warn',
  offered:      'accent',
  placed:       'ok',
  rejected:     'danger',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const firstName = (user?.name || 'there').split(' ')[0];

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const stats = {
    open_requirements: data?.open_requirements ?? 0,
    total_candidates:  data?.total_candidates ?? 0,
    total_clients:     data?.total_clients ?? 0,
    active_submissions: data?.active_submissions ?? 0,
    placed_count:      data?.placed_count ?? 0,
  };
  const recentProjects = data?.recent_projects ?? [];
  const recentCandidates = data?.recent_candidates ?? [];
  const recentSubmissions = data?.recent_submissions ?? [];

  const isEmpty =
    !isLoading &&
    stats.total_candidates === 0 &&
    stats.total_clients === 0 &&
    stats.open_requirements === 0 &&
    stats.placed_count === 0;

  const statCards = [
    { label: 'Open requirements', value: stats.open_requirements, color: 'blue',   icon: ICO.projects },
    { label: 'Total resources',   value: stats.total_candidates,  color: 'green',  icon: ICO.resources },
    { label: 'Total clients',     value: stats.total_clients,     color: 'cyan',   icon: ICO.clients },
    { label: 'Placements',        value: stats.placed_count,      color: 'yellow', icon: ICO.check },
  ];

  return (
    <div className="col gap-5">
      <div className="page-head">
        <div>
          <h1 className="page-title">{getGreeting()}, {firstName}</h1>
          <div className="page-sub">
            {isEmpty
              ? 'Welcome — let’s set up your workspace.'
              : (
                <>
                  You have{' '}
                  <b style={{ color: 'var(--text)' }}>{stats.active_submissions} active submission{stats.active_submissions === 1 ? '' : 's'}</b>
                  {' and '}
                  <b style={{ color: 'var(--text)' }}>{stats.open_requirements} open requirement{stats.open_requirements === 1 ? '' : 's'}</b>.
                </>
              )}
          </div>
        </div>
      </div>

      {/* First-run empty state: show only when truly nothing exists */}
      {isEmpty ? (
        <div className="card" style={{ padding: 28 }}>
          <div className="row gap-4" style={{ alignItems: 'flex-start' }}>
            <div className="icon-bubble" style={{ background: 'var(--grad-blue)', width: 48, height: 48, borderRadius: 12 }}>
              <Icon d={ICO.spark} size={22} stroke="#fff" sw={2} />
            </div>
            <div className="col gap-2" style={{ flex: 1 }}>
              <div className="text-lg bold">Get started in three steps</div>
              <div className="text-sm muted">
                Your workspace is empty. Add your first client, post a requirement, and start sourcing resources.
              </div>
              <div className="row gap-2" style={{ flexWrap: 'wrap', marginTop: 8 }}>
                <button className="btn primary" onClick={() => navigate('/clients/add')}>
                  <Icon d={ICO.plus} /> Add your first client
                </button>
                <button className="btn" onClick={() => navigate('/candidates/upload')}>
                  <Icon d={ICO.upload} /> Upload a resume
                </button>
                <button className="btn" onClick={() => navigate('/candidates/add')}>
                  <Icon d={ICO.user} /> Add a resource manually
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards (real values, no mock charts) */}
          <div className="grid-4">
            {statCards.map((s, i) => (
              <div key={i} className="stat-color">
                <div className="top">
                  <span className="icon-bubble" style={{ background: `var(--grad-${s.color})` }}>
                    <Icon d={s.icon} size={16} stroke="#fff" sw={2} />
                  </span>
                </div>
                <div className="value">{isLoading ? '—' : s.value}</div>
                <div className="label-row"><span>{s.label}</span></div>
              </div>
            ))}
          </div>

          {/* Recent activity rows */}
          <div className="grid-2" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
            <div className="card">
              <div className="card-head">
                <div className="card-title">Recent requirements</div>
                <button className="btn sm ghost" style={{ marginLeft: 'auto' }} onClick={() => navigate('/projects')}>
                  View all <Icon d={ICO.arrow} size={11} />
                </button>
              </div>
              {recentProjects.length === 0 ? (
                <EmptyRow message="No requirements yet" cta="New requirement" onCta={() => navigate('/projects')} />
              ) : (
                recentProjects.map((p, i) => (
                  <div
                    key={p.id}
                    className="row gap-3"
                    style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <Avatar name={p.client_name || 'Client'} color={i} />
                    <div className="col" style={{ flex: 1, minWidth: 0 }}>
                      <div className="text-sm bold ellipsis">{p.title}</div>
                      <div className="text-xs muted ellipsis">{p.client_name || '—'}</div>
                    </div>
                    <span className={`badge ${PROJECT_STATUS_COLOR[p.status] || 'neutral'}`}>
                      <span className="dot" />
                      {PROJECT_STATUS_LABEL[p.status] || p.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <div className="card-head">
                <div className="card-title">Recent resources</div>
                <button className="btn sm ghost" style={{ marginLeft: 'auto' }} onClick={() => navigate('/candidates')}>
                  View all <Icon d={ICO.arrow} size={11} />
                </button>
              </div>
              {recentCandidates.length === 0 ? (
                <EmptyRow message="No resources yet" cta="Add resource" onCta={() => navigate('/candidates/upload')} />
              ) : (
                recentCandidates.map((c, i) => (
                  <div
                    key={c.id}
                    className="row gap-3"
                    style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(`/candidates/${c.id}`)}
                  >
                    <Avatar name={c.full_name} color={i} />
                    <div className="text-sm bold ellipsis" style={{ flex: 1 }}>{c.full_name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent submissions — only show if any */}
          {recentSubmissions.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Recent submissions</div>
                <span className="badge accent" style={{ marginLeft: 'auto' }}>
                  {stats.active_submissions} active
                </span>
                <button className="btn sm ghost" onClick={() => navigate('/assignments')}>
                  View all <Icon d={ICO.arrow} size={11} />
                </button>
              </div>
              <div className="table-wrap" style={{ border: 0, borderRadius: 0 }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Project</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions.map((s) => (
                      <tr
                        key={s.id}
                        className="clickable"
                        onClick={() => navigate(`/candidates/${s.candidate_id}`)}
                      >
                        <td className="bold">{s.candidate_name}</td>
                        <td className="muted">{s.project_title}</td>
                        <td>
                          <span className={`badge ${ASSIGNMENT_STATUS_COLOR[s.status] || 'neutral'}`}>
                            <span className="dot" />
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyRow({ message, cta, onCta }) {
  return (
    <div className="col gap-2" style={{ padding: '20px 16px', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
      <div className="text-sm muted">{message}</div>
      {cta && (
        <button className="btn sm primary" onClick={onCta}>
          <Icon d={ICO.plus} /> {cta}
        </button>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
