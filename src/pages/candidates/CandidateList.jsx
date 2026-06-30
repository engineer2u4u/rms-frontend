import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import { useListCandidates } from '../../hooks/useCandidates';
import { useListProjects } from '../../hooks/useClients';
import { Icon, ICO, Avatar, MatchCircle } from '../../components/roster';
import {
  SKILL_GROUPS,
  TIMEZONES,
  EDUCATION_LEVELS,
} from '../../data/formOptions';

const RESOURCE_STATUSES = [
  { id: 'actively_looking', label: 'Actively looking', color: 'accent' },
  { id: 'passive',          label: 'Passive',          color: 'neutral' },
  { id: 'do_not_contact',   label: 'Do not contact',   color: 'danger' },
];

const SENIORITIES = ['Junior', 'Mid', 'Senior', 'Principal'];
const AVAILABILITIES = [
  { id: 'full_time', label: 'Full time' },
  { id: 'part_time', label: 'Part time' },
  { id: 'contract',  label: 'Contract' },
];

// Grouped options for react-select skill picker
const SKILL_OPTIONS_GROUPED = Object.entries(SKILL_GROUPS).map(([group, skills]) => ({
  label: group,
  options: skills.map((s) => ({ value: s, label: s })),
}));

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 30,
    borderRadius: 4,
    borderColor: state.isFocused ? 'var(--accent)' : 'var(--border)',
    boxShadow: state.isFocused ? '0 0 0 3px var(--accent-soft)' : 'none',
    fontSize: 12,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 12,
    backgroundColor: state.isSelected
      ? 'var(--accent-soft)'
      : state.isFocused
        ? 'var(--surface-2)'
        : 'transparent',
    color: 'var(--text)',
  }),
  groupHeading: (base) => ({
    ...base,
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    paddingTop: 8,
  }),
  menu: (base) => ({ ...base, zIndex: 20 }),
  multiValue: (base) => ({
    ...base,
    background: 'var(--accent-soft)',
    borderRadius: 4,
  }),
  multiValueLabel: (base) => ({
    ...base,
    fontSize: 11,
    color: 'oklch(0.40 0.16 264)',
  }),
};

function seniorityOf(yrs) {
  const y = Number(yrs) || 0;
  if (y < 4) return 'Junior';
  if (y < 8) return 'Mid';
  if (y < 13) return 'Senior';
  return 'Principal';
}

// Extract a flat list of required-skill names from a project, regardless of
// whether the API returned `required_skills: [{skill_name,...}]` (canonical)
// or already-normalized strings.
function reqSkillNames(project) {
  if (!project) return [];
  const list = project.required_skills || project.skills || [];
  return list
    .map((s) => (typeof s === 'string' ? s : s.skill_name))
    .filter(Boolean);
}

function reqMandatoryNames(project) {
  if (!project) return [];
  const list = project.required_skills || [];
  return list
    .filter((s) => s.is_mandatory !== false) // default to mandatory if flag absent
    .map((s) => (typeof s === 'string' ? s : s.skill_name))
    .filter(Boolean);
}

