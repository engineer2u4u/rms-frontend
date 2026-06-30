import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCandidate, useDeleteCandidate, useGenerateShareToken } from '../../hooks/useCandidates';
import { useAuthStore } from '../../store/authStore';
import ShareButtons from '../../components/ui/ShareButtons';
import { Icon, ICO, Avatar, StatusBadge } from '../../components/roster';

const RESOURCE_STATUSES = [
  { id: 'actively_looking', label: 'Actively looking', color: 'accent' },
  { id: 'passive',          label: 'Passive',          color: 'neutral' },
  { id: 'do_not_contact',   label: 'Do not contact',   color: 'danger' },
];

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useCandidate(id);
  const deleteMutation = useDeleteCandidate();
  const shareMutation = useGenerateShareToken();
  const [shareUrl, setShareUrl] = useState(null);

  const c = data?.candidate;
  if (isLoading) {
    return (
      <div className="empty">
        <div className="text-sm muted">Loading…</div>
      </div>
    );
  }
  if (!c) {
    return (
      <div className="empty">
        <div className="text-sm muted">Candidate not found</div>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Delete this candidate?')) {
      deleteMutation.mutate(id, { onSuccess: () => navigate('/candidates') });
    }
  };

  const handleShare = () => {
    shareMutation.mutate(parseInt(id), {
      onSuccess: (data) => {
        const url = `${window.location.origin}/r/${data.token}`;
        setShareUrl(url);
      },
    });
  };

  return (
    <div className="col gap-4">
      {/* Header */}
      <div className="page-head">
        <div className="row gap-3" style={{ alignItems: 'center' }}>
          <Avatar name={c.full_name} size="lg" />
          <div>
            <h1 className="page-title">{c.full_name}</h1>
            <div className="page-sub">
              {c.current_title || '—'}
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate('/candidates')}>
            <Icon d={ICO.arrow} /> Back
          </button>
          <button className="btn" onClick={handleShare}>
            <Icon d={ICO.send} /> Share
          </button>
          <button className="btn" onClick={() => navigate(`/candidates/${id}/edit`)}>
            <Icon d={ICO.edit} /> Edit
          </button>
          <button className="btn danger" onClick={handleDelete}>
            <Icon d={ICO.x} /> Delete
          </button>
        </div>
      </div>

      {/* Stat tiles — Status / Engagement / Rate / Experience */}
      <div className="grid-4">
        <div className="stat">
          <div className="stat-label">Status</div>
          <div style={{ marginTop: 6 }}>
            <StatusBadge status={c.status} statuses={RESOURCE_STATUSES} />
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Engagement</div>
          <div className="text-sm bold" style={{ marginTop: 6, textTransform: 'capitalize' }}>
            {c.availability ? c.availability.replace('_', ' ') : '—'}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Hourly rate</div>
          <div className="text-sm bold mono" style={{ marginTop: 6 }}>
            {c.hourly_rate
              ? `${c.rate_currency || 'USD'} ${c.hourly_rate}/hr`
              : '—'}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Experience</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            {c.total_experience_years ? `${c.total_experience_years}y` : '—'}
          </div>
        </div>
      </div>

      {/* Share URL */}
      {shareUrl && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">Shareable resume link</div>
            <span className="badge ok" style={{ marginLeft: 'auto' }}>
              <span className="dot" />Valid 10 days
            </span>
          </div>
          <div className="card-body col gap-3">
            <div className="row gap-2" style={{ alignItems: 'center' }}>
              <input className="input" value={shareUrl} readOnly style={{ flex: 1 }} />
              <button
                className="btn primary"
                type="button"
                onClick={() => navigator.clipboard?.writeText(shareUrl)}
              >
                <Icon d={ICO.copy} /> Copy
              </button>
            </div>
            <ShareButtons
              whatsappText={`Check out ${c.full_name}'s profile: ${shareUrl}`}
              emailSubject={`Candidate Profile - ${c.full_name}`}
              emailBody={`Hi,\n\nPlease find the candidate profile below:\n\nName: ${c.full_name}\nProfile: ${shareUrl}\n\nBest regards`}
              copyUrl={shareUrl}
            />
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Left — Info */}
        <div className="col gap-4">
          {/* Basic Info */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Details</div>
            </div>
            <div className="card-body">
              <div className="grid-2">
                {c.email && <InfoRow label="Email" value={c.email} />}
                {c.phone && <InfoRow label="Phone" value={c.phone} />}
                {c.location && <InfoRow label="Location" value={c.location} />}
                {c.total_experience_years && (
                  <InfoRow label="Experience" value={`${c.total_experience_years} years`} />
                )}
                <InfoRow label="Availability" value={c.availability?.replace('_', ' ')} />
                <InfoRow
                  label="Status"
                  value={<StatusBadge status={c.status} statuses={RESOURCE_STATUSES} />}
                />

                {/* Contract → hourly rate. Otherwise → CTC. Defensive: show whatever
                    is actually stored, since older records may have either set. */}
                {c.hourly_rate != null && c.hourly_rate !== '' && (
                  <InfoRow
                    label="Hourly rate"
                    value={(
                      <span className="row gap-2" style={{ alignItems: 'baseline' }}>
                        <span className="badge accent">{c.rate_currency || 'USD'}</span>
                        <span className="bold mono">{c.hourly_rate}</span>
                        <span className="text-xs muted">/ hour</span>
                      </span>
                    )}
                  />
                )}
                {c.timezone && <InfoRow label="Timezone" value={c.timezone} />}
              </div>
              {c.summary && (
                <div className="col gap-2" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div className="text-xs muted bold">Summary</div>
                  <div className="text-sm" style={{ whiteSpace: 'pre-line' }}>{c.summary}</div>
                </div>
              )}
            </div>
          </div>

          {/* Experience */}
          {c.experience?.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Experience</div>
              </div>
              <div className="card-body col gap-4">
                {c.experience.map((exp, i) => {
                  const dateRange = formatDateRange(exp.start_date, exp.end_date);
                  return (
                    <div
                      key={i}
                      className="col gap-1"
                      style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 12 }}
                    >
                      <div className="text-sm bold">{exp.designation}</div>
                      <div className="text-xs muted">{exp.company_name}</div>
                      {dateRange && (
                        <div className="text-xs muted mono">{dateRange}</div>
                      )}
                      {exp.description && (
                        <div className="text-sm" style={{ whiteSpace: 'pre-line', marginTop: 4 }}>
                          {exp.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education */}
          {c.education?.some((e) => e.degree) && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Education</div>
              </div>
              <div className="card-body col gap-3">
                {c.education
                  .filter((e) => e.degree)
                  .map((edu, i) => {
                    // year_of_completion is a YEAR column — empty saves as "0000"
                    // which we treat as "no year set" rather than displaying it.
                    const year =
                      edu.year_of_completion && String(edu.year_of_completion) !== '0000'
                        ? edu.year_of_completion
                        : null;
                    const meta = [edu.institution, year].filter(Boolean).join(' · ');
                    return (
                      <div key={i} className="col gap-1">
                        <div className="text-sm bold">{edu.degree}</div>
                        {meta && <div className="text-xs muted">{meta}</div>}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="col gap-4">
          {/* Skills */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Skills</div>
            </div>
            <div className="card-body">
              {c.skills?.length > 0 ? (
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                  {c.skills.map((s, i) => (
                    <span key={i} className="skill-tag">{s.skill_name}</span>
                  ))}
                </div>
              ) : (
                <div className="text-sm muted">No skills added</div>
              )}
            </div>
          </div>

          {/* Tags */}
          {c.tags?.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Tags</div>
              </div>
              <div className="card-body">
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                  {c.tags.map((t, i) => (
                    <span key={i} className="badge accent">{t.tag || t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Certifications */}
          {c.certifications?.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Certifications</div>
              </div>
              <div className="card-body col gap-2">
                {c.certifications.map((cert, i) => (
                  <div key={i} className="col gap-1">
                    <div className="text-sm bold">{cert.certification_name}</div>
                    <div className="text-xs muted">{cert.issuing_org}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume — Drive link if available, otherwise local download fallback */}
          {(c.resume_drive_url || c.resume_local_path) && <ResumeCard candidate={c} />}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="col gap-1">
      <div className="text-xs muted bold">{label}</div>
      <div className="text-sm">{typeof value === 'string' ? (value || '—') : (value ?? '—')}</div>
    </div>
  );
}

// Treats SQL "0000-00-00", empty strings, and the literal word "null" as missing.
function cleanDate(v) {
  if (!v) return '';
  const s = String(v).trim().toLowerCase();
  if (s === '' || s === '0000-00-00' || s === 'null' || s === '0') return '';
  return String(v).trim();
}

function formatDateRange(start, end) {
  const s = cleanDate(start);
  const e = cleanDate(end);
  if (!s && !e) return '';
  if (!s) return `Until ${e}`;
  if (!e) return `${s} — Present`;
  return `${s} — ${e}`;
}

function ResumeCard({ candidate: c }) {
  // Build a token-bearing URL for the local-download endpoint. Browsers can't
  // attach Authorization headers to <a href> clicks, so we pass the access
  // token in the query string just for this download.
  const accessToken = useAuthStore((s) => s.accessToken);
  const localUrl = c.resume_local_path
    ? `${import.meta.env.VITE_API_URL}/candidates/resume_download.php?id=${c.id}&token=${encodeURIComponent(accessToken)}`
    : null;

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Resume</div>
      </div>
      <div className="card-body col gap-2">
        {c.resume_drive_url && (
          <a
            href={c.resume_drive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ width: '100%' }}
          >
            <Icon d={ICO.doc} />
            <span className="ellipsis">
              {c.resume_file_name || 'View on Google Drive'}
            </span>
          </a>
        )}
        {localUrl && (
          <a
            href={localUrl}
            className="btn"
            style={{ width: '100%' }}
            title="Download the original file from this server"
          >
            <Icon d={ICO.download} />
            <span className="ellipsis">
              Download {c.resume_drive_url ? '(local copy)' : (c.resume_file_name || 'resume')}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
