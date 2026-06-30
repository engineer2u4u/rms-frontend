import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useProject,
  useDeleteProject,
  useUnassignCandidate,
  useUpdateProjectStatus,
  useUpdateAssignmentStatus,
} from '../../hooks/useClients';
import MatchResults from './MatchResults';
import AssignmentStatusModal from '../../components/assignments/AssignmentStatusModal';
import { Icon, ICO, StatusBadge } from '../../components/roster';

const PROJECT_STATUSES = [
  { id: 'open',        label: 'Open',         color: 'neutral' },
  { id: 'in_progress', label: 'In progress',  color: 'info' },
  { id: 'filled',      label: 'Filled',       color: 'ok' },
  { id: 'closed',      label: 'Closed',       color: 'neutral' },
  { id: 'cancelled',   label: 'Cancelled',    color: 'danger' },
];

// Linear flow for the pipeline stepper — terminal "closed/cancelled" statuses
// render as a separate dead-end indicator, not as part of the timeline.
const PIPELINE_STAGES = [
  { id: 'open',        label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'filled',      label: 'Filled' },
];

const ASSIGNMENT_STATUSES = [
  { id: 'shortlisted',  label: 'Shortlisted',         color: 'neutral' },
  { id: 'submitted',    label: 'Submitted',           color: 'info' },
  { id: 'interviewing', label: 'Interview scheduled', color: 'warn' },
  { id: 'offered',      label: 'Offered',             color: 'accent' },
  { id: 'placed',       label: 'Placed',              color: 'ok' },
  { id: 'rejected',     label: 'Rejected',            color: 'danger' },
];

// Statuses that require extra info captured via the modal. Anything else
// flips status directly without prompting.
const STATUSES_NEEDING_DETAILS = new Set(['interviewing', 'offered', 'rejected']);

// Linear "happy path" order — used by the Move-to-next button. Skips
// "rejected" so the button always advances toward placement; a user who
// wants to reject explicitly picks it from the dropdown.
const PIPELINE_ORDER = ['shortlisted', 'submitted', 'interviewing', 'offered', 'placed'];

