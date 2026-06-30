import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listAssignments } from '../../api/clients';
import { useUpdateAssignmentStatus } from '../../hooks/useClients';
import AssignmentStatusModal from '../../components/assignments/AssignmentStatusModal';
import { Icon, ICO, Avatar } from '../../components/roster';

// Mirrors the backend's candidate_assignments.status enum
const ASSIGNMENT_STATUSES = [
  { id: 'shortlisted',  label: 'Shortlisted',  color: 'neutral' },
  { id: 'submitted',    label: 'Submitted',    color: 'info' },
  { id: 'interviewing', label: 'Interview scheduled', color: 'warn' },
  { id: 'offered',      label: 'Offered',      color: 'accent' },
  { id: 'placed',       label: 'Placed',       color: 'ok' },
  { id: 'rejected',     label: 'Rejected',     color: 'danger' },
];

const STATUSES_NEEDING_DETAILS = new Set(['interviewing', 'offered', 'rejected']);
const PIPELINE_ORDER = ['shortlisted', 'submitted', 'interviewing', 'offered', 'placed'];
const labelOf = (id) =>
  ASSIGNMENT_STATUSES.find((s) => s.id === id)?.label || id;

export default function Assignments() {
  const navigate = useNavigate();
  const [statusF, setStatusF] = useState('all');
  const updateMutation = useUpdateAssignmentStatus();

  // pendingChange = { assignment, nextStatus } — when set, the metadata
  // modal is open collecting the extra fields before mutating.
  const [pendingChange, setPendingChange] = useState(null);

  const changeStatus = (assignment, newStatus) => {
    if (newStatus === assignment.status) return;
    if (STATUSES_NEEDING_DETAILS.has(newStatus)) {
      setPendingChange({ assignment, nextStatus: newStatus });
      return;
    }
    updateMutation.mutate({ id: assignment.id, status: newStatus });
  };

  const moveNext = (assignment) => {
    const idx = PIPELINE_ORDER.indexOf(assignment.status);
    if (idx === -1 || idx >= PIPELINE_ORDER.length - 1) return;
    changeStatus(assignment, PIPELINE_ORDER[idx + 1]);
  };

  const submitPendingChange = (extra) => {
    if (!pendingChange) return;
    updateMutation.mutate(
      { id: pendingChange.assignment.id, status: pendingChange.nextStatus, ...extra },
      { onSuccess: () => setPendingChange(null) }
    );
  };

  const params = { per_page: 200 };
  if (statusF !== 'all') params.status = statusF;

  // Fetch directly via useQuery — the shared hook is gated to single-entity lookups.
  const { data, isLoading } = useQuery({
    queryKey: ['assignments-all', statusF],
    queryFn: () => listAssignments(params),
  });

  const assignments = data?.data ?? [];
  const total = data?.pagination?.total ?? assignments.length;

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Assignments</h1>
          <div className="page-sub">
            {isLoading
              ? 'Loading…'
              : `${total} resource-to-project pairing${total === 1 ? '' : 's'} in your pipeline`}
          </div>
        </div>
      </div>

      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        <button
          className="chip"
          style={statusF === 'all' ? { background: 'var(--text)', color: '#fff', borderColor: 'var(--text)' } : undefined}
          onClick={() => setStatusF('all')}
        >
          All <span className="num" style={{ opacity: 0.7 }}>{assignments.length}</span>
        </button>
        {ASSIGNMENT_STATUSES.map((s) => {
          const ct = assignments.filter((a) => a.status === s.id).length;
          return (
            <button
              key={s.id}
              className="chip"
              style={statusF === s.id ? { background: 'var(--text)', color: '#fff', borderColor: 'var(--text)' } : undefined}
              onClick={() => setStatusF(s.id)}
            >
              <span className={`dot ${s.color}`} />
              {s.label} <span className="num" style={{ opacity: 0.7 }}>{ct}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="empty"><div className="text-sm muted">Loading…</div></div>
      ) : assignments.length === 0 ? (
        <div className="empty">
          <Icon d={ICO.assign} size={32} />
          <div className="text-sm bold">No assignments yet</div>
          <div className="text-xs muted">
            Assignments appear here once you start matching resources to projects.
          </div>
          <button className="btn primary" style={{ marginTop: 8 }} onClick={() => navigate('/projects')}>
            <Icon d={ICO.arrow} /> Go to projects
          </button>
        </div>
      ) : (
        <div className="pipeline">
          {ASSIGNMENT_STATUSES.map((s) => {
            const items = assignments.filter((a) => a.status === s.id);
            return (
              <div key={s.id} className="pipeline-col">
                <header>
                  <span className={`dot ${s.color}`} />
                  <span>{s.label}</span>
                  <span className="text-xs muted" style={{ marginLeft: 'auto' }}>{items.length}</span>
                </header>
                <div className="col-body">
                  {items.length === 0 ? (
                    <div className="empty text-xs">Empty</div>
                  ) : (
                    items.map((a, i) => (
                      <div
                        key={a.id}
                        className="kanban-card"
                        onClick={() => navigate(`/candidates/${a.candidate_id}`)}
                      >
                        <div className="row gap-2" style={{ alignItems: 'center', marginBottom: 6 }}>
                          <Avatar name={a.candidate_name} color={i} />
                          <div className="col" style={{ flex: 1, minWidth: 0 }}>
                            <div className="text-sm bold ellipsis">{a.candidate_name}</div>
                            {a.current_title && (
                              <div className="text-xs muted ellipsis">{a.current_title}</div>
                            )}
                          </div>
                        </div>
                        <div
                          className="row gap-2"
                          style={{
                            alignItems: 'center',
                            padding: '6px 8px',
                            background: 'var(--surface-2)',
                            borderRadius: 4,
                          }}
                        >
                          <Avatar name={a.client_name || 'Client'} color={(i + 2) % 6} />
                          <div className="col" style={{ flex: 1, minWidth: 0 }}>
                            <div className="text-xs ellipsis">{a.client_name || '—'}</div>
                            <div className="text-xs muted ellipsis">{a.project_title}</div>
                          </div>
                        </div>
                        {a.notes && (
                          <div className="text-xs muted" style={{ marginTop: 6, fontStyle: 'italic' }}>
                            "{a.notes}"
                          </div>
                        )}
                        {a.assigned_at && (
                          <div className="text-xs muted" style={{ marginTop: 6 }}>
                            {new Date(a.assigned_at).toLocaleDateString()}
                          </div>
                        )}
                        <select
                          className="input"
                          value={a.status}
                          disabled={updateMutation.isPending}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            changeStatus(a, e.target.value);
                          }}
                          style={{ width: '100%', height: 28, marginTop: 8 }}
                          title="Move to a different pipeline stage"
                        >
                          {ASSIGNMENT_STATUSES.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                          ))}
                        </select>
                        {(() => {
                          const idx = PIPELINE_ORDER.indexOf(a.status);
                          const next = idx >= 0 && idx < PIPELINE_ORDER.length - 1
                            ? PIPELINE_ORDER[idx + 1]
                            : null;
                          if (!next) return null;
                          return (
                            <button
                              type="button"
                              className="btn sm primary"
                              onClick={(e) => { e.stopPropagation(); moveNext(a); }}
                              disabled={updateMutation.isPending}
                              style={{ width: '100%', marginTop: 6 }}
                              title={`Move to ${labelOf(next)}`}
                            >
                              Move to {labelOf(next)} <Icon d={ICO.arrow} />
                            </button>
                          );
                        })()}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AssignmentStatusModal
        open={!!pendingChange}
        nextStatus={pendingChange?.nextStatus}
        nextStatusLabel={pendingChange ? labelOf(pendingChange.nextStatus) : ''}
        initial={pendingChange?.assignment || {}}
        onClose={() => setPendingChange(null)}
        onSubmit={submitPendingChange}
      />
    </div>
  );
}