// Weighted match score against a project. Mandatory skills weigh more than
// nice-to-haves. Experience is compared against the project's deepest required
// years_required (if specified). Location loosely matches city/country tokens.
function computeMatch(candidate, project) {
  if (!project) return null;
  const required = project.required_skills || [];
  if (required.length === 0) return { total: 0, matchedSkills: [], missingSkills: [] };

  const has = (candidate.skills || [])
    .map((s) => (typeof s === 'string' ? s : s.skill_name || ''))
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  const hasSkill = (name) => {
    const n = name.toLowerCase();
    return has.some((h) => h === n || h.includes(n.split(' ')[0]) || n.includes(h.split(' ')[0]));
  };

  const mandatory = required.filter((s) => s.is_mandatory !== false);
  const optional  = required.filter((s) => s.is_mandatory === false);

  const matchedMandatory = mandatory.filter((s) => hasSkill(s.skill_name));
  const matchedOptional  = optional.filter((s) => hasSkill(s.skill_name));

  // Skill score: mandatory weighted 70%, optional 30%. If no mandatory skills
  // defined, optional carry the full weight.
  let skillScore;
  if (mandatory.length === 0) {
    skillScore = optional.length === 0 ? 0 : (matchedOptional.length / optional.length) * 100;
  } else if (optional.length === 0) {
    skillScore = (matchedMandatory.length / mandatory.length) * 100;
  } else {
    skillScore =
      ((matchedMandatory.length / mandatory.length) * 0.7 +
        (matchedOptional.length / optional.length) * 0.3) *
      100;
  }

  // Experience: compare against the deepest years_required (defaults to 5 if none specified).
  const deepest = Math.max(
    ...required.map((s) => Number(s.years_required) || 0),
    0
  );
  const target = deepest || 5;
  const yrs = Number(candidate.total_experience_years) || 0;
  const expScore = Math.min(100, (yrs / target) * 100);

  // Location: match candidate's city/country against the project's working
  // arrangement. Remote engagements score high regardless of location.
  const candidateLoc = (candidate.location || '').toLowerCase();
  const projectLoc = (
    project.location ||
    project.working_hours ||
    ''
  ).toLowerCase();
  const looksRemote = /remote|anywhere|hybrid/.test(projectLoc) || project.availability === 'contract';
  let locScore = 70;
  if (looksRemote) {
    locScore = 90;
  } else if (candidateLoc && projectLoc) {
    const cityToken = candidateLoc.split(',')[0].trim();
    const countryToken = candidateLoc.split(',').pop().trim();
    if (cityToken && projectLoc.includes(cityToken)) locScore = 95;
    else if (countryToken && projectLoc.includes(countryToken)) locScore = 85;
  }

  const total = Math.round(skillScore * 0.6 + expScore * 0.25 + locScore * 0.15);

  const matchedSkills = [...matchedMandatory, ...matchedOptional].map((s) => s.skill_name);
  const missingSkills = required
    .filter((s) => !hasSkill(s.skill_name))
    .map((s) => s.skill_name);

  return { total, skillScore: Math.round(skillScore), expScore: Math.round(expScore), locScore: Math.round(locScore), matchedSkills, missingSkills };
}