function statusLabel(id) {
  return ASSIGNMENT_STATUSES.find((s) => s.id === id)?.label || id;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProject(id);
  const deleteMutation = useDeleteProject();
  const unassignMutation = useUnassignCandidate();
  const updateProjectMutation = useUpdateProjectStatus();
  const updateAssignmentMutation = useUpdateAssignmentStatus();

  // pendingChange = { assignment, nextStatus }. When set, the metadata
  // modal is open collecting the extras for that status transition.
  // Declared here (above the early-return guards) so hook order stays
  // consistent — moving it below a conditional `return` violates the Rules
  // of Hooks and crashes ProjectDetail.
  const [pendingChange, setPendingChange] = useState(null);

  const project = data?.data;

  if (isLoading) {
    return (
      <div className="empty">
        <div className="text-sm muted">Loading…</div>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="empty">
        <div className="text-sm muted">Project not found</div>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Delete this project? This cannot be undone.')) {
      deleteMutation.mutate(id, {
        onSuccess: () => navigate(`/clients/${project.client_id}`),
      });
    }
  };

  const handleUnassign = (assignmentId) => {
    if (window.confirm('Remove this assignment?')) {
      unassignMutation.mutate({ id: assignmentId });
    }
  };

  const handleProjectStatusChange = (newStatus) => {
    if (newStatus === project.status) return;
    updateProjectMutation.mutate({ id: parseInt(id), status: newStatus });
  };

  const handleAssignmentStatusChange = (assignment, newStatus) => {
    if (newStatus === assignment.status) return;
    if (STATUSES_NEEDING_DETAILS.has(newStatus)) {
      setPendingChange({ assignment, nextStatus: newStatus });
      return;
    }
    updateAssignmentMutation.mutate({ id: assignment.id, status: newStatus });
  };

  // Advance to the next stage on the pipeline. Skips terminal states.
  const handleMoveNext = (assignment) => {
    const idx = PIPELINE_ORDER.indexOf(assignment.status);
    if (idx === -1 || idx >= PIPELINE_ORDER.length - 1) return;
    const next = PIPELINE_ORDER[idx + 1];
    handleAssignmentStatusChange(assignment, next);
  };

  const submitPendingChange = (extra) => {
    if (!pendingChange) return;
    updateAssignmentMutation.mutate(
      { id: pendingChange.assignment.id, status: pendingChange.nextStatus, ...extra },
      { onSuccess: () => setPendingChange(null) }
    );
  };

  // Determine where the project sits in the linear pipeline. Terminal states
  // (closed/cancelled) aren't on the line — they get their own badge.
  const stageIdx = PIPELINE_STAGES.findIndex((s) => s.id === project.status);
  const isTerminal = project.status === 'closed' || project.status === 'cancelled';

  return (
    <div className="col gap-4">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">{project.title}</h1>
          <div className="page-sub">
            <Link to={`/clients/${project.client_id}`}>{project.client_name}</Link>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate(`/projects/${id}/edit`)}>
            <Icon d={ICO.edit} /> Edit
          </button>
          <button className="btn danger" onClick={handleDelete}>
            <Icon d={ICO.x} /> Delete
          </button>
        </div>
      </div>

      {/* Pipeline progress strip + inline status changer */}
      <div className="card">
        <div className="card-body col gap-3" style={{ padding: '14px 20px' }}>
          <div className="row gap-3" style={{ alignItems: 'center' }}>
            <div className="text-xs muted bold" style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Pipeline status
            </div>
            <div style={{ flex: 1 }} />
            <label className="text-xs muted">Change status</label>
            <select
              className="input"
              value={project.status}
              disabled={updateProjectMutation.isPending}
              onChange={(e) => handleProjectStatusChange(e.target.value)}
              style={{ width: 180, height: 32 }}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="row" style={{ alignItems: 'center', gap: 0 }}>
            {PIPELINE_STAGES.map((stage, i) => {
              const passed = !isTerminal && stageIdx >= 0 && i < stageIdx;
              const active = !isTerminal && stageIdx === i;
              const isLast = i === PIPELINE_STAGES.length - 1;
              return (
                <span key={stage.id} style={{ display: 'contents' }}>
                  <div className="col" style={{ alignItems: 'center', flex: 1, gap: 6 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: passed
                          ? 'var(--accent)'
                          : active
                            ? 'var(--surface)'
                            : 'var(--surface-2)',
                        border: `2px solid ${active || passed ? 'var(--accent)' : 'var(--border)'}`,
                        boxShadow: active ? '0 0 0 4px var(--accent-soft)' : 'none',
                        display: 'grid',
                        placeItems: 'center',
                        color: passed ? '#fff' : active ? 'var(--accent)' : 'var(--text-3)',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {passed ? '✓' : i + 1}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: active ? 'var(--text)' : passed ? 'var(--text-2)' : 'var(--text-3)',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: passed ? 'var(--accent)' : 'var(--border)',
                        marginBottom: 18,
                      }}
                    />
                  )}
                </span>
              );
            })}
            {isTerminal && (
              <span style={{ marginLeft: 16 }} className={`badge ${project.status === 'cancelled' ? 'danger' : 'neutral'}`}>
                <span className="dot" />
                {project.status === 'cancelled' ? 'Cancelled' : 'Closed'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Left column */}
        <div className="col gap-4">
          {/* Info Card */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Details</div>
              <span style={{ marginLeft: 'auto' }}>
                <StatusBadge status={project.status} statuses={PROJECT_STATUSES} />
              </span>
            </div>
            <div className="card-body col gap-3">
              {project.billing_rate && (
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <Icon d={ICO.billing} size={14} />
                  <div className="text-sm">
                    {project.billing_currency} {project.billing_rate} / {project.billing_type}
                  </div>
                </div>
              )}
              <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                <Icon d={ICO.briefcase} size={14} />
                <div className="text-sm" style={{ textTransform: 'capitalize' }}>
                  {project.availability?.replace('_', ' ')}
                </div>
              </div>
              {project.deadline && (
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <Icon d={ICO.calendar} size={14} />
                  <div className="text-sm">Deadline: {project.deadline}</div>
                </div>
              )}
              {project.working_hours && (
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <Icon d={ICO.calendar} size={14} />
                  <div className="text-sm">{project.working_hours}</div>
                </div>
              )}
              {project.timezone && (
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  <Icon d={ICO.globe} size={14} />
                  <div className="text-sm">{project.timezone}</div>
                </div>
              )}

              {project.description && (
                <div className="col gap-2" style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div className="text-xs muted bold">Description</div>
                  <div className="text-sm" style={{ whiteSpace: 'pre-line' }}>{project.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Required Skills */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                Required skills ({project.required_skills?.length || 0})
              </div>
            </div>
            <div className="card-body">
              {project.required_skills?.length > 0 ? (
                <div className="col gap-2">
                  {project.required_skills.map((s, i) => (
                    <div key={i} className="row gap-2" style={{ alignItems: 'center' }}>
                      <span className="skill-tag">{s.skill_name}</span>
                      <span className="text-xs muted" style={{ textTransform: 'capitalize' }}>
                        {s.proficiency}
                      </span>
                      <span style={{ marginLeft: 'auto' }} className={`badge ${s.is_mandatory ? 'danger' : 'neutral'}`}>
                        <span className="dot" />
                        {s.is_mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm muted">No skills defined</div>
              )}
            </div>
          </div>

          {/* Assigned Candidates */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                Assigned ({project.assignments?.length || 0})
              </div>
            </div>
            <div className="card-body">
              {project.assignments?.length > 0 ? (
                <div className="col gap-3">
                  {project.assignments.map((a) => {
                    const orderIdx = PIPELINE_ORDER.indexOf(a.status);
                    const nextId = orderIdx >= 0 && orderIdx < PIPELINE_ORDER.length - 1
                      ? PIPELINE_ORDER[orderIdx + 1]
                      : null;
                    return (
                      <div
                        key={a.id}
                        className="col gap-2"
                        style={{
                          padding: '10px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                        }}
                      >
                        <div className="row gap-3" style={{ alignItems: 'center' }}>
                          <div className="col" style={{ flex: 1, minWidth: 0 }}>
                            <Link to={`/candidates/${a.candidate_id}`} className="text-sm bold ellipsis">
                              {a.full_name}
                            </Link>
                            <div className="text-xs muted ellipsis">{a.current_title || 'No title'}</div>
                          </div>
                          <select
                            className="input"
                            value={a.status}
                            disabled={updateAssignmentMutation.isPending}
                            onChange={(e) => handleAssignmentStatusChange(a, e.target.value)}
                            style={{ width: 180, height: 30 }}
                            title="Change pipeline status"
                          >
                            {ASSIGNMENT_STATUSES.map((s) => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                          {nextId && (
                            <button
                              type="button"
                              className="btn sm primary"
                              onClick={() => handleMoveNext(a)}
                              disabled={updateAssignmentMutation.isPending}
                              title={`Move to ${statusLabel(nextId)}`}
                            >
                              Next: {statusLabel(nextId)} <Icon d={ICO.arrow} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn sm"
                            onClick={() => handleUnassign(a.id)}
                            disabled={unassignMutation.isPending}
                            title="De-assign this candidate from the project"
                            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          >
                            <Icon d={ICO.x} /> De-assign
                          </button>
                        </div>
                        <AssignmentExtras assignment={a} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm muted">No candidates assigned yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right - Match Results */}
        <div>
          <MatchResults projectId={id} projectTitle={project.title} />
        </div>
      </div>

      <AssignmentStatusModal
        open={!!pendingChange}
        nextStatus={pendingChange?.nextStatus}
        nextStatusLabel={pendingChange ? statusLabel(pendingChange.nextStatus) : ''}
        initial={pendingChange?.assignment || {}}
        onClose={() => setPendingChange(null)}
        onSubmit={submitPendingChange}
      />
    </div>
  );
}

// Shows the metadata captured for the current assignment status — interview
// info, offer terms, rejection reason. Nothing renders for statuses that
// have no metadata yet.
function AssignmentExtras({ assignment: a }) {
  const bits = [];

  if (a.status === 'interviewing' && (a.interview_at || a.meeting_link)) {
    bits.push(
      <div key="iv" className="row gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        {a.interview_at && (
          <span className="text-xs muted">
            <Icon d={ICO.calendar} size={12} /> {formatDateTime(a.interview_at)}
          </span>
        )}
        {a.meeting_link && (
          <a
            href={a.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs"
            style={{ color: 'var(--accent)' }}
          >
            <Icon d={ICO.link} size={12} /> Meeting link
          </a>
        )}
      </div>
    );
  }

  if (a.status === 'offered' && a.offered_amount != null) {
    bits.push(
      <div key="of" className="text-xs">
        <span className="badge accent" style={{ marginRight: 6 }}>
          {a.offered_currency || 'USD'} {Number(a.offered_amount).toLocaleString()}
        </span>
        <span className="muted">{unitLabel(a.offered_unit)}</span>
      </div>
    );
  }

  if (a.status === 'rejected' && a.rejection_reason) {
    bits.push(
      <div
        key="rj"
        className="text-xs"
        style={{
          padding: '6px 8px',
          background: 'var(--danger-soft, var(--surface-2))',
          border: '1px solid var(--border)',
          borderRadius: 6,
          color: 'var(--text-2)',
        }}
      >
        <span className="bold">Reason: </span>{a.rejection_reason}
      </div>
    );
  }

  if (bits.length === 0) return null;
  return <div className="col gap-1" style={{ marginTop: 2 }}>{bits}</div>;
}

function formatDateTime(v) {
  if (!v) return '';
  const d = new Date(String(v).replace(' ', 'T'));
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function unitLabel(u) {
  return ({
    hourly:  '/ hour',
    daily:   '/ day',
    monthly: '/ month',
    yearly:  '/ year',
    fixed:   '· fixed',
  })[u] || '';
}
