import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCandidate, useCreateCandidate, useUpdateCandidate } from '../../hooks/useCandidates';
import SkillInput from '../../components/ui/SkillInput';
import CertificationInput from '../../components/ui/CertificationInput';
import ExperienceInput from '../../components/ui/ExperienceInput';
import { CURRENCIES, EDUCATION_LEVELS, TIMEZONES } from '../../data/formOptions';
import { Icon, ICO } from '../../components/roster';

// Manual resource entry. Hourly rate / currency are only captured when the
// resource is on contract; everything else is universal.

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  location: '',
  status: 'actively_looking',
  current_title: '',
  total_experience_years: '',
  hourly_rate: '',
  rate_currency: 'USD',
  timezone: '',
  availability: 'full_time',
  skills: [],
  experiences: [],
  certifications: [],
  education_level: '',
};

export default function CandidateForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const { data: existing } = useCandidate(id);
  const createMutation = useCreateCandidate();
  const updateMutation = useUpdateCandidate();

  // Preserve any pre-existing data the simplified form no longer surfaces, so
  // editing doesn't accidentally wipe richer fields populated by the wizard.
  const [preserved, setPreserved] = useState({
    summary: '',
    portfolio_url: '',
    linkedin_url: '',
    tags: [],
  });

  useEffect(() => {
    if (existing?.candidate) {
      const c = existing.candidate;
      setForm({
        full_name: c.full_name || '',
        email: c.email || '',
        phone: c.phone || '',
        location: c.location || '',
        status: c.status || 'actively_looking',
        current_title: c.current_title || '',
        total_experience_years: c.total_experience_years ?? '',
        hourly_rate: c.hourly_rate ?? '',
        rate_currency: c.rate_currency || 'USD',
        timezone: c.timezone || '',
        availability: c.availability || 'full_time',
        skills: c.skills || [],
        experiences: (c.experience || []).map((e) => ({
          designation: e.designation || '',
          company_name: e.company_name || '',
          start_date: e.start_date || '',
          end_date: e.end_date || '',
          description: e.description || '',
        })),
        certifications: (c.certifications || []).map((cert) => ({
          certification_name: cert.certification_name || '',
          issuing_org: cert.issuing_org || '',
        })),
        education_level: c.education?.[0]?.degree || '',
      });
      setPreserved({
        summary: c.summary || '',
        portfolio_url: c.portfolio_url || '',
        linkedin_url: c.linkedin_url || '',
        tags: (c.tags || []).map((t) => (typeof t === 'string' ? t : t.tag)),
      });
    }
  }, [existing]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isContract = form.availability === 'contract';

  const handleSubmit = (e) => {
    e.preventDefault();
    const educationEntry = form.education_level
      ? [{ degree: form.education_level, institution: '', year_of_completion: '', grade: '' }]
      : [];

    // Filter out blank certification rows.
    const certs = form.certifications
      .map((c) => ({
        certification_name: (c.certification_name || '').trim(),
        issuing_org: (c.issuing_org || '').trim(),
      }))
      .filter((c) => c.certification_name);

    // Filter out blank experience rows.
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

      // Hourly rate only for contract.
      hourly_rate:  isContract ? (form.hourly_rate || null) : null,
      rate_currency: isContract && form.hourly_rate ? form.rate_currency : null,

      // Explicitly null the removed fields so older edits clear them.
      current_company: null,
      notice_period_days: null,
      current_ctc: null,
      expected_ctc: null,

      // Preserved fields the simplified UI doesn't edit
      summary: preserved.summary,
      portfolio_url: preserved.portfolio_url,
      linkedin_url: preserved.linkedin_url,
      tags: preserved.tags,
    };

    if (isEdit) {
      updateMutation.mutate({ ...payload, id }, {
        onSuccess: () => navigate(`/candidates/${id}`),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: (data) => navigate(`/candidates/${data?.data?.id ?? data?.id}`),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit resource' : 'Add resource'}</h1>
          <div className="page-sub">
            {isEdit ? 'Update this resource’s profile.' : 'Create a new resource profile manually.'}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" type="button" onClick={() => navigate(-1)}>
            <Icon d={ICO.arrow} /> Back
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="col gap-4">
        {/* Basic info */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Basic information</div>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field">
                <label>Full name *</label>
                <input className="input" name="full_name" value={form.full_name} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input className="input" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="field">
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
              <div className="field">
                <label>Primary Role</label>
                <input className="input" name="current_title" value={form.current_title} onChange={handleChange} />
              </div>
              <div className="field">
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
          <div className="card-body">
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

        {/* Education (single dropdown) */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Education</div>
          </div>
          <div className="card-body">
            <div className="field" style={{ maxWidth: 360 }}>
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
        <div className="row gap-2" style={{ justifyContent: 'flex-end', paddingBottom: 24 }}>
          <button className="btn" type="button" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn primary" type="submit" disabled={isPending}>
            <Icon d={ICO.check} />
            {isPending ? 'Saving…' : isEdit ? 'Update resource' : 'Create resource'}
          </button>
        </div>
      </form>
    </div>
  );
}
