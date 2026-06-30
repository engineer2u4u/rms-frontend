import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClient, useDeleteClient } from '../../hooks/useClients';
import { Icon, ICO, Avatar, StatusBadge } from '../../components/roster';

const PROJECT_STATUSES = [
  { id: 'open',        label: 'Open',         color: 'neutral' },
  { id: 'in_progress', label: 'In progress',  color: 'info' },
  { id: 'filled',      label: 'Filled',       color: 'ok' },
  { id: 'closed',      label: 'Closed',       color: 'neutral' },
  { id: 'cancelled',   label: 'Cancelled',    color: 'danger' },
];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useClient(id);
  const deleteMutation = useDeleteClient();

  const client = data?.data;

  if (isLoading) {
    return (
      <div className="empty">
        <div className="text-sm muted">Loading…</div>
      </div>
    );
  }
  if (!client) {
    return (
      <div className="empty">
        <div className="text-sm muted">Client not found</div>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Delete this client and all associated projects? This cannot be undone.')) {
      deleteMutation.mutate(id, { onSuccess: () => navigate('/clients') });
    }
  };

  // Aggregates pulled from the loaded projects list — surfaced as stat tiles.
  const projects = client.projects || [];
  const openProjects = projects.filter((p) => ['open', 'in_progress'].includes(p.status)).length;
  const totalAssignments = projects.reduce((sum, p) => sum + (p.assignment_count || 0), 0);

  return (
    <div className="col gap-4">
      {/* Header */}
      <div className="page-head">
        <div className="row gap-3" style={{ alignItems: 'center' }}>
          <Avatar name={client.company_name} size="lg" />
          <div>
            <h1 className="page-title">{client.company_name}</h1>
            <div className="page-sub">
              {client.industry || '—'}
              {client.address ? ` · ${client.address.split('\n')[0]}` : ''}
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate(`/clients/${id}/edit`)}>
            <Icon d={ICO.edit} /> Edit
          </button>
          <button className="btn danger" onClick={handleDelete}>
            <Icon d={ICO.x} /> Delete
          </button>
        </div>
      </div>

      {/* Stat tiles — Open reqs / Assignments / Contact / Industry */}
      <div className="grid-4">
        <div className="stat">
          <div className="stat-label">Open requirements</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{openProjects}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Active assignments</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{totalAssignments}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Primary contact</div>
          <div className="text-sm bold ellipsis" style={{ marginTop: 6 }}>
            {client.contact_person || '—'}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Industry</div>
          <div className="text-sm bold ellipsis" style={{ marginTop: 6 }}>
            {client.industry || '—'}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Left column */}
        <div className="col gap-4">
          {/* Contact Card */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Contact</div>
            </div>
            <div className="card-body col gap-3">
              {client.contact_person && (
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <Icon d={ICO.user} size={14} />
                  <div className="text-sm bold">{client.contact_person}</div>
                </div>
              )}
              {client.email && (
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <Icon d={ICO.mail} size={14} />
                  <a href={`mailto:${client.email}`} className="text-sm">{client.email}</a>
                </div>
              )}
              {client.phone && (
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <Icon d={ICO.briefcase} size={14} />
                  <a href={`tel:${client.phone}`} className="text-sm">{client.phone}</a>
                </div>
              )}
              {client.website && (
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <Icon d={ICO.globe} size={14} />
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm ellipsis">
                    {client.website}
                  </a>
                </div>
              )}
              {client.address && (
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <Icon d={ICO.pin} size={14} />
                  <div className="text-sm" style={{ whiteSpace: 'pre-line' }}>{client.address}</div>
                </div>
              )}
              {!client.contact_person && !client.email && !client.phone && (
                <div className="text-sm muted">No contact info added</div>
              )}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Notes</div>
              </div>
              <div className="card-body">
                <div className="text-sm" style={{ whiteSpace: 'pre-line' }}>{client.notes}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Projects */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              Projects ({client.projects?.length || 0})
            </div>
            <button
              className="btn sm primary"
              style={{ marginLeft: 'auto' }}
              onClick={() => navigate(`/clients/${id}/projects/add`)}
            >
              <Icon d={ICO.plus} /> Add project
            </button>
          </div>

          {!client.projects?.length ? (
            <div className="col gap-2" style={{ padding: '24px 16px', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
              <div className="text-sm muted">No projects yet. Create a project for this client.</div>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 0, borderRadius: 0 }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Billing</th>
                    <th className="right">Assigned</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {client.projects.map((p) => (
                    <tr
                      key={p.id}
                      className="clickable"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <td>
                        <div className="col">
                          <Link
                            to={`/projects/${p.id}`}
                            className="bold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {p.title}
                          </Link>
                          {p.availability && (
                            <span className="text-xs muted">
                              {p.availability.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td><StatusBadge status={p.status} statuses={PROJECT_STATUSES} /></td>
                      <td className="mono text-xs">
                        {p.billing_rate
                          ? `${p.billing_currency || ''} ${p.billing_rate}${p.billing_type ? `/${p.billing_type}` : ''}`
                          : '—'}
                      </td>
                      <td className="right num">{p.assignment_count ?? 0}</td>
                      <td className="mono text-xs muted">{p.deadline || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
