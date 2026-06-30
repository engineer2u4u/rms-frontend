import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { useProject, useCreateProject, useUpdateProject } from '../../hooks/useClients';
import { Icon, ICO } from '../../components/roster';
import {
  CURRENCIES,
  TIMEZONES,
  SKILL_GROUPS,
} from '../../data/formOptions';

// Skill picker uses the same curated universe as the resource form so we get
// consistent matching across resources and project requirements.
const SKILL_OPTIONS_GROUPED = Object.entries(SKILL_GROUPS).map(([group, skills]) => ({
  label: group,
  options: skills.map((s) => ({ value: s, label: s })),
}));

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    borderRadius: 6,
    borderColor: state.isFocused ? 'var(--accent)' : 'var(--border)',
    boxShadow: state.isFocused ? '0 0 0 3px var(--accent-soft)' : 'none',
    fontSize: 13,
    '&:hover': { borderColor: 'var(--border-strong)' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
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
};

const emptyForm = {
  title: '',
  description: '',
  billing_type: 'monthly',
  billing_rate: '',
  billing_currency: 'INR',
  deadline: '',
  availability: 'full_time',
  working_hours: '',
  timezone: '',
  status: 'open',
  required_skills: [], // [{ skill_name, proficiency, years_required, is_mandatory }]
};

