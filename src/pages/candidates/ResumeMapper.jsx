import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCreateCandidate } from '../../hooks/useCandidates';
import { listSkills, addSkill } from '../../api/skills';
import SkillInput from '../../components/ui/SkillInput';
import CertificationInput from '../../components/ui/CertificationInput';
import ExperienceInput from '../../components/ui/ExperienceInput';
import { CURRENCIES, EDUCATION_LEVELS, TIMEZONES } from '../../data/formOptions';
import { Icon, ICO } from '../../components/roster';

// "Confirm details" step of the add-resource wizard. Mirrors the simplified
// manual CandidateForm field-for-field — basic info, conditional compensation,
// skills, education. Extra extracted data (summary, experience, certs,
// linkedin) is preserved silently in the save payload so nothing the AI found
// is lost, even though we don't show it as editable fields.
export default function ResumeMapper({
  sections = [],
  extracted,
  drive = null,
  driveError = null,
  localPath = null,
  fileName = null,
  onBack,
  onCreated,
}) {
  const createMutation = useCreateCandidate();
  const queryClient = useQueryClient();
  const [showRawSections, setShowRawSections] = useState(false);

  // Tenant's master skill list — drives the "matched vs new" classification
  // for skills the AI extracted from this resume. Only matched skills get
  // auto-added to the candidate; new ones stay as suggestions until the
  // recruiter clicks [+] to promote them to the master list.
  const { data: knownSkills = [], isSuccess: skillsLoaded } = useQuery({
    queryKey: ['master-skills'],
    queryFn: listSkills,
  });
  // Compare on a canonical form (alphanumerics only, lowercased) so the
  // resume's "React Native" matches the master DB's camelCase "reactNative".
  const canon = (s) => (s || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const knownSet = useMemo(
    () => new Set(knownSkills.map(canon)),
    [knownSkills]
  );

  const addSkillMutation = useMutation({
    mutationFn: addSkill,
    onSuccess: (data, requestedName) => {
      // Master list cache update.
      queryClient.setQueryData(['master-skills'], (prev) => {
        const list = prev || [];
        return list.includes(data.skill_name) ? list : [...list, data.skill_name].sort();
      });
      // Promote the corresponding parsed skill into the candidate's skill
      // list — it just became valid (master DB now contains it).
      const parsed = parsedSkills.find((s) => s.skill_name === requestedName);
      if (parsed) {
        setForm((prev) => {
          if (prev.skills.some((s) => canon(s.skill_name) === canon(parsed.skill_name))) {
            return prev;
          }
          return { ...prev, skills: [...prev.skills, parsed] };
        });
      }
      if (data.created) toast.success(`Added "${data.skill_name}" to skills`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add skill'),
  });

  const parsedSkills = useMemo(
    () =>
      (extracted?.skills || []).map((s) => ({
        skill_name: (s.skill_name || '').trim(),
        proficiency: s.proficiency || 'intermediate',
        years_of_experience: s.years_of_experience ?? null,
      })).filter((s) => s.skill_name),
    [extracted]
  );

  // Pick the first education entry's degree to seed the dropdown; the rest of
  // the education list still gets persisted via the preserved payload.
  const firstEducationDegree =
    (extracted?.education?.[0]?.degree || '').trim();

  const parsedCertifications = useMemo(
    () =>
      (extracted?.certifications || [])
        .map((c) => ({
          certification_name: (c.certification_name || '').trim(),
          issuing_org: (c.issuing_org || '').trim(),
        }))
        .filter((c) => c.certification_name),
    [extracted]
  );

  // Helper for SQL "0000-00-00" / null sentinels coming back from the AI.
  const cleanAiDate = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return '';
    const lower = s.toLowerCase();
    if (lower === '0000-00-00' || lower === 'null' || lower === '0') return '';
    return s;
  };

  const parsedExperiences = useMemo(
    () =>
      (extracted?.experience || [])
        .map((e) => ({
          designation: (e.designation || '').trim(),
          company_name: (e.company_name || '').trim(),
          start_date: cleanAiDate(e.start_date),
          end_date: cleanAiDate(e.end_date),
          description: (e.description || '').trim(),
        }))
        .filter((e) => e.designation || e.company_name || e.description),
    [extracted]
  );

  const [form, setForm] = useState({
    full_name: extracted?.full_name || '',
    email: extracted?.email || '',
    phone: extracted?.phone || '',
    location: extracted?.location || '',
    status: 'actively_looking',
    current_title: extracted?.current_title || '',
    total_experience_years: extracted?.total_experience_years || '',
    hourly_rate: '',
    rate_currency: 'USD',
    timezone: extracted?.timezone || '',
    availability: 'full_time',
    // Seeded by the effect below once the master list loads.
    skills: [],
    experiences: parsedExperiences,
    certifications: parsedCertifications,
    education_level: firstEducationDegree,
  });

  // Once the master list arrives, auto-include only the parsed skills that
  // match it. New (unmatched) skills require the recruiter to click [+] to
  // promote them to master before they land on the candidate. Runs once.
  const [skillsSeeded, setSkillsSeeded] = useState(false);
  useEffect(() => {
    if (skillsSeeded || !skillsLoaded) return;
    const matched = parsedSkills.filter((s) => knownSet.has(canon(s.skill_name)));
    if (matched.length > 0) {
      setForm((prev) => ({ ...prev, skills: matched }));
    }
    setSkillsSeeded(true);
  }, [skillsSeeded, skillsLoaded, parsedSkills, knownSet]);

  // Track which scalar fields came pre-filled — used to mark them with the
  // `.field.parsed` styling so the recruiter can see what the AI picked up.
  const parsedFields = new Set(
    Object.entries({
      full_name: extracted?.full_name,
      email: extracted?.email,
      phone: extracted?.phone,
      location: extracted?.location,
      current_title: extracted?.current_title,
      total_experience_years: extracted?.total_experience_years,
    })
      .filter(([, v]) => v)
      .map(([k]) => k)
  );
  if (firstEducationDegree) parsedFields.add('education_level');

  const fieldClass = (name) => `field${parsedFields.has(name) ? ' parsed' : ''}`;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isContract = form.availability === 'contract';

  const handleSave = (e) => {
    e?.preventDefault?.();
    const educationEntry = form.education_level
      ? [{ degree: form.education_level, institution: '', year_of_completion: '', grade: '' }]
      : [];

    const certs = form.certifications
      .map((c) => ({
        certification_name: (c.certification_name || '').trim(),
        issuing_org: (c.issuing_org || '').trim(),
      }))
      .filter((c) => c.certification_name);

    const experience = form.experiences
      .map((e) => ({
        designation: (e.designation || '').trim(),
        company_name: (e.company_name || '').trim(),
        start_date: (e.start_date || '').trim(),
        end_date: (e.end_date || '').trim(),
        description: (e.description || '').trim(),
      }))
      .filter((e) => e.designation || e.company_name || e.description);

    const payload = {
      // Visible fields
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      location: form.location,
      status: form.status,
      current_title: form.current_title,
      total_experience_years: form.total_experience_years,
      timezone: form.timezone,
      availability: form.availability,
      skills: form.skills,
      experience,
      education: educationEntry,
      certifications: certs,

      // Hourly rate only on contract.
      hourly_rate:  isContract ? (form.hourly_rate || null) : null,
      rate_currency: isContract && form.hourly_rate ? form.rate_currency : null,

      // Removed-from-UI fields — explicitly null so older records get cleared
      // if the form is used to re-save them.
      current_company: null,
      notice_period_days: null,
      current_ctc: null,
      expected_ctc: null,

      // Preserved-from-AI extras the simplified UI doesn't surface
      summary: extracted?.summary || null,
      linkedin_url: extracted?.linkedin_url || null,
      portfolio_url: extracted?.portfolio_url || null,

      // Resume file pointers
      resume_file_name: drive?.file_name || fileName || null,
      resume_drive_file_id: drive?.file_id || null,
      resume_drive_url: drive?.url || null,
      resume_local_path: localPath || null,
    };

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        const id = data?.data?.id ?? data?.id;
        onCreated?.({ id, full_name: form.full_name });
      },
    });
  };

  const counts = {
    parsed: parsedFields.size,
    skills: parsedSkills.length,
    education: extracted?.education?.length || 0,
    certifications: parsedCertifications.length,
    experiences: parsedExperiences.length,
  };

  return (
    <form onSubmit={handleSave} className="row gap-4" style={{ alignItems: 'flex-start' }}>
      {/* Left sidebar — source preview */}
      <aside
        className="card"
        style={{
          width: 280,
          flexShrink: 0,
          position: 'sticky',
          top: 16,
          maxHeight: 'calc(100vh - 120px)',
          overflow: 'auto',
        }}
      >
        <div className="card-head">
          <div className="card-title">Source resume</div>
        </div>
        <div className="card-body col gap-3">
          <div
            className="row gap-2"
            style={{
              padding: 10,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              alignItems: 'center',
            }}
          >
            <Icon d={ICO.doc} />
            <div className="col" style={{ flex: 1, minWidth: 0 }}>
              <div className="text-sm bold ellipsis">{fileName || 'resume'}</div>
              <div className="text-xs muted">{sections.length} section{sections.length === 1 ? '' : 's'}</div>
            </div>
          </div>

          {drive?.url && (
            <a
              href={drive.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ width: '100%' }}
            >
              <Icon d={ICO.link} /> Open on Google Drive
            </a>
          )}

          {driveError && (
            <div
              className="text-xs"
              style={{
                padding: 8,
                background: 'var(--warn-soft)',
                border: '1px solid oklch(0.85 0.08 75)',
                borderRadius: 6,
                color: 'oklch(0.40 0.14 75)',
              }}
            >
              {driveError}
            </div>
          )}

          <button
            type="button"
            className="btn ghost"
            onClick={() => setShowRawSections((v) => !v)}
            style={{ width: '100%' }}
          >
            <Icon d={ICO.doc} />
            {showRawSections ? 'Hide raw sections' : 'Show raw sections'}
          </button>

          {showRawSections && (
            <div className="col gap-2" style={{ fontSize: 11, lineHeight: 1.5 }}>
              {sections.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                  }}
                >
                  <div className="bold" style={{ color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 10 }}>
                    {s.heading}
                  </div>
                  <div className="muted" style={{ whiteSpace: 'pre-line', marginTop: 4 }}>
                    {s.content.length > 280 ? `${s.content.slice(0, 280)}…` : s.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Right — review form, exact mirror of the manual CandidateForm */}
      <div className="col gap-4" style={{ flex: 1, minWidth: 0 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Review &amp; confirm</div>
            <span className="badge accent" style={{ marginLeft: 8 }}>
              <span className="dot" />
              {counts.parsed} field{counts.parsed === 1 ? '' : 's'} auto-filled
            </span>
            <span className="text-xs muted" style={{ marginLeft: 'auto' }}>
              {counts.skills} skills · {counts.education} education
            </span>
          </div>
          <div className="card-body">
            <p className="text-sm muted" style={{ margin: 0 }}>
              Highlighted fields were extracted from the resume. Edit anything before saving.
            </p>
          </div>
        </div>

        {/* Basic information */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Basic information</div>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className={fieldClass('full_name')}>
                <label>Full name *</label>
                <input
                  className="input"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={fieldClass('email')}>
                <label>Email</label>
                <input className="input" type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className={fieldClass('phone')}>
                <label>Phone</label>
                <input className="input" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className={fieldClass('location')}>
                <label>Location</label>
                <input className="input" name="location" value={form.location} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Status</label>
                <select className="input" name="status" value={form.status} onChange={handleChange}>
                  <option value="actively_looking">Actively looking</option>
                  <option value="passive">Passive</option>
                  <option value="do_not_contact">Do not contact</option>
                </select>
              </div>
              <div className="field">
                <label>Availability</label>
                <select className="input" name="availability" value={form.availability} onChange={handleChange}>
                  <option value="full_time">Full time</option>
                  <option value="part_time">Part time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Professional details */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Professional details</div>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className={fieldClass('current_title')}>
                <label>Primary Role</label>
                <input className="input" name="current_title" value={form.current_title} onChange={handleChange} />
              </div>
              <div className={fieldClass('total_experience_years')}>
                <label>Total experience (years)</label>
                <input
                  className="input"
                  type="number"
                  step="0.5"
                  min="0"
                  name="total_experience_years"
                  value={form.total_experience_years}
                  onChange={handleChange}
                />
              </div>

              {isContract && (
                <div className="field full">
                  <label>Hourly rate</label>
                  <div className="row gap-2">
                    <select
                      className="input"
                      name="rate_currency"
                      value={form.rate_currency}
                      onChange={handleChange}
                      style={{ width: 200, flexShrink: 0 }}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      name="hourly_rate"
                      value={form.hourly_rate}
                      onChange={handleChange}
                      placeholder="e.g. 75"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              )}

              <div className="field full">
                <label>Timezone</label>
                <select className="input" name="timezone" value={form.timezone} onChange={handleChange}>
                  <option value="">— Select —</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Work experience */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Work experience</div>
            {counts.experiences > 0 && (
              <span className="badge accent" style={{ marginLeft: 8 }}>
                <span className="dot" />
                {counts.experiences} from resume
              </span>
            )}
            <span className="text-xs muted" style={{ marginLeft: 'auto' }}>
              {form.experiences.length} role{form.experiences.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="card-body">
            <ExperienceInput
              experiences={form.experiences}
              onChange={(experiences) => setForm((prev) => ({ ...prev, experiences }))}
            />
          </div>
        </section>

        {/* Skills */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Skills</div>
            <span className="text-xs muted" style={{ marginLeft: 'auto' }}>
              {form.skills.length} added
            </span>
          </div>
          <div className="card-body col gap-3">
            {parsedSkills.length > 0 && (
              <div className="col gap-2">
                <div className="text-xs muted bold" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  Detected from resume — {parsedSkills.filter((s) => knownSet.has(canon(s.skill_name))).length} added to candidate, {parsedSkills.filter((s) => !knownSet.has(canon(s.skill_name))).length} new (click + to include)
                </div>
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                  {parsedSkills.map((s, i) => {
                    const isKnown = knownSet.has(canon(s.skill_name));
                    return (
                      <span
                        key={`${s.skill_name}-${i}`}
                        className="row gap-2"
                        style={{
                          alignItems: 'center',
                          padding: '4px 4px 4px 10px',
                          background: isKnown ? 'var(--ok-soft)' : 'var(--warn-soft)',
                          border: `1px solid ${isKnown ? 'oklch(0.85 0.07 155)' : 'oklch(0.88 0.08 75)'}`,
                          borderRadius: 999,
                          height: 28,
                          fontSize: 12,
                          color: isKnown ? 'oklch(0.38 0.13 155)' : 'oklch(0.42 0.14 75)',
                          fontWeight: 500,
                        }}
                        title={isKnown ? 'Already in your skills database' : 'New skill — click + to add it'}
                      >
                        <span>{s.skill_name}</span>
                        {isKnown ? (
                          <Icon d={ICO.check} size={11} sw={2.5} />
                        ) : (
                          <button
                            type="button"
                            onClick={() => addSkillMutation.mutate(s.skill_name)}
                            disabled={addSkillMutation.isPending}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: 0,
                              background: 'rgba(0,0,0,0.06)',
                              color: 'inherit',
                              display: 'grid',
                              placeItems: 'center',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                            title={`Add "${s.skill_name}" to skills DB (saved as camelCase)`}
                          >
                            <Icon d={ICO.plus} size={11} sw={2.5} />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
                <div className="text-xs muted">
                  Only skills that match your master list are auto-added to this candidate. Click <Icon d={ICO.plus} size={10} /> on a new skill to add it to the master list (saved as camelCase) — it will also be added to this candidate.
                </div>
              </div>
            )}
            <SkillInput
              skills={form.skills}
              onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
            />
          </div>
        </section>

        {/* Certifications */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Certifications</div>
            {counts.certifications > 0 && (
              <span className="badge accent" style={{ marginLeft: 8 }}>
                <span className="dot" />
                {counts.certifications} from resume
              </span>
            )}
            <span className="text-xs muted" style={{ marginLeft: 'auto' }}>
              {form.certifications.length} added
            </span>
          </div>
          <div className="card-body">
            <CertificationInput
              certifications={form.certifications}
              onChange={(certifications) => setForm((prev) => ({ ...prev, certifications }))}
            />
          </div>
        </section>

        {/* Education */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Education</div>
          </div>
          <div className="card-body">
            <div className={`${fieldClass('education_level')}`} style={{ maxWidth: 360 }}>
              <label>Highest qualification</label>
              <select
                className="input"
                name="education_level"
                value={form.education_level}
                onChange={handleChange}
              >
                <option value="">— Select —</option>
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="row gap-2" style={{ paddingBottom: 24 }}>
          <button type="button" className="btn" onClick={() => onBack?.()}>
            <Icon d={ICO.arrow} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>
          <div style={{ flex: 1 }} />
          <button type="submit" className="btn primary" disabled={createMutation.isPending}>
            <Icon d={ICO.check} />
            {createMutation.isPending ? 'Saving…' : 'Save resource'}
          </button>
        </div>
      </div>
    </form>
  );
}
