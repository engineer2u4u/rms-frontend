import { Icon, ICO } from '../roster';

// Editable list of work experiences. Each row captures designation /
// company / dates / description. Dates are free-text — the AI parser often
// returns "November 2019" rather than ISO, and the detail page's cleanDate
// helper already filters 0000-00-00 sentinels out of display.
export default function ExperienceInput({ experiences, onChange }) {
  const update = (index, key, value) => {
    onChange(experiences.map((e, i) => (i === index ? { ...e, [key]: value } : e)));
  };

  const addRow = () => {
    onChange([
      ...experiences,
      { designation: '', company_name: '', start_date: '', end_date: '', description: '' },
    ]);
  };

  const removeRow = (index) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="col gap-3">
      {experiences.length === 0 ? (
        <div className="text-sm muted">No work experience added.</div>
      ) : (
        experiences.map((exp, i) => (
          <div
            key={i}
            className="col gap-2"
            style={{
              padding: 12,
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--surface-2)',
            }}
          >
            <div className="row gap-2" style={{ alignItems: 'center' }}>
              <span className="text-xs muted bold" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Role #{i + 1}
              </span>
              <div style={{ flex: 1 }} />
              <button
                type="button"
                className="btn ghost"
                style={{ width: 28, padding: 0, justifyContent: 'center', color: 'var(--danger)' }}
                onClick={() => removeRow(i)}
                title="Remove this experience"
              >
                <Icon d={ICO.x} />
              </button>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Designation</label>
                <input
                  className="input"
                  value={exp.designation || ''}
                  onChange={(e) => update(i, 'designation', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div className="field">
                <label>Company</label>
                <input
                  className="input"
                  value={exp.company_name || ''}
                  onChange={(e) => update(i, 'company_name', e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="field">
                <label>Start date</label>
                <input
                  className="input"
                  value={exp.start_date || ''}
                  onChange={(e) => update(i, 'start_date', e.target.value)}
                  placeholder="e.g. November 2019 or 2019-11"
                />
              </div>
              <div className="field">
                <label>End date</label>
                <input
                  className="input"
                  value={exp.end_date || ''}
                  onChange={(e) => update(i, 'end_date', e.target.value)}
                  placeholder="leave blank for Present"
                />
              </div>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                className="input"
                rows={4}
                value={exp.description || ''}
                onChange={(e) => update(i, 'description', e.target.value)}
                placeholder="Key responsibilities or achievements"
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </div>
          </div>
        ))
      )}
      <button type="button" className="btn sm" onClick={addRow} style={{ alignSelf: 'flex-start' }}>
        <Icon d={ICO.plus} /> Add work experience
      </button>
    </div>
  );
}