export default function CandidateList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filter state
  const [q, setQ] = useState('');
  const [skillsFilter, setSkillsFilter] = useState([]);          // array of skill name strings
  const [seniorityFilter, setSeniorityFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ? [searchParams.get('status')] : []);
  const [availabilityFilter, setAvailabilityFilter] = useState([]);
  const [timezoneFilter, setTimezoneFilter] = useState('');      // single value
  const [educationFilter, setEducationFilter] = useState([]);    // array of education levels (client-side)
  const [minYrs, setMinYrs] = useState(0);
  const [minMatch, setMinMatch] = useState(0);
  const [view, setView] = useState('table');
  const [matchProjectId, setMatchProjectId] = useState('');
  const [page, setPage] = useState(1);

  // Backend params
  const backendParams = { page, per_page: 24 };
  if (q) backendParams.search = q;
  if (statusFilter.length === 1) backendParams.status = statusFilter[0];
  if (skillsFilter.length) backendParams.skills = skillsFilter.join(',');
  if (minYrs > 0) backendParams.experience_min = minYrs;
  if (availabilityFilter.length === 1) backendParams.availability = availabilityFilter[0];
  if (timezoneFilter) backendParams.timezone = timezoneFilter;

  const { data, isLoading } = useListCandidates(backendParams);

  const { data: projectsData } = useListProjects({ per_page: 200 });
  const projects = projectsData?.data || [];
  const matchProject = matchProjectId ? projects.find((p) => p.id === Number(matchProjectId)) : null;

  const candidates = data?.data || [];
  const pagination = data?.pagination;

  // Client-side filters (seniority, multi-status, multi-availability, education, match threshold)
  // plus computed match score against the selected project.
  const enriched = useMemo(() => {
    return candidates
      .map((c) => ({
        ...c,
        _seniority: seniorityOf(c.total_experience_years),
        _education: c.education?.[0]?.degree || '',
        _match: computeMatch(c, matchProject),
      }))
      .filter((c) => {
        if (seniorityFilter.length && !seniorityFilter.includes(c._seniority)) return false;
        if (statusFilter.length > 1 && !statusFilter.includes(c.status)) return false;
        if (availabilityFilter.length > 1 && !availabilityFilter.includes(c.availability)) return false;
        if (educationFilter.length && !educationFilter.includes(c._education)) return false;
        if (minMatch > 0 && (!c._match || c._match.total < minMatch)) return false;
        return true;
      })
      .sort((a, b) => {
        if (matchProject) return (b._match?.total || 0) - (a._match?.total || 0);
        return (a.full_name || '').localeCompare(b.full_name || '');
      });
  }, [candidates, seniorityFilter, statusFilter, availabilityFilter, educationFilter, minMatch, matchProject]);

  function toggle(list, set, v) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
    setPage(1);
  }

  function clearFilters() {
    setQ(''); setSkillsFilter([]); setSeniorityFilter([]); setStatusFilter([]);
    setAvailabilityFilter([]); setTimezoneFilter(''); setEducationFilter([]);
    setMinYrs(0); setMinMatch(0); setPage(1);
  }

  const skillsFilterValue = skillsFilter.map((s) => ({ value: s, label: s }));

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Resources</h1>
          <div className="page-sub">
            {enriched.length} of {pagination?.total ?? candidates.length} people
            {matchProject && <> · matched against <b style={{ color: 'var(--text)' }}>{matchProject.title}</b></>}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate('/candidates/upload')}>
            <Icon d={ICO.upload} /> Upload resume
          </button>
          <button className="btn"><Icon d={ICO.download} /> Export</button>
          <button className="btn primary" onClick={() => navigate('/candidates/add')}>
            <Icon d={ICO.plus} /> Add resource
          </button>
        </div>
      </div>

      {/* Match-to context bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
        <Icon d={ICO.spark} />
        <span className="text-sm bold">Match against project</span>
        <select
          className="input"
          style={{ height: 28, maxWidth: 360 }}
          value={matchProjectId}
          onChange={(e) => setMatchProjectId(e.target.value)}
        >
          <option value="">— None (browse all) —</option>
          {projects
            .filter((p) => !['filled', 'closed', 'cancelled'].includes(p.status))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.company_name ? `${p.company_name} · ` : ''}{p.title}
              </option>
            ))}
        </select>
        {matchProject && reqSkillNames(matchProject).length > 0 && (
          <div className="row gap-2" style={{ flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            {reqSkillNames(matchProject).slice(0, 6).map((s) => {
              const mandatory = reqMandatoryNames(matchProject).includes(s);
              return (
                <span key={s} className="skill-tag match" title={mandatory ? 'Mandatory' : 'Nice to have'}>
                  {s}{!mandatory && <span style={{ opacity: 0.6 }}> · nice</span>}
                </span>
              );
            })}
            {reqSkillNames(matchProject).length > 6 && (
              <span className="text-xs muted">+{reqSkillNames(matchProject).length - 6}</span>
            )}
          </div>
        )}
      </div>

      <div className="row gap-4" style={{ alignItems: 'flex-start' }}>
        {/* Filter rail */}
        <aside className="filter-rail">
          <details className="filter-group" open>
            <summary>
              <Icon d={ICO.search} size={12} /> Quick search
              <Icon d={ICO.caret} size={12} className="caret" />
            </summary>
            <div className="filter-body">
              <input
                className="input"
                placeholder="Name, email…"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
              />
            </div>
          </details>

          <details className="filter-group" open>
            <summary>
              Match score
              {minMatch > 0 && <span className="pill">≥ {minMatch}%</span>}
              <Icon d={ICO.caret} size={12} className="caret" />
            </summary>
            <div className="filter-body">
              {!matchProject && (
                <div className="text-xs muted" style={{ marginBottom: 6 }}>
                  Pick a project above to compute match scores.
                </div>
              )}
              <input
                type="range" min="0" max="95" step="5"
                value={minMatch}
                disabled={!matchProject}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                style={{ accentColor: 'var(--accent)', opacity: matchProject ? 1 : 0.5 }}
              />
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="text-xs muted">0%</span>
                <span className="text-xs mono bold">{minMatch}%</span>
                <span className="text-xs muted">95%</span>
              </div>
            </div>
          </details>

          <details className="filter-group" open>
            <summary>
              Skills
              {skillsFilter.length > 0 && <span className="pill">{skillsFilter.length}</span>}
              <Icon d={ICO.caret} size={12} className="caret" />
            </summary>
            <div className="filter-body">
              <Select
                isMulti
                options={SKILL_OPTIONS_GROUPED}
                value={skillsFilterValue}
                onChange={(opts) => {
                  setSkillsFilter((opts || []).map((o) => o.value));
                  setPage(1);
                }}
                placeholder="Pick skills…"
                styles={selectStyles}
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
              />
            </div>
          </details>

          <details className="filter-group" open>
            <summary>
              Seniority
              {seniorityFilter.length > 0 && <span className="pill">{seniorityFilter.length}</span>}
              <Icon d={ICO.caret} size={12} className="caret" />
            </summary>
            <div className="filter-body">
              {SENIORITIES.map((s) => (
                <label key={s} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={seniorityFilter.includes(s)}
                    onChange={() => toggle(seniorityFilter, setSeniorityFilter, s)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="filter-group" open>
            <summary>
              Status
              {statusFilter.length > 0 && <span className="pill">{statusFilter.length}</span>}
              <Icon d={ICO.caret} size={12} className="caret" />
            </summary>
            <div className="filter-body">
              {RESOURCE_STATUSES.map((s) => (
                <label key={s.id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={statusFilter.includes(s.id)}
                    onChange={() => toggle(statusFilter, setStatusFilter, s.id)}
                  />
                  <span className={`dot ${s.color}`} style={{ marginRight: 2 }} />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="filter-group" open>
            <summary>
              Availability
              {availabilityFilter.length > 0 && <span className="pill">{availabilityFilter.length}</span>}
              <Icon d={ICO.caret} size={12} className="caret" />
            </summary>
            <div className="filter-body">
              {AVAILABILITIES.map((a) => (
                <label key={a.id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={availabilityFilter.includes(a.id)}
                    onChange={() => toggle(availabilityFilter, setAvailabilityFilter, a.id)}
                  />
                  <span>{a.label}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="filter-group" open>
            <summary>
              Timezone
              {timezoneFilter && <span className="pill">{timezoneFilter}</span>}
              <Icon d={ICO.caret} size={12} className="caret" />
            </summary>
            <div className="filter-body">
              <select
                className="input"
                value={timezoneFilter}
                onChange={(e) => { setTimezoneFilter(e.target.value); setPage(1); }}
              >
                <option value="">Any</option>
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </details>

          <details className="filter-group" open>
            <summary>
              Education
              {educationFilter.length > 0 && <span className="pill">{educationFilter.length}</span>}
              <Icon d={ICO.caret} size={12} className="caret" />
            </summary>
            <div className="filter-body">
              {EDUCATION_LEVELS.map((lvl) => (
                <label key={lvl} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={educationFilter.includes(lvl)}
                    onChange={() => toggle(educationFilter, setEducationFilter, lvl)}
                  />
                  <span>{lvl}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="filter-group" open>
            <summary>
              Min experience
              {minYrs > 0 && <span className="pill">{minYrs}y</span>}
              <Icon d={ICO.caret} size={12} className="caret" />
            </summary>
            <div className="filter-body">
              <input
                type="range" min="0" max="15" step="1"
                value={minYrs}
                onChange={(e) => { setMinYrs(Number(e.target.value)); setPage(1); }}
                style={{ accentColor: 'var(--accent)' }}
              />
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="text-xs muted">0y</span>
                <span className="text-xs mono bold">{minYrs}+ yrs</span>
                <span className="text-xs muted">15+y</span>
              </div>
            </div>
          </details>

          <div style={{ padding: '8px 10px' }}>
            <button className="btn sm" style={{ width: '100%' }} onClick={clearFilters}>
              Clear all
            </button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-grow col gap-3" style={{ minWidth: 0 }}>
          <div className="row gap-2" style={{ alignItems: 'center' }}>
            <span className="text-sm muted">{enriched.length} results</span>
            <div style={{ flex: 1 }} />
            <div className="role-switch">
              <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
              <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>Cards</button>
            </div>
          </div>

          {isLoading ? (
            <div className="empty"><div className="text-sm muted">Loading…</div></div>
          ) : enriched.length === 0 ? (
            <div className="empty">
              <Icon d={ICO.resources} size={32} />
              <div className="text-sm bold">No matches</div>
              <div className="text-xs muted">Try clearing some filters or adjusting the match threshold.</div>
            </div>
          ) : view === 'table' ? (
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Skills</th>
                    <th className="right">Exp</th>
                    <th>Availability</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="right">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {enriched.map((c, i) => {
                    const stDef = RESOURCE_STATUSES.find((s) => s.id === c.status) || RESOURCE_STATUSES[1];
                    const skillNames = (c.skills || []).map((s) => typeof s === 'string' ? s : s.skill_name).filter(Boolean);
                    return (
                      <tr key={c.id} className="clickable" onClick={() => navigate(`/candidates/${c.id}`)}>
                        <td>
                          <div className="row gap-2" style={{ alignItems: 'center' }}>
                            <Avatar name={c.full_name} color={i} />
                            <div className="col">
                              <span className="bold">{c.full_name}</span>
                              <span className="text-xs muted">
                                {c._seniority}{c.current_title ? ` · ${c.current_title}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="row gap-2" style={{ flexWrap: 'wrap', maxWidth: 280 }}>
                            {skillNames.slice(0, 4).map((s) => {
                              const matched = reqSkillNames(matchProject).some(
                                (ps) => ps.toLowerCase() === s.toLowerCase()
                              );
                              return <span key={s} className={`skill-tag ${matched ? 'match' : ''}`}>{s}</span>;
                            })}
                            {skillNames.length > 4 && <span className="text-xs muted">+{skillNames.length - 4}</span>}
                          </div>
                        </td>
                        <td className="right num">{c.total_experience_years ?? '—'}{c.total_experience_years ? 'y' : ''}</td>
                        <td className="text-xs">{c.availability ? c.availability.replace('_', ' ') : '—'}</td>
                        <td className="text-xs muted">{c.location || '—'}</td>
                        <td><span className={`badge ${stDef.color}`}><span className="dot" />{stDef.label}</span></td>
                        <td className="right">
                          {c._match
                            ? <MatchCircle score={c._match.total} />
                            : <span className="muted text-xs" title="Select a project to compute match">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid-3">
              {enriched.map((c, i) => {
                const stDef = RESOURCE_STATUSES.find((s) => s.id === c.status) || RESOURCE_STATUSES[1];
                const skillNames = (c.skills || []).map((s) => typeof s === 'string' ? s : s.skill_name).filter(Boolean);
                return (
                  <button
                    key={c.id}
                    className="card"
                    style={{ textAlign: 'left', padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}
                    onClick={() => navigate(`/candidates/${c.id}`)}
                  >
                    <div className="row gap-3" style={{ alignItems: 'center' }}>
                      <Avatar name={c.full_name} color={i} size="lg" />
                      <div className="col" style={{ flex: 1 }}>
                        <div className="bold">{c.full_name}</div>
                        <div className="text-xs muted">
                          {c._seniority}{c.current_title ? ` · ${c.current_title}` : ''}
                        </div>
                      </div>
                      {c._match
                        ? <MatchCircle score={c._match.total} />
                        : <span className="muted text-xs" title="Select a project to compute match">—</span>}
                    </div>
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                      {skillNames.slice(0, 5).map((s) => {
                        const matched = reqSkillNames(matchProject).some(
                          (ps) => ps.toLowerCase() === s.toLowerCase()
                        );
                        return <span key={s} className={`skill-tag ${matched ? 'match' : ''}`}>{s}</span>;
                      })}
                    </div>
                    <div className="row gap-3" style={{ alignItems: 'center', marginTop: 'auto' }}>
                      <span className="text-xs muted">
                        {c.total_experience_years ?? 0}y{c.location ? ` · ${c.location}` : ''}
                      </span>
                      <span className={`badge ${stDef.color}`} style={{ marginLeft: 'auto' }}>
                        <span className="dot" />{stDef.label}
                      </span>
                    </div>
                  </button>
                );
              })}
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
      </div>
    </div>
  );
}