export default function ProjectForm() {
  const { id, clientId } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const skillSelectRef = useRef(null);

  const { data: existing } = useProject(id);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  useEffect(() => {
    if (existing?.data) {
      const p = existing.data;
      setForm({
        title: p.title || '',
        description: p.description || '',
        billing_type: p.billing_type || 'monthly',
        billing_rate: p.billing_rate ?? '',
        billing_currency: p.billing_currency || 'INR',
        deadline: p.deadline || '',
        availability: p.availability || 'full_time',
        working_hours: p.working_hours || '',
        timezone: p.timezone || '',
        status: p.status || 'open',
        required_skills: (p.required_skills || []).map((s) => ({
          skill_name: s.skill_name,
          // Keep proficiency/years_required on the model for backend compatibility,
          // but default to sensible values since the UI no longer captures them.
          proficiency: s.proficiency || 'intermediate',
          years_required: s.years_required ?? null,
          is_mandatory: s.is_mandatory ?? true,
        })),
      });
    }
  }, [existing]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      client_id: isEdit ? existing?.data?.client_id : parseInt(clientId),
      billing_rate: form.billing_rate !== '' ? parseFloat(form.billing_rate) : null,
    };

    if (isEdit) {
      updateMutation.mutate({ ...payload, id: parseInt(id) }, {
        onSuccess: () => navigate(`/projects/${id}`),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: (data) => navigate(`/projects/${data.data.id}`),
      });
    }
  };

  // Skills (curated picker + mandatory toggle per pick)
  const addSkill = (option) => {
    if (!option) return;
    if (form.required_skills.some((s) => s.skill_name === option.value)) return;
    setForm((prev) => ({
      ...prev,
      required_skills: [
        ...prev.required_skills,
        { skill_name: option.value, proficiency: 'intermediate', years_required: null, is_mandatory: true },
      ],
    }));
    setTimeout(() => skillSelectRef.current?.focus(), 0);
  };

  const toggleMandatory = (index) => {
    setForm((prev) => ({
      ...prev,
      required_skills: prev.required_skills.map((s, i) =>
        i === index ? { ...s, is_mandatory: !s.is_mandatory } : s
      ),
    }));
  };

  const removeSkill = (index) => {
    setForm((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index),
    }));
  };

  // Hide already-picked skills from the picker.
  const skillFilteredGroups = SKILL_OPTIONS_GROUPED.map((g) => ({
    ...g,
    options: g.options.filter((o) => !form.required_skills.some((s) => s.skill_name === o.value)),
  })).filter((g) => g.options.length > 0);

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit project' : 'Add project'}</h1>
          <div className="page-sub">
            {isEdit ? 'Update project details and requirements.' : 'Define a new project for this client.'}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" type="button" onClick={() => navigate(-1)}>
            <Icon d={ICO.arrow} /> Back
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="col gap-4">
        {/* Project details */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Project details</div>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field full">
                <label>Project title *</label>
                <input
                  className="input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field full">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              {isEdit && (
                <div className="field">
                  <label>Status</label>
                  <select
                    className="input"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="filled">Filled</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Billing */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Billing</div>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field">
                <label>Billing type</label>
                <select
                  className="input"
                  name="billing_type"
                  value={form.billing_type}
                  onChange={handleChange}
                >
                  <option value="hourly">Hourly</option>
                  <option value="monthly">Monthly</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div className="field">
                <label>Currency</label>
                <select
                  className="input"
                  name="billing_currency"
                  value={form.billing_currency}
                  onChange={handleChange}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="field full">
                <label>Rate</label>
                <input
                  className="input"
                  name="billing_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.billing_rate}
                  onChange={handleChange}
                  placeholder={form.billing_type === 'hourly' ? 'e.g. 75' : form.billing_type === 'monthly' ? 'e.g. 200000' : 'Fixed total'}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Work details */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Work details</div>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field">
                <label>Deadline</label>
                <input
                  className="input"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Engagement type</label>
                <select
                  className="input"
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                >
                  <option value="full_time">Full time</option>
                  <option value="part_time">Part time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div className="field">
                <label>Working hours</label>
                <input
                  className="input"
                  name="working_hours"
                  value={form.working_hours}
                  onChange={handleChange}
                  placeholder="e.g. 9 AM - 6 PM"
                />
              </div>
              <div className="field">
                <label>Timezone</label>
                <select
                  className="input"
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                >
                  <option value="">— Select —</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Required skills */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Required skills</div>
            <span className="text-xs muted" style={{ marginLeft: 'auto' }}>
              {form.required_skills.length} added
            </span>
          </div>
          <div className="card-body col gap-3">
            <Select
              ref={skillSelectRef}
              options={skillFilteredGroups}
              value={null}
              onChange={addSkill}
              placeholder="Pick a skill to add…"
              styles={selectStyles}
              isClearable={false}
              blurInputOnSelect={false}
              closeMenuOnSelect={false}
            />

            {form.required_skills.length === 0 ? (
              <div className="text-sm muted">No required skills added yet. Pick from the dropdown above.</div>
            ) : (
              <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {form.required_skills.map((skill, index) => (
                  <span
                    key={`${skill.skill_name}-${index}`}
                    className="row gap-2"
                    style={{
                      alignItems: 'center',
                      padding: '4px 4px 4px 10px',
                      background: skill.is_mandatory ? 'var(--accent-soft)' : 'var(--surface-2)',
                      border: `1px solid ${skill.is_mandatory ? 'var(--accent-border)' : 'var(--border)'}`,
                      borderRadius: 999,
                      height: 28,
                      fontSize: 12,
                      color: skill.is_mandatory ? 'oklch(0.40 0.16 264)' : 'var(--text-2)',
                      fontWeight: 500,
                    }}
                  >
                    <span>{skill.skill_name}</span>
                    <button
                      type="button"
                      onClick={() => toggleMandatory(index)}
                      style={{
                        background: 'transparent',
                        border: 0,
                        padding: '0 6px',
                        height: 18,
                        borderRadius: 9,
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: 'inherit',
                        opacity: 0.8,
                        textTransform: 'uppercase',
                        letterSpacing: '.04em',
                      }}
                      title={skill.is_mandatory ? 'Click to mark as nice-to-have' : 'Click to mark as mandatory'}
                    >
                      {skill.is_mandatory ? 'Must' : 'Nice'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: 0,
                        background: 'transparent',
                        color: 'inherit',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        opacity: 0.7,
                      }}
                      title="Remove"
                    >
                      <Icon d={ICO.x} size={11} sw={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="row gap-2" style={{ justifyContent: 'flex-end', paddingBottom: 24 }}>
          <button className="btn" type="button" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn primary" type="submit" disabled={isPending}>
            <Icon d={ICO.check} />
            {isPending ? 'Saving…' : isEdit ? 'Update project' : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  );
}
