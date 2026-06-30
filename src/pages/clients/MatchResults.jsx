import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMatchingCandidates, useAssignCandidate } from '../../hooks/useClients';
import ShareButtons from '../../components/ui/ShareButtons';
import { Icon, ICO, Avatar } from '../../components/roster';

// Score band → Roster badge color
const GROUPS = [
  { key: 'perfect', label: '100% match',  scoreLabel: 'Perfect',  color: 'ok',     dot: 'ok',     min: 100 },
  { key: 'strong',  label: '80–99% match', scoreLabel: 'Strong',  color: 'accent', dot: 'accent', min: 80 },
  { key: 'good',    label: '70–79% match', scoreLabel: 'Good',    color: 'warn',   dot: 'warn',   min: 70 },
  { key: 'weak',    label: 'Below 70% match', scoreLabel: 'Weak', color: 'danger', dot: 'danger', min: 0  },
];

export default function MatchResults({ projectId, projectTitle }) {
  const [includeWeak, setIncludeWeak] = useState(false);
  const { data, isLoading } = useMatchingCandidates(projectId, { includeWeak });
  const assignMutation = useAssignCandidate();
  const [selected, setSelected] = useState({});
  const [expanded, setExpanded] = useState({ perfect: true, strong: true, good: false, weak: false });

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body empty"><div className="text-sm muted">Finding matches…</div></div>
      </div>
    );
  }

  const matchData = data?.data;
  if (!matchData || matchData.total_matched === 0) {
    return (
      <div className="card">
        <div className="card-body empty">
          <Icon d={ICO.spark} size={28} />
          <div className="text-sm bold">
            {includeWeak ? 'No candidates to match' : 'No candidates above 70% match'}
          </div>
          <div className="text-xs muted">
            {matchData?.required_skills?.length === 0
              ? 'Add required skills to this project to start matching candidates.'
              : 'Try broadening the requirements or adding more resources.'}
          </div>
          {!includeWeak && (
            <button
              className="btn sm"
              style={{ marginTop: 10 }}
              onClick={() => setIncludeWeak(true)}
            >
              Show all candidates (including low match)
            </button>
          )}
        </div>
      </div>
    );
  }

  const groups = matchData.groups;
  const toggleGroup = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleSelect = (candidateId) =>
    setSelected((prev) => {
      const next = { ...prev };
      if (next[candidateId]) delete next[candidateId];
      else next[candidateId] = true;
      return next;
    });

  const selectAll = (candidates) => {
    const ids = candidates.map((c) => c.id);
    const allSelected = ids.every((id) => selected[id]);
    setSelected((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        if (allSelected) delete next[id];
        else next[id] = true;
      });
      return next;
    });
  };

  const selectedIds = Object.keys(selected).map(Number);
  const selectedCandidates = [
    ...groups.perfect,
    ...groups.strong,
    ...groups.good,
  ].filter((c) => selected[c.id]);

  const handleAssignSelected = () => {
    selectedIds.forEach((candidateId) => {
      assignMutation.mutate({ candidate_id: candidateId, project_id: parseInt(projectId) });
    });
    setSelected({});
  };

  const shareText =
    selectedCandidates.length > 0
      ? `Matching candidates for "${projectTitle}":\n\n` +
        selectedCandidates
          .map((c, i) => `${i + 1}. ${c.full_name} - ${c.current_title || 'N/A'} (${c.score}% match)`)
          .join('\n')
      : '';

  return (
    <div className="col gap-4">
      {/* Header */}
      <div className="row gap-3" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="col">
          <div className="text-xs muted bold" style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Matching candidates
          </div>
          <div className="text-sm" style={{ marginTop: 2 }}>
            <span className="bold">{matchData.total_matched}</span> people {includeWeak ? 'matched' : '≥ 70% match'}
          </div>
        </div>
        <label
          className="row gap-2 text-xs muted"
          style={{ alignItems: 'center', cursor: 'pointer' }}
          title="Show candidates with skill match below 70% so you can still assign them"
        >
          <input
            type="checkbox"
            checked={includeWeak}
            onChange={(e) => setIncludeWeak(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          <span>Include low match (&lt; 70%)</span>
        </label>
        <div style={{ flex: 1 }} />
        {selectedIds.length > 0 && (
          <div className="row gap-2" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="text-xs muted">{selectedIds.length} selected</span>
            <button
              className="btn primary sm"
              onClick={handleAssignSelected}
              disabled={assignMutation.isPending}
            >
              <Icon d={ICO.plus} /> Assign selected
            </button>
            <ShareButtons
              whatsappText={shareText}
              emailSubject={`Candidate Matches - ${projectTitle}`}
              emailBody={shareText}
            />
          </div>
        )}
      </div>

      {/* Groups */}
      {GROUPS.map(({ key, label, color, dot }) => {
        const candidates = groups[key] || [];
        if (candidates.length === 0) return null;
        const isExpanded = expanded[key];

        return (
          <div key={key} className="card">
            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleGroup(key)}
              className="card-head"
              style={{
                width: '100%',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Icon d={isExpanded ? ICO.chevron : ICO.caret} size={14} />
              <span className={`badge ${color}`}>
                <span className="dot" />
                {label}
              </span>
              <span className="text-xs muted">{candidates.length} candidate{candidates.length === 1 ? '' : 's'}</span>
            </button>

            {isExpanded && (
              <div className="col">
                {/* Select all bar */}
                <div
                  className="row gap-2"
                  style={{
                    alignItems: 'center',
                    padding: '8px 16px',
                    background: 'var(--surface-2)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <label className="row gap-2 text-xs muted" style={{ alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={candidates.every((c) => selected[c.id])}
                      onChange={() => selectAll(candidates)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span>Select all in this group</span>
                  </label>
                </div>

                {/* Candidate rows */}
                <div className="col">
                  {candidates.map((c, idx) => (
                    <div
                      key={c.id}
                      className="row gap-3"
                      style={{
                        alignItems: 'flex-start',
                        padding: '14px 16px',
                        borderBottom: idx < candidates.length - 1 ? '1px solid var(--border)' : 0,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!selected[c.id]}
                        onChange={() => toggleSelect(c.id)}
                        style={{ accentColor: 'var(--accent)', marginTop: 4 }}
                      />
                      <Avatar name={c.full_name} color={idx} />

                      <div className="col gap-2" style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + score + status */}
                        <div className="row gap-2" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          <Link to={`/candidates/${c.id}`} className="text-sm bold">
                            {c.full_name}
                          </Link>
                          <span className={`badge ${color}`}>
                            <span className="dot" />
                            {c.score}% match
                          </span>
                          {c.status && (
                            <span className="badge neutral">
                              <span className="dot" />
                              {c.status.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>

                        {/* Meta line */}
                        <div className="text-xs muted">
                          {c.current_title || 'No title'}
                          {c.location ? ` · ${c.location}` : ''}
                          {c.total_experience_years ? ` · ${c.total_experience_years}y exp` : ''}
                        </div>

                        {/* Skill matches */}
                        {c.skill_matches?.length > 0 && (
                          <div className="row gap-2" style={{ flexWrap: 'wrap', marginTop: 2 }}>
                            {c.skill_matches.map((sm, i) => {
                              if (sm.match === 'full') {
                                return <span key={i} className="skill-tag match">{sm.skill}</span>;
                              }
                              if (sm.match === 'partial') {
                                return (
                                  <span key={i} className="skill-tag" style={{ background: 'var(--warn-soft)', borderColor: 'oklch(0.88 0.08 75)' }}>
                                    {sm.skill}
                                    <span className="muted" style={{ marginLeft: 4 }}>≈ {sm.candidate}</span>
                                  </span>
                                );
                              }
                              return (
                                <span key={i} className="skill-tag miss">{sm.skill}</span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <button
                        className="btn sm primary"
                        onClick={() =>
                          assignMutation.mutate({
                            candidate_id: c.id,
                            project_id: parseInt(projectId),
                          })
                        }
                        disabled={assignMutation.isPending}
                      >
                        <Icon d={ICO.plus} /> Assign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
